from datetime import date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.db import get_db_connection
from app.schemas import IssueBookRequest, ReturnBookRequest, IssuanceResponse
from app.auth import get_current_user, get_admin_user

router = APIRouter(prefix="/api/issuances", tags=["Book Issuance & Fines"])

FINE_PER_DAY = 1.00  # $1.00 per day overdue

def update_overdue_fines(cursor):
    """Dynamically update overdue status and fines in DB for non-returned items past due_date."""
    today = date.today()
    cursor.execute("""
        SELECT id, due_date, status, fine_amount
        FROM book_issuances
        WHERE status != 'returned' AND due_date < %s;
    """, (today,))
    overdue_records = cursor.fetchall()
    
    for rec in overdue_records:
        days_overdue = (today - rec["due_date"]).days
        fine = round(days_overdue * FINE_PER_DAY, 2)
        cursor.execute("""
            UPDATE book_issuances
            SET status = 'overdue', fine_amount = %s
            WHERE id = %s;
        """, (fine, rec["id"]))

@router.get("", response_model=List[IssuanceResponse])
def get_issuances(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Update overdue statuses & fine calculations
            update_overdue_fines(cursor)
            
            if current_user["role"] == "admin":
                cursor.execute("""
                    SELECT i.*, b.title as book_title, b.author as book_author,
                           u.name as user_name, u.email as user_email
                    FROM book_issuances i
                    JOIN books b ON i.book_id = b.id
                    JOIN users u ON i.user_id = u.id
                    ORDER BY i.created_at DESC;
                """)
            else:
                cursor.execute("""
                    SELECT i.*, b.title as book_title, b.author as book_author,
                           u.name as user_name, u.email as user_email
                    FROM book_issuances i
                    JOIN books b ON i.book_id = b.id
                    JOIN users u ON i.user_id = u.id
                    WHERE i.user_id = %s
                    ORDER BY i.created_at DESC;
                """, (current_user["id"],))
            
            issuances = cursor.fetchall()
            return issuances
    finally:
        conn.close()

@router.post("/issue", response_model=IssuanceResponse, status_code=status.HTTP_201_CREATED)
def issue_book(req: IssueBookRequest, current_user: dict = Depends(get_current_user)):
    target_user_id = req.user_id if (req.user_id and current_user["role"] == "admin") else current_user["id"]
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Verify book availability
            cursor.execute("SELECT * FROM books WHERE id = %s;", (req.book_id,))
            book = cursor.fetchone()
            if not book:
                raise HTTPException(status_code=404, detail="Book not found")
            if book["available_copies"] <= 0:
                raise HTTPException(status_code=400, detail="No copies currently available for this book")
            
            # Check if user already has an active issue for this book
            cursor.execute("""
                SELECT id FROM book_issuances
                WHERE book_id = %s AND user_id = %s AND status != 'returned';
            """, (req.book_id, target_user_id))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="This user already has an active borrowing for this book")
            
            issue_date = date.today()
            due_date = issue_date + timedelta(days=req.days)
            
            # Decrement available copies
            cursor.execute("UPDATE books SET available_copies = available_copies - 1 WHERE id = %s;", (req.book_id,))
            
            # Insert issuance record
            cursor.execute("""
                INSERT INTO book_issuances (book_id, user_id, issue_date, due_date, status, fine_amount)
                VALUES (%s, %s, %s, %s, 'issued', 0.00);
            """, (req.book_id, target_user_id, issue_date, due_date))
            
            new_id = cursor.lastrowid
            
            cursor.execute("""
                SELECT i.*, b.title as book_title, b.author as book_author,
                       u.name as user_name, u.email as user_email
                FROM book_issuances i
                JOIN books b ON i.book_id = b.id
                JOIN users u ON i.user_id = u.id
                WHERE i.id = %s;
            """, (new_id,))
            return cursor.fetchone()
    finally:
        conn.close()

@router.post("/return", response_model=IssuanceResponse)
def return_book(req: ReturnBookRequest, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT i.*, b.id as book_id
                FROM book_issuances i
                JOIN books b ON i.book_id = b.id
                WHERE i.id = %s;
            """, (req.issuance_id,))
            issuance = cursor.fetchone()
            
            if not issuance:
                raise HTTPException(status_code=404, detail="Issuance record not found")
            
            if current_user["role"] != "admin" and issuance["user_id"] != current_user["id"]:
                raise HTTPException(status_code=403, detail="Not authorized to return this book")
            
            if issuance["status"] == "returned":
                raise HTTPException(status_code=400, detail="Book has already been returned")
            
            return_date = date.today()
            fine_amount = issuance["fine_amount"]
            
            # Calculate final fine if returned after due_date
            if return_date > issuance["due_date"]:
                overdue_days = (return_date - issuance["due_date"]).days
                fine_amount = round(overdue_days * FINE_PER_DAY, 2)
            
            # Update issuance record
            cursor.execute("""
                UPDATE book_issuances
                SET return_date = %s, status = 'returned', fine_amount = %s
                WHERE id = %s;
            """, (return_date, fine_amount, req.issuance_id))
            
            # Increment available copies in stock
            cursor.execute("UPDATE books SET available_copies = available_copies + 1 WHERE id = %s;", (issuance["book_id"],))
            
            cursor.execute("""
                SELECT i.*, b.title as book_title, b.author as book_author,
                       u.name as user_name, u.email as user_email
                FROM book_issuances i
                JOIN books b ON i.book_id = b.id
                JOIN users u ON i.user_id = u.id
                WHERE i.id = %s;
            """, (req.issuance_id,))
            return cursor.fetchone()
    finally:
        conn.close()

@router.post("/{issuance_id}/pay-fine", response_model=IssuanceResponse)
def pay_fine(issuance_id: int, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM book_issuances WHERE id = %s;", (issuance_id,))
            issuance = cursor.fetchone()
            if not issuance:
                raise HTTPException(status_code=404, detail="Issuance record not found")
            
            if current_user["role"] != "admin" and issuance["user_id"] != current_user["id"]:
                raise HTTPException(status_code=403, detail="Not authorized")
            
            cursor.execute("UPDATE book_issuances SET fine_paid = TRUE WHERE id = %s;", (issuance_id,))
            
            cursor.execute("""
                SELECT i.*, b.title as book_title, b.author as book_author,
                       u.name as user_name, u.email as user_email
                FROM book_issuances i
                JOIN books b ON i.book_id = b.id
                JOIN users u ON i.user_id = u.id
                WHERE i.id = %s;
            """, (issuance_id,))
            return cursor.fetchone()
    finally:
        conn.close()

@router.get("/stats")
def get_stats(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            update_overdue_fines(cursor)
            
            cursor.execute("SELECT COUNT(*) as total_books, SUM(total_copies) as total_copies, SUM(available_copies) as available_copies FROM books;")
            book_stats = cursor.fetchone()
            
            if current_user["role"] == "admin":
                cursor.execute("SELECT COUNT(*) as total_users FROM users WHERE role = 'member';")
                member_count = cursor.fetchone()["total_users"]
                
                cursor.execute("SELECT COUNT(*) as active_loans FROM book_issuances WHERE status != 'returned';")
                active_loans = cursor.fetchone()["active_loans"]
                
                cursor.execute("SELECT COUNT(*) as overdue_loans FROM book_issuances WHERE status = 'overdue';")
                overdue_loans = cursor.fetchone()["overdue_loans"]
                
                cursor.execute("SELECT SUM(fine_amount) as total_fines FROM book_issuances;")
                fines_row = cursor.fetchone()
                total_fines = float(fines_row["total_fines"] or 0)
                
                return {
                    "total_books": book_stats["total_books"] or 0,
                    "total_copies": int(book_stats["total_copies"] or 0),
                    "available_copies": int(book_stats["available_copies"] or 0),
                    "total_members": member_count or 0,
                    "active_loans": active_loans or 0,
                    "overdue_loans": overdue_loans or 0,
                    "total_fines": total_fines
                }
            else:
                user_id = current_user["id"]
                cursor.execute("SELECT COUNT(*) as active_loans FROM book_issuances WHERE user_id = %s AND status != 'returned';", (user_id,))
                active_loans = cursor.fetchone()["active_loans"]
                
                cursor.execute("SELECT COUNT(*) as overdue_loans FROM book_issuances WHERE user_id = %s AND status = 'overdue';", (user_id,))
                overdue_loans = cursor.fetchone()["overdue_loans"]
                
                cursor.execute("SELECT SUM(fine_amount) as total_fines FROM book_issuances WHERE user_id = %s;", (user_id,))
                fines_row = cursor.fetchone()
                total_fines = float(fines_row["total_fines"] or 0)
                
                return {
                    "total_books": book_stats["total_books"] or 0,
                    "available_copies": int(book_stats["available_copies"] or 0),
                    "my_active_loans": active_loans or 0,
                    "my_overdue_loans": overdue_loans or 0,
                    "my_total_fines": total_fines
                }
    finally:
        conn.close()
