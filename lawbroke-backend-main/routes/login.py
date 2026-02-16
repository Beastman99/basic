# routes/login.py
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from sqlalchemy import Table, Column, Integer, String, DateTime, MetaData
from databases import Database
import bcrypt
import jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import logging

load_dotenv()

# Environment setup
DATABASE_URL = os.getenv("DATABASE_URL")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret")  # Make sure this is in your .env
JWT_ALGORITHM = "HS256"
DEV_EMAIL = os.getenv("DEV_EMAIL", "benjamin.eastman99@gmail.com")  # Default fallback

database = Database(DATABASE_URL)
router = APIRouter()

# Define the User table (must match your database)
metadata = MetaData()

users = Table(
    "User",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("name", String),
    Column("email", String, unique=True),
    Column("passwordhash", String),
    Column("createdat", DateTime),
)


@router.post("/api/login")
async def login_user(request: Request):
    """
    Logs in a user by verifying email and password using bcrypt,
    and returns a signed JWT for authenticated feature access.
    """
    try:
        data = await request.json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return JSONResponse(
                {"ok": False, "error": "Email and password required"},
                status_code=400,
            )

        if not database.is_connected:
            await database.connect()

        # Find user by email
        query = users.select().where(users.c.email == email)
        user = await database.fetch_one(query)

        if not user:
            return JSONResponse(
                {"ok": False, "error": "Invalid email or password"},
                status_code=401,
            )

        # Verify hashed password
        stored_hash = user["passwordhash"].encode("utf-8")
        if not bcrypt.checkpw(password.encode("utf-8"), stored_hash):
            return JSONResponse(
                {"ok": False, "error": "Invalid email or password"},
                status_code=401,
            )

        # ✅ Check if this is a developer/admin account
        is_dev = user["email"] == DEV_EMAIL

        # ✅ Successful login → issue JWT token
        payload = {
            "sub": user["email"],
            "name": user["name"],
            "email": user["email"],
            "is_dev": is_dev,  # Flag for developer access
            "exp": datetime.utcnow() + timedelta(days=7),
        }

        token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

        return JSONResponse(
            {
                "ok": True,
                "message": "Login successful 🎉",
                "token": token,
                "user": {"name": user["name"], "email": user["email"], "is_dev": is_dev},
            },
            status_code=200,
        )

    except Exception as e:
        logging.exception("Login error:")
        return JSONResponse({"ok": False, "error": str(e)}, status_code=500)
