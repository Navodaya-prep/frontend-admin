import { useState, useEffect } from 'react'

export default function AdminManagement({ adminToken }) {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    isSuperAdmin: false
  })
  const [tempPassword, setTempPassword] = useState('')

  useEffect(() => {
    loadAdmins()
  }, [])

  async function loadAdmins() {
    setLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL ?? '/api'
      const res = await fetch(`${API_URL}/admin/manage/admins`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
      const json = await res.json()
      if (json.success) {
        setAdmins(json.data.admins)
      } else {
        setError(json.message || 'Failed to load admins')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  async function handleInvite(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const API_URL = import.meta.env.VITE_API_URL ?? '/api'
      const res = await fetch(`${API_URL}/admin/manage/admins/invite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inviteForm)
      })
      
      const json = await res.json()
      if (json.success) {
        setTempPassword(json.data.tempPassword)
        setSuccess(`Admin invited! Temporary password: ${json.data.tempPassword}`)
        setInviteForm({ firstName: '', lastName: '', email: '', isSuperAdmin: false })
        loadAdmins()
        // Don't close modal immediately so user can see the password
      } else {
        setError(json.message || 'Invitation failed')
      }
    } catch (err) {
      setError('Network error')
    }
  }

  async function handleDelete(adminId, adminName) {
    if (!confirm(`Are you sure you want to delete ${adminName}?`)) return

    setError('')
    setSuccess('')

    try {
      const API_URL = import.meta.env.VITE_API_URL ?? '/api'
      const res = await fetch(`${API_URL}/admin/manage/admins/${adminId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
      
      const json = await res.json()
      if (json.success) {
        setSuccess('Admin deleted successfully')
        setTimeout(() => setSuccess(''), 3000)
        loadAdmins()
      } else {
        setError(json.message || 'Delete failed')
      }
    } catch (err) {
      setError('Network error')
    }
  }

  function closeInviteModal() {
    setShowInviteModal(false)
    setInviteForm({ firstName: '', lastName: '', email: '', isSuperAdmin: false })
    setTempPassword('')
    setError('')
    setSuccess('')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Admin Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowInviteModal(true)}
        >
          + Invite Admin
        </button>
      </div>

      {error && (
        <div className="error-banner" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      {success && !showInviteModal && (
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

      {loading ? (
        <p style={{ textAlign: 'center', padding: 40 }}>Loading admins...</p>
      ) : admins.length === 0 ? (
        <p style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>No admins found</p>
      ) : (
        <div style={{ background: 'white', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--bg-light)' }}>
              <tr>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Name</th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Email</th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Role</th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Status</th>
                <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid var(--border)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(admin => (
                <tr key={admin.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: 12 }}>
                    {admin.firstName} {admin.lastName}
                  </td>
                  <td style={{ padding: 12, color: 'var(--muted)' }}>{admin.email}</td>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      background: admin.isSuperAdmin ? '#6366f1' : '#6b7280',
                      color: 'white',
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 600
                    }}>
                      {admin.isSuperAdmin ? '👑 Super Admin' : 'Admin'}
                    </span>
                  </td>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      background: admin.isActive ? '#10b981' : '#ef4444',
                      color: 'white',
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 600
                    }}>
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: 12, textAlign: 'right' }}>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '4px 12px', fontSize: 13 }}
                      onClick={() => handleDelete(admin.id, `${admin.firstName} ${admin.lastName}`)}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showInviteModal && (
        <div className="modal-overlay" onClick={closeInviteModal}>
          <div className="modal-content" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0 }}>Invite Admin</h2>
              <button onClick={closeInviteModal} className="btn btn-outline" style={{ padding: '4px 12px' }}>✕</button>
            </div>

            {error && (
              <div className="error-banner" style={{ marginBottom: 16 }}>
                {error}
              </div>
            )}

            {success && tempPassword && (
              <div style={{
                padding: 16,
                background: '#fef3c7',
                border: '2px solid #f59e0b',
                borderRadius: 8,
                marginBottom: 16
              }}>
                <p style={{ margin: '0 0 12px 0', fontWeight: 600, color: '#92400e' }}>
                  ⚠️ Admin Invited Successfully!
                </p>
                <p style={{ margin: '0 0 8px 0', fontSize: 14, color: '#78350f' }}>
                  Please send this temporary password to the admin via email:
                </p>
                <div style={{
                  padding: 12,
                  background: 'white',
                  borderRadius: 6,
                  fontFamily: 'monospace',
                  fontSize: 16,
                  wordBreak: 'break-all',
                  marginBottom: 12
                }}>
                  {tempPassword}
                </div>
                <p style={{ margin: 0, fontSize: 12, color: '#78350f' }}>
                  The admin will be asked to change their password after first login.
                </p>
              </div>
            )}

            {!tempPassword && (
              <form onSubmit={handleInvite}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    className="input"
                    value={inviteForm.firstName}
                    onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                    placeholder="First name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    className="input"
                    value={inviteForm.lastName}
                    onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                    placeholder="Last name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    className="input"
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    placeholder="admin@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={inviteForm.isSuperAdmin}
                      onChange={(e) => setInviteForm({ ...inviteForm, isSuperAdmin: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>Make this admin a Super Admin</span>
                  </label>
                  <p style={{ fontSize: 12, color: 'var(--muted)', margin: '8px 0 0 0' }}>
                    Super admins can manage other admins
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="submit" className="btn btn-primary">
                    Send Invitation
                  </button>
                  <button type="button" className="btn btn-outline" onClick={closeInviteModal}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {tempPassword && (
              <button className="btn btn-primary btn-full" onClick={closeInviteModal}>
                Done
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
