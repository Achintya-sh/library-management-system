from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth_routes, book_routes, issue_routes

app = FastAPI(
    title="Athena Library Management System API",
    description="FastAPI backend with MySQL/SQLite for user management, catalog, and book issuance tracking",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(book_routes.router)
app.include_router(issue_routes.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Athena Library API is running"}
