# routes/match_field.py
from fastapi import APIRouter
from pydantic import BaseModel
from field_inference import infer_field

router = APIRouter()

class MatchFieldRequest(BaseModel):
    text: str

@router.post("/api/match-field")
async def match_field(req: MatchFieldRequest):
    field = infer_field(req.text)
    return {"field": field}
 