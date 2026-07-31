import os
import sqlite3
import pymysql
import pymysql.cursors
from datetime import date, datetime
from app.config import DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

# On Vercel, /tmp is the only writable directory
SQLITE_DB_PATH = "/tmp/library_db.sqlite"


def _ensure_initialized(db_path: str):
    """Bootstrap the SQLite DB with schema + seed data on first use."""
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'member',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
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

    cur.execute("""
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

    # Seed users if empty
    cur.execute("SELECT COUNT(*) FROM users;")
    if cur.fetchone()[0] == 0:
        import bcrypt
        admin_hash = bcrypt.hashpw(b"admin123", bcrypt.gensalt()).decode()
        member_hash = bcrypt.hashpw(b"member123", bcrypt.gensalt()).decode()
        cur.execute("""
            INSERT INTO users (name, email, password_hash, role) VALUES
            ('Head Librarian', 'admin@library.org', ?, 'admin'),
            ('Alice Johnson', 'alice@example.com', ?, 'member');
        """, (admin_hash, member_hash))

    # Seed books if empty
    cur.execute("SELECT COUNT(*) FROM books;")
    if cur.fetchone()[0] == 0:
        books = [
            ('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 'Classic', 5, 5, 'Shelf A-1'),
            ('To Kill a Mockingbird', 'Harper Lee', '9780061120084', 'Fiction', 4, 4, 'Shelf A-2'),
            ('1984', 'George Orwell', '9780451524935', 'Dystopian', 6, 6, 'Shelf B-1'),
            ('Clean Code', 'Robert C. Martin', '9780132350884', 'Technology', 3, 3, 'Shelf C-3'),
            ('Design Patterns', 'Erich Gamma et al.', '9780201633610', 'Technology', 2, 2, 'Shelf C-4'),
            ('Dune', 'Frank Herbert', '9780441172719', 'Sci-Fi', 4, 4, 'Shelf B-3'),
        ]
        cur.executemany("""
            INSERT INTO books (title, author, isbn, genre, total_copies, available_copies, location_rack)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        """, books)

    conn.commit()
    conn.close()


class SQLiteCursorWrapper:
    def __init__(self, cursor):
        self.cursor = cursor
        self.lastrowid = None

    def execute(self, query, params=None):
        sqlite_query = query.replace("%s", "?")
        if params is not None:
            processed = []
            for p in params:
                if isinstance(p, (date, datetime)):
                    processed.append(p.isoformat())
                elif isinstance(p, bool):
                    processed.append(1 if p else 0)
                else:
                    processed.append(p)
            params = tuple(processed)
            res = self.cursor.execute(sqlite_query, params)
        else:
            res = self.cursor.execute(sqlite_query)
        self.lastrowid = self.cursor.lastrowid
        return res

    def executemany(self, query, seq_of_params):
        sqlite_query = query.replace("%s", "?")
        res = self.cursor.executemany(sqlite_query, seq_of_params)
        self.lastrowid = self.cursor.lastrowid
        return res

    def _parse_dates(self, d: dict) -> dict:
        for k, v in d.items():
            if isinstance(v, str) and len(v) == 10 and v.count('-') == 2:
                try:
                    d[k] = date.fromisoformat(v)
                except ValueError:
                    pass
        return d

    def fetchone(self):
        row = self.cursor.fetchone()
        if row is None:
            return None
        return self._parse_dates(dict(row))

    def fetchall(self):
        return [self._parse_dates(dict(r)) for r in self.cursor.fetchall()]

    def __enter__(self):
        return self

    def __exit__(self, *_):
        pass


class SQLiteConnectionWrapper:
    def __init__(self, conn):
        self.conn = conn
        self.conn.row_factory = sqlite3.Row

    def cursor(self):
        return SQLiteCursorWrapper(self.conn.cursor())

    def close(self):
        self.conn.commit()
        self.conn.close()


def get_db_connection():
    """Return a MySQL connection, or fall back to SQLite in /tmp."""
    try:
        connection = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=True,
            connect_timeout=3,
        )
        return connection
    except Exception:
        # First request auto-bootstraps the SQLite database
        _ensure_initialized(SQLITE_DB_PATH)
        conn = sqlite3.connect(SQLITE_DB_PATH)
        return SQLiteConnectionWrapper(conn)
