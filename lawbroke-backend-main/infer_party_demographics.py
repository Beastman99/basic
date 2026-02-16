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
# Inference functions
# ───────────────────────────────────────────────────────────────
def infer_race_simple(name: str) -> str:
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


def infer_gender_with_title(name: str) -> str:
    if not name:
        return "Unknown"
    lowered = name.lower().strip()
    if lowered.startswith("mr "):
        return "male"
    if any(lowered.startswith(prefix) for prefix in ["mrs ", "ms ", "miss "]):
        return "female"

    first_name = name.split()[0]
    g = detector.get_gender(first_name)
    if g in ["male", "mostly_male"]:
        return "male"
    if g in ["female", "mostly_female"]:
        return "female"
    return "Unknown"

# ───────────────────────────────────────────────────────────────
# Main async process
# ───────────────────────────────────────────────────────────────
BATCH_SIZE = 500
PROGRESS_FILE = "progress.txt"

async def update_batch(batch, batch_num, total):
    """Process one batch safely with reconnect + retry."""
    for attempt in range(3):
        try:
            async with database.transaction():
                for r in batch:
                    pid = r["id"]
                    name = r["party_name"]

                    gender = infer_gender_with_title(name)
                    race = infer_race_simple(name)

                    await database.execute(
                        """
                        UPDATE case_parties
                        SET inferred_gender = :gender,
                            inferred_race = :race
                        WHERE id = :id
                        """,
                        {"id": pid, "gender": gender, "race": race},
                    )

            logging.info(f"✅ Batch {batch_num} done ({min(batch_num * BATCH_SIZE, total)}/{total})")
            with open(PROGRESS_FILE, "w") as f:
                f.write(str(batch_num))  # Save progress
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

async def main():
    await database.connect()
    rows = await database.fetch_all("SELECT id, party_name FROM case_parties")
    total = len(rows)
    logging.info(f"Starting demographic enrichment on {total:,} party records")

    start_batch = 0
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE) as f:
            try:
                start_batch = int(f.read().strip())
                logging.info(f"Resuming from batch {start_batch}")
            except ValueError:
                pass

    for i in tqdm(range(start_batch * BATCH_SIZE, total, BATCH_SIZE), desc="Updating batches"):
        batch_num = i // BATCH_SIZE + 1
        batch = rows[i : i + BATCH_SIZE]
        await update_batch(batch, batch_num, total)

    await database.disconnect()
    logging.info("🎉 All demographic enrichment complete.")


if __name__ == "__main__":
    asyncio.run(main())
