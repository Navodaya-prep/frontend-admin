import { useState, useEffect } from 'react'
import { listMockTests, createMockTest, updateMockTest, deleteMockTest } from '../api.js'
import Icon from './Icons.jsx'

const CLASS_LEVELS = ['6', '7', '8', '9', 'both']
const SUBJECTS = ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'General Knowledge']
const EMPTY_FORM = { title: '', subject: '', duration: '', classLevel: '6', isPremium: false }

export default function Dashboard({ adminToken, onSelectTest }) {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingTest, setEditingTest] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => { fetchTests() }, [])

  function flash(msg) {
    setSuccess(msg)
    setTimeout(() => setSuccess(''), 3000)
  }

  async function fetchTests() {
    setLoading(true)
    setError('')
    try {
      const data = await listMockTests(adminToken)
      setTests(data.tests || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function openCreateModal() {
    setEditingTest(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowModal(true)
  }

  function openEditModal(test, e) {
    e.stopPropagation()
    setEditingTest(test)
    setForm({
      title: test.title,
      subject: test.subject,
      duration: String(test.duration),
      classLevel: test.classLevel,
      isPremium: !!test.isPremium,
    })
    setFormError('')
    setShowModal(true)
  }

  async function handleSubmitForm(e) {
    e.preventDefault()
    if (!form.title || !form.subject || !form.duration) {
      setFormError('All fields are required')
      return
    }
    setSubmitting(true)
    setFormError('')
    try {
      const payload = {
        title: form.title,
        subject: form.subject,
        duration: parseInt(form.duration),
        classLevel: form.classLevel,
        isPremium: form.isPremium,
      }
      if (editingTest) {
        await updateMockTest(adminToken, editingTest._id, payload)
        flash('Mock test updated.')
      } else {
        await createMockTest(adminToken, payload)
        flash('Mock test created.')
      }
      setShowModal(false)
      setForm(EMPTY_FORM)
      setEditingTest(null)
      fetchTests()
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    setError('')
    try {
      await deleteMockTest(adminToken, deleting._id)
      flash('Mock test deleted.')
      setDeleting(null)
      fetchTests()
    } catch (e) {
      setError(e.message)
      setDeleting(null)
    }
  }

  const filteredTests = tests.filter(t => {
    if (filterSubject && t.subject !== filterSubject) return false
    if (filterClass && t.classLevel !== filterClass) return false
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const hasFilters = filterSubject || filterClass || searchQuery

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Mock Tests</h1>
          <p className="page-desc">
            Timed, exam-style tests with auto-scoring and a leaderboard. Click a test to manage its questions.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Icon name="plus" size={16} /> Create Mock Test
        </button>
      </div>

      {/* Filters and search */}
      <div className="toolbar">
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Icon name="search" size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input
            type="text"
            className="input"
            placeholder="Search mock tests…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <select className="input" value={filterSubject} onChange={e => setFilterSubject(e.target.value)} style={{ width: 'auto', minWidth: 170 }}>
          <option value="">All Subjects</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input" value={filterClass} onChange={e => setFilterClass(e.target.value)} style={{ width: 'auto', minWidth: 140 }}>
          <option value="">All Classes</option>
          {CLASS_LEVELS.map(c => <option key={c} value={c}>Class {c}</option>)}
        </select>
        {hasFilters && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilterSubject(''); setFilterClass(''); setSearchQuery('') }}>
            <Icon name="x" size={14} /> Clear
          </button>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      {loading && <div className="loading-block"><div className="spinner" />Loading mock tests…</div>}

      {!loading && filteredTests.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon"><Icon name="clipboard" size={26} /></div>
          <h3>{tests.length === 0 ? 'No mock tests yet' : 'No results found'}</h3>
          <p>
            {tests.length === 0
              ? 'Create your first mock test to get started.'
              : 'Try adjusting your filters or search query.'}
          </p>
          {tests.length === 0 && (
            <button className="btn btn-primary" onClick={openCreateModal}>
              <Icon name="plus" size={16} /> Create Mock Test
            </button>
          )}
        </div>
      )}

      {!loading && filteredTests.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 20 }}>
          {filteredTests.map(test => (
            <div key={test._id} className="card card-hover" onClick={() => onSelectTest(test)}>
              <h3 style={{ margin: '0 0 10px', fontSize: 16.5, fontWeight: 700 }}>{test.title}</h3>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="badge badge-blue">{test.subject}</span>
                <span className="badge badge-purple">Class {test.classLevel}</span>
                {test.isPremium && <span className="badge badge-premium"><Icon name="crown" size={12} /> Premium</span>}
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
                padding: 14, background: 'var(--bg-light)', borderRadius: 10, margin: '16px 0',
              }}>
                <div>
                  <div className="stat-label">Questions</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: test.questionCount ? 'var(--primary)' : 'var(--muted)' }}>
                    {test.questionCount || 0}
                  </div>
                </div>
                <div>
                  <div className="stat-label">Duration</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--info)' }}>
                    {test.duration}<span style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)' }}> min</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => onSelectTest(test)}>
                  Manage Questions
                </button>
                <button className="btn btn-outline btn-sm" onClick={e => openEditModal(test, e)} title="Edit test details">
                  <Icon name="edit" size={14} />
                </button>
                <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)' }} title="Delete test"
                  onClick={e => { e.stopPropagation(); setDeleting(test) }}>
                  <Icon name="trash" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / edit test modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h2>{editingTest ? 'Edit Mock Test' : 'Create Mock Test'}</h2>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon" aria-label="Close">
                <Icon name="x" size={17} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm}>
              <div className="form-group">
                <label className="form-label">Test title</label>
                <input
                  className="input"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Class 6 Mathematics Full Test"
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select
                    className="input"
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    required
                  >
                    <option value="">Select subject</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Class level</label>
                  <select
                    className="input"
                    value={form.classLevel}
                    onChange={e => setForm(f => ({ ...f, classLevel: e.target.value }))}
                  >
                    {CLASS_LEVELS.map(c => <option key={c} value={c}>Class {c}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'end' }}>
                <div className="form-group">
                  <label className="form-label">Duration (minutes)</label>
                  <input
                    className="input"
                    type="number"
                    value={form.duration}
                    onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                    placeholder="60"
                    min="1"
                    required
                  />
                </div>
                <div className="form-group" style={{ paddingBottom: 9 }}>
                  <label className="form-checkbox" style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.isPremium}
                      onChange={e => setForm(f => ({ ...f, isPremium: e.target.checked }))}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>Premium only</span>
                  </label>
                </div>
              </div>

              {formError && <div className="error-banner" style={{ marginTop: 8 }}>{formError}</div>}

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving…' : (editingTest ? 'Save Changes' : 'Create Mock Test')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleting && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleting(null)}>
          <div className="modal" style={{ maxWidth: 440 }}>
            <h3>Delete "{deleting.title}"?</h3>
            <p className="muted" style={{ margin: '12px 0 0', lineHeight: 1.6 }}>
              The test and all of its {deleting.questionCount || 0} question{(deleting.questionCount || 0) !== 1 ? 's' : ''} will be permanently removed. This cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setDeleting(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Delete Test</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
