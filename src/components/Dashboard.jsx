import { useState, useEffect } from 'react'
import { listMockTests, createMockTest, deleteMockTest } from '../api.js'

const CLASS_LEVELS = ['6', '7', '8', '9', 'both']
const SUBJECTS = ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'General Knowledge']
const EMPTY_FORM = { title: '', subject: '', duration: '', classLevel: '6', isPremium: false }

export default function Dashboard({ adminToken, onSelectTest }) {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => { fetchTests() }, [])

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

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.title || !form.subject || !form.duration) {
      setFormError('All fields are required')
      return
    }
    setSubmitting(true)
    setFormError('')
    try {
      await createMockTest(adminToken, {
        title: form.title,
        subject: form.subject,
        duration: parseInt(form.duration),
        classLevel: form.classLevel,
        isPremium: form.isPremium,
      })
      setShowModal(false)
      setForm(EMPTY_FORM)
      setSuccess('Mock test created successfully!')
      setTimeout(() => setSuccess(''), 3000)
      fetchTests()
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(test) {
    if (!confirm(`Are you sure you want to delete "${test.title}"? This will also delete all questions.`)) return
    
    setError('')
    try {
      await deleteMockTest(adminToken, test._id)
      setSuccess('Mock test deleted successfully!')
      setTimeout(() => setSuccess(''), 3000)
      fetchTests()
    } catch (e) {
      setError(e.message)
    }
  }

  const filteredTests = tests.filter(t => {
    if (filterSubject && t.subject !== filterSubject) return false
    if (filterClass && t.classLevel !== filterClass) return false
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: 32 }}>Mock Tests</h1>
            <p style={{ margin: 0, color: 'var(--muted)' }}>Create and manage mock tests for students</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Create Mock Test
          </button>
        </div>

        {/* Filters and Search */}
        <div style={{ 
          display: 'flex', 
          gap: 12, 
          padding: 20,
          background: 'white',
          borderRadius: 12,
          border: '1px solid var(--border)'
        }}>
          <input
            type="text"
            className="input"
            placeholder="🔍 Search mock tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <select
            className="input"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            style={{ minWidth: 180 }}
          >
            <option value="">All Subjects</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            className="input"
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            style={{ minWidth: 150 }}
          >
            <option value="">All Classes</option>
            {CLASS_LEVELS.map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>
          {(filterSubject || filterClass || searchQuery) && (
            <button
              className="btn btn-outline"
              onClick={() => {
                setFilterSubject('')
                setFilterClass('')
                setSearchQuery('')
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
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

      {loading && (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <p style={{ color: 'var(--muted)', fontSize: 16 }}>Loading mock tests...</p>
        </div>
      )}

      {!loading && filteredTests.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: 80,
          background: 'white',
          borderRadius: 12,
          border: '2px dashed var(--border)'
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📝</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 20 }}>
            {tests.length === 0 ? 'No mock tests yet' : 'No results found'}
          </h3>
          <p style={{ margin: '0 0 24px 0', color: 'var(--muted)' }}>
            {tests.length === 0 
              ? 'Create your first mock test to get started'
              : 'Try adjusting your filters or search query'
            }
          </p>
          {tests.length === 0 && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              + Create Mock Test
            </button>
          )}
        </div>
      )}

      {!loading && filteredTests.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
          {filteredTests.map(test => (
            <div
              key={test._id}
              style={{
                background: 'white',
                borderRadius: 12,
                padding: 24,
                border: '1px solid var(--border)',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
              onClick={() => onSelectTest(test)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 600 }}>{test.title}</h3>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      background: '#e0f2fe',
                      color: '#0369a1',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      {test.subject}
                    </span>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      background: '#f3e8ff',
                      color: '#7c3aed',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      Class {test.classLevel}
                    </span>
                    {test.isPremium && (
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                        color: 'white',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 600
                      }}>
                        👑 Premium
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                padding: 16,
                background: 'var(--bg-light)',
                borderRadius: 8,
                marginTop: 16
              }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, fontWeight: 600 }}>Questions</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: test.questionCount === 0 ? 'var(--muted)' : '#6366f1' }}>
                    {test.questionCount || 0}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, fontWeight: 600 }}>Duration</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#06b6d4' }}>
                    {test.duration}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--muted)' }}>m</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }} onClick={(e) => e.stopPropagation()}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, fontSize: 14 }}
                  onClick={() => onSelectTest(test)}
                >
                  Manage Questions
                </button>
                <button
                  className="btn btn-outline"
                  style={{ padding: '8px 16px', fontSize: 14 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(test)
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0 }}>Create Mock Test</h2>
              <button onClick={() => setShowModal(false)} className="btn btn-outline" style={{ padding: '4px 12px' }}>✕</button>
            </div>
            
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Test Title</label>
                <input
                  className="input"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Class 6 Mathematics Full Test"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
                  <label className="form-label">Class Level</label>
                  <select
                    className="input"
                    value={form.classLevel}
                    onChange={e => setForm(f => ({ ...f, classLevel: e.target.value }))}
                  >
                    {CLASS_LEVELS.map(c => <option key={c} value={c}>Class {c}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'end' }}>
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
                <div className="form-group" style={{ paddingBottom: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
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

              {formError && (
                <div className="error-banner" style={{ marginTop: 16 }}>
                  {formError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ flex: 1 }}>
                  {submitting ? 'Creating...' : 'Create Mock Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
