# 📰 RAG News Chatbot

An end-to-end **Retrieval-Augmented Generation (RAG)** chatbot that answers news-related questions.
Backend provides ingestion, embedding, and chat APIs.
Frontend is a lightweight React app with streaming responses.

---

## 🚀 Project Structure

```
.
├── backend/      # Node.js + Express + SQLite + Redis
└── frontend/     # React + Vite
```

---

## ✨ Features

* **RAG pipeline** – fetches and embeds \~50 latest news articles from RSS feeds.
* **Gemini integration** – uses Google Gemini for final answers.
* **Redis session store** – per-session chat history with configurable TTL.
* **Streaming responses** – Server-Sent Events (SSE) for a typewriter effect.
* **Cache warming** – optional pre-population of embedding and answer caches.

---

## 🛠️ Backend

### Setup

1. **Environment file**

   Copy `.env.example` to `.env` and fill in the keys:

   ```bash
   cp backend/.env.example backend/.env
   ```

   | Key                        | Description                                   | Default                  |
   | -------------------------- | --------------------------------------------- | ------------------------ |
   | `PORT`                     | HTTP port                                     | `5001`                   |
   | `REDIS_URL`                | Redis connection URL                          | `redis://127.0.0.1:6379` |
   | `DB_PATH`                  | SQLite database file                          | `rag.db`                 |
   | `SESSION_TTL_SECONDS`      | Session TTL in seconds                        | `86400`                  |
   | `SESSION_HISTORY_MAX`      | Max messages kept per session                 | `200`                    |
   | `JINA_API_KEY`             | Jina embeddings API key                       | –                        |
   | `GEMINI_API_KEY`           | Gemini API key                                | –                        |
   | `GEMINI_MODEL`             | Gemini model                                  | `gemini-1.5-flash`       |
   | `RSS_FEEDS`                | Comma-separated RSS URLs                      | –                        |
   | `INGEST_MAX_ITEMS`         | Max RSS items to embed                        | –                        |
   | `ANSWER_CACHE_TTL_SECONDS` | TTL for final answer cache                    | `600`                    |
   | `QUERY_CACHE_TTL_SECONDS`  | TTL for query/context cache                   | `300`                    |
   | `PERSIST_TRANSCRIPTS`      | `true` to persist chat to `transcripts` table | –                        |

2. **Dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Start Redis**

   Local:

   ```bash
   docker run -d --name redis -p 6379:6379 redis:7-alpine
   ```

   Or set `REDIS_URL` to a hosted Redis instance.

4. **Run the server**

   ```bash
   npm run dev
   ```

### Commands

* `npm run dev` – start server with auto-reload.
* `npm run ingest` – fetch \~50 news items from RSS and index them into SQLite.

### API Endpoints

| Method | Path                      | Description                                |
| ------ | ------------------------- | ------------------------------------------ |
| GET    | `/health`                 | Health check                               |
| GET    | `/session/new`            | Create a new chat session                  |
| POST   | `/api/chat`               | `{ sessionId?, message }` – send a message |
| GET    | `/api/history/:sessionId` | Retrieve chat history                      |
| DELETE | `/api/history/:sessionId` | Delete chat history                        |
| GET    | `/api/stream?q=question`  | Streamed response (SSE)                    |

### Caching Details

* **Session Messages** – stored in `session:{sessionId}:messages` Redis list. TTL refreshed on each write.
* **Cache Warming** – optional pre-deployment script can pre-populate:

  * `answer:*`  (final answers)
  * `qvec:*`    (query embeddings)
  * `ctx:*`     (retrieved context)

---

## 💻 Frontend

* **Tech Stack:** React + Vite
* **Streaming:** Uses Server-Sent Events to display Gemini’s response character-by-character.

### Setup

```bash
cd frontend
cp .env.example .env
# Inside .env
VITE_API_BASE=http://localhost:5001
npm install
npm run dev
```

### Build & Preview

```bash
npm run build
npm run preview
```

### Deploy

Deploy to **Vercel** (or any static host).
Set the environment variable:

```
VITE_API_BASE=https://your-backend-url
```

---

## 📦 Deployment Notes

* **Backend** can be deployed on services like Render, Railway, Fly.io, or your own server.
  Make sure `REDIS_URL` points to a reachable Redis instance.
* **Database**: SQLite file (`rag.db`) needs a persistent volume if using ephemeral hosting.
* **Redis**: Managed Redis Cloud or self-hosted instance is fine.

---

## ⚡ Development Workflow

1. Run Redis.
2. Ingest news data: `npm run ingest` (backend).
3. Start backend: `npm run dev`.
4. Start frontend: `npm run dev` (in another terminal).
5. Open [http://localhost:5173](http://localhost:5173) (Vite default) and start chatting!

---

## 🧩 Code Overview

* **Ingestion (`scripts/ingest.js`)**
  Fetches RSS items → stores in `documents` table → embeds with Jina → stores vectors in `embeddings` (SQLite).

* **Chat Flow (`src/routes/chat.js`)**

  * Retrieves top-k contexts by cosine similarity.
  * Sends user query + context to Gemini.
  * Persists user & assistant messages to Redis (and optionally SQLite).

* **Streaming (`/api/stream`)**
  Splits Gemini output into tokens for a typewriter
