import { useState, useEffect } from 'react'
import { listLiveClasses, createLiveClass, endLiveClass } from '../api.js'

const SUBJECTS = ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'General Knowledge', 'Mental Ability']
const CLASS_LEVELS = ['6', '7', '8', '9', 'both']
const EMPTY = { title: '', subject: '', teacherName: '', description: '', youtubeVideoId: '', classLevel: '6', duration: 60, isPremium: false }

export default function LiveClasses({ adminToken, onEnterRoom }) {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => { fetch() }, [])

  async function fetch() {
    setLoading(true)
    setError('')
    try {
      const data = await listLiveClasses(adminToken)
      setClasses(data.classes || [])
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  function extractYouTubeId(input) {
    // Accept full URL or bare ID
    try {
      const url = new URL(input)
      return url.searchParams.get('v') || url.pathname.split('/').pop()
    } catch {
      return input.trim() // already a bare ID
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setFormError('')
    if (!form.title || !form.subject || !form.teacherName || !form.youtubeVideoId) {
      setFormError('Please fill all required fields')
      return
    }
    const youtubeVideoId = extractYouTubeId(form.youtubeVideoId)
    if (!youtubeVideoId) { setFormError('Invalid YouTube URL or ID'); return }
    setSubmitting(true)
    try {
      const data = await createLiveClass(adminToken, { ...form, youtubeVideoId, duration: parseInt(form.duration) })
      setShowModal(false)
      setForm(EMPTY)
      onEnterRoom(data.class)
    } catch (e) { setFormError(e.message) }
    finally { setSubmitting(false) }
  }

  async function handleEnd(cls) {
    if (!confirm(`End "${cls.title}"?`)) return
    try {
      await endLiveClass(adminToken, cls.id)
      fetch()
    } catch (e) { alert(e.message) }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Live Classes</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Start Live Class</button>
      </div>

      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && classes.length === 0 && (
        <div className="empty-state">No live classes yet. Start one to begin!</div>
      )}

      {classes.length > 0 && (
        <table className="table">
          <thead>
            <tr><th>Title</th><th>Subject</th><th>Teacher</th><th>Class</th><th>Status</th><th>Started</th><th></th></tr>
          </thead>
          <tbody>
            {classes.map(c => (
              <tr key={c.id}>
                <td><strong>{c.title}</strong></td>
                <td>{c.subject}</td>
                <td>{c.teacherName}</td>
                <td>{c.classLevel}</td>
                <td>
                  <span className={`badge ${c.isLive ? 'badge-live' : ''}`}>
                    {c.isLive ? '🔴 Live' : 'Ended'}
                  </span>
                </td>
                <td>{new Date(c.startedAt).toLocaleTimeString()}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  {c.isLive && (
                    <>
                      <button className="btn btn-sm btn-primary" onClick={() => onEnterRoom(c)}>Enter Room</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleEnd(c)}>End</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Start Live Class</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Class 6 Maths Live" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Subject *</label>
                  <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
                    <option value="">Select subject</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Class Level *</label>
                  <select value={form.classLevel} onChange={e => setForm(f => ({ ...f, classLevel: e.target.value }))}>
                    {CLASS_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Teacher Name *</label>
                  <input value={form.teacherName} onChange={e => setForm(f => ({ ...f, teacherName: e.target.value }))} placeholder="e.g. Mr. Sharma" />
                </div>
                <div className="form-group">
                  <label>Duration (min)</label>
                  <input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} min="1" />
                </div>
              </div>
              <div className="form-group">
                <label>YouTube Video ID *</label>
                <input value={form.youtubeVideoId} onChange={e => setForm(f => ({ ...f, youtubeVideoId: e.target.value }))} placeholder="Paste full URL or just the video ID" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What will be covered in this class?" />
              </div>
              <div className="form-group form-checkbox">
                <label>
                  <input type="checkbox" checked={form.isPremium} onChange={e => setForm(f => ({ ...f, isPremium: e.target.checked }))} />
                  Premium only
                </label>
              </div>
              {formError && <p className="error-text">{formError}</p>}
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Starting...' : 'Start Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
