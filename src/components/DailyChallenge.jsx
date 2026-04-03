import { useState, useEffect, useMemo } from 'react'
import { listChallenges, createChallenge, updateChallenge, deleteChallenge } from '../api'

const SUBJECTS = ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'General Knowledge']
const DIFFICULTIES = ['easy', 'medium', 'hard']

const EMPTY_FORM = {
  date: '',
  text: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
  subject: '',
  difficulty: 'medium',
}

export default function DailyChallenge({ adminToken }) {
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [filter, setFilter] = useState('upcoming') // 'upcoming' | 'past' | 'all'

  useEffect(() => { load() }, [])

  async function load() {
    try {
      setLoading(true)
      const data = await listChallenges(adminToken)
      setChallenges(data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  const filtered = useMemo(() => {
    if (filter === 'upcoming') return challenges.filter(c => c.date >= today)
    if (filter === 'past') return challenges.filter(c => c.date < today)
    return challenges
  }, [challenges, filter, today])

  const todayChallenge = useMemo(() => challenges.find(c => c.date === today), [challenges, today])

  function openNew() {
    // Default date to next available date
    const dates = new Set(challenges.map(c => c.date))
    let d = new Date()
    d.setDate(d.getDate() + 1) // start from tomorrow
    while (dates.has(d.toISOString().split('T')[0])) {
      d.setDate(d.getDate() + 1)
    }
    setForm({ ...EMPTY_FORM, date: d.toISOString().split('T')[0] })
    setEditing(null)
    setFormError('')
    setShowForm(true)
  }

  function openEdit(ch) {
    setForm({
      date: ch.date,
      text: ch.text,
      options: [...ch.options],
      correctIndex: ch.correctIndex,
      explanation: ch.explanation || '',
      subject: ch.subject || '',
      difficulty: ch.difficulty || 'medium',
    })
    setEditing(ch)
    setFormError('')
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.date) { setFormError('Date is required'); return }
    if (!form.text.trim()) { setFormError('Question text is required'); return }
    if (form.options.some(o => !o.trim())) { setFormError('All 4 options are required'); return }

    setSubmitting(true)
    setFormError('')
    try {
      if (editing) {
        await updateChallenge(adminToken, editing.id, form)
        setSuccess('Challenge updated!')
      } else {
        await createChallenge(adminToken, form)
        setSuccess('Challenge created!')
      }
      setShowForm(false)
      setEditing(null)
      setForm(EMPTY_FORM)
      await load()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteChallenge(adminToken, id)
      setDeleteConfirm(null)
      setSuccess('Challenge deleted!')
      await load()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.message)
    }
  }

  function getDifficultyStyle(d) {
    switch (d) {
      case 'easy': return { bg: '#e6f4ea', color: '#1e7e34' }
      case 'hard': return { bg: '#fce8e6', color: '#c62828' }
      default: return { bg: '#fff3e0', color: '#e65100' }
    }
  }

  function getDateStatus(date) {
    if (date === today) return { label: "TODAY'S", bg: '#4CAF50', color: '#fff' }
    if (date > today) return { label: 'UPCOMING', bg: '#1A73E8', color: '#fff' }
    return { label: 'PAST', bg: '#9e9e9e', color: '#fff' }
  }

  function formatDate(d) {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 64 }}>
      <div className="spinner" />
    </div>
  )

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 24,
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>⚡ Daily Challenge</h2>
          <p style={{ margin: '4px 0 0', color: '#6c757d', fontSize: 14 }}>
            Post one question per day. Only super admins can manage challenges.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ New Challenge</button>
      </div>

      {error && <div className="error-banner" style={{ marginBottom: 16 }}>{error}</div>}
      {success && <div className="success-banner" style={{ marginBottom: 16 }}>{success}</div>}

      {/* Today's Card */}
      {todayChallenge && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 16, padding: 24, marginBottom: 24, color: '#fff',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{
                background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 20,
                fontSize: 11, fontWeight: 700, letterSpacing: 1,
              }}>TODAY'S CHALLENGE</span>
              <h3 style={{ margin: '12px 0 8px', fontSize: 18, fontWeight: 700 }}>
                {todayChallenge.text}
              </h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {todayChallenge.options.map((opt, i) => (
                  <span key={i} style={{
                    background: i === todayChallenge.correctIndex ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255,255,255,0.15)',
                    padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    border: i === todayChallenge.correctIndex ? '1px solid rgba(76, 175, 80, 0.5)' : '1px solid rgba(255,255,255,0.2)',
                  }}>
                    {String.fromCharCode(65 + i)}. {opt}
                    {i === todayChallenge.correctIndex && ' ✓'}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'right', minWidth: 80 }}>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{todayChallenge.attemptCount || 0}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>attempts</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button
              className="btn btn-outline"
              style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff', fontSize: 13 }}
              onClick={() => openEdit(todayChallenge)}
            >
              Edit
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['upcoming', 'past', 'all'].map(f => (
          <button
            key={f}
            className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: 13, padding: '6px 16px' }}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({
              f === 'upcoming' ? challenges.filter(c => c.date >= today).length :
              f === 'past' ? challenges.filter(c => c.date < today).length :
              challenges.length
            })
          </button>
        ))}
      </div>

      {/* Challenge List */}
      {filtered.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: 12, padding: 48, textAlign: 'center',
          border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#374151' }}>No challenges found</h3>
          <p style={{ color: '#9ca3af', marginTop: 8 }}>Create a new daily challenge to get started</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(ch => {
            const status = getDateStatus(ch.date)
            const diff = getDifficultyStyle(ch.difficulty)
            return (
              <div key={ch.id} style={{
                background: '#fff', borderRadius: 12, padding: 20,
                border: ch.date === today ? '2px solid #667eea' : '1px solid var(--border)',
                transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{
                        background: status.bg, color: status.color, padding: '2px 8px',
                        borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                      }}>{status.label}</span>
                      <span style={{ fontSize: 13, color: '#6c757d', fontWeight: 600 }}>{formatDate(ch.date)}</span>
                      {ch.subject && (
                        <span style={{
                          background: '#f0f0ff', color: '#5b5fc7', padding: '2px 8px',
                          borderRadius: 4, fontSize: 11, fontWeight: 600,
                        }}>{ch.subject}</span>
                      )}
                      <span style={{
                        background: diff.bg, color: diff.color, padding: '2px 8px',
                        borderRadius: 4, fontSize: 11, fontWeight: 600,
                      }}>{ch.difficulty}</span>
                    </div>
                    <p style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: '#1a1a2e', lineHeight: 1.4 }}>
                      {ch.text}
                    </p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {ch.options.map((opt, i) => (
                        <span key={i} style={{
                          background: i === ch.correctIndex ? '#e8f5e9' : '#f5f5f5',
                          color: i === ch.correctIndex ? '#2e7d32' : '#555',
                          padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                          border: i === ch.correctIndex ? '1px solid #a5d6a7' : '1px solid #e0e0e0',
                        }}>
                          {String.fromCharCode(65 + i)}. {opt}
                          {i === ch.correctIndex && ' ✓'}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
                    <span style={{ fontSize: 12, color: '#6c757d', marginRight: 8, alignSelf: 'center' }}>
                      {ch.attemptCount || 0} attempts
                    </span>
                    <button className="btn btn-outline" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => openEdit(ch)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{ fontSize: 12, padding: '4px 10px', color: '#dc3545', borderColor: '#dc3545' }}
                      onClick={() => setDeleteConfirm(ch)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 32, width: '90%', maxWidth: 400,
          }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Delete Challenge?</h3>
            <p style={{ color: '#6c757d', margin: '0 0 24px', fontSize: 14 }}>
              This will permanently delete the challenge for <strong>{formatDate(deleteConfirm.date)}</strong> and all user attempts.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button
                className="btn btn-primary"
                style={{ background: '#dc3545', borderColor: '#dc3545' }}
                onClick={() => handleDelete(deleteConfirm.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflowY: 'auto', padding: 24,
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 32, width: '90%', maxWidth: 640,
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <h3 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700 }}>
              {editing ? 'Edit Challenge' : 'New Daily Challenge'}
            </h3>

            <form onSubmit={handleSubmit}>
              {/* Date */}
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Challenge Date *</label>
                <input
                  type="date"
                  className="input"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  required
                />
              </div>

              {/* Question Text */}
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Question *</label>
                <textarea
                  className="input"
                  rows={3}
                  value={form.text}
                  onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                  placeholder="Enter the challenge question..."
                  required
                />
              </div>

              {/* Options */}
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Options *</label>
                {form.options.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                      background: form.correctIndex === i ? '#e8f5e9' : '#f8f9fa',
                      padding: '8px 12px', borderRadius: 8, minWidth: 36, justifyContent: 'center',
                      border: form.correctIndex === i ? '2px solid #4caf50' : '2px solid transparent',
                    }}>
                      <input
                        type="radio"
                        name="correctIndex"
                        checked={form.correctIndex === i}
                        onChange={() => setForm(f => ({ ...f, correctIndex: i }))}
                      />
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{String.fromCharCode(65 + i)}</span>
                    </label>
                    <input
                      className="input"
                      style={{ flex: 1 }}
                      value={opt}
                      onChange={e => {
                        const opts = [...form.options]
                        opts[i] = e.target.value
                        setForm(f => ({ ...f, options: opts }))
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      required
                    />
                  </div>
                ))}
                <p style={{ fontSize: 12, color: '#6c757d', margin: '4px 0 0' }}>
                  Select the radio button next to the correct answer
                </p>
              </div>

              {/* Subject & Difficulty */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select
                    className="input"
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  >
                    <option value="">Select subject</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Difficulty</label>
                  <select
                    className="input"
                    value={form.difficulty}
                    onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
                  >
                    {DIFFICULTIES.map(d => (
                      <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Explanation */}
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Explanation (optional)</label>
                <textarea
                  className="input"
                  rows={2}
                  value={form.explanation}
                  onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
                  placeholder="Explain why this is the correct answer..."
                />
              </div>

              {formError && (
                <div className="error-banner" style={{ marginBottom: 16 }}>{formError}</div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setEditing(null); setForm(EMPTY_FORM) }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'Saving...' : (editing ? 'Update Challenge' : 'Create Challenge')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
