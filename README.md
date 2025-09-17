Backend Structure 

RAG News Chatbot - Backend

Setup
- Copy .env.example to .env and fill keys
- Start Redis locally or provide REDIS_URL
- Install deps and run dev

Commands
- npm run dev: start server with auto-reload
- npm run ingest: fetch ~50 news items from RSS and index into SQLite

Environment
- PORT: default 5001
- REDIS_URL: redis://127.0.0.1:6379
- DB_PATH: rag.db
- SESSION_TTL_SECONDS: 86400 (1 day)
- SESSION_HISTORY_MAX: max messages kept per session (default 200)
- JINA_API_KEY: Jina embeddings key
- GEMINI_API_KEY: Gemini key
- GEMINI_MODEL: gemini-1.5-flash
- RSS_FEEDS: comma separated RSS URLs
- INGEST_MAX_ITEMS: cap items to embed
- ANSWER_CACHE_TTL_SECONDS: cache TTL for final answers (default 600s)
- QUERY_CACHE_TTL_SECONDS: cache TTL for query embedding/context (default 300s)
- PERSIST_TRANSCRIPTS: if 'true', persist chat to SQLite `transcripts` (optional)

Caching
- Chat messages stored per-session in Redis list key session:{sessionId}:messages
- TTL is refreshed on each message; configure via SESSION_TTL_SECONDS

Cache Warming
- On deploy, you can pre-warm by calling `/api/chat` with a set of common FAQs
  or run a small script that batches common queries and primes `answer:*`, `qvec:*`, and `ctx:*` keys.
  Example pseudo:
  1) For each popular query, call retrieval once to compute and cache q-embedding and contexts
  2) Call `/api/chat` to populate final answer cache
  3) Set higher TTLs during warm-up via env if needed

API
- GET /health
- GET /session/new → { sessionId }
- POST /api/chat { sessionId?, message }
- GET /api/history/:sessionId
- DELETE /api/history/:sessionId
- GET /api/stream?q=question (SSE stream)

Code Walkthrough
- Ingestion (`scripts/ingest.js`): fetches RSS items, stores in `documents`, embeds with Jina, stores vectors in `embeddings` (SQLite). Retrieval is brute-force cosine.
- Redis sessions (`src/redis.js`, `src/routes/chat.js`): chat history per session in `session:{sessionId}:messages` list. TTL via `SESSION_TTL_SECONDS` is refreshed on writes.
- Chat flow: frontend calls `/api/chat` which retrieves top-k context, calls Gemini, persists both user and assistant messages.
- Streaming: `/api/stream` provides a typed-out effect by splitting Gemini text into tokens.











Frontend Structure 


