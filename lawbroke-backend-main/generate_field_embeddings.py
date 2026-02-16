import json
from transformers import AutoTokenizer, AutoModel
import torch
import torch.nn.functional as F

FIELDS = [
    "Administrative Law", "Commercial Law", "Constitutional Law", "Contract Law",
    "Criminal Law", "Employment Law", "Equity and Trusts", "Evidence and Procedure",
    "Family Law", "Property Law", "Tort Law", "Wills and Estates"
]

tokenizer = AutoTokenizer.from_pretrained("auslaw/EmuBERT")
model = AutoModel.from_pretrained("auslaw/EmuBERT")

def embed_text(text):
    tokens = tokenizer(text, return_tensors="pt", padding=True, truncation=True)
    with torch.no_grad():
        output = model(**tokens)
    last_hidden_state = output.last_hidden_state
    mask = tokens["attention_mask"].unsqueeze(-1)
    embedding = (last_hidden_state * mask).sum(1) / mask.sum(1)
    return F.normalize(embedding, p=2, dim=1).squeeze().tolist()

embeddings = {field: embed_text(field) for field in FIELDS}

with open("field_embeddings.json", "w") as f:
    json.dump(embeddings, f, indent=2)
