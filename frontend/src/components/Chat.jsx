import { useEffect, useRef, useState } from 'react'
import { sendMessage, getHistory, clearHistory, streamAnswer } from '../api'

function Chat({ sessionId, onReset }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const streamCloseRef = useRef(null)
  const chatEndRef = useRef(null)

  useEffect(() => {
    if (!sessionId) return
    ;(async () => {
      const h = await getHistory(sessionId)
      setMessages(h.messages || [])
    })()
  }, [sessionId])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function onSend(e) {
    e?.preventDefault()
    const text = input.trim()
    if (!text || !sessionId) return
    setInput('')
    const localUser = { role: 'user', content: text, ts: Date.now() }
    setMessages(m => [...m, localUser, { role: 'assistant', content: '', ts: Date.now(), streaming: true }])
    setLoading(true)

    let streamed = ''
    streamCloseRef.current = streamAnswer(text, (tok) => {
      streamed += tok
      setMessages(m => {
        const copy = m.slice()
        const last = copy[copy.length - 1]
        if (last && last.role === 'assistant' && last.streaming) {
          last.content = streamed
        }
        return copy
      })
    }, async () => {
      try {
        const resp = await sendMessage(sessionId, text)
        setMessages(m => m.map((msg, idx) => idx === m.length - 1 ? { ...msg, streaming: false, content: resp.answer } : msg))
      } catch {
        setMessages(m => m.map((msg, idx) => idx === m.length - 1 ? { ...msg, streaming: false } : msg))
      } finally {
        setLoading(false)
      }
    })
  }

  return (
    <div className="chat-container">
      <div className="chat">
        {messages.length === 0 && (
          <div className="empty">
            <div className="empty__icon">💬</div>
            <h3>Welcome to News Chatbot</h3>
            <p>Ask anything about the latest news from around the world.</p>
            <div className="suggestions">
              <button onClick={() => setInput("What are today's top headlines?")}>
                Today's headlines
              </button>
              <button onClick={() => setInput("Latest news about technology")}>
                Tech news
              </button>
              <button onClick={() => setInput("What's happening in politics?")}>
                Politics
              </button>
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`msg msg--${m.role}`}>
            <div className="msg__avatar">
              {m.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="msg__content">
              <div className="msg__bubble">
                {m.content}
                {m.streaming && <span className="cursor">▍</span>}
              </div>
              {m.contexts && m.contexts.length > 0 && (
                <div className="msg__sources">
                  <details>
                    <summary>Sources ({m.contexts.length})</summary>
                    <div className="sources">
                      {m.contexts.map((ctx, idx) => (
                        <div key={idx} className="source">
                          <div className="source__title">{ctx.title}</div>
                          <div className="source__url">{ctx.url}</div>
                          <div className="source__score">Score: {ctx.score?.toFixed(3)}</div>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form className="composer" onSubmit={onSend}>
        <div className="composer__input">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={loading ? 'Waiting for response...' : 'Type your question about news...'}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()} className="send-btn">
            {loading ? '⏳' : '📤'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Chat
