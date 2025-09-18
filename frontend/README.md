Voosh RAG News Chatbot - Frontend

Overview
- React (Vite) single-page app for the RAG chatbot
- Shows session ID, chat history, typing effect via SSE, and reset session

Quick Start (Local)
```bash
cd frontend
npm install
cp env.example .env
# set VITE_API_BASE=http://localhost:5001 or your backend URL
npm run dev
```

Build
```bash
npm run build
npm run preview
```

Environment
- VITE_API_BASE: backend origin (e.g., http://localhost:5001 or https://your-backend)

Features
- New session created on load via /session/new
- Chat with streaming effect using /api/stream (SSE) while final answer arrives from /api/chat
- Reset session clears Redis history and generates a new session

Deploy
- Any static host (Netlify/Vercel/Render Static)
- If building on platform, set:
  - Root Directory: frontend
  - Build Command: npm run build
  - Publish Directory: dist
  - Env: VITE_API_BASE=https://your-backend

Project Structure
- src/App.jsx: app shell and session management
- src/components/Chat.jsx: chat UI and streaming
- src/api.js: API/SSE helpers


