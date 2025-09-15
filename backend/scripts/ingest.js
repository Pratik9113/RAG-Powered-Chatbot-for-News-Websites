import 'dotenv/config';
import Parser from 'rss-parser';
import { v4 as uuidv4 } from 'uuid';
import { getDb, initSchema, upsertDocument, insertEmbedding } from '../src/db/index.js';
import { embedTexts } from '../src/services/embeddings.js';

const FEEDS = (process.env.RSS_FEEDS || '').split(',').map(s => s.trim()).filter(Boolean);
const MAX_ITEMS = parseInt(process.env.INGEST_MAX_ITEMS || '60', 10);

async function fetchArticles() {
  const parser = new Parser();
  const outputs = [];
  for (const feed of FEEDS) {
    console.log('Fetching feed', feed);
    try {
      const res = await parser.parseURL(feed);
      for (const item of res.items || []) {
        outputs.push({
          id: uuidv4(),
          source: feed,
          url: item.link || null,
          title: item.title || null,
          content: [item.contentSnippet, item.content, item.summary].filter(Boolean).join('\n').slice(0, 6000),
          createdAt: new Date().toISOString(),
        });
        if (outputs.length >= MAX_ITEMS) break;
      }
    } catch (e) {
      console.warn('Feed error', feed, e);
    }
    if (outputs.length >= MAX_ITEMS) break;
  }
  return outputs;
}

async function main() {
  if (!FEEDS.length) {
    console.error('Please set RSS_FEEDS env (comma-separated)');
    process.exit(1);
  }
  if (!process.env.JINA_API_KEY) {
    console.error('Please set JINA_API_KEY to embed articles');
    process.exit(1);
  }
  initSchema();
  const db = getDb();
  const articles = await fetchArticles();
  console.log(`Embedding ${articles.length} articles...`);

  for (const art of articles) {
    try { upsertDocument(db, art); } catch {}
  }

  const BATCH = parseInt(process.env.INGEST_BATCH_SIZE || '8', 10);
  for (let i = 0; i < articles.length; i += BATCH) {
    const batch = articles.slice(i, i + BATCH);
    try {
      const inputs = batch.map(art => `${art.title || ''}\n\n${art.content}`);
      const vectors = await embedTexts(inputs);
      for (let j = 0; j < batch.length; j++) {
        insertEmbedding(db, { documentId: batch[j].id, vector: vectors[j] });
      }
    } catch (e) {
      console.warn('Batch embedding failed; falling back per-item', e);
      for (const art of batch) {
        try {
          const [vec] = await embedTexts([`${art.title || ''}\n\n${art.content}`]);
          insertEmbedding(db, { documentId: art.id, vector: vec });
        } catch (ee) {
          console.warn('Skip article due to error', art.url, ee);
        }
      }
    }
  }
  console.log('Ingestion complete');
}

main();


