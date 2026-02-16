import re
import asyncio
import pandas as pd
import databases
from dotenv import load_dotenv
import os

URL = "https://supremecourt.nsw.gov.au/about-us/judges/judges-1974---.html"

load_dotenv("../lawbroke-frontend/.env")
DATABASE_URL = os.getenv("DATABASE_URL")
database = databases.Database(DATABASE_URL)


def norm_name(s: str) -> str:
    if not s:
        return ""
    s = re.sub(r"\s+", " ", str(s)).strip()
    s = re.sub(r"^\b(The Hon(?:ourable)?\.?\s*)?(Chief\s+Justice|President|Justice)\b\.?\s*", "", s, flags=re.I)
    s = re.sub(r"\(.*?\)", "", s)  # remove (1916–1984)
    return s.strip()


def to_year(s: str):
    if not isinstance(s, str):
        s = str(s)
    m = re.search(r"(19|20)\d{2}", s)
    return int(m.group(0)) if m else None


def load_table():
    tables = pd.read_html(URL, flavor="lxml")
    df = max(tables, key=lambda t: t.shape[1])  # pick the widest table
    df.columns = [str(c).strip() for c in df.columns]

    # Try to identify key columns
    colmap = {}
    for c in df.columns:
        c_low = c.lower()
        if "name" in c_low:
            colmap["name"] = c
        elif "commence" in c_low or "start" in c_low:
            colmap["start"] = c
        elif "conclude" in c_low or "end" in c_low:
            colmap["end"] = c
        elif "service" in c_low or "details" in c_low:
            colmap["details"] = c

    results = []
    for _, row in df.iterrows():
        name_raw = str(row.get(colmap.get("name", ""), "")).strip()
        if not name_raw or name_raw.lower() == "name":
            continue

        start_text = str(row.get(colmap.get("start", ""), "")).strip()
        end_text = str(row.get(colmap.get("end", ""), "")).strip()
        details = str(row.get(colmap.get("details", ""), "")).strip()

        results.append({
            "full_name": norm_name(name_raw),
            "title": "Justice",
            "start_year": to_year(start_text),
            "end_year": to_year(end_text),
            "appointment": details,
            "court_level": "Supreme Court (NSW)",
            "url_source": URL,
            "location": None
        })
    return results


ALTERS = [
    "ALTER TABLE case_judges ADD COLUMN IF NOT EXISTS full_name TEXT;",
    "ALTER TABLE case_judges ADD COLUMN IF NOT EXISTS title TEXT;",
    "ALTER TABLE case_judges ADD COLUMN IF NOT EXISTS start_year INTEGER;",
    "ALTER TABLE case_judges ADD COLUMN IF NOT EXISTS end_year INTEGER;",
    "ALTER TABLE case_judges ADD COLUMN IF NOT EXISTS court_level TEXT;",
    "ALTER TABLE case_judges ADD COLUMN IF NOT EXISTS url_source TEXT;",
    "ALTER TABLE case_judges ADD COLUMN IF NOT EXISTS location TEXT;",
    "ALTER TABLE case_judges ADD COLUMN IF NOT EXISTS appointment TEXT;",
    "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname='case_judges_full_name_key') THEN CREATE UNIQUE INDEX case_judges_full_name_key ON case_judges(full_name); END IF; END $$;",
]

UPSERT = """
INSERT INTO case_judges
(full_name, title, start_year, end_year, court_level, url_source, location, appointment)
VALUES (:full_name, :title, :start_year, :end_year, :court_level, :url_source, :location, :appointment)
ON CONFLICT (full_name) DO UPDATE SET
title = EXCLUDED.title,
start_year = EXCLUDED.start_year,
end_year = EXCLUDED.end_year,
court_level = EXCLUDED.court_level,
url_source = EXCLUDED.url_source,
location = EXCLUDED.location,
appointment = EXCLUDED.appointment;
"""


async def main():
    await database.connect()
    for q in ALTERS:
        try:
            await database.execute(q)
        except Exception:
            pass

    judges = load_table()
    count = 0
    for j in judges:
        await database.execute(UPSERT, j)
        count += 1

    await database.disconnect()
    print(f"✅ Upserted {count} NSW judges (1974–present) into case_judges")


if __name__ == "__main__":
    asyncio.run(main())
