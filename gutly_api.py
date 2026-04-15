import os
import sqlite3
import fitz
import numpy as np
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rank_bm25 import BM25Okapi
from sentence_transformers import SentenceTransformer, CrossEncoder
import faiss
from openai import OpenAI
import nltk
from nltk.corpus import stopwords
from collections import defaultdict

# =========================
# SETUP
# =========================
nltk.download("stopwords")

PDF_FOLDER = "papers"
TOP_K = 3
MODEL_NAME = "gpt-4o-mini"

ALPHA = 0.4
BETA = 0.6
CONFIDENCE_THRESHOLD = 0.35

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
STOPWORDS = set(stopwords.words("english"))

# memory
conversation_memory = defaultdict(list)

# globals
docs = []
bm25 = None
embed_model = None
reranker = None
faiss_index = None

# =========================
# TOKENIZATION
# =========================
def tokenize(text):
    return [w.lower() for w in text.split() if w.lower() not in STOPWORDS]

def extract_query_terms(query):
    return [w.lower() for w in query.split() if len(w) > 3 and w not in STOPWORDS]

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

    # normalize again
    hybrid = (hybrid - hybrid.min()) / (hybrid.max() + 1e-8)

    confidence = float(np.max(hybrid))

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

    return top_idx, confidence

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

    query_emb = model.encode([query])[0]
    line_embs = model.encode(candidates)

    scores = np.dot(line_embs, query_emb) / (
        np.linalg.norm(line_embs, axis=1) * np.linalg.norm(query_emb) + 1e-8
    )

    top_idx = np.argsort(scores)[-10:]
    shortlisted = [candidates[i] for i in top_idx]

    pairs = [(query, s) for s in shortlisted]
    rerank_scores = reranker.predict(pairs)

    return shortlisted[np.argmax(rerank_scores)]

# =========================
# QUERY CLASSIFIER
# =========================
def is_general_query(query):
    keywords = ["what is", "who is", "define", "capital", "history"]
    return any(k in query.lower() for k in keywords)

# =========================
# PROMPTS
# =========================
def build_prompt(context, query, history):
    history_text = ""
    for hq, ha in history[-3:]:
        history_text += f"Q: {hq}\nA: {ha}\n\n"

    return f"""
You are a biomedical research assistant.

Conversation History:
{history_text}

Context:
{context}

Question:
{query}

Answer with:
1. Direct answer
2. Supporting evidence
3. Evidence strength
"""

def build_general_prompt(query, history):
    history_text = ""
    for hq, ha in history[-3:]:
        history_text += f"Q: {hq}\nA: {ha}\n\n"

    return f"""
You are a knowledgeable assistant.

Conversation History:
{history_text}

Question:
{query}

Answer clearly and directly.
"""

# =========================
# LLM CALL
# =========================
def generate_answer(prompt):
    resp = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=800,
    )
    return resp.choices[0].message.content or "⚠️ No answer generated"

# =========================
# MAIN PIPELINE
# =========================
def answer_query(query, session_id):
    history = conversation_memory[session_id]

    top_idx, confidence = hybrid_search(
        query, bm25, faiss_index, embed_model, docs
    )

    use_rag = True

    if confidence < CONFIDENCE_THRESHOLD or is_general_query(query):
        use_rag = False

    if use_rag:
        context = ""
        for i, idx in enumerate(top_idx):
            doc = docs[idx]
            best = get_best_passage(doc["text"], query, embed_model, reranker)
            context += f"[DOC {i} | {doc['source']}]\n{best}\n\n"

        prompt = build_prompt(context, query, history)
        sources = [docs[i]["source"] for i in top_idx]
    else:
        prompt = build_general_prompt(query, history)
        sources = []

    answer = generate_answer(prompt)

    history.append((query, answer))

    return answer, sources, use_rag, confidence

# =========================
# PARSE OUTPUT FOR FRONTEND
# =========================
def parse_answer_sections(answer_text):
    sections = {
        "direct": "",
        "evidence": "",
        "strength": ""
    }

    if not answer_text:
        return sections

    lines = answer_text.split("\n")
    current = None

    for line in lines:
        l = line.lower()

        if "direct answer" in l:
            current = "direct"
            continue
        elif "supporting evidence" in l:
            current = "evidence"
            continue
        elif "evidence strength" in l:
            current = "strength"
            continue

        if current:
            sections[current] += line + "\n"

    return {k: v.strip() for k, v in sections.items()}

# =========================
# DATABASE
# =========================
DB_PATH = "abcgut.db"

def init_db():
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS waitlist (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT,
            last_name  TEXT,
            email      TEXT NOT NULL,
            joined_at  TEXT NOT NULL
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS signups (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       TEXT NOT NULL,
            email      TEXT NOT NULL UNIQUE,
            plan       TEXT,
            joined_at  TEXT NOT NULL
        )
    """)
    con.commit()
    con.close()

def get_db():
    return sqlite3.connect(DB_PATH)

# =========================
# FASTAPI INIT
# =========================
@asynccontextmanager
async def lifespan(app: FastAPI):
    global docs, bm25, embed_model, reranker, faiss_index

    init_db()
    print("Loading models...")
    docs = load_documents(PDF_FOLDER)
    bm25 = build_bm25(docs)
    embed_model = SentenceTransformer("BAAI/bge-base-en-v1.5")
    reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
    faiss_index = build_faiss(docs, embed_model)

    print("Server ready!")
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

# =========================
# REQUEST MODELS
# =========================
class QueryRequest(BaseModel):
    query: str
    session_id: str = "default"

class WaitlistRequest(BaseModel):
    first_name: str = ""
    last_name: str = ""
    email: str

class SignupRequest(BaseModel):
    name: str
    email: str
    plan: str = ""

# =========================
# ENDPOINTS
# =========================
@app.post("/waitlist")
def waitlist_endpoint(req: WaitlistRequest):
    if not req.email:
        raise HTTPException(status_code=400, detail="Email is required")
    now = datetime.now(timezone.utc).isoformat()
    con = get_db()
    try:
        con.execute(
            "INSERT INTO waitlist (first_name, last_name, email, joined_at) VALUES (?, ?, ?, ?)",
            (req.first_name, req.last_name, req.email, now)
        )
        con.commit()
    finally:
        con.close()
    return {"ok": True}

@app.post("/signup")
def signup_endpoint(req: SignupRequest):
    if not req.email or not req.name:
        raise HTTPException(status_code=400, detail="Name and email are required")
    now = datetime.now(timezone.utc).isoformat()
    con = get_db()
    try:
        con.execute(
            "INSERT OR IGNORE INTO signups (name, email, plan, joined_at) VALUES (?, ?, ?, ?)",
            (req.name, req.email, req.plan, now)
        )
        con.commit()
    finally:
        con.close()
    return {"ok": True}

@app.post("/query")
def query_endpoint(req: QueryRequest):
    answer, sources, used_rag, confidence = answer_query(
        req.query,
        req.session_id
    )

    parsed = parse_answer_sections(answer)

    return {
        "query": req.query,
        "answer": {
            "direct": parsed["direct"],
            "evidence": parsed["evidence"],
            "strength": parsed["strength"],
            "raw": answer
        },
        "meta": {
            "mode": "RAG" if used_rag else "LLM",
            "confidence": round(confidence, 3),
            "sources": sources,
            "session_id": req.session_id
        }
    }
