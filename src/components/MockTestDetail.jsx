import { useState, useEffect } from 'react'
import { listQuestions, addQuestion, updateQuestion, deleteQuestion, reorderQuestions, getImageUrl } from '../api.js'
import QuestionEditorModal from './QuestionEditorModal.jsx'
import Icon from './Icons.jsx'

const SUBJECTS = ['Mathematics', 'English', 'Hindi', 'Reasoning', 'General']
const CLASS_LEVELS = [
  { value: '6', label: 'Class 6' },
  { value: '7', label: 'Class 7' },
  { value: '8', label: 'Class 8' },
  { value: '9', label: 'Class 9' },
  { value: 'both', label: 'All classes' },
]

const DIFF_BADGE = {
  easy: { className: 'badge badge-green', label: 'Easy' },
  medium: { className: 'badge badge-amber', label: 'Medium' },
  hard: { className: 'badge badge-red', label: 'Hard' },
}

export default function MockTestDetail({ adminToken, test, onBack }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [draggedIndex, setDraggedIndex] = useState(null)

  useEffect(() => { fetchQuestions() }, [])

  function flash(msg) {
    setSuccess(msg)
    setTimeout(() => setSuccess(''), 3000)
  }

  async function fetchQuestions() {
    setLoading(true)
    setError('')
    try {
      const data = await listQuestions(adminToken, test._id)
      setQuestions(data.questions || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function openEditor(question = null) {
    setEditingQuestion(question)
    setEditorOpen(true)
  }

  async function handleSave(payload) {
    if (editingQuestion) {
      await updateQuestion(adminToken, test._id, editingQuestion.id, payload)
      flash('Question updated.')
    } else {
      await addQuestion(adminToken, test._id, payload)
      flash('Question added.')
    }
    setEditorOpen(false)
    setEditingQuestion(null)
    fetchQuestions()
  }

  async function confirmDelete() {
    if (!deleting) return
    setError('')
    try {
      await deleteQuestion(adminToken, test._id, deleting.id)
      flash('Question deleted.')
      setDeleting(null)
      fetchQuestions()
    } catch (e) {
      setError(e.message)
      setDeleting(null)
    }
  }

  // Drag and drop reordering
  function handleDragStart(e, index) {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e, index) {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    const next = [...questions]
    const [moved] = next.splice(draggedIndex, 1)
    next.splice(index, 0, moved)
    setQuestions(next)
    setDraggedIndex(index)
  }

  async function handleDragEnd() {
    if (draggedIndex !== null) {
      try {
        await reorderQuestions(adminToken, test._id, { questionIds: questions.map(q => q.id) })
        flash('Question order saved.')
      } catch (e) {
        setError(e.message)
        fetchQuestions()
      }
    }
    setDraggedIndex(null)
  }

  const stats = {
    total: questions.length,
    easy: questions.filter(q => q.difficulty === 'easy').length,
    medium: questions.filter(q => q.difficulty === 'medium').length,
    hard: questions.filter(q => q.difficulty === 'hard').length,
  }

  return (
    <div>
      {/* Header */}
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 16, marginLeft: -8 }}>
        <Icon name="arrowLeft" size={15} /> Back to Mock Tests
      </button>

      <div className="page-header">
        <div>
          <h1>{test.title}</h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            <span className="badge badge-blue">{test.subject}</span>
            <span className="badge badge-purple">Class {test.classLevel}</span>
            <span className="badge badge-gray"><Icon name="clock" size={13} /> {test.duration} min</span>
            {test.isPremium && <span className="badge badge-premium"><Icon name="crown" size={13} /> Premium</span>}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => openEditor()}>
          <Icon name="plus" size={16} /> Add Question
        </button>
      </div>

      {/* Difficulty breakdown */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}><Icon name="fileText" size={20} /></div>
          <div><div className="stat-label">Total</div><div className="stat-value">{stats.total}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}><Icon name="checkCircle" size={20} /></div>
          <div><div className="stat-label">Easy</div><div className="stat-value">{stats.easy}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}><Icon name="alert" size={20} /></div>
          <div><div className="stat-label">Medium</div><div className="stat-value">{stats.medium}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}><Icon name="zap" size={20} /></div>
          <div><div className="stat-label">Hard</div><div className="stat-value">{stats.hard}</div></div>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      {/* Questions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 className="section-title" style={{ marginBottom: 0 }}>Questions</h3>
        {questions.length > 1 && (
          <span className="muted" style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon name="grip" size={14} /> Drag cards to reorder
          </span>
        )}
      </div>

      {loading && <div className="loading-block"><div className="spinner" />Loading questions…</div>}

      {!loading && questions.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon"><Icon name="fileText" size={26} /></div>
          <h3>No questions yet</h3>
          <p>Add the first question to this mock test.</p>
          <button className="btn btn-primary" onClick={() => openEditor()}>
            <Icon name="plus" size={16} /> Add Question
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {questions.map((q, i) => {
          const diff = DIFF_BADGE[q.difficulty] || DIFF_BADGE.medium
          return (
            <div
              key={q.id}
              className="card"
              draggable
              onDragStart={e => handleDragStart(e, i)}
              onDragOver={e => handleDragOver(e, i)}
              onDragEnd={handleDragEnd}
              style={{
                cursor: 'grab',
                border: draggedIndex === i ? '2px dashed var(--primary)' : undefined,
                opacity: draggedIndex === i ? 0.7 : 1,
              }}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: 34, height: 34, background: 'var(--primary)', color: '#fff',
                  borderRadius: 9, fontWeight: 700, fontSize: 14, flexShrink: 0,
                }}>
                  {i + 1}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span className={diff.className}>{diff.label}</span>
                    {q.subject && <span className="badge badge-gray">{q.subject}</span>}
                    {q.isPYQ && q.examYear && <span className="badge badge-blue">PYQ {q.examYear}</span>}
                  </div>

                  <p style={{ margin: 0, fontSize: 15, fontWeight: 500, lineHeight: 1.6 }}>{q.text}</p>
                  {q.textHi && (
                    <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{q.textHi}</p>
                  )}
                  {q.imageUrl && (
                    <img src={getImageUrl(q.imageUrl)} alt="Question" style={{ marginTop: 10, maxWidth: '100%', maxHeight: 160, borderRadius: 8, border: '1px solid var(--border)', objectFit: 'contain' }} />
                  )}

                  <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
                    {q.options.map((opt, idx) => {
                      const optType = typeof opt === 'string' ? 'text' : (opt.type || 'text')
                      const optValue = typeof opt === 'string' ? opt : (opt.value || '')
                      const correct = idx === q.correctIndex
                      return (
                        <div key={idx} className={`option-edit-row ${correct ? 'correct' : ''}`} style={{ marginBottom: 0, alignItems: 'center', padding: '9px 12px' }}>
                          <span className="option-letter" style={{ marginTop: 0 }}>{['A', 'B', 'C', 'D'][idx]}</span>
                          {optType === 'image' ? (
                            <img src={getImageUrl(optValue)} alt={`Option ${idx + 1}`} style={{ maxWidth: 160, maxHeight: 90, borderRadius: 6, objectFit: 'contain' }} />
                          ) : (
                            <span style={{ flex: 1, fontSize: 13.5, color: correct ? '#065f46' : 'var(--text)', fontWeight: correct ? 600 : 400 }}>{optValue}</span>
                          )}
                          {correct && <Icon name="checkCircle" size={17} style={{ color: 'var(--success)', flexShrink: 0, marginLeft: 'auto' }} />}
                        </div>
                      )
                    })}
                  </div>

                  {q.explanation && (
                    <div style={{
                      marginTop: 12, padding: '10px 14px', background: 'var(--bg-light)',
                      borderLeft: '3px solid var(--primary)', borderRadius: 8, fontSize: 13, color: 'var(--muted)', lineHeight: 1.6,
                    }}>
                      <strong style={{ color: 'var(--primary)' }}>Explanation: </strong>{q.explanation}
                    </div>
                  )}

                  {q.tags?.length > 0 && (
                    <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {q.tags.map((tag, idx) => (
                        <span key={idx} className="badge badge-gray" style={{ fontSize: 11 }}>#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => openEditor(q)}>
                    <Icon name="edit" size={13} /> Edit
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => setDeleting(q)} style={{ color: 'var(--danger)' }}>
                    <Icon name="trash" size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Question editor */}
      {editorOpen && (
        <QuestionEditorModal
          initial={editingQuestion}
          onSave={handleSave}
          onClose={() => { setEditorOpen(false); setEditingQuestion(null) }}
          adminToken={adminToken}
          features={{ subject: true, hindi: true }}
          subjects={SUBJECTS}
          classLevels={CLASS_LEVELS}
          contextLabel={`Mock test · ${test.title}`}
        />
      )}

      {/* Delete confirmation */}
      {deleting && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleting(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <h3>Delete this question?</h3>
            <p className="muted" style={{ margin: '12px 0 0', lineHeight: 1.6 }}>
              It will be permanently removed from "{test.title}". This cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setDeleting(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Delete Question</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
