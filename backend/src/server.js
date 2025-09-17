import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { createServer } from 'http';
import { v4 as uuidv4 } from 'uuid';
import chatRouter, { registerSseRoute } from './routes/chat.js';
import { initSchema } from './db/index.js';
import { getRedis } from './redis.js';

const app = express();
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
 
// Ensure DB schema exists (creates tables if missing)
try { initSchema(); } catch (e) { console.warn('[db] initSchema failed:', e); }

// Health
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Session helper
app.get('/session/new', (_req, res) => {
  const sessionId = uuidv4();
  res.json({ sessionId });
});

// Redis connection check route
app.get('/health/redis', async (_req, res) => {
  try {
    const redis = getRedis();
    await redis.ping();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Attach chat routes
app.use('/api', chatRouter);

// SSE route
registerSseRoute(app);

const PORT = process.env.PORT || 5001;
const server = createServer(app);
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend running on http://localhost:${PORT}`);
});

export default app;


