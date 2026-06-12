import { useState, useEffect, useMemo } from 'react'
import PrivacyPolicy from './components/PrivacyPolicy.jsx'
import DeleteAccount from './components/DeleteAccount.jsx'
import Login from './components/Login.jsx'
import Sidebar, { NAV_SECTIONS } from './components/Sidebar.jsx'
import Overview from './components/Overview.jsx'
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
import Notifications from './components/Notifications.jsx'
import Icon from './components/Icons.jsx'

export default function App() {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('adminToken') || '')
  const [adminInfo, setAdminInfo] = useState(() => {
    const stored = localStorage.getItem('adminInfo')
    return stored ? JSON.parse(stored) : null
  })
  const [tab, setTab] = useState(() => window.location.hash.slice(1) || 'overview')
  const [view, setView] = useState('list') // 'list' | 'detail'
  const [selectedTest, setSelectedTest] = useState(null)
  const [selectedClass, setSelectedClass] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (adminToken) {
      localStorage.setItem('adminToken', adminToken)
      if (!adminInfo) loadAdminInfo()
    }
  }, [adminToken])

  async function loadAdminInfo() {
    try {
      const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'
      const res = await fetch(`${API_URL}/admin/auth/profile`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
      if (res.status === 401) {
        handleLogout()
        return
      }
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

  function navigate(id) {
    window.location.hash = id
    setTab(id)
    setView('list')
    setSelectedTest(null)
    setSelectedClass(null)
    setSidebarOpen(false)
  }

  function handleBack() {
    setView('list')
    setSelectedTest(null)
    setSelectedClass(null)
  }

  const pageMeta = useMemo(() => {
    if (tab === 'profile') return { title: 'My Profile', desc: 'Your account details and password' }
    for (const section of NAV_SECTIONS(adminInfo?.isSuperAdmin)) {
      const item = section.items.find(i => i.id === tab)
      if (item) return item
    }
    return { title: 'Overview', desc: '' }
  }, [tab, adminInfo])

  // Public routes — no auth required
  if (window.location.pathname === '/privacy-policy') return <PrivacyPolicy />
  if (window.location.pathname === '/delete-account') return <DeleteAccount />

  if (!adminToken) return <Login onLogin={setAdminToken} />

  return (
    <div className="app-shell">
      <Sidebar
        active={tab}
        onNavigate={navigate}
        adminInfo={adminInfo}
        onLogout={handleLogout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
            <button className="menu-toggle" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
              <Icon name="menu" size={20} />
            </button>
            <div style={{ minWidth: 0 }}>
              <div className="topbar-title">{pageMeta.title}</div>
              {pageMeta.desc && <div className="topbar-sub">{pageMeta.desc}</div>}
            </div>
          </div>
          <div className="topbar-right">
            {adminInfo?.isSuperAdmin && (
              <span className="badge badge-purple"><Icon name="crown" size={13} /> Super Admin</span>
            )}
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('profile')}>
              <Icon name="user" size={16} />
              Profile
            </button>
          </div>
        </header>

        <main className="main">
          {tab === 'overview' && <Overview adminToken={adminToken} adminInfo={adminInfo} onNavigate={navigate} />}
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
          {tab === 'notifications' && <Notifications adminToken={adminToken} isSuperAdmin={adminInfo?.isSuperAdmin} />}
          {tab === 'settings' && <Settings adminToken={adminToken} isSuperAdmin={adminInfo?.isSuperAdmin} />}
          {tab === 'daily' && adminInfo?.isSuperAdmin && <DailyChallenge adminToken={adminToken} />}
          {tab === 'teachers' && adminInfo?.isSuperAdmin && <ManageTeachers adminToken={adminToken} />}
          {tab === 'admins' && adminInfo?.isSuperAdmin && <AdminManagement adminToken={adminToken} />}
          {tab === 'profile' && <AdminProfile adminToken={adminToken} onUpdate={loadAdminInfo} />}
        </main>

        <footer className="content-footer">
          NavodayaSarthi Admin Console · Empowering Navodaya aspirants across India
        </footer>
      </div>
    </div>
  )
}
