
# ABC Gut Website

Marketing site, user dashboard, and AI chatbot for ABC Gut — a gut microbiome testing company.

## What's in here

- **Landing page** — hero, how it works, science section, pricing, testimonials
- **Signup page** — two flows: buy a plan (Test Kit / Annual Subscription) or redeem a physical kit code (Walgreens/CVS)
- **User dashboard** — view gut health reports, download them, access Gutly AI
- **Report viewer** — full microbiome report with score, phylum breakdown, SCFA analysis, disease risk panels, and action plan
- **Gutly AI chatbot** — asks questions to the backend RAG API and displays answers with sources
- **Admin panel** (`/admin`) — view all signups, upload reports for users, manage redemption codes, remove users

## Tech stack

- **Frontend:** Vite + React, CSS Modules, DM Sans / DM Serif Display fonts
- **Data (local/demo):** localStorage-based DB in `src/data/db.js` — swap function bodies for real API calls when backend is ready
- **Chatbot backend:** FastAPI + RAG pipeline in `gutly_api.py`, hosted on HuggingFace Spaces

## Chatbot backend (`gutly_api.py`)

The chatbot sends questions to a RAG (Retrieval-Augmented Generation) pipeline:

1. **PDF knowledge base** — place research papers in the `/papers` folder; the server indexes them on startup
2. **Hybrid search** — combines BM25 keyword search and semantic embeddings (BAAI/bge-base-en-v1.5) to find relevant passages
3. **Reranker** — cross-encoder (ms-marco-MiniLM-L-6-v2) picks the best passage per document
4. **Answer generation** — context + question sent to OpenAI to generate the final response

### To improve responses

- **Better answers** → edit `build_prompt()` in `gutly_api.py`
- **More knowledge** → add PDFs to the `/papers` folder
- **Smarter model** → change `MODEL_NAME` at the top of `gutly_api.py`
- **Tuning retrieval** → adjust `TOP_K`, `ALPHA`, `BETA` constants

## Local development

```bash
npm install
npm run dev
```

Admin panel is at `/admin` — only accessible to users with `role: admin`.
