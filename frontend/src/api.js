const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001';

export async function newSession() {
  const res = await fetch(`${API_BASE}/session/new`);
  const json = await res.json();
  return json.sessionId;
}

export async function sendMessage(sessionId, message) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message })
  });
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}

export async function getHistory(sessionId) {
  const res = await fetch(`${API_BASE}/api/history/${sessionId}`);
  if (!res.ok) throw new Error('History failed');
  return res.json();
}

export async function clearHistory(sessionId) {
  const res = await fetch(`${API_BASE}/api/history/${sessionId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Clear failed');
  return res.json();
}

export function streamAnswer(question, onToken, onEnd) {
  const url = new URL(`${API_BASE}/api/stream`);
  url.searchParams.set('q', question);
  const es = new EventSource(url.toString());
  es.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data);
      if (data.token) onToken(data.token);
    } catch {}
  };
  es.addEventListener('end', () => {
    onEnd?.();
    es.close();
  });
  es.onerror = () => {
    onEnd?.();
    es.close();
  };
  return () => es.close();
}


