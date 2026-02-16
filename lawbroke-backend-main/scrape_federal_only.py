import asyncio
import cloudscraper
from bs4 import BeautifulSoup
from tqdm import tqdm
import time
import random
import databases
import sqlalchemy

# ───────────────────────────────────────────────
# CONFIG
# ───────────────────────────────────────────────
DATABASE_URL = "postgresql://lawbroke_db_00yg_user:rfyeQvc51e3oYNLuklzNXlGIGZ5DzebC@dpg-d1u9ffmr433s73egj18g-a.oregon-postgres.render.com/lawbroke_db_00yg?sslmode=require"
BASE = "https://www.fedcourt.gov.au"
LIST_URL = f"{BASE}/about/judges/current-judges-appointment/current-judges"

database = databases.Database(DATABASE_URL)
metadata = sqlalchemy.MetaData()

# ───────────────────────────────────────────────
# SCRAPER
# ───────────────────────────────────────────────
def get_scraper():
    return cloudscraper.create_scraper(
        browser={"browser": "chrome", "platform": "darwin", "mobile": False}
    )

def scrape_listing(scraper):
    resp = scraper.get(LIST_URL, timeout=30)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    links = []
    for a in soup.select("div#content a[href*='/about/judges/current-judges-appointment/current-judges/']"):
        href = a["href"]
        name = a.get_text(strip=True)
        if not href.startswith("http"):
            href = BASE + href
        links.append({"name": name, "url": href})
    return links

def scrape_detail(scraper, url):
    time.sleep(random.uniform(0.7, 1.4))
    r = scraper.get(url, timeout=30)
    if r.status_code != 200:
        return None
    soup = BeautifulSoup(r.text, "html.parser")

    title_tag = soup.find("h1")
    title = title_tag.get_text(strip=True) if title_tag else ""

    text = soup.get_text(" ", strip=True)
    appoint, location = "", ""
    if "Judge, Federal Court of Australia:" in text:
        appoint = text.split("Judge, Federal Court of Australia:")[1].split("Location:")[0].strip()
    if "Location:" in text:
        location = text.split("Location:")[1].split("Other Commissions")[0].strip().split()[0]

    return {
        "full_name": title,
        "title": "Justice" if "Justice" in title else "",
        "appointment": appoint,
        "location": location,
        "url_source": url,
        "court_level": "Federal Court of Australia",
    }

# ───────────────────────────────────────────────
# DATABASE OPS
# ───────────────────────────────────────────────
async def ensure_columns():
    """Add missing columns safely."""
    async with database.transaction():
        for col, dtype in [
            ("full_name", "TEXT"),
            ("title", "TEXT"),
            ("court_level", "TEXT"),
            ("start_year", "INTEGER"),
            ("url_source", "TEXT"),
            ("appointment", "TEXT"),
            ("location", "TEXT"),
        ]:
            query = f'ALTER TABLE case_judges ADD COLUMN IF NOT EXISTS {col} {dtype};'
            try:
                await database.execute(query=query)
            except Exception:
                pass

async def insert_or_update(judge):
    """Upsert judge by full_name."""
    query = """
    INSERT INTO case_judges (full_name, title, court_level, start_year, url_source, appointment, location)
    VALUES (:full_name, :title, :court_level, NULL, :url_source, :appointment, :location)
    ON CONFLICT (full_name) DO UPDATE
    SET title = EXCLUDED.title,
        court_level = EXCLUDED.court_level,
        url_source = EXCLUDED.url_source,
        appointment = EXCLUDED.appointment,
        location = EXCLUDED.location;
    """
    await database.execute(query=query, values=judge)

# ───────────────────────────────────────────────
# MAIN
# ───────────────────────────────────────────────
async def main():
    print(f"🌐 Scraping Federal Court: {LIST_URL}")
    scraper = get_scraper()
    links = scrape_listing(scraper)
    print(f"✅ Found {len(links)} judge links")

    await database.connect()
    await ensure_columns()

    added = 0
    for entry in tqdm(links, desc="Fetching + inserting"):
        detail = scrape_detail(scraper, entry["url"])
        if detail and detail.get("full_name"):
            await insert_or_update(detail)
            added += 1

    await database.disconnect()
    print(f"✅ Inserted or updated {added} Federal Court judges into case_judges")

if __name__ == "__main__":
    asyncio.run(main())
