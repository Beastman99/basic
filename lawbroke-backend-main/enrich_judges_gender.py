import os
import asyncio
import databases
import sqlalchemy
from gender_guesser.detector import Detector  # type: ignore
from tqdm import tqdm

# ────────────────────────────────────────────────
# CONFIG
# ────────────────────────────────────────────────
DATABASE_URL = "postgresql://lawbroke_db_00yg_user:rfyeQvc51e3oYNLuklzNXlGIGZ5DzebC@dpg-d1u9ffmr433s73egj18g-a.oregon-postgres.render.com/lawbroke_db_00yg?sslmode=require"

database = databases.Database(DATABASE_URL)
metadata = sqlalchemy.MetaData()
detector = Detector(case_sensitive=False)

# ────────────────────────────────────────────────
# MAIN
# ────────────────────────────────────────────────
async def main():
    await database.connect()
    print("✅ Connected to database.")

    # Fetch judges without gender
    rows = await database.fetch_all("""
        SELECT id, judge_name
        FROM case_judges
        WHERE gender IS NULL OR gender = ''
    """)

    print(f"🔍 Found {len(rows)} judges to enrich")

    for row in tqdm(rows):
        name = row["judge_name"] or ""
        first_name = name.split()[0] if name else ""
        gender_guess = detector.get_gender(first_name)
        # Simplify gender categories
        if gender_guess in ("male", "mostly_male"):
            gender = "male"
        elif gender_guess in ("female", "mostly_female"):
            gender = "female"
        else:
            gender = "unknown"

        await database.execute(
            """
            UPDATE case_judges
            SET gender = :gender
            WHERE id = :id
            """,
            {"gender": gender, "id": row["id"]}
        )

    print("✅ Gender enrichment done.")

    # Optional: check update summary
    rows = await database.fetch_all("SELECT gender, COUNT(*) FROM case_judges GROUP BY gender;")
    print("\nUpdated distribution:")
    for r in rows:
        print(f"  {r['gender']}: {r['count']}")

    await database.disconnect()
    print("✅ Disconnected.")

# ────────────────────────────────────────────────
if __name__ == "__main__":
    asyncio.run(main())

