import os
import sqlite3
import bcrypt
import pymysql
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "library_db")

SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), "library_db.sqlite")

def hash_pass(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def init_db():
    print(f"Connecting to MySQL server at {DB_HOST}:{DB_PORT} as user '{DB_USER}'...")
    try:
        # Initial connection without db name to ensure DB exists
        conn = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            autocommit=True
        )
        cursor = conn.cursor()
        
        # Create database
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME};")
        cursor.execute(f"USE {DB_NAME};")
        
        # Create tables
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('admin', 'member') DEFAULT 'member',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS books (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            author VARCHAR(255) NOT NULL,
            isbn VARCHAR(50) UNIQUE NOT NULL,
            genre VARCHAR(100) DEFAULT 'General',
            total_copies INT NOT NULL DEFAULT 1,
            available_copies INT NOT NULL DEFAULT 1,
            location_rack VARCHAR(50) DEFAULT 'Main Shelf',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS book_issuances (
            id INT AUTO_INCREMENT PRIMARY KEY,
            book_id INT NOT NULL,
            user_id INT NOT NULL,
            issue_date DATE NOT NULL,
            due_date DATE NOT NULL,
            return_date DATE NULL,
            status ENUM('issued', 'returned', 'overdue') DEFAULT 'issued',
            fine_amount DECIMAL(10, 2) DEFAULT 0.00,
            fine_paid BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)

        print("MySQL Tables created successfully.")

        # Seed default Admin and Member if users table is empty
        cursor.execute("SELECT COUNT(*) FROM users;")
        user_count = cursor.fetchone()[0]
        if user_count == 0:
            print("Seeding default admin and member users...")
            admin_pass = hash_pass("admin123")
            member_pass = hash_pass("member123")
            
            cursor.execute("""
                INSERT INTO users (name, email, password_hash, role) VALUES 
                ('Head Librarian', 'admin@library.org', %s, 'admin'),
                ('Alice Johnson', 'alice@example.com', %s, 'member');
            """, (admin_pass, member_pass))

        # Seed sample books if books table is empty
        cursor.execute("SELECT COUNT(*) FROM books;")
        book_count = cursor.fetchone()[0]
        if book_count == 0:
            print("Seeding initial book catalog...")
            sample_books = [
                ('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 'Classic', 5, 5, 'Shelf A-1'),
                ('To Kill a Mockingbird', 'Harper Lee', '9780061120084', 'Fiction', 4, 4, 'Shelf A-2'),
                ('1984', 'George Orwell', '9780451524935', 'Dystopian', 6, 6, 'Shelf B-1'),
                ('Clean Code', 'Robert C. Martin', '9780132350884', 'Technology', 3, 3, 'Shelf C-3'),
                ('Design Patterns', 'Erich Gamma et al.', '9780201633610', 'Technology', 2, 2, 'Shelf C-4'),
                ('Dune', 'Frank Herbert', '9780441172719', 'Sci-Fi', 4, 4, 'Shelf B-3')
            ]
            cursor.executemany("""
                INSERT INTO books (title, author, isbn, genre, total_copies, available_copies, location_rack)
                VALUES (%s, %s, %s, %s, %s, %s, %s);
            """, sample_books)

        conn.close()
        print("MySQL Database initialization complete.")
    except Exception as e:
        print(f"MySQL connection unavailable ({e}). Initializing fallback SQLite database...")
        init_sqlite_db()

def init_sqlite_db(db_path=None):
    if db_path is None:
        db_path = SQLITE_DB_PATH
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'member',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        isbn TEXT UNIQUE NOT NULL,
        genre TEXT DEFAULT 'General',
        total_copies INTEGER NOT NULL DEFAULT 1,
        available_copies INTEGER NOT NULL DEFAULT 1,
        location_rack TEXT DEFAULT 'Main Shelf',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS book_issuances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        issue_date TEXT NOT NULL,
        due_date TEXT NOT NULL,
        return_date TEXT NULL,
        status TEXT DEFAULT 'issued',
        fine_amount REAL DEFAULT 0.00,
        fine_paid INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    cursor.execute("SELECT COUNT(*) FROM users;")
    user_count = cursor.fetchone()[0]
    if user_count == 0:
        print("Seeding default admin and member users into SQLite...")
        admin_pass = hash_pass("admin123")
        member_pass = hash_pass("member123")
        
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, role) VALUES 
            ('Head Librarian', 'admin@library.org', ?, 'admin'),
            ('Alice Johnson', 'alice@example.com', ?, 'member');
        """, (admin_pass, member_pass))

    cursor.execute("SELECT COUNT(*) FROM books;")
    book_count = cursor.fetchone()[0]
    if book_count == 0:
        print("Seeding initial book catalog into SQLite...")
        sample_books = [
            ('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 'Classic', 5, 5, 'Shelf A-1'),
            ('To Kill a Mockingbird', 'Harper Lee', '9780061120084', 'Fiction', 4, 4, 'Shelf A-2'),
            ('1984', 'George Orwell', '9780451524935', 'Dystopian', 6, 6, 'Shelf B-1'),
            ('Clean Code', 'Robert C. Martin', '9780132350884', 'Technology', 3, 3, 'Shelf C-3'),
            ('Design Patterns', 'Erich Gamma et al.', '9780201633610', 'Technology', 2, 2, 'Shelf C-4'),
            ('Dune', 'Frank Herbert', '9780441172719', 'Sci-Fi', 4, 4, 'Shelf B-3')
        ]
        cursor.executemany("""
            INSERT INTO books (title, author, isbn, genre, total_copies, available_copies, location_rack)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        """, sample_books)

    conn.commit()
    conn.close()
    print("SQLite Database initialization complete.")

if __name__ == "__main__":
    init_db()
