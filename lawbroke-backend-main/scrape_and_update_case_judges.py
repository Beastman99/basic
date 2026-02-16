import asyncio
import re
import databases
import sqlalchemy
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm

# ────────────────────────────────────────────────────────────────
# CONFIG
# ────────────────────────────────────────────────────────────────
DATABASE_URL = "postgresql://lawbroke_db_00yg_user:rfyeQvc51e3oYNLuklzNXlGIGZ5DzebC@dpg-d1u9ffmr433s73egj18g-a.oregon-postgres.render.com/lawbroke_db_00yg?sslmode=require"
database = databases.Database(DATABASE_URL)
metadata = sqlalchemy.MetaData()

# ────────────────────────────────────────────────────────────────
# UTILS
# ────────────────────────────────────────────────────────────────

def clean_text(text):
    return re.sub(r"\s+", " ", text.strip())

def ensure_columns_exist():
    """Add any missing enrichment columns safely."""
    engine = sqlalchemy.create_engine(DATABASE_URL)
    with engine.connect() as conn:
        for col, coltype in [
            ("full_name", "TEXT"),
            ("title", "TEXT"),
            ("court_level", "TEXT"),
            ("start_year", "INTEGER"),
            ("url_source", "TEXT"),
        ]:
            try:
                conn.execute(f"ALTER TABLE case_judges ADD COLUMN IF NOT EXISTS {col} {coltype};")
            except Exception as e:
                print(f"⚠️ Could not ensure column {col}: {e}")

# ────────────────────────────────────────────────────────────────
# SCRAPERS
# ────────────────────────────────────────────────────────────────

def scrape_nsw_supreme():
    url = "https://supremecourt.nsw.gov.au/about-us/contact-us/judicial-officer-contacts.html"
    print(f"🌐 Scraping NSW Supreme Court: {url}")
    html = requests.get(url, timeout=20).text
    soup = BeautifulSoup(html, "html.parser")

    judges = []
    for p in soup.find_all(["p", "li"]):
        text = clean_text(p.get_text())
        if not text or "Justice" not in text:
            continue
        # Example: "The Hon Justice Lucy McCallum — Chief Justice of NSW"
        name_match = re.search(r"(The Hon|Honourable)?\s*(Justice|Associate Justice|Chief Justice|Mr Justice|Ms Justice)\s+([A-Za-z\-\s']+)", text)
        if name_match:
            title = name_match.group(2)
            full_name = clean_text(name_match.group(3))
            judges.append({
                "full_name": full_name,
                "title": title,
                "court_level": "Supreme Court (NSW)",
                "url_source": url
            })
    return judges

def scrape_federal_court():
    url = "https://www.fedcourt.gov.au/about/judges/current-judges-appointment/current-judges"
    print(f"🌐 Scraping Federal Court: {url}")
    r = requests.get(url, timeout=20)
    soup = BeautifulSoup(r.text, "html.parser")

    judges = []
    # Match both Chief Justice and ordinary judges
    for div in soup.select("div.judge, div.judges-list div"):
        name_tag = div.find("h3")
        if not name_tag:
            continue
        full_name = name_tag.get_text(strip=True)
        if not full_name or "vacant" in full_name.lower():
            continue

        judges.append({
            "full_name": full_name,
            "title": "Justice" if "Chief" not in full_name else "Chief Justice",
            "court_level": "Federal Court",
            "url_source": url
        })

    print(f"🧩 Extracted {len(judges)} Federal Court judges")
    return judges



# ────────────────────────────────────────────────────────────────
# MAIN
# ────────────────────────────────────────────────────────────────

async def main():
    ensure_columns_exist()
    await database.connect()

    all_judges = scrape_nsw_supreme() + scrape_federal_court()
    print(f"🧩 Extracted {len(all_judges)} judges total")

    for j in tqdm(all_judges):
        # Prevent duplicates by full name + court_level
        existing = await database.fetch_one(
            """
            SELECT id FROM case_judges
            WHERE full_name = :full_name AND court_level = :court_level
            """,
            {"full_name": j["full_name"], "court_level": j["court_level"]}
        )
        if existing:
            continue

        await database.execute(
            """
            INSERT INTO case_judges (full_name, title, court_level, start_year, url_source)
            VALUES (:full_name, :title, :court_level, :start_year, :url_source)
            """,
            j
        )

    await database.disconnect()
    print("✅ Judge enrichment complete.")

# ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    asyncio.run(main())
