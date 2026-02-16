import os
import json
import asyncio
import logging
import databases
from dotenv import load_dotenv
from tqdm import tqdm  # make sure it's installed

# ──────────────────────────────────────────────
# Load environment + setup
# ──────────────────────────────────────────────
load_dotenv("../lawbroke-frontend/.env")
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("❌ DATABASE_URL not set in .env")

database = databases.Database(DATABASE_URL)
logging.basicConfig(level=logging.INFO)

# ──────────────────────────────────────────────
# Async DB update
# ──────────────────────────────────────────────
async def update_outcomes():
    await database.connect()
    logging.info("Connected to database.")

    updated, skipped = 0, 0

    # open the extracted outcomes
    with open("case_outcomes.jsonl", "r") as f:
        for line in tqdm(f, desc="Updating outcomes"):
            record = json.loads(line.strip())
            citation = record.get("citation")
            outcome = record.get("outcome")

            if not citation or not outcome:
                skipped += 1
                continue

            # normalise spacing
            citation = citation.strip()
            outcome = outcome.strip()

            # update only if exists
            query = """
                UPDATE nsw_case_summaries
                SET outcome = :outcome
                WHERE citation = :citation
            """
            result = await database.execute(query, {"outcome": outcome, "citation": citation})
            if result:
                updated += 1
            else:
                skipped += 1

    await database.disconnect()
    logging.info(f"✅ Done. Updated: {updated}, Skipped: {skipped}")

# ──────────────────────────────────────────────
# Entry point
# ──────────────────────────────────────────────
if __name__ == "__main__":
    asyncio.run(update_outcomes())
