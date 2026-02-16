import asyncio
import os
import re
import requests
from bs4 import BeautifulSoup
import databases
from dotenv import load_dotenv
from tqdm import tqdm

BASE = "https://www.familyeducation.com"
INDEX_URL = f"{BASE}/baby-names/surname/origin"

load_dotenv("../lawbroke-frontend/.env")
DATABASE_URL = os.getenv("DATABASE_URL")
database = databases.Database(DATABASE_URL)

# ───────────────────────────────────────────────────────────────
# Create table if not exists
# ───────────────────────────────────────────────────────────────
CREATE_TABLE = """
CREATE TABLE IF NOT EXISTS surname_reference (
    id SERIAL PRIMARY KEY,
    surname TEXT UNIQUE,
    origin TEXT,
    meaning TEXT,
    source_url TEXT
);
"""

UPSERT = """
INSERT INTO surname_reference (surname, origin, meaning, source_url)
VALUES (:surname, :origin, :meaning, :source_url)
ON CONFLICT (surname) DO UPDATE SET
    origin = EXCLUDED.origin,
    meaning = EXCLUDED.meaning,
    source_url = EXCLUDED.source_url;
"""

# ───────────────────────────────────────────────────────────────
# Utility functions
# ───────────────────────────────────────────────────────────────
HEADERS = {"User-Agent": "Mozilla/5.0"}

def get_soup(url: str):
    r = requests.get(url, headers=HEADERS)
    r.raise_for_status()
    return BeautifulSoup(r.text, "html.parser")

def scrape_origin_links():
    """Extract all origin links from the index page."""
    soup = get_soup(INDEX_URL)
    links = []
    for a in soup.select("ul.baby-names-list a[href*='/baby-names/surname/origin/']"):
        href = a.get("href")
        origin = a.text.strip()
        if href and origin:
            links.append((origin, BASE + href))
    return links

def scrape_surnames_for_origin(origin: str, url: str):
    """Extract all surnames listed on an origin page."""
    soup = get_soup(url)
    names = []
    for a in soup.select("ul li a"):
        surname = a.text.strip()
        if not surname or len(surname) < 2 or not surname[0].isalpha():
            continue
        link = a.get("href")
        if link and not link.startswith("http"):
            link = BASE + link
        names.append({"surname": surname, "origin": origin, "source_url": link or url, "meaning": None})
    return names

# ───────────────────────────────────────────────────────────────
# Main
# ───────────────────────────────────────────────────────────────
async def main():
    await database.connect()
    await database.execute(CREATE_TABLE)

    origins = scrape_origin_links()
    print(f"✅ Found {len(origins)} origins")

    all_records = []
    for origin, url in tqdm(origins, desc="Scraping origins"):
        try:
            records = scrape_surnames_for_origin(origin, url)
            for r in records:
                await database.execute(UPSERT, r)
            print(f"  ↳ {origin}: {len(records)} names")
            all_records.extend(records)
        except Exception as e:
            print(f"❌ {origin} failed: {e}")

    await database.disconnect()
    print(f"✅ Completed. Inserted or updated ~{len(all_records)} surnames")

if __name__ == "__main__":
    asyncio.run(main())
