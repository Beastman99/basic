from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import psycopg2
import bcrypt
import os

router = APIRouter()


def get_connection():
    return psycopg2.connect(
        os.getenv("DATABASE_URL"),
        sslmode="require"
    )


@router.post("/api/signup")
async def signup(request: Request):
    try:
        data = await request.json()
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        if not all([name, email, password]):
            return JSONResponse(
                {"ok": False, "error": "All fields required"},
                status_code=400
            )

        conn = get_connection()
        cur = conn.cursor()

        # Ensure the table exists
        cur.execute("""
            CREATE TABLE IF NOT EXISTS "User" (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                passwordHash TEXT NOT NULL,
                createdAt TIMESTAMP DEFAULT NOW()
            );
        """)

        # Check if email already exists
        cur.execute('SELECT 1 FROM "User" WHERE email = %s LIMIT 1;', (email,))
        if cur.fetchone():
            conn.close()
            return JSONResponse(
                {"ok": False, "error": "Email already registered"},
                status_code=400
            )

        # ✅ Hash password safely with bcrypt
        password_bytes = password.encode("utf-8")
        salt = bcrypt.gensalt(rounds=12)
        password_hash = bcrypt.hashpw(password_bytes, salt).decode("utf-8")

        # Insert user
        cur.execute(
            'INSERT INTO "User" (name, email, passwordHash) VALUES (%s, %s, %s);',
            (name, email, password_hash)
        )
        conn.commit()
        conn.close()

        return JSONResponse(
            {"ok": True, "message": "Account created 🎉"},
            status_code=201
        )

    except Exception as e:
        import traceback
        print("❌ Server error in /api/signup:")
        traceback.print_exc()
        return JSONResponse({"ok": False, "error": str(e)}, status_code=500)
