import { useState, useEffect } from 'react'
import Login from './components/Login.jsx'
import Dashboard from './components/Dashboard.jsx'
import MockTestDetail from './components/MockTestDetail.jsx'

export default function App() {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem('adminKey') || '')
  const [view, setView] = useState('dashboard') // 'dashboard' | 'detail'
  const [selectedTest, setSelectedTest] = useState(null)

  useEffect(() => {
    if (adminKey) localStorage.setItem('adminKey', adminKey)
  }, [adminKey])

  function handleLogin(key) {
    setAdminKey(key)
  }

  function handleLogout() {
    localStorage.removeItem('adminKey')
    setAdminKey('')
  }

  function handleSelectTest(test) {
    setSelectedTest(test)
    setView('detail')
  }

  function handleBack() {
    setView('dashboard')
    setSelectedTest(null)
  }

  if (!adminKey) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="app">
      <header className="header">
        <span className="header-title">Navodaya Admin</span>
        <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
      </header>
      <main className="main">
        {view === 'dashboard' && (
          <Dashboard adminKey={adminKey} onSelectTest={handleSelectTest} />
        )}
        {view === 'detail' && selectedTest && (
          <MockTestDetail adminKey={adminKey} test={selectedTest} onBack={handleBack} />
        )}
      </main>
    </div>
  )
}
