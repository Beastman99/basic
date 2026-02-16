import asyncio
import os
import logging
import databases
import sqlalchemy
from gender_guesser.detector import Detector  # type: ignore
from dotenv import load_dotenv
from tqdm import tqdm
from asyncpg.exceptions import ConnectionDoesNotExistError, InterfaceError

# ───────────────────────────────────────────────────────────────
# Load environment + setup logging
# ───────────────────────────────────────────────────────────────
load_dotenv("../lawbroke-frontend/.env")
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("❌ DATABASE_URL not set")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
database = databases.Database(DATABASE_URL, timeout=60)
metadata = sqlalchemy.MetaData()
detector = Detector(case_sensitive=False)

# ───────────────────────────────────────────────────────────────
# Local fallback rules for surnames not found in DB
# ───────────────────────────────────────────────────────────────
def infer_race_fallback(name: str) -> str:
    if not name:
        return "Unknown"
    name = name.strip().lower()

    if any(suffix in name for suffix in ["son", "smith", "brown", "jones", "taylor", "miller"]):
        return "Anglo/European"
    if any(part in name for part in ["nguyen", "tran", "kim", "chen", "li", "park", "tanaka", "suzuki"]):
        return "East Asian"
    if any(part in name for part in ["patel", "singh", "kumar", "sharma", "ahmed", "ali", "khan"]):
        return "South Asian"
    if any(part in name for part in ["hassan", "mohammed", "abdul", "farah", "yousef", "nasir"]):
        return "Middle Eastern"
    if any(part in name for part in ["rodriguez", "garcia", "martinez", "silva", "santos", "romano"]):
        return "Hispanic/Latin"
    if any(part in name for part in ["okoro", "ade", "nkrumah", "abebe", "diallo", "kamau"]):
        return "African"
    if any(part in name for part in ["ski", "ska", "ov", "ova", "ic", "vich", "vic"]):
        return "Slavic/Eastern European"

    return "Unknown"


# ───────────────────────────────────────────────────────────────
# DB lookup helper
# ───────────────────────────────────────────────────────────────
async def infer_origin_from_db(last_name: str) -> str | None:
    """Look up surname origin from surname_reference (fast indexed match)."""
    row = await database.fetch_one(
        "SELECT origin FROM surname_reference WHERE LOWER(surname) = LOWER(:s)",
        {"s": last_name},
    )
    return row["origin"] if row else None


# ───────────────────────────────────────────────────────────────
# Batch updating
# ───────────────────────────────────────────────────────────────
BATCH_SIZE = 500
PROGRESS_FILE = "progress.txt"


async def update_batch(batch, batch_num, total):
    for attempt in range(3):
        try:
            async with database.transaction():
                for r in batch:
                    pid = r["id"]
                    name = r["party_name"]

                    # Extract last name
                    last_name = name.split()[-1].strip(" ,.-").title() if name else None

                    # Try lookup in surname_reference
                    race = None
                    if last_name:
                        race = await infer_origin_from_db(last_name)
                    if not race:
                        race = infer_race_fallback(name)

                    await database.execute(
                        """
                        UPDATE case_parties
                        SET inferred_race = :race
                        WHERE id = :id
                        """,
                        {"id": pid, "race": race},
                    )

            logging.info(f"✅ Batch {batch_num} done ({min(batch_num * BATCH_SIZE, total)}/{total})")
            with open(PROGRESS_FILE, "w") as f:
                f.write(str(batch_num))
            return
        except (ConnectionDoesNotExistError, InterfaceError, TimeoutError) as e:
            logging.warning(f"⚠️ Connection lost on batch {batch_num} (attempt {attempt+1}/3): {e}")
            await database.disconnect()
            await asyncio.sleep(5)
            await database.connect()
        except Exception as e:
            logging.error(f"❌ Unexpected error on batch {batch_num}: {e}", exc_info=True)
            raise e

    logging.error(f"🚨 Batch {batch_num} failed after 3 attempts, skipping…")


# ───────────────────────────────────────────────────────────────
# Main orchestration
# ───────────────────────────────────────────────────────────────
async def main():
    await database.connect()

    # Force a clean restart each run
    if os.path.exists(PROGRESS_FILE):
        os.remove(PROGRESS_FILE)
        logging.info("🧹 Progress file removed – restarting full enrichment")

    # Reset only inferred_race (keep gender intact)
    await database.execute("UPDATE case_parties SET inferred_race = NULL;")
    logging.info("🧽 Cleared existing inferred_race values")

    rows = await database.fetch_all("""
        SELECT id, party_name 
        FROM case_parties
        WHERE party_name IS NOT NULL
    """)
    total = len(rows)
    logging.info(f"Starting demographic re-enrichment on {total:,} party records")

    for i in tqdm(range(0, total, BATCH_SIZE), desc="Updating batches"):
        batch_num = i // BATCH_SIZE + 1
        batch = rows[i : i + BATCH_SIZE]
        await update_batch(batch, batch_num, total)

    await database.disconnect()
    logging.info("🎉 All race origin enrichment complete.")


# ───────────────────────────────────────────────────────────────
# Entrypoint
# ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    asyncio.run(main())
