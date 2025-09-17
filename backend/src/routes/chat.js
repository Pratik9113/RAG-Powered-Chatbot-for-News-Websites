import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getRedis } from '../redis.js';
import { getDb, insertTranscript } from '../db/index.js';
import { retrieveContexts } from '../services/retrieval.js';
import { generateAnswer } from '../services/gemini.js';
import { getCachedAnswer, setCachedAnswer } from '../services/cache.js';

const router = express.Router();

const SESSION_TTL_SECONDS = parseInt(process.env.SESSION_TTL_SECONDS || '86400', 10);
const HISTORY_MAX = parseInt(process.env.SESSION_HISTORY_MAX || '200', 10);
const PERSIST = String(process.env.PERSIST_TRANSCRIPTS || 'false') === 'true';

function sessionKey(sessionId) {
  return `session:${sessionId}:messages`;
}

async function ensureSession(redis, sessionId) {
  const key = sessionKey(sessionId);
  const exists = await redis.exists(key);
  if (!exists) {
    await redis.del(key);
    await redis.expire(key, SESSION_TTL_SECONDS);
  }
}

router.post('/chat', async (req, res) => {
  try {
    const { sessionId: providedSessionId, message, topK } = req.body || {};
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'message is required' });
    }
    const sessionId = providedSessionId || uuidv4();
    const redis = getRedis();
    await ensureSession(redis, sessionId);

    const key = sessionKey(sessionId);
    const db = PERSIST ? getDb() : null;
    const userMsg = { role: 'user', content: message, ts: Date.now() };
    const pipe = redis.pipeline();
    pipe.rpush(key, JSON.stringify(userMsg));
    pipe.ltrim(key, -HISTORY_MAX, -1);
    pipe.expire(key, SESSION_TTL_SECONDS);
    await pipe.exec();

    if (db) {
      try { insertTranscript(db, { sessionId, role: 'user', content: message }); } catch {}
    }

    const cached = await getCachedAnswer(message);
    let contexts, answer;
    if (cached) {
      ({ contexts, answer } = cached);
    } else {
      contexts = await retrieveContexts(message, Number(topK));
      answer = await generateAnswer({ question: message, contexts });
      setCachedAnswer(message, { contexts, answer }).catch(() => {});
    }
    const botMsg = { role: 'assistant', content: answer, ts: Date.now(), contexts };
    const pipe2 = redis.pipeline();
    pipe2.rpush(key, JSON.stringify(botMsg));
    pipe2.ltrim(key, -HISTORY_MAX, -1);
    pipe2.expire(key, SESSION_TTL_SECONDS);
    await pipe2.exec();

    if (db) {
      try { insertTranscript(db, { sessionId, role: 'assistant', content: answer, contexts }); } catch {}
    }

    res.json({ sessionId, answer, contexts });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'internal_error', detail: String(e) });
  }
});

router.get('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const offset = parseInt(req.query.offset || '0', 10);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit || '100', 10)));
    const redis = getRedis();
    const key = sessionKey(sessionId);
    const start = offset;
    const end = offset + limit - 1;
    const items = await redis.lrange(key, start, end);
    const messages = items.map(i => JSON.parse(i));
    res.json({ sessionId, offset, limit, messages });
  } catch (e) {
    res.status(500).json({ error: 'internal_error', detail: String(e) });
  }
});

router.delete('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const redis = getRedis();
    const key = sessionKey(sessionId);
    await redis.del(key);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'internal_error', detail: String(e) });
  }
});

router.get('/debug/redis', async (req, res) => {
  try {
    const redis = getRedis();
    const keys = await redis.keys('*');
    const data = {};
    for (const key of keys) {
      const type = await redis.type(key);
      if (type === 'list') {
        data[key] = await redis.lrange(key, 0, -1);
      } else if (type === 'string') {
        data[key] = await redis.get(key);
      } else {
        data[key] = `[${type}]`;
      }
    }
    res.json({ keys, data });
  } catch (e) {
    res.status(500).json({ error: 'internal_error', detail: String(e) });
  }
});

export function registerSseRoute(app) {
  app.get('/api/stream', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const q = String(req.query.q || '').trim();
    if (!q) {
      res.write(`event: end\n`);
      res.write(`data: ${JSON.stringify({ error: 'missing q' })}\n\n`);
      return res.end();
    }

    try {
      const contexts = await retrieveContexts(q, 5);
      // We call Gemini once and stream tokens by splitting text
      const answer = await generateAnswer({ question: q, contexts });
      for (const token of answer.split(/(\s+)/)) {
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
        await new Promise(r => setTimeout(r, 10));
      }
      res.write(`event: end\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (e) {
      res.write(`event: end\n`);
      res.write(`data: ${JSON.stringify({ error: String(e) })}\n\n`);
      res.end();
    }
  });
}

export default router;