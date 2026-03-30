import { useState } from 'react'

export default function Login({ onLogin }) {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!key.trim()) {
      setError('Admin key is required')
      return
    }
    onLogin(key.trim())
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1 className="login-title">Navodaya Admin</h1>
        <p className="login-sub">Enter your admin key to continue</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Admin Key</label>
            <input
              type="password"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="Enter admin key"
              autoFocus
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary btn-full" type="submit">Login</button>
        </form>
      </div>
    </div>
  )
}
