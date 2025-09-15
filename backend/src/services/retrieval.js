import { getDb, searchSimilar } from '../db/index.js';
import { embedText } from './embeddings.js';
import { getCachedEmbedding, setCachedEmbedding, getCachedContexts, setCachedContexts } from './cache.js';

export async function retrieveContexts(question, topK) {
  const db = getDb();
  const limit = Number.isFinite(topK) ? Math.max(1, Math.min(10, topK)) : 5;
  let qVec = await getCachedEmbedding(question);
  if (!qVec) {
    qVec = await embedText(question);
    setCachedEmbedding(question, qVec).catch(() => {});
  }
  let results = await getCachedContexts(question, limit);
  if (!results) {
    results = searchSimilar(db, qVec, limit);
    setCachedContexts(question, limit, results).catch(() => {});
  }
  return results;
}
