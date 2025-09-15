import crypto from 'node:crypto';
import { getRedis } from '../redis.js';

const DEFAULT_TTL = parseInt(process.env.ANSWER_CACHE_TTL_SECONDS || '600', 10); // 10 min

export function keyForQuestion(question) {
  const h = crypto.createHash('sha256').update(question).digest('hex').slice(0, 16);
  return `answer:${h}`;
}

export async function getCachedAnswer(question) {
  const redis = getRedis();
  const val = await redis.get(keyForQuestion(question));
  return val ? JSON.parse(val) : null;
}

export async function setCachedAnswer(question, payload) {
  const redis = getRedis();
  await redis.setex(keyForQuestion(question), DEFAULT_TTL, JSON.stringify(payload));
}

const EMB_TTL = parseInt(process.env.QUERY_CACHE_TTL_SECONDS || '300', 10);
export function keyForEmbedding(question) {
  const h = crypto.createHash('sha256').update(question).digest('hex').slice(0, 16);
  return `qvec:${h}`;
}
export function keyForContexts(question, topK) {
  const h = crypto.createHash('sha256').update(`${question}|${topK}`).digest('hex').slice(0, 16);
  return `ctx:${h}`;
}
export async function getCachedEmbedding(question) {
  const redis = getRedis();
  const buf = await redis.getBuffer(keyForEmbedding(question));
  return buf ? new Float32Array(new Uint8Array(buf).buffer) : null;
}
export async function setCachedEmbedding(question, vector) {
  const redis = getRedis();
  await redis.setex(keyForEmbedding(question), EMB_TTL, Buffer.from(new Float32Array(vector).buffer));
}
export async function getCachedContexts(question, topK) {
  const redis = getRedis();
  const val = await redis.get(keyForContexts(question, topK));
  return val ? JSON.parse(val) : null;
}
export async function setCachedContexts(question, topK, contexts) {
  const redis = getRedis();
  await redis.setex(keyForContexts(question, topK), EMB_TTL, JSON.stringify(contexts));
}


