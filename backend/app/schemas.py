from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "member"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: Optional[datetime] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class BookCreate(BaseModel):
    title: str
    author: str
    isbn: str
    genre: Optional[str] = "General"
    total_copies: int = 1
    location_rack: Optional[str] = "Main Shelf"

class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    isbn: Optional[str] = None
    genre: Optional[str] = None
    total_copies: Optional[int] = None
    available_copies: Optional[int] = None
    location_rack: Optional[str] = None

class BookResponse(BaseModel):
    id: int
    title: str
    author: str
    isbn: str
    genre: str
    total_copies: int
    available_copies: int
    location_rack: str
    created_at: Optional[datetime] = None

class IssueBookRequest(BaseModel):
    book_id: int
    user_id: Optional[int] = None  # If not provided, defaults to requesting user
    days: int = 14

class ReturnBookRequest(BaseModel):
    issuance_id: int

class IssuanceResponse(BaseModel):
    id: int
    book_id: int
    book_title: Optional[str] = None
    book_author: Optional[str] = None
    user_id: int
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    issue_date: date
    due_date: date
    return_date: Optional[date] = None
    status: str
    fine_amount: float
    fine_paid: bool
    created_at: Optional[datetime] = None
