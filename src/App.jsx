import { useState, useEffect } from 'react'
import Login from './components/Login.jsx'
import Dashboard from './components/Dashboard.jsx'
import MockTestDetail from './components/MockTestDetail.jsx'
import LiveClasses from './components/LiveClasses.jsx'
import LiveClassRoom from './components/LiveClassRoom.jsx'
import PracticeHub from './components/PracticeHub.jsx'
import RecordedClasses from './components/RecordedClasses.jsx'
import AdminProfile from './components/AdminProfile.jsx'
import AdminManagement from './components/AdminManagement.jsx'
import ManageTeachers from './components/ManageTeachers.jsx'
import Settings from './components/Settings.jsx'
import DailyChallenge from './components/DailyChallenge.jsx'
import Doubts from './components/Doubts.jsx'

export default function App() {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('adminToken') || '')
  const [adminInfo, setAdminInfo] = useState(() => {
    const stored = localStorage.getItem('adminInfo')
    return stored ? JSON.parse(stored) : null
  })
  const [tab, setTab] = useState('mocktests')
  const [view, setView] = useState('list') // 'list' | 'detail'
  const [selectedTest, setSelectedTest] = useState(null)
  const [selectedClass, setSelectedClass] = useState(null)

  const TABS = [
    { id: 'recorded', label: '🎥 Recorded Classes' },
    { id: 'practice', label: '📋 Practice Hub' },
    { id: 'mocktests', label: 'Mock Tests' },
    { id: 'live', label: '🔴 Live Classes' },
    { id: 'doubts', label: '💬 Doubts' },
    ...(adminInfo?.isSuperAdmin ? [{ id: 'daily', label: '⚡ Daily Challenge' }] : []),
    { id: 'settings', label: '⚙️ Settings' },
    ...(adminInfo?.isSuperAdmin ? [
      { id: 'teachers', label: '👨‍🏫 Manage Teachers' },
      { id: 'admins', label: '👥 Admin Management' },
    ] : [])
  ]

  useEffect(() => {
    if (adminToken) {
      localStorage.setItem('adminToken', adminToken)
      // Load admin info if not already loaded
      if (!adminInfo) {
        loadAdminInfo()
      }
    }
  }, [adminToken])

  async function loadAdminInfo() {
    try {
      const API_URL = import.meta.env.VITE_API_URL ?? '/api'
      const res = await fetch(`${API_URL}/admin/auth/profile`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
      const json = await res.json()
      if (json.success) {
        setAdminInfo(json.data.admin)
        localStorage.setItem('adminInfo', JSON.stringify(json.data.admin))
      }
    } catch (err) {
      console.error('Failed to load admin info:', err)
    }
  }

  function handleLogout() {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminInfo')
    setAdminToken('')
    setAdminInfo(null)
  }

  function handleBack() {
    setView('list')
    setSelectedTest(null)
    setSelectedClass(null)
  }

  if (!adminToken) return <Login onLogin={setAdminToken} />

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {adminInfo && (
            <button
              className="btn btn-outline"
              onClick={() => { setTab('profile'); setView('list'); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <span style={{ fontSize: 18 }}>👤</span>
              <span>{adminInfo.firstName} {adminInfo.lastName}</span>
              {adminInfo.isSuperAdmin && <span style={{ fontSize: 14 }}>👑</span>}
            </button>
          )}
          <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="main">
        {tab === 'recorded' && <RecordedClasses adminToken={adminToken} />}
        {tab === 'practice' && <PracticeHub adminToken={adminToken} />}
        {tab === 'mocktests' && view === 'list' && (
          <Dashboard adminToken={adminToken} onSelectTest={t => { setSelectedTest(t); setView('detail') }} />
        )}
        {tab === 'mocktests' && view === 'detail' && selectedTest && (
          <MockTestDetail adminToken={adminToken} test={selectedTest} onBack={handleBack} />
        )}
        {tab === 'live' && view === 'list' && (
          <LiveClasses adminToken={adminToken} onEnterRoom={c => { setSelectedClass(c); setView('detail') }} />
        )}
        {tab === 'live' && view === 'detail' && selectedClass && (
          <LiveClassRoom adminToken={adminToken} liveClass={selectedClass} onBack={handleBack} />
        )}
        {tab === 'doubts' && <Doubts adminToken={adminToken} />}
        {tab === 'settings' && <Settings adminToken={adminToken} isSuperAdmin={adminInfo?.isSuperAdmin} />}
        {tab === 'daily' && adminInfo?.isSuperAdmin && <DailyChallenge adminToken={adminToken} />}
        {tab === 'teachers' && adminInfo?.isSuperAdmin && <ManageTeachers adminToken={adminToken} />}
        {tab === 'admins' && adminInfo?.isSuperAdmin && <AdminManagement adminToken={adminToken} />}
        {tab === 'profile' && <AdminProfile adminToken={adminToken} onUpdate={loadAdminInfo} />}
      </main>
    </div>
  )
}
