Voosh RAG News Chatbot - Frontend

Tech Stack
- React + Vite
- Minimal SCSS-like CSS (in `App.css`)
- SSE for streaming tokens

Setup
1) Create `.env`:
   - `VITE_API_BASE=http://localhost:5001`
2) Install and run:
```bash
npm i
npm run dev
```

Features
- New session is created on load
- Sends question, shows streamed typing effect
- Shows past messages, reset button clears session history

Build
```bash
npm run build
npm run preview
```

Deploy
- Any static host (Netlify, Vercel). Set `VITE_API_BASE` to your backend URL.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
