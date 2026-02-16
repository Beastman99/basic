# main.py
from sqlalchemy import func
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from starlette.concurrency import run_in_threadpool

import databases
import sqlalchemy
import os
import logging
import re
from typing import Optional, Dict, Any
from dotenv import load_dotenv
from field_inference import infer_field  # ✅ safe lazy-loaded import

# ──────────────────────────────────────────────────────────────────────────────
# Env setup
# ──────────────────────────────────────────────────────────────────────────────
from dotenv import load_dotenv
from dotenv import load_dotenv
import os

# Point to the frontend .env
frontend_env = os.path.abspath(os.path.join(os.path.dirname(__file__), "../lawbroke-frontend/.env"))
load_dotenv(dotenv_path=frontend_env)



load_dotenv()
logging.basicConfig(level=logging.INFO)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL or not DATABASE_URL.startswith("postgresql"):
    raise RuntimeError("❌ DATABASE_URL must be set and point to a Postgres instance.")
logging.info(f"✅ Using DATABASE_URL: {DATABASE_URL}")

PREDICT_URL = os.getenv("PREDICT_URL")  # optional upstream predictor

# ──────────────────────────────────────────────────────────────────────────────
# FastAPI app setup
# ──────────────────────────────────────────────────────────────────────────────
app = FastAPI(title="LawBroke Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Import and include routers (AFTER app is defined)
from routes import signup, login
app.include_router(signup.router)
app.include_router(login.router)

# ──────────────────────────────────────────────────────────────────────────────
# Database
# ──────────────────────────────────────────────────────────────────────────────
database = databases.Database(DATABASE_URL)
metadata = sqlalchemy.MetaData()

barristers_enriched = sqlalchemy.Table(
    "barristers_enriched",
    metadata,
    sqlalchemy.Column("barrister_name", sqlalchemy.String),
    sqlalchemy.Column("inferred_field_of_law", sqlalchemy.String),
    sqlalchemy.Column("num_cases", sqlalchemy.Integer),
    sqlalchemy.Column("most_recent_year", sqlalchemy.Integer),
    sqlalchemy.Column("avg_reasoning_score", sqlalchemy.Float),
    sqlalchemy.Column("our_ranking", sqlalchemy.Float),
    sqlalchemy.Column("reasoning_score_by_field", sqlalchemy.String),
    sqlalchemy.Column("address", sqlalchemy.String),
    sqlalchemy.Column("phone", sqlalchemy.String),
)

# ──────────────────────────────────────────────────────────────────────────────
# Lifecycle
# ──────────────────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

# ──────────────────────────────────────────────────────────────────────────────
# Health Check
# ──────────────────────────────────────────────────────────────────────────────
@app.get("/")
def health():
    return {"status": "live"}

# ──────────────────────────────────────────────────────────────────────────────
# Barristers (FindLawyer)
# ──────────────────────────────────────────────────────────────────────────────
@app.get("/api/barristers")
async def get_barristers(
    summary: str = Query(..., min_length=5, description="User's summary of issue"),
    override_field: Optional[str] = Query(None, description="Optional override for field"),
    postcode: Optional[int] = Query(None, description="Optional AU postcode (4 digits)"),
):
    field = override_field or infer_field(summary)
    query = barristers_enriched.select().where(
        func.lower(barristers_enriched.c.inferred_field_of_law).like(f"%{field.lower()}%")
    )

    rows = await database.fetch_all(query)

    def extract_postcode(address: Optional[str]) -> Optional[int]:
        m = re.search(r"\b\d{4}\b", address or "")
        return int(m.group(0)) if m else None

    results = []
    for row in rows:
        item = dict(row)
        if postcode is not None:
            pc = extract_postcode(item.get("address"))
            item["distance"] = abs(pc - postcode) if pc is not None else None
        results.append(item)

    if postcode is not None:
        results.sort(key=lambda x: x["distance"] if x.get("distance") is not None else 9999)

    return results

# ──────────────────────────────────────────────────────────────────────────────
# Solicitors (FindLawyer)
# ──────────────────────────────────────────────────────────────────────────────
solicitors_enriched = sqlalchemy.Table(
    "solicitors_enriched",
    metadata,
    sqlalchemy.Column("solicitor_name", sqlalchemy.String),
    sqlalchemy.Column("inferred_field_of_law", sqlalchemy.String),
    sqlalchemy.Column("num_cases", sqlalchemy.Integer),
    sqlalchemy.Column("most_recent_year", sqlalchemy.Integer),
    sqlalchemy.Column("avg_reasoning_score", sqlalchemy.Float),
    sqlalchemy.Column("our_ranking", sqlalchemy.Float),
    sqlalchemy.Column("reasoning_score_by_field", sqlalchemy.String),
    sqlalchemy.Column("address", sqlalchemy.String),
    sqlalchemy.Column("phone", sqlalchemy.String),
)

@app.get("/api/solicitors")
async def get_solicitors(
    summary: str = Query(..., min_length=5, description="User's summary of issue"),
    override_field: Optional[str] = Query(None, description="Optional override for field"),
    postcode: Optional[int] = Query(None, description="Optional AU postcode (4 digits)"),
):
    field = override_field or infer_field(summary)

    query = solicitors_enriched.select().where(
        func.lower(solicitors_enriched.c.inferred_field_of_law).like(f"%{field.lower()}%")
    )

    rows = await database.fetch_all(query)

    def extract_postcode(address: Optional[str]) -> Optional[int]:
        m = re.search(r"\b\d{4}\b", address or "")
        return int(m.group(0)) if m else None

    results = []
    for row in rows:
        item = dict(row)
        if postcode is not None:
            pc = extract_postcode(item.get("address"))
            item["distance"] = abs(pc - postcode) if pc is not None else None
        results.append(item)

    if postcode is not None:
        results.sort(key=lambda x: x["distance"] if x.get("distance") is not None else 9999)

    return results


# ──────────────────────────────────────────────────────────────────────────────
# Case Predictor
# ──────────────────────────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    summary: str
    jurisdiction: str

def _load_predict_fn():
    try:
        from predict_outcome_from_input import predict_from_input
        logging.info("🔌 Using predict_outcome_from_input.predict_from_input")
        return predict_from_input
    except Exception:
        pass
    try:
        from predictor_api import predictor_main
        logging.info("🔌 Using predictor_api.predictor_main")
        return predictor_main
    except Exception:
        pass
    return None

def _normalise_prediction(raw: Any) -> Dict[str, Any]:
    if not isinstance(raw, dict):
        raise ValueError("Predictor must return a dict")

    probs = raw.get("probabilities")
    reasoning = raw.get("reasoning")

    if not isinstance(probs, dict):
        raise ValueError("Predictor must return {'probabilities': {...}}")

    values = list(probs.values())
    if values and all(isinstance(v, (int, float)) for v in values):
        if any(v <= 1.0 for v in values) and all(0.0 <= v <= 1.0 for v in values):
            probs = {k: round(float(v) * 100, 2) for k, v in probs.items()}
        else:
            probs = {k: round(float(v), 2) for k, v in probs.items()}
    else:
        raise ValueError("Probabilities must be numeric")

    if reasoning is not None and not isinstance(reasoning, list):
        reasoning = [str(reasoning)]

    return {"probabilities": probs, "reasoning": reasoning} if reasoning else {"probabilities": probs}

@app.post("/api/predict")
async def predict(req: PredictRequest):
    fn = _load_predict_fn()
    if fn is not None:
        try:
            raw = await run_in_threadpool(fn, req.summary, req.jurisdiction)
            return _normalise_prediction(raw)
        except Exception as e:
            logging.exception("Local predictor error")
            raise HTTPException(status_code=500, detail=f"Local predictor error: {e}")

    if PREDICT_URL:
        try:
            import httpx
            async with httpx.AsyncClient(timeout=30) as client:
                r = await client.post(PREDICT_URL, json=req.model_dump())
            if r.status_code == 404:
                raise HTTPException(status_code=502, detail="Upstream predictor 404")
            if r.status_code >= 400:
                raise HTTPException(status_code=502, detail=f"Upstream error {r.status_code}: {r.text[:300]}")
            return _normalise_prediction(r.json())
        except HTTPException:
            raise
        except Exception as e:
            logging.exception("External predictor error")
            raise HTTPException(status_code=502, detail=f"External predictor error: {e}")

    raise HTTPException(
        status_code=501,
        detail="Predictor not configured: expected predict_outcome_from_input or predictor_api or PREDICT_URL",
    )

# ──────────────────────────────────────────────────────────────────────────────
# Entrypoint
# ──────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "10000")))
