import { useState, useEffect } from 'react'
import { listDoubts, getDoubtWithAnswers, answerDoubt, deleteAdminDoubt } from '../api'

const SUBJECT_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Mental Ability', value: 'Mental Ability' },
  { label: 'Arithmetic', value: 'Arithmetic' },
  { label: 'Language', value: 'Language' },
  { label: 'General', value: 'General' },
]

function formatTime(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function Doubts({ adminToken }) {
  const [doubts, setDoubts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [selectedDoubt, setSelectedDoubt] = useState(null)
  const [answers, setAnswers] = useState([])
  const [answerText, setAnswerText] = useState('')
  const [answering, setAnswering] = useState(false)
  const [loadingAnswers, setLoadingAnswers] = useState(false)

  useEffect(() => { load() }, [subjectFilter, statusFilter])

  async function load() {
    try {
      setLoading(true)
      setError('')
      const params = {}
      if (subjectFilter) params.subject = subjectFilter
      if (statusFilter) params.status = statusFilter
      const data = await listDoubts(adminToken, params)
      setDoubts(data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function openDoubt(doubt) {
    setSelectedDoubt(doubt)
    setAnswers([])
    setAnswerText('')
    setLoadingAnswers(true)
    try {
      const data = await getDoubtWithAnswers(adminToken, doubt.id)
      setAnswers(data.answers || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingAnswers(false)
    }
  }

  async function handleAnswer(e) {
    e.preventDefault()
    if (!answerText.trim() || !selectedDoubt) return
    setAnswering(true)
    try {
      await answerDoubt(adminToken, selectedDoubt.id, answerText.trim())
      setAnswerText('')
      // Refresh answers and doubt list
      const data = await getDoubtWithAnswers(adminToken, selectedDoubt.id)
      setAnswers(data.answers || [])
      setDoubts((prev) =>
        prev.map((d) => d.id === selectedDoubt.id ? { ...d, status: 'answered', answerCount: (d.answerCount || 0) + 1 } : d)
      )
    } catch (e) {
      alert(e.message)
    } finally {
      setAnswering(false)
    }
  }

  async function handleDelete(doubtId) {
    if (!confirm('Delete this doubt and all its answers?')) return
    try {
      await deleteAdminDoubt(adminToken, doubtId)
      setDoubts((prev) => prev.filter((d) => d.id !== doubtId))
      if (selectedDoubt?.id === doubtId) setSelectedDoubt(null)
    } catch (e) {
      alert(e.message)
    }
  }

  const openCount = doubts.filter((d) => d.status === 'open').length

  return (
    <div style={{ display: 'flex', gap: 24, height: 'calc(100vh - 80px)' }}>
      {/* Left: Doubt list */}
      <div style={{ width: 420, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Student Doubts</h2>
          <span style={{ background: '#fee2e2', color: '#dc2626', padding: '2px 10px', borderRadius: 99, fontSize: 13, fontWeight: 600 }}>
            {openCount} open
          </span>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="btn btn-outline" style={{ fontSize: 13 }}>
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="answered">Answered</option>
          </select>
          <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="btn btn-outline" style={{ fontSize: 13 }}>
            {SUBJECT_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Loading...</div>
        ) : doubts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>No doubts found</div>
        ) : (
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {doubts.map((doubt) => (
              <div
                key={doubt.id}
                onClick={() => openDoubt(doubt)}
                style={{
                  background: selectedDoubt?.id === doubt.id ? '#eff6ff' : 'white',
                  border: `1px solid ${selectedDoubt?.id === doubt.id ? '#3b82f6' : '#e5e7eb'}`,
                  borderRadius: 10, padding: '12px 14px', cursor: 'pointer',
                  transition: 'all 0.1s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{
                      background: doubt.status === 'answered' ? '#dcfce7' : '#fef3c7',
                      color: doubt.status === 'answered' ? '#16a34a' : '#d97706',
                      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                    }}>
                      {doubt.status}
                    </span>
                    <span style={{ fontSize: 11, background: '#f3f4f6', padding: '2px 8px', borderRadius: 99, color: '#6b7280' }}>
                      {doubt.subject}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{formatTime(doubt.createdAt)}</span>
                </div>
                <p style={{ margin: '0 0 6px', fontSize: 14, color: '#111827', lineHeight: 1.4 }}>{doubt.text}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>by {doubt.userName}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>💬 {doubt.answerCount || 0}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(doubt.id) }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 14, padding: 2 }}
                      title="Delete doubt"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Answers panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {!selectedDoubt ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 48 }}>💬</span>
            <span>Select a doubt to view and answer</span>
          </div>
        ) : (
          <>
            {/* Question header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', background: '#eff6ff' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 12, background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                  {selectedDoubt.subject}
                </span>
                <span style={{ fontSize: 12, color: '#6b7280' }}>by {selectedDoubt.userName} · {formatTime(selectedDoubt.createdAt)}</span>
              </div>
              <p style={{ margin: 0, fontSize: 15, color: '#111827', fontWeight: 500, lineHeight: 1.5 }}>{selectedDoubt.text}</p>
            </div>

            {/* Answers */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {loadingAnswers ? (
                <div style={{ textAlign: 'center', padding: 20, color: '#6b7280' }}>Loading answers...</div>
              ) : answers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No answers yet. Be the first to answer!</div>
              ) : (
                answers.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      background: a.isAdmin ? '#fef3c7' : '#f9fafb',
                      border: `1px solid ${a.isAdmin ? '#fbbf24' : '#e5e7eb'}`,
                      borderRadius: 10, padding: '10px 14px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: a.isAdmin ? '#d97706' : '#374151' }}>
                        {a.isAdmin ? '👑 Admin: ' : ''}{a.userName}
                      </span>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>{formatTime(a.createdAt)}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.5 }}>{a.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Answer input */}
            <form onSubmit={handleAnswer} style={{ padding: 16, borderTop: '1px solid #e5e7eb', display: 'flex', gap: 10 }}>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Type your answer as admin..."
                rows={2}
                style={{
                  flex: 1, border: '1.5px solid #d1d5db', borderRadius: 8,
                  padding: '10px 12px', fontSize: 14, resize: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!answerText.trim() || answering}
                style={{ alignSelf: 'flex-end', minWidth: 100 }}
              >
                {answering ? 'Sending...' : 'Answer →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
