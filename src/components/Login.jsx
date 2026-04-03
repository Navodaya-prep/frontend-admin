import { useState } from 'react'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password')
      return
    }

    setLoading(true)
    
    try {
      const API_URL = import.meta.env.VITE_API_URL ?? '/api'
      const res = await fetch(`${API_URL}/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      
      const json = await res.json()
      
      if (!json.success) {
        setError(json.message || 'Login failed')
        setLoading(false)
        return
      }
      
      // Store token and admin info
      localStorage.setItem('adminToken', json.data.token)
      localStorage.setItem('adminInfo', JSON.stringify(json.data.admin))
      onLogin(json.data.token)
    } catch (err) {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏫</div>
          <h1 className="login-title">Admin Login</h1>
          <p className="login-sub">Navodaya Prime Admin Panel</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-banner" style={{ marginBottom: 20 }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: 'var(--muted)',
                  padding: '4px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#333'}
                onMouseLeave={(e) => e.target.style.color = 'var(--muted)'}
                disabled={loading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button 
            className="btn btn-primary btn-full" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p style={{ 
            marginTop: 24, 
            textAlign: 'center', 
            fontSize: 13, 
            color: 'var(--muted)' 
          }}>
            Contact your super admin for access
          </p>
        </form>
      </div>
    </div>
  )
}
