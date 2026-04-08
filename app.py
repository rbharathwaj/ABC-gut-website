import os
import fitz
import numpy as np
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rank_bm25 import BM25Okapi
from sentence_transformers import SentenceTransformer, CrossEncoder
import faiss
from openai import OpenAI
import nltk
from nltk.corpus import stopwords

# =========================
# SETUP
# =========================
nltk.download("stopwords")

PDF_FOLDER = "papers"
TOP_K = 3
MODEL_NAME = "gpt-5-nano"

ALPHA = 0.4
BETA = 0.6

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
STOPWORDS = set(stopwords.words("english"))

# globals populated at startup
docs = []
bm25 = None
embed_model = None
reranker = None
faiss_index = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global docs, bm25, embed_model, reranker, faiss_index
    print("Loading models...")
    docs = load_documents(PDF_FOLDER)
    bm25 = build_bm25(docs)
    embed_model = SentenceTransformer("all-MiniLM-L6-v2")
    reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
    faiss_index = build_faiss(docs, embed_model)
    print("Server ready!")
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

# =========================
# REQUEST MODEL
# =========================
class QueryRequest(BaseModel):
    query: str

# =========================
# UTILS
# =========================
def tokenize(text):
    return [w.lower() for w in text.split() if w.lower() not in STOPWORDS]

def extract_query_terms(query):
    words = [w.lower() for w in query.split() if w.lower() not in STOPWORDS]
    return [w for w in words if len(w) > 3]

# =========================
# LOAD DOCUMENTS
# =========================
def load_documents(folder):
    docs = []

    for file in os.listdir(folder):
        if not file.endswith(".pdf"):
            continue

        doc = fitz.open(os.path.join(folder, file))
        pages = []

        for page in doc:
            text = page.get_text().strip()
            if text:
                pages.append(text)

        docs.append({
            "text": "\n".join(pages),
            "source": file
        })

    return docs

# =========================
# BUILD COMPONENTS
# =========================
def build_bm25(docs):
    tokenized = [tokenize(d["text"]) for d in docs]
    return BM25Okapi(tokenized)

def build_faiss(docs, model):
    texts = [d["text"][:5000] for d in docs]
    embeddings = model.encode(texts)
    embeddings = np.array(embeddings).astype("float32")

    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)

    return index

# =========================
# RETRIEVAL
# =========================
def keyword_boost(text, query_terms):
    return sum(1 for t in query_terms if t in text.lower())

def hybrid_search(query, bm25, faiss_index, model, docs):
    query_terms = extract_query_terms(query)

    bm25_scores = np.array(bm25.get_scores(tokenize(query)))

    q_vec = model.encode([query]).astype("float32")
    D, _ = faiss_index.search(q_vec, len(docs))
    emb_scores = 1 / (1 + D[0])

    bm25_norm = (bm25_scores - bm25_scores.min()) / (bm25_scores.max() + 1e-8)
    emb_norm = (emb_scores - emb_scores.min()) / (emb_scores.max() + 1e-8)

    hybrid = ALPHA * bm25_norm + BETA * emb_norm

    boost = np.array([keyword_boost(d["text"], query_terms) for d in docs])
    hybrid += 0.3 * boost

    indices = np.argsort(hybrid)[::-1]

    top_idx = []
    seen = set()

    for idx in indices:
        src = docs[idx]["source"]
        if src not in seen:
            top_idx.append(idx)
            seen.add(src)
        if len(top_idx) >= TOP_K:
            break

    return top_idx

# =========================
# PASSAGE SELECTION
# =========================
def get_best_passage(text, query, model, reranker):
    lines = text.split("\n")

    candidates = []
    for line in lines:
        line = line.strip()

        if len(line) < 80:
            continue

        lower = line.lower()

        if any(x in lower for x in ["license", "doi", "author"]):
            continue
        if "[" in line and "]" in line:
            continue
        if any(c.isdigit() for c in line[:5]):
            continue

        candidates.append(line)

    if not candidates:
        return text[:1000]

    # embedding shortlist
    query_emb = model.encode([query])[0]
    line_embs = model.encode(candidates)

    scores = np.dot(line_embs, query_emb) / (
        np.linalg.norm(line_embs, axis=1) * np.linalg.norm(query_emb) + 1e-8
    )

    top_idx = np.argsort(scores)[-10:]
    shortlisted = [candidates[i] for i in top_idx]

    # rerank
    pairs = [(query, s) for s in shortlisted]
    rerank_scores = reranker.predict(pairs)

    return shortlisted[np.argmax(rerank_scores)]

# =========================
# ANSWERING
# =========================
def build_prompt(context, query):
    return f"""
You are a biomedical research assistant.

Answer clearly and confidently.

Structure:
1. Direct answer
2. Supporting evidence
3. Evidence strength

Context:
{context}

Question:
{query}
"""

def generate_answer(prompt):
    resp = client.responses.create(
        model=MODEL_NAME,
        input=[{"role": "user", "content": prompt}],
        max_output_tokens=500,
        reasoning={"effort": "low"},
        text={"verbosity": "high"},
    )
    return resp.output_text

def answer_query(query, docs, bm25, faiss_index, model, reranker):
    top_idx = hybrid_search(query, bm25, faiss_index, model, docs)

    context = ""
    for i, idx in enumerate(top_idx):
        doc = docs[idx]
        best = get_best_passage(doc["text"], query, model, reranker)

        context += f"[DOC {i} | {doc['source']}]\n{best}\n\n"

    answer = generate_answer(build_prompt(context, query))
    sources = [docs[i]["source"] for i in top_idx]

    return answer, sources

# =========================
# API ENDPOINT
# =========================
@app.post("/query")
def query_endpoint(req: QueryRequest):
    answer, sources = answer_query(
        req.query,
        docs,
        bm25,
        faiss_index,
        embed_model,
        reranker
    )

    return {
        "answer": answer,
        "sources": sources
    }