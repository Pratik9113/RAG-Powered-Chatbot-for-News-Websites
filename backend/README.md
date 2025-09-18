Voosh RAG News Chatbot - Backend

Overview
- Node.js + Express REST API for a RAG chatbot over a news corpus
- Sessions & caches in Redis; embeddings stored in SQLite; LLM via Gemini
- Ingestion from RSS feeds with Jina embeddings

Quick Start (Local)
1) Install deps:
```bash
cd backend
npm install
```
2) Copy env and set keys:
```bash
cp env.example .env
# set JINA_API_KEY and GEMINI_API_KEY
```
3) Start Redis (locally or provide REDIS_URL).
4) Ingest news (one-time):
```bash
npm run ingest
```
5) Run server:
```bash
npm run dev
# Server at http://localhost:5001
```

Environment Variables
- PORT: default 5001
- REDIS_URL: e.g. rediss://default:PASS@host:port (Redis Cloud)
- DB_PATH: path to SQLite file (default rag.db)
- SESSION_TTL_SECONDS: default 86400 (1 day)
- SESSION_HISTORY_MAX: default 200
- ANSWER_CACHE_TTL_SECONDS: default 600
- QUERY_CACHE_TTL_SECONDS: default 300
- PERSIST_TRANSCRIPTS: 'true' to also persist chats to SQLite
- JINA_API_KEY: Jina embeddings key (required for ingestion)
- GEMINI_API_KEY: Gemini key (required to answer)
- GEMINI_MODEL: default gemini-1.5-flash
- RSS_FEEDS: comma-separated RSS URLs
- INGEST_MAX_ITEMS: cap items to embed (default 60)
- INGEST_BATCH_SIZE: batch size for embeddings (default 8)

Scripts
- npm run dev: start server with nodemon
- npm start: start server
- npm run ingest: fetch ~50 news items and index into SQLite

API
- GET /health → { ok: true }
- GET /health/redis → { ok: true }
- GET /session/new → { sessionId }
- POST /api/chat { sessionId?, message, topK? } → { sessionId, answer, contexts }
- GET /api/history/:sessionId → { messages }
- DELETE /api/history/:sessionId → { ok: true }
- GET /api/stream?q=... (SSE) → tokens for typing effect

Architecture (brief)
- Ingestion (scripts/ingest.js) pulls RSS, embeds with Jina, stores docs+vectors in SQLite
- Retrieval (src/services/retrieval.js) embeds question, finds top‑K via cosine over BLOB vectors
- Gemini (src/services/gemini.js) generates answer with provided contexts
- Redis (src/redis.js, src/services/cache.js) stores session history and caches (answers, q-emb, contexts)

Deployment (Render.com)
- Root Directory: backend
- Build Command: npm install
- Start Command: npm start
- Set env: REDIS_URL, JINA_API_KEY, GEMINI_API_KEY, RSS_FEEDS, etc.
- Native module note: better-sqlite3 is rebuilt via postinstall; if needed set npm_config_build_from_source=true
- After first deploy, run: npm run ingest

Cache Warming (optional)
- Precompute popular queries: call retrieval once to cache q-embedding/contexts, then /api/chat to cache final answers


