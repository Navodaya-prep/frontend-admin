import { useState, useEffect } from 'react'
import Login from './components/Login.jsx'
import Dashboard from './components/Dashboard.jsx'
import MockTestDetail from './components/MockTestDetail.jsx'
import LiveClasses from './components/LiveClasses.jsx'
import LiveClassRoom from './components/LiveClassRoom.jsx'

const TABS = [
  { id: 'mocktests', label: 'Mock Tests' },
  { id: 'live', label: '🔴 Live Classes' },
]

export default function App() {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem('adminKey') || '')
  const [tab, setTab] = useState('mocktests')
  const [view, setView] = useState('list') // 'list' | 'detail'
  const [selectedTest, setSelectedTest] = useState(null)
  const [selectedClass, setSelectedClass] = useState(null)

  useEffect(() => {
    if (adminKey) localStorage.setItem('adminKey', adminKey)
  }, [adminKey])

  function handleLogout() {
    localStorage.removeItem('adminKey')
    setAdminKey('')
  }

  function handleBack() {
    setView('list')
    setSelectedTest(null)
    setSelectedClass(null)
  }

  if (!adminKey) return <Login onLogin={setAdminKey} />

  return (
    <div className="app">
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <span className="header-title">Navodaya Admin</span>
          <nav className="tab-nav">
            {TABS.map(t => (
              <button
                key={t.id}
                className={`tab-btn ${tab === t.id ? 'active' : ''}`}
                onClick={() => { setTab(t.id); setView('list') }}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
        <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
      </header>

      <main className="main">
        {tab === 'mocktests' && view === 'list' && (
          <Dashboard adminKey={adminKey} onSelectTest={t => { setSelectedTest(t); setView('detail') }} />
        )}
        {tab === 'mocktests' && view === 'detail' && selectedTest && (
          <MockTestDetail adminKey={adminKey} test={selectedTest} onBack={handleBack} />
        )}
        {tab === 'live' && view === 'list' && (
          <LiveClasses adminKey={adminKey} onEnterRoom={c => { setSelectedClass(c); setView('detail') }} />
        )}
        {tab === 'live' && view === 'detail' && selectedClass && (
          <LiveClassRoom adminKey={adminKey} liveClass={selectedClass} onBack={handleBack} />
        )}
      </main>
    </div>
  )
}
