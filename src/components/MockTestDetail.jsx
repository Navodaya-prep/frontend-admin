import { useState, useEffect, useRef } from 'react'
import { listQuestions, addQuestion, updateQuestion, deleteQuestion, reorderQuestions, uploadImage, getImageUrl } from '../api.js'
import DeleteIcon from './DeleteIcon.jsx'

const DIFFICULTIES = ['easy', 'medium', 'hard']
const SUBJECTS = ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'General Knowledge']
const CLASS_LEVELS = ['6', '7', '8', '9', 'both']

const EMPTY_Q = {
  text: '',
  imageUrl: '',
  options: [
    { type: 'text', value: '' },
    { type: 'text', value: '' },
    { type: 'text', value: '' },
    { type: 'text', value: '' },
  ],
  correctIndex: 0,
  explanation: '',
  subject: '',
  difficulty: 'medium',
  classLevel: '6',
  isPremium: false,
  isPYQ: false,
  examYear: '',
  tags: '',
}

const getDifficultyColor = (difficulty) => {
  switch(difficulty) {
    case 'easy': return { bg: '#d1fae5', color: '#065f46', label: '✅ Easy' }
    case 'medium': return { bg: '#fef3c7', color: '#92400e', label: '⚠️ Medium' }
    case 'hard': return { bg: '#fee2e2', color: '#991b1b', label: '🔥 Hard' }
    default: return { bg: '#f3f4f6', color: '#374151', label: difficulty }
  }
}

// ─── Image Upload Button ──────────────────────────────────────────────────────
function MockTestImageUpload({ adminToken, currentUrl, onUploaded, label = 'Upload Image' }) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(adminToken, file)
      onUploaded(url)
    } catch (err) {
      alert('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {currentUrl && (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={getImageUrl(currentUrl)}
            alt="Uploaded"
            style={{ maxWidth: 200, maxHeight: 120, borderRadius: 8, border: '2px solid var(--border)', objectFit: 'contain', background: '#f9fafb' }}
          />
          <button
            type="button"
            onClick={() => onUploaded('')}
            style={{
              position: 'absolute', top: -8, right: -8,
              width: 22, height: 22, borderRadius: '50%',
              background: '#ef4444', color: 'white', border: 'none',
              fontSize: 12, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontWeight: 700,
            }}
          ><DeleteIcon size={13} /></button>
        </div>
      )}
      <div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleFile} style={{ display: 'none' }} />
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{ fontSize: 13 }}
        >
          {uploading ? '⏳ Uploading...' : `📷 ${label}`}
        </button>
      </div>
    </div>
  )
}

export default function MockTestDetail({ adminToken, test, onBack }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [form, setForm] = useState(EMPTY_Q)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [draggedIndex, setDraggedIndex] = useState(null)

  useEffect(() => { fetchQuestions() }, [])

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

  function setOption(index, value) {
    setForm(f => {
      const options = [...f.options]
      options[index] = { ...options[index], value }
      return { ...f, options }
    })
  }

  function setOptionType(index, type) {
    setForm(f => {
      const options = [...f.options]
      options[index] = { type, value: '' }
      return { ...f, options }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.text.trim()) { setFormError('Question text is required'); return }
    if (form.options.some(o => !o.value.trim())) { setFormError('All 4 options are required'); return }
    
    setSubmitting(true)
    setFormError('')
    try {
      const payload = {
        text: form.text,
        imageUrl: form.imageUrl || '',
        options: form.options.map(o => ({ type: o.type || 'text', value: o.value })),
        correctIndex: parseInt(form.correctIndex),
        explanation: form.explanation,
        subject: form.subject,
        difficulty: form.difficulty,
        classLevel: form.classLevel,
        isPremium: form.isPremium,
        isPYQ: form.isPYQ,
        examYear: form.examYear,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      }

      if (editingQuestion) {
        await updateQuestion(adminToken, test._id, editingQuestion.id, payload)
        setSuccess('Question updated successfully!')
      } else {
        await addQuestion(adminToken, test._id, payload)
        setSuccess('Question added successfully!')
      }
      
      setTimeout(() => setSuccess(''), 3000)
      setForm(EMPTY_Q)
      setShowForm(false)
      setEditingQuestion(null)
      fetchQuestions()
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(q) {
    if (!confirm('Are you sure you want to delete this question?')) return
    
    setError('')
    try {
      await deleteQuestion(adminToken, test._id, q.id)
      setSuccess('Question deleted successfully!')
      setTimeout(() => setSuccess(''), 3000)
      fetchQuestions()
    } catch (e) {
      setError(e.message)
    }
  }

  function handleEdit(q) {
    setEditingQuestion(q)
    // Handle both legacy string options and new {type, value} options
    const options = (q.options || []).map(opt => {
      if (typeof opt === 'string') return { type: 'text', value: opt }
      return { type: opt.type || 'text', value: opt.value || '' }
    })
    while (options.length < 4) options.push({ type: 'text', value: '' })
    setForm({
      text: q.text,
      imageUrl: q.imageUrl || '',
      options,
      correctIndex: q.correctIndex,
      explanation: q.explanation || '',
      subject: q.subject || '',
      difficulty: q.difficulty || 'medium',
      classLevel: q.classLevel || '6',
      isPremium: q.isPremium || false,
      isPYQ: q.isPYQ || false,
      examYear: q.examYear || '',
      tags: (q.tags || []).join(', '),
    })
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingQuestion(null)
    setForm(EMPTY_Q)
    setFormError('')
  }

  // Drag and Drop Handlers
  function handleDragStart(e, index) {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e, index) {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    
    const newQuestions = [...questions]
    const draggedItem = newQuestions[draggedIndex]
    newQuestions.splice(draggedIndex, 1)
    newQuestions.splice(index, 0, draggedItem)
    
    setQuestions(newQuestions)
    setDraggedIndex(index)
  }

  async function handleDragEnd() {
    if (draggedIndex !== null) {
      try {
        const questionIds = questions.map(q => q.id)
        await reorderQuestions(adminToken, test._id, { questionIds })
        setSuccess('Questions reordered successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } catch (e) {
        setError(e.message)
        fetchQuestions() // Revert on error
      }
    }
    setDraggedIndex(null)
  }

  // Statistics
  const stats = {
    total: questions.length,
    easy: questions.filter(q => q.difficulty === 'easy').length,
    medium: questions.filter(q => q.difficulty === 'medium').length,
    hard: questions.filter(q => q.difficulty === 'hard').length,
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <button className="btn btn-outline" onClick={onBack} style={{ marginBottom: 16 }}>
          ← Back to Mock Tests
        </button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: 32 }}>{test.title}</h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-block',
                padding: '6px 14px',
                background: '#e0f2fe',
                color: '#0369a1',
                borderRadius: 16,
                fontSize: 14,
                fontWeight: 600
              }}>
                {test.subject}
              </span>
              <span style={{
                display: 'inline-block',
                padding: '6px 14px',
                background: '#f3e8ff',
                color: '#7c3aed',
                borderRadius: 16,
                fontSize: 14,
                fontWeight: 600
              }}>
                Class {test.classLevel}
              </span>
              <span style={{
                display: 'inline-block',
                padding: '6px 14px',
                background: '#dbeafe',
                color: '#1e40af',
                borderRadius: 16,
                fontSize: 14,
                fontWeight: 600
              }}>
                ⏱️ {test.duration} minutes
              </span>
              {test.isPremium && (
                <span style={{
                  display: 'inline-block',
                  padding: '6px 14px',
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  color: 'white',
                  borderRadius: 16,
                  fontSize: 14,
                  fontWeight: 600
                }}>
                  👑 Premium
                </span>
              )}
            </div>
          </div>
          
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Question'}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        <div style={{
          background: 'white',
          padding: 20,
          borderRadius: 12,
          border: '2px solid #6366f1',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, fontWeight: 600 }}>Total Questions</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#6366f1' }}>{stats.total}</div>
        </div>
        
        <div style={{
          background: 'white',
          padding: 20,
          borderRadius: 12,
          border: '2px solid #10b981',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, fontWeight: 600 }}>Easy Questions</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#10b981' }}>{stats.easy}</div>
        </div>
        
        <div style={{
          background: 'white',
          padding: 20,
          borderRadius: 12,
          border: '2px solid #f59e0b',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, fontWeight: 600 }}>Medium Questions</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#f59e0b' }}>{stats.medium}</div>
        </div>
        
        <div style={{
          background: 'white',
          padding: 20,
          borderRadius: 12,
          border: '2px solid #ef4444',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, fontWeight: 600 }}>Hard Questions</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#ef4444' }}>{stats.hard}</div>
        </div>
      </div>

      {/* Messages */}
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

      {/* Add/Edit Question Form */}
      {showForm && (
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 32,
          marginBottom: 24,
          border: '2px solid #6366f1',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)'
        }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: 24 }}>
            {editingQuestion ? '✏️ Edit Question' : '➕ Add New Question'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Question Text *</label>
              <textarea
                className="input"
                rows={3}
                value={form.text}
                onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                placeholder="Enter your question here..."
                required
              />
            </div>

            {/* Question Image (optional) */}
            <div className="form-group">
              <label className="form-label">Question Image (optional)</label>
              <MockTestImageUpload
                adminToken={adminToken}
                currentUrl={form.imageUrl}
                onUploaded={(url) => setForm(f => ({ ...f, imageUrl: url }))}
                label="Add Question Image"
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 600, marginBottom: 8, display: 'block', fontSize: 14 }}>Options *</label>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
                Each option can be text or image. Use the toggle to switch types.
              </div>
              {form.options.map((opt, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: 12,
                  marginBottom: 14,
                  alignItems: 'flex-start',
                  padding: 14,
                  borderRadius: 10,
                  background: form.correctIndex === i ? '#d1fae5' : 'var(--bg-light)',
                  border: form.correctIndex === i ? '2px solid #10b981' : '2px solid var(--border)',
                }}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    background: form.correctIndex === i ? '#10b981' : 'var(--bg-light)',
                    color: form.correctIndex === i ? 'white' : 'var(--text)',
                    borderRadius: '50%',
                    fontWeight: 700,
                    fontSize: 14,
                    flexShrink: 0,
                  }}>{i + 1}</span>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* Type toggle */}
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button type="button" onClick={() => setOptionType(i, 'text')}
                        style={{
                          padding: '3px 10px', fontSize: 12, borderRadius: 6, cursor: 'pointer',
                          border: (opt.type || 'text') === 'text' ? '2px solid #6366f1' : '1px solid var(--border)',
                          background: (opt.type || 'text') === 'text' ? '#e0e7ff' : 'white',
                          color: (opt.type || 'text') === 'text' ? '#6366f1' : 'var(--muted)',
                          fontWeight: 600,
                        }}>Aa Text</button>
                      <button type="button" onClick={() => setOptionType(i, 'image')}
                        style={{
                          padding: '3px 10px', fontSize: 12, borderRadius: 6, cursor: 'pointer',
                          border: opt.type === 'image' ? '2px solid #6366f1' : '1px solid var(--border)',
                          background: opt.type === 'image' ? '#e0e7ff' : 'white',
                          color: opt.type === 'image' ? '#6366f1' : 'var(--muted)',
                          fontWeight: 600,
                        }}>🖼 Image</button>
                    </div>

                    {/* Value input */}
                    {(opt.type || 'text') === 'text' ? (
                      <input
                        className="input"
                        value={opt.value}
                        onChange={e => setOption(i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                        required
                        style={{ flex: 1, margin: 0 }}
                      />
                    ) : (
                      <MockTestImageUpload
                        adminToken={adminToken}
                        currentUrl={opt.value}
                        onUploaded={(url) => setOption(i, url)}
                        label={`Upload Option ${i + 1}`}
                      />
                    )}
                  </div>

                  <button
                    type="button"
                    className={`btn ${form.correctIndex === i ? 'btn-success' : 'btn-outline'}`}
                    onClick={() => setForm(f => ({ ...f, correctIndex: i }))}
                    style={{ minWidth: 120, flexShrink: 0, marginTop: 4 }}
                  >
                    {form.correctIndex === i ? '✓ Correct' : 'Mark Correct'}
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
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
                <label className="form-label">Difficulty *</label>
                <select
                  className="input"
                  value={form.difficulty}
                  onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
                  required
                >
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
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

            <div className="form-group">
              <label className="form-label">Explanation (optional)</label>
              <textarea
                className="input"
                rows={2}
                value={form.explanation}
                onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
                placeholder="Explain why this is the correct answer..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'end' }}>
              <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <input
                  className="input"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="e.g. algebra, fractions, geometry"
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

            {/* PYQ Section */}
            <div style={{
              background: '#f8f9fa',
              padding: 16,
              borderRadius: 8,
              border: '1px solid #e1e4e8'
            }}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.isPYQ}
                    onChange={e => setForm(f => ({ ...f, isPYQ: e.target.checked, examYear: e.target.checked ? f.examYear : '' }))}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Previous Year Question (PYQ)</span>
                </label>
                <p style={{ fontSize: 12, color: '#6c757d', marginTop: 4, marginLeft: 24 }}>
                  Mark this question if it appeared in an actual JNVST exam
                </p>
              </div>
              {form.isPYQ && (
                <div className="form-group" style={{ marginTop: 12, marginBottom: 0 }}>
                  <label className="form-label">Exam Year *</label>
                  <select
                    className="input"
                    value={form.examYear}
                    onChange={e => setForm(f => ({ ...f, examYear: e.target.value }))}
                    required={form.isPYQ}
                  >
                    <option value="">Select exam year</option>
                    {Array.from({ length: 11 }, (_, i) => 2025 - i).map(year => (
                      <option key={year} value={String(year)}>{year}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {formError && (
              <div className="error-banner" style={{ marginTop: 16 }}>
                {formError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button type="button" className="btn btn-outline" onClick={cancelForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting} style={{ flex: 1 }}>
                {submitting ? 'Saving...' : (editingQuestion ? 'Update Question' : 'Add Question')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Questions List */}
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: 32,
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 24 }}>Questions ({questions.length})</h2>
          {questions.length > 0 && (
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>
              💡 Drag and drop to reorder
            </p>
          )}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <p style={{ color: 'var(--muted)' }}>Loading questions...</p>
          </div>
        )}

        {!loading && questions.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📝</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 20 }}>No questions yet</h3>
            <p style={{ margin: '0 0 24px 0', color: 'var(--muted)' }}>
              Add your first question to this mock test
            </p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              + Add Question
            </button>
          </div>
        )}

        {questions.map((q, i) => {
          const diffColor = getDifficultyColor(q.difficulty)
          return (
            <div
              key={q.id}
              draggable
              onDragStart={(e) => handleDragStart(e, i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragEnd={handleDragEnd}
              style={{
                background: 'var(--bg-light)',
                borderRadius: 12,
                padding: 24,
                marginBottom: 16,
                border: draggedIndex === i ? '2px dashed #6366f1' : '2px solid transparent',
                cursor: 'grab',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (draggedIndex === null) {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1 }}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    background: '#6366f1',
                    color: 'white',
                    borderRadius: '50%',
                    fontWeight: 700,
                    fontSize: 16
                  }}>
                    {i + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        background: diffColor.bg,
                        color: diffColor.color,
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 600
                      }}>
                        {diffColor.label}
                      </span>
                      {q.subject && (
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          background: 'white',
                          color: 'var(--text)',
                          borderRadius: 12,
                          fontSize: 12,
                          border: '1px solid var(--border)'
                        }}>
                          {q.subject}
                        </span>
                      )}
                      {q.isPremium && (
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                          color: 'white',
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 600
                        }}>
                          👑
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 500, lineHeight: 1.6 }}>{q.text}</p>
                    {q.imageUrl && (
                      <div style={{ marginTop: 8 }}>
                        <img src={getImageUrl(q.imageUrl)} alt="Question" style={{ maxWidth: '100%', maxHeight: 160, borderRadius: 8, border: '1px solid var(--border)', objectFit: 'contain' }} />
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-outline"
                    style={{ padding: '8px 16px', fontSize: 14 }}
                    onClick={() => handleEdit(q)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-outline"
                    style={{ padding: '8px 16px', fontSize: 14 }}
                    onClick={() => handleDelete(q)}
                  >
                    <DeleteIcon size={16} /> Delete
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
                {q.options.map((opt, idx) => {
                  const optType = typeof opt === 'string' ? 'text' : (opt.type || 'text')
                  const optValue = typeof opt === 'string' ? opt : (opt.value || '')
                  return (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 16px',
                      background: idx === q.correctIndex ? '#d1fae5' : 'white',
                      border: idx === q.correctIndex ? '2px solid #10b981' : '1px solid var(--border)',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: optType === 'image' ? 'flex-start' : 'center',
                      gap: 12
                    }}
                  >
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      background: idx === q.correctIndex ? '#10b981' : 'var(--bg-light)',
                      color: idx === q.correctIndex ? 'white' : 'var(--text)',
                      borderRadius: '50%',
                      fontWeight: 700,
                      fontSize: 13,
                      flexShrink: 0,
                    }}>
                      {idx + 1}
                    </span>
                    {optType === 'image' ? (
                      <img src={getImageUrl(optValue)} alt={`Option ${idx + 1}`} style={{ maxWidth: 160, maxHeight: 100, borderRadius: 4, objectFit: 'contain', flex: 1 }} />
                    ) : (
                      <span style={{ flex: 1, color: idx === q.correctIndex ? '#065f46' : 'var(--text)' }}>{optValue}</span>
                    )}
                    {idx === q.correctIndex && (
                      <span style={{ color: '#10b981', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>✓ Correct</span>
                    )}
                  </div>
                  )
                })}
              </div>

              {q.explanation && (
                <div style={{
                  marginTop: 16,
                  padding: 16,
                  background: '#fffbeb',
                  border: '1px solid #fbbf24',
                  borderRadius: 8
                }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#92400e', marginBottom: 4 }}>💡 Explanation:</div>
                  <p style={{ margin: 0, fontSize: 14, color: '#92400e', lineHeight: 1.6 }}>{q.explanation}</p>
                </div>
              )}

              {q.tags && q.tags.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {q.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        background: 'white',
                        color: 'var(--muted)',
                        borderRadius: 12,
                        fontSize: 11,
                        border: '1px solid var(--border)'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
