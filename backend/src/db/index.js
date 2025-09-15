import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'rag.db');

export function getDb() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('temp_store = MEMORY');
  db.pragma('mmap_size = 268435456');
  return db;
}

export function initSchema() {
  const db = getDb();
  const schemaUrl = new URL('./schema.sql', import.meta.url);
  const schemaPath = fileURLToPath(schemaUrl);
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schemaSql);
}

export function upsertDocument(db, { id, source, url, title, content, createdAt }) {
  const stmt = db.prepare(
    `INSERT INTO documents (id, source, url, title, content, created_at)
     VALUES (@id, @source, @url, @title, @content, @createdAt)
     ON CONFLICT(id) DO UPDATE SET
       source=excluded.source,
       url=excluded.url,
       title=excluded.title,
       content=excluded.content`
  );
  stmt.run({ id, source, url, title, content, createdAt });
}

export function insertEmbedding(db, { documentId, vector }) {
  const stmt = db.prepare(
    `INSERT OR REPLACE INTO embeddings (document_id, vector) VALUES (?, ?)`
  );
  stmt.run(documentId, Buffer.from(new Float32Array(vector).buffer));
}

export function searchSimilar(db, queryVector, topK = 5) {
  const rows = db.prepare(
    `SELECT d.id, d.title, d.url, d.content, e.vector as vec
     FROM documents d JOIN embeddings e ON d.id = e.document_id`
  ).all();

  const q = new Float32Array(queryVector);
  function cosine(a, b) {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
      const va = a[i];
      const vb = b[i];
      dot += va * vb;
      na += va * va;
      nb += vb * vb;
    }
    return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
  }

  const scored = rows.map(r => {
    const vec = new Float32Array(new Uint8Array(r.vec).buffer);
    return { ...r, score: cosine(q, vec) };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}


