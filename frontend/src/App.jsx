import { useEffect, useState } from 'react'
import './App.css'
import { newSession, clearHistory } from './api'
import Header from './components/Header'
import Chat from './components/Chat'
// import RedisInspector from './components/RedisInspector'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  const [sessionId, setSessionId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')

  useEffect(() => {
    (async () => {
      const sid = await newSession()
      setSessionId(sid)
    })()
  }, [])

  async function onReset() {
    if (!sessionId) return
    setLoading(true)
    try {
      await clearHistory(sessionId)
      // Force refresh by creating new session
      const newSid = await newSession()
      setSessionId(newSid)
    } finally {
      setLoading(false)
    }
  }

  function onTabChange(tab) {
    setActiveTab(tab)
  }

  return (
    <ErrorBoundary>
      <div className="app">
        <Header 
          sessionId={sessionId}
          activeTab={activeTab}
          onTabChange={onTabChange}
          onReset={onReset}
          loading={loading}
        />

        <main className="main-content">
          {activeTab === 'chat' && (
            <Chat sessionId={sessionId} onReset={onReset} />
          )}
        </main>
      </div>
    </ErrorBoundary>
  )
}

export default App
