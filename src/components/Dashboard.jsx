import { useState, useEffect } from 'react'
import { listMockTests, createMockTest } from '../api.js'

const CLASS_LEVELS = ['6', '7', '8', '9', 'both']
const SUBJECTS = ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'General Knowledge']

const EMPTY_FORM = { title: '', subject: '', duration: '', classLevel: '6', isPremium: false }

export default function Dashboard({ adminKey, onSelectTest }) {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => { fetchTests() }, [])

  async function fetchTests() {
    setLoading(true)
    setError('')
    try {
      const data = await listMockTests(adminKey)
      setTests(data.tests || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.title || !form.subject || !form.duration) {
      setFormError('All fields are required')
      return
    }
    setSubmitting(true)
    setFormError('')
    try {
      await createMockTest(adminKey, {
        title: form.title,
        subject: form.subject,
        duration: parseInt(form.duration),
        classLevel: form.classLevel,
        isPremium: form.isPremium,
      })
      setShowModal(false)
      setForm(EMPTY_FORM)
      fetchTests()
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Mock Tests</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Mock Test</button>
      </div>

      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && tests.length === 0 && (
        <div className="empty-state">No mock tests yet. Create one to get started.</div>
      )}

      {tests.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Subject</th>
              <th>Class</th>
              <th>Duration</th>
              <th>Questions</th>
              <th>Premium</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tests.map(t => (
              <tr key={t._id}>
                <td><strong>{t.title}</strong></td>
                <td>{t.subject}</td>
                <td>{t.classLevel}</td>
                <td>{t.duration} min</td>
                <td>{t.questionCount ?? 0}</td>
                <td>{t.isPremium ? 'Yes' : 'No'}</td>
                <td>
                  <button className="btn btn-sm" onClick={() => onSelectTest(t)}>Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Create Mock Test</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Class 6 Full Test" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Subject</label>
                  <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
                    <option value="">Select subject</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Class Level</label>
                  <select value={form.classLevel} onChange={e => setForm(f => ({ ...f, classLevel: e.target.value }))}>
                    {CLASS_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="60" min="1" />
                </div>
                <div className="form-group form-checkbox">
                  <label>
                    <input type="checkbox" checked={form.isPremium} onChange={e => setForm(f => ({ ...f, isPremium: e.target.checked }))} />
                    Premium only
                  </label>
                </div>
              </div>
              {formError && <p className="error-text">{formError}</p>}
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
