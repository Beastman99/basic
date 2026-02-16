from transformers import AutoTokenizer, AutoModel
import torch
from sklearn.metrics.pairwise import cosine_similarity

# Load once and reuse
tokenizer = AutoTokenizer.from_pretrained("nlpaueb/legal-bert-base-uncased")
model = AutoModel.from_pretrained("nlpaueb/legal-bert-base-uncased")
model.eval()  # Important: inference mode

# Legal field labels + prompts
field_labels = [
    "Criminal Law", "Family Law", "Administrative Law", "Employment Law", "Constitutional Law",
    "Commercial Law", "Property Law", "Wills and Estates", "Equity and Trusts",
    "Contract Law", "Tort Law", "General Law"
]

field_prompts = [
    "Charged with a criminal offence or arrested",
    "Issues relating to custody, divorce or parenting",
    "Government decisions like visa or benefits rejections",
    "Unfair dismissal or workplace issues",
    "Challenging the constitutionality of a law",
    "Business contract breaches or commercial disputes",
    "Disputes over property or land ownership",
    "Disputes over wills, deceased estates or inheritance",
    "Matters involving trusts or equitable relief",
    "Issues around contracts or contract breaches",
    "Personal injury or negligence claims",
    "General legal query"
]

# Precompute embeddings
def get_embedding(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state[:, 0, :].numpy()

field_embeddings = [get_embedding(p) for p in field_prompts]

# Main inference function
def infer_field(text):
    user_emb = get_embedding(text)
    sims = [cosine_similarity(user_emb, field_emb)[0][0] for field_emb in field_embeddings]
    return field_labels[sims.index(max(sims))]
