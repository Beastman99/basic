from transformers import AutoTokenizer, AutoModel
import torch
from sklearn.metrics.pairwise import cosine_similarity

# Load legal-BERT model
tokenizer = AutoTokenizer.from_pretrained("nlpaueb/legal-bert-base-uncased")
model = AutoModel.from_pretrained("nlpaueb/legal-bert-base-uncased")

# List of legal fields
FIELD_PROMPTS = {
    "Criminal Law": "This case involves criminal offences like theft, assault, or murder.",
    "Family Law": "This case deals with divorce, custody, or child support disputes.",
    "Administrative Law": "This case concerns government decisions like visas or Centrelink appeals.",
    "Employment Law": "This case is about workplace rights, unfair dismissal, or wage disputes.",
    "Wills and Estates": "This case involves probate, wills, or distribution of estates.",
    "Commercial Law": "This case relates to business, corporations, or trade practices.",
    "Constitutional Law": "This case challenges the powers of parliament or government.",
    "Property Law": "This case is about land ownership, boundaries, or property disputes.",
    "Equity and Trusts": "This case involves fiduciary duties or disputes over trusts.",
    "Contract Law": "This case is about breach of contract or contract interpretation.",
    "Tort Law": "This case involves negligence, defamation, or civil wrongs.",
    "General Law": "This case does not clearly fall into a specific legal category."
}


# Helper: get embedding
def get_embedding(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state[:, 0, :].numpy()  # Use [CLS] token

field_embeddings = [get_embedding(prompt) for prompt in FIELD_PROMPTS.values()]
FIELDS = list(FIELD_PROMPTS.keys())


# Main function
def infer_field(user_text):
    user_embedding = get_embedding(user_text)
    sims = [cosine_similarity(user_embedding, f_emb)[0][0] for f_emb in field_embeddings]
    best_index = sims.index(max(sims))
    return FIELDS[best_index]
