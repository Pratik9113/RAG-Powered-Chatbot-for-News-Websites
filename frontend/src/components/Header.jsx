import { useMemo } from 'react'

function Header({ sessionId, activeTab, onTabChange, onReset, loading }) {
  const title = useMemo(() => 'News Chatbot', [])

  return (
    <header className="app__header">
      <div className="header__left">
        <h1>{title}</h1>
        <span className="session-id">Session: {sessionId?.slice(0, 8)}...</span>
      </div>
      <div className="header__right">
        <button 
          className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => onTabChange('chat')}
        >
          Chat
        </button>
        <button
          className={`tab-btn reset-btn`}
          onClick={onReset}
          disabled={loading}
          title="Clear this session's history and start a new one"
          style={{ marginLeft: 8 }}
        >
          {loading ? 'Resetting…' : 'Reset Session'}
        </button>
      </div>
    </header>
  )
}

export default Header
