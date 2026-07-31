# 📚 Athena Library Management System

A full-stack modern **Library Management System** built with **FastAPI (Python)**, **MySQL / SQLite**, and **React 18 (Vite)** featuring a glassmorphic UI, JWT authentication, role-based access control, book catalog search, checkout issuances, and live overdue fine tracking.

---

## 🚀 Quick Features Matrix

| Category | Features Implemented |
|---|---|
| 🔐 **Auth & Roles** | JWT authentication, Bcrypt password hashing, Head Librarian (Admin) vs Student (Member) views |
| 📖 **Catalog Management** | Real-time title/author/ISBN search, category filtering, shelf rack location tracking, CRUD book modal |
| 🔄 **Book Checkout & Issuance** | Loan checkout duration selection (7, 14, 21, 30 days), automatic stock inventory updates |
| 💰 **Overdue Fine Engine** | Automatic `$1.00/day` overdue fine calculation on active loans, payment recording on book return |
| 📊 **Analytics Dashboard** | Live stats grid (Total Books, Members, Issued Loans, Fine Balances), recent activity feed |

---

## 🛠 Tech Stack

- **Backend**: FastAPI, PyMySQL / SQLite3, PyJWT, Passlib (Bcrypt), Uvicorn
- **Frontend**: React 18, Vite, Lucide Icons, Vanilla Glassmorphism CSS design system
- **Database**: MySQL 8.0 / 9.0 (with automatic zero-config SQLite fallback)
- **Deployment**: Docker & Docker Compose ready

---

## 🏃 Quick Start (Local Development)

### Option 1: One-Click Docker Launch (Recommended)
```bash
docker-compose up --build
```
- **Web App**: `http://localhost`
- **Backend API**: `http://localhost:8000/docs`

---

### Option 2: Run Without Docker

#### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Initialize database & seed initial catalog
python init_db.py

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- **Web App**: `http://localhost:3000`

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Head Librarian (Admin)** | `admin@library.org` | `admin123` | Full admin rights, catalog CRUD, checkout/returns processing |
| **Student Member** | `alice@example.com` | `member123` | View catalog, personal loans dashboard, fine history |

*(New Admin or Member accounts can also be created via the Register screen)*.

---

## 📡 API Endpoints Summary

- `POST /api/auth/register` — User account registration
- `POST /api/auth/login` — User authentication & JWT token issuance
- `GET /api/books` — Catalog search and filter
- `POST /api/books` — Add new book (Admin only)
- `PUT /api/books/{id}` — Update book inventory details (Admin only)
- `DELETE /api/books/{id}` — Remove book from catalog (Admin only)
- `POST /api/issuances/issue` — Checkout book to member
- `POST /api/issuances/return` — Process return and calculate overdue fine
- `GET /api/issuances/stats` — Dashboard metrics summary

---
