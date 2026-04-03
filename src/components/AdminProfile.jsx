import { useState, useEffect } from 'react'

export default function AdminProfile({ adminToken, onUpdate }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: ''
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const API_URL = import.meta.env.VITE_API_URL ?? '/api'
      const res = await fetch(`${API_URL}/admin/auth/profile`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
      const json = await res.json()
      if (json.success) {
        setAdmin(json.data.admin)
        setForm({
          firstName: json.data.admin.firstName || '',
          lastName: json.data.admin.lastName || '',
          email: json.data.admin.email || ''
        })
      }
    } catch (err) {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateProfile(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    try {
      const API_URL = import.meta.env.VITE_API_URL ?? '/api'
      const res = await fetch(`${API_URL}/admin/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      })
      
      const json = await res.json()
      if (json.success) {
        setAdmin(json.data.admin)
        setEditing(false)
        setSuccess('Profile updated successfully!')
        setTimeout(() => setSuccess(''), 3000)
        // Notify parent to update admin info
        if (onUpdate) onUpdate()
      } else {
        setError(json.message || 'Update failed')
      }
    } catch (err) {
      setError('Network error')
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL ?? '/api'
      const res = await fetch(`${API_URL}/admin/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })
      
      const json = await res.json()
      if (json.success) {
        setChangingPassword(false)
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setSuccess('Password changed successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(json.message || 'Password change failed')
      }
    } catch (err) {
      setError('Network error')
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>Loading profile...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: 32 }}>My Profile</h1>
        <p style={{ margin: 0, color: 'var(--muted)' }}>Manage your account settings and preferences</p>
      </div>

      {error && (
        <div className="error-banner" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: 12,
          background: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
          borderRadius: 6,
          marginBottom: 16
        }}>
          {success}
        </div>
      )}

      {/* Profile Information Card */}
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: 32,
        marginBottom: 24,
        border: '1px solid var(--border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Profile Information</h2>
          {!editing && !changingPassword && (
            <button className="btn btn-primary" onClick={() => setEditing(true)}>
              ✏️ Edit Profile
            </button>
          )}
        </div>

        {!editing && !changingPassword && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 8, fontWeight: 600 }}>First Name</label>
                <p style={{ margin: 0, fontSize: 16 }}>{admin?.firstName || '—'}</p>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 8, fontWeight: 600 }}>Last Name</label>
                <p style={{ margin: 0, fontSize: 16 }}>{admin?.lastName || '—'}</p>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 8, fontWeight: 600 }}>Email</label>
                <p style={{ margin: 0, fontSize: 16 }}>{admin?.email}</p>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 8, fontWeight: 600 }}>Role</label>
                <span style={{
                  display: 'inline-block',
                  padding: '6px 14px',
                  background: admin?.isSuperAdmin ? '#6366f1' : '#6b7280',
                  color: 'white',
                  borderRadius: 16,
                  fontSize: 13,
                  fontWeight: 600
                }}>
                  {admin?.isSuperAdmin ? '👑 Super Admin' : 'Admin'}
                </span>
              </div>
            </div>
          </div>
        )}

        {editing && (
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                className="input"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                placeholder="First name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                className="input"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="Last name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email address"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary">
                💾 Save Changes
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setEditing(false)
                  setError('')
                  setForm({
                    firstName: admin?.firstName || '',
                    lastName: admin?.lastName || '',
                    email: admin?.email || ''
                  })
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Password Change Card */}
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: 32,
        border: '1px solid var(--border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Password & Security</h2>
          {!changingPassword && !editing && (
            <button className="btn btn-outline" onClick={() => setChangingPassword(true)}>
              🔒 Change Password
            </button>
          )}
        </div>

        {!changingPassword && (
          <div>
            <p style={{ margin: 0, color: 'var(--muted)' }}>
              Keep your account secure by using a strong password. We recommend changing your password every few months.
            </p>
          </div>
        )}

        {changingPassword && (
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  required
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '20px'
                  }}
                >
                  {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Enter new password (min. 6 characters)"
                  required
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '20px'
                  }}
                >
                  {showNewPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                className="input"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary">
                🔒 Change Password
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setChangingPassword(false)
                  setError('')
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
