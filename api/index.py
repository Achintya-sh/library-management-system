import sys
import os

# Make backend/ importable by Vercel's Python runtime
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from mangum import Mangum
from app.main import app

# Vercel requires a WSGI/ASGI handler exported as `handler`
handler = Mangum(app, lifespan="off")
