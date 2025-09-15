CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  url TEXT,
  title TEXT,
  content TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS embeddings (
  document_id TEXT PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
  vector BLOB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);


