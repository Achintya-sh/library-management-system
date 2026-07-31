from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.db import get_db_connection
from app.schemas import UserRegister, UserLogin, UserResponse, Token
from app.auth import hash_password, verify_password, create_access_token, get_current_user, get_admin_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
def register_user(user: UserRegister):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Check if email exists
            cursor.execute("SELECT id FROM users WHERE email = %s;", (user.email,))
            existing = cursor.fetchone()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email is already registered"
                )
            
            hashed_pwd = hash_password(user.password)
            role = user.role if user.role in ["admin", "member"] else "member"
            
            cursor.execute("""
                INSERT INTO users (name, email, password_hash, role)
                VALUES (%s, %s, %s, %s);
            """, (user.name, user.email, hashed_pwd, role))
            
            user_id = cursor.lastrowid
            
            cursor.execute("SELECT id, name, email, role, created_at FROM users WHERE id = %s;", (user_id,))
            new_user = cursor.fetchone()
            return new_user
    finally:
        conn.close()

@router.post("/login", response_model=Token)
def login_user(credentials: UserLogin):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM users WHERE email = %s;", (credentials.email,))
            user = cursor.fetchone()
            if not user or not verify_password(credentials.password, user["password_hash"]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )
            
            access_token = create_access_token(data={"sub": user["email"]})
            user_response = UserResponse(
                id=user["id"],
                name=user["name"],
                email=user["email"],
                role=user["role"],
                created_at=user["created_at"]
            )
            return Token(
                access_token=access_token,
                token_type="bearer",
                user=user_response
            )
    finally:
        conn.close()

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.get("/users", response_model=List[UserResponse])
def get_all_users(admin_user: dict = Depends(get_admin_user)):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, name, email, role, created_at FROM users ORDER BY name ASC;")
            users = cursor.fetchall()
            return users
    finally:
        conn.close()
