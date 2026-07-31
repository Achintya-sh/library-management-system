from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.db import get_db_connection
from app.schemas import BookCreate, BookUpdate, BookResponse
from app.auth import get_current_user, get_admin_user

router = APIRouter(prefix="/api/books", tags=["Books"])

@router.get("", response_model=List[BookResponse])
def get_books(search: Optional[str] = Query(None, description="Search term for title, author, isbn, or genre")):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            if search:
                pattern = f"%{search}%"
                cursor.execute("""
                    SELECT * FROM books
                    WHERE title LIKE %s OR author LIKE %s OR isbn LIKE %s OR genre LIKE %s
                    ORDER BY title ASC;
                """, (pattern, pattern, pattern, pattern))
            else:
                cursor.execute("SELECT * FROM books ORDER BY title ASC;")
            books = cursor.fetchall()
            return books
    finally:
        conn.close()

@router.get("/{book_id}", response_model=BookResponse)
def get_book(book_id: int):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM books WHERE id = %s;", (book_id,))
            book = cursor.fetchone()
            if not book:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
            return book
    finally:
        conn.close()

@router.post("", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
def create_book(book: BookCreate, admin: dict = Depends(get_admin_user)):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM books WHERE isbn = %s;", (book.isbn,))
            if cursor.fetchone():
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Book with this ISBN already exists")

            cursor.execute("""
                INSERT INTO books (title, author, isbn, genre, total_copies, available_copies, location_rack)
                VALUES (%s, %s, %s, %s, %s, %s, %s);
            """, (
                book.title,
                book.author,
                book.isbn,
                book.genre,
                book.total_copies,
                book.total_copies,  # Initially available = total
                book.location_rack
            ))
            new_id = cursor.lastrowid
            cursor.execute("SELECT * FROM books WHERE id = %s;", (new_id,))
            new_book = cursor.fetchone()
            return new_book
    finally:
        conn.close()

@router.put("/{book_id}", response_model=BookResponse)
def update_book(book_id: int, book_update: BookUpdate, admin: dict = Depends(get_admin_user)):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM books WHERE id = %s;", (book_id,))
            existing = cursor.fetchone()
            if not existing:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")

            # Build dynamic update query
            updates = []
            params = []
            
            if book_update.title is not None:
                updates.append("title = %s")
                params.append(book_update.title)
            if book_update.author is not None:
                updates.append("author = %s")
                params.append(book_update.author)
            if book_update.isbn is not None:
                updates.append("isbn = %s")
                params.append(book_update.isbn)
            if book_update.genre is not None:
                updates.append("genre = %s")
                params.append(book_update.genre)
            if book_update.total_copies is not None:
                diff = book_update.total_copies - existing["total_copies"]
                new_avail = existing["available_copies"] + diff
                if new_avail < 0:
                    raise HTTPException(status_code=400, detail="Cannot reduce total copies below currently issued copies count")
                updates.append("total_copies = %s")
                params.append(book_update.total_copies)
                updates.append("available_copies = %s")
                params.append(new_avail)
            if book_update.location_rack is not None:
                updates.append("location_rack = %s")
                params.append(book_update.location_rack)

            if not updates:
                return existing

            query = f"UPDATE books SET {', '.join(updates)} WHERE id = %s;"
            params.append(book_id)
            cursor.execute(query, tuple(params))

            cursor.execute("SELECT * FROM books WHERE id = %s;", (book_id,))
            updated_book = cursor.fetchone()
            return updated_book
    finally:
        conn.close()

@router.delete("/{book_id}")
def delete_book(book_id: int, admin: dict = Depends(get_admin_user)):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM books WHERE id = %s;", (book_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
            
            cursor.execute("DELETE FROM books WHERE id = %s;", (book_id,))
            return {"message": "Book deleted successfully"}
    finally:
        conn.close()
