import { useState, useEffect } from 'react'
import { getSettings, updateSettings } from '../api'

export default function Settings({ adminToken, isSuperAdmin }) {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    examDate: '',
    examName: '',
  })

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    setLoading(true)
    setError('')
    try {
      const data = await getSettings(adminToken)
      setSettings(data)
      setForm({
        examDate: data.examDate ? new Date(data.examDate).toISOString().split('T')[0] : '',
        examName: data.examName || '',
      })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      await updateSettings(adminToken, form)
      setSuccess('Settings updated successfully!')
      setEditing(false)
      loadSettings()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.message)
    }
  }

  function calculateDaysLeft() {
    if (!settings?.examDate) return null
    const examDate = new Date(settings.examDate)
    const today = new Date()
    const diffTime = examDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysLeft = calculateDaysLeft()

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: 28, fontWeight: 700 }}>⚙️ System Settings</h2>
        <p style={{ color: 'var(--muted)', fontSize: 15, margin: 0 }}>
          Manage exam dates and system configuration
        </p>
      </div>

      {error && (
        <div className="error-banner" style={{ marginBottom: 20 }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: 16,
          background: '#d1fae5',
          color: '#065f46',
          border: '1px solid #10b981',
          borderRadius: 8,
          marginBottom: 20,
          fontWeight: 500,
        }}>
          {success}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 64, color: 'var(--muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <p>Loading settings...</p>
        </div>
      ) : (
        <>
          {/* Exam Countdown Card */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 16,
            padding: 32,
            marginBottom: 32,
            color: 'white',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          }}>
            <div style={{ fontSize: 18, opacity: 0.9, marginBottom: 8 }}>
              📅 {settings?.examName || 'JNVST Exam'}
            </div>
            <div style={{ fontSize: 56, fontWeight: 800, marginBottom: 8 }}>
              {daysLeft !== null ? (
                daysLeft > 0 ? daysLeft : 'Exam Day!'
              ) : '—'}
            </div>
            <div style={{ fontSize: 18, opacity: 0.9 }}>
              {daysLeft !== null && daysLeft > 0 ? 
                `days left until exam` : 
                daysLeft === 0 ? 'Good luck!' : 'Exam date not set'
              }
            </div>
            {settings?.examDate && (
              <div style={{ fontSize: 14, opacity: 0.8, marginTop: 16 }}>
                Exam Date: {new Date(settings.examDate).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            )}
          </div>

          {/* Settings Form (Super Admin Only) */}
          {isSuperAdmin && (
            <div style={{
              background: 'white',
              borderRadius: 12,
              padding: 32,
              border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Exam Configuration</h3>
                {!editing && (
                  <button className="btn btn-primary" onClick={() => setEditing(true)}>
                    ✏️ Edit Settings
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Exam Name</label>
                    <input
                      className="input"
                      type="text"
                      value={form.examName}
                      onChange={(e) => setForm(f => ({ ...f, examName: e.target.value }))}
                      placeholder="e.g., JNVST 2026"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Exam Date</label>
                    <input
                      className="input"
                      type="date"
                      value={form.examDate}
                      onChange={(e) => setForm(f => ({ ...f, examDate: e.target.value }))}
                      required
                    />
                    <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>
                      Set the date when the exam will be conducted
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => {
                        setEditing(false)
                        setForm({
                          examDate: settings.examDate ? new Date(settings.examDate).toISOString().split('T')[0] : '',
                          examName: settings.examName || '',
                        })
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      💾 Save Settings
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'grid', gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4, fontWeight: 600 }}>
                      Exam Name
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>
                      {settings?.examName || '—'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4, fontWeight: 600 }}>
                      Exam Date
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>
                      {settings?.examDate ? new Date(settings.examDate).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }) : '—'}
                    </div>
                  </div>
                  {settings?.updatedAt && (
                    <div style={{ fontSize: 13, color: 'var(--muted)', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                      Last updated: {new Date(settings.updatedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Non-Super Admin View */}
          {!isSuperAdmin && (
            <div style={{
              background: 'white',
              borderRadius: 12,
              padding: 32,
              border: '1px solid var(--border)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
              <p style={{ fontSize: 16, color: 'var(--muted)', margin: 0 }}>
                Only super admins can modify system settings
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
