import { useState, useEffect, useRef } from 'react'
import {
  listSubjects, createSubject, updateSubject, deleteSubject,
  listChapters, createChapter, updateChapter, deleteChapter,
  listPracticeQuestions, createPracticeQuestion,
  updatePracticeQuestion, deletePracticeQuestion,
  uploadImage, getImageUrl,
} from '../api'

// ─── Difficulty badge ─────────────────────────────────────────────────────────
const DIFF_STYLE = {
  easy:   { background: '#d1fae5', color: '#065f46', border: '#10b981' },
  medium: { background: '#fef3c7', color: '#92400e', border: '#f59e0b' },
  hard:   { background: '#fee2e2', color: '#991b1b', border: '#ef4444' },
}

function DiffBadge({ d }) {
  const s = DIFF_STYLE[d] || DIFF_STYLE.medium
  return (
    <span style={{
      ...s, 
      borderRadius: 12, 
      padding: '4px 10px',
      fontSize: 12, 
      fontWeight: 600,
      border: `1px solid ${s.border}`,
      textTransform: 'capitalize',
    }}>{d}</span>
  )
}

// ─── Confirm delete helper ────────────────────────────────────────────────────
function useConfirmDelete(onDelete) {
  const [pending, setPending] = useState(null)
  function ask(item) { setPending(item) }
  function confirm() { if (pending) { onDelete(pending); setPending(null) } }
  function cancel() { setPending(null) }
  return { pending, ask, confirm, cancel }
}

// ─────────────────────────────────────────────────────────────────────────────
// Subject Modal
// ─────────────────────────────────────────────────────────────────────────────
function SubjectModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(
    initial ?? { name: '', icon: '📚', color: '#2563eb', description: '', order: 0 }
  )
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>{initial ? 'Edit Subject' : 'New Subject'}</h2>
        
        <label className="form-label">Subject Name *</label>
        <input className="input" value={form.name} onChange={set('name')} placeholder="e.g., Mental Ability" />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <div>
            <label className="form-label">Icon Emoji</label>
            <input className="input" value={form.icon} onChange={set('icon')} placeholder="🧠" />
          </div>
          <div>
            <label className="form-label">Color</label>
            <input className="input" type="color" value={form.color} onChange={set('color')} />
          </div>
        </div>
        
        <label className="form-label" style={{ marginTop: 16 }}>Description</label>
        <input className="input" value={form.description} onChange={set('description')} placeholder="Brief description" />
        
        <label className="form-label" style={{ marginTop: 16 }}>Display Order</label>
        <input className="input" type="number" value={form.order} onChange={set('order')} min="0" />
        
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave({ ...form, order: Number(form.order) })} disabled={!form.name.trim()}>
            {initial ? 'Update Subject' : 'Create Subject'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Chapter Modal
// ─────────────────────────────────────────────────────────────────────────────
function ChapterModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(
    initial ?? { title: '', description: '', order: 0, isPremium: false }
  )
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>{initial ? 'Edit Chapter' : 'New Chapter'}</h2>
        
        <label className="form-label">Chapter Title *</label>
        <input className="input" value={form.title} onChange={set('title')} placeholder="e.g., Number Series" />
        
        <label className="form-label" style={{ marginTop: 16 }}>Description</label>
        <input className="input" value={form.description} onChange={set('description')} placeholder="Brief description" />
        
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', marginTop: 16 }}>
          <div style={{ flex: 1 }}>
            <label className="form-label">Display Order</label>
            <input className="input" type="number" value={form.order} onChange={set('order')} min="0" />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', paddingBottom: 10 }}>
            <input type="checkbox" checked={form.isPremium}
              onChange={(e) => setForm((f) => ({ ...f, isPremium: e.target.checked }))} 
              style={{ width: 18, height: 18, cursor: 'pointer' }} />
            <span style={{ fontWeight: 500 }}>Premium Content</span>
          </label>
        </div>
        
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave({ ...form, order: Number(form.order) })} disabled={!form.title.trim()}>
            {initial ? 'Update Chapter' : 'Create Chapter'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Image Upload Button (reusable)
// ─────────────────────────────────────────────────────────────────────────────
function ImageUploadButton({ adminToken, currentUrl, onUploaded, label = 'Upload Image' }) {
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
          >×</button>
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

// ─────────────────────────────────────────────────────────────────────────────
// Question Modal (with image support)
// ─────────────────────────────────────────────────────────────────────────────
function QuestionModal({ initial, onSave, onClose, adminToken }) {
  const empty = {
    text: '', imageUrl: '',
    options: [
      { type: 'text', value: '' },
      { type: 'text', value: '' },
      { type: 'text', value: '' },
      { type: 'text', value: '' },
    ],
    correctIndex: 0, explanation: '',
    difficulty: 'medium', classLevel: '', tags: '', isPremium: false,
    isPYQ: false, examYear: '',
  }

  function parseInitial(init) {
    if (!init) return empty
    // Handle legacy string options (backward compat)
    const options = (init.options || []).map((opt) => {
      if (typeof opt === 'string') return { type: 'text', value: opt }
      return { type: opt.type || 'text', value: opt.value || '' }
    })
    // Ensure at least 4 options
    while (options.length < 4) options.push({ type: 'text', value: '' })
    return {
      ...init,
      imageUrl: init.imageUrl || '',
      options,
      tags: Array.isArray(init.tags) ? init.tags.join(', ') : (init.tags || ''),
    }
  }

  const [form, setForm] = useState(() => parseInitial(initial))

  function setOptType(i, type) {
    setForm((f) => {
      const opts = [...f.options]
      opts[i] = { ...opts[i], type, value: '' }
      return { ...f, options: opts }
    })
  }

  function setOptValue(i, value) {
    setForm((f) => {
      const opts = [...f.options]
      opts[i] = { ...opts[i], value }
      return { ...f, options: opts }
    })
  }

  function handleSave() {
    const payload = {
      ...form,
      correctIndex: Number(form.correctIndex),
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    }
    onSave(payload)
  }

  const optionLabels = ['A', 'B', 'C', 'D']
  const allOptionsFilled = form.options.every((o) => o.value.trim() !== '')

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 660 }}>
        <h2>{initial ? 'Edit Question' : 'Add New Question'}</h2>

        {/* Question Text */}
        <label className="form-label">Question Text *</label>
        <textarea className="input" rows={3} value={form.text}
          onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
          placeholder="Enter the question..." />

        {/* Question Image (optional) */}
        <div style={{ marginTop: 12 }}>
          <label className="form-label" style={{ marginBottom: 8 }}>Question Image (optional)</label>
          <ImageUploadButton
            adminToken={adminToken}
            currentUrl={form.imageUrl}
            onUploaded={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
            label="Add Question Image"
          />
        </div>

        {/* Answer Options */}
        <label className="form-label" style={{ marginTop: 16 }}>Answer Options</label>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
          Each option can be text or image. Select the correct answer with the radio button.
        </div>
        {form.options.map((opt, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12,
            padding: 12, borderRadius: 10,
            background: Number(form.correctIndex) === i ? '#d1fae5' : 'var(--bg)',
            border: Number(form.correctIndex) === i ? '2px solid var(--success)' : '2px solid var(--border)',
          }}>
            <input
              type="radio"
              name="correct"
              checked={Number(form.correctIndex) === i}
              onChange={() => setForm((f) => ({ ...f, correctIndex: i }))}
              style={{ width: 18, height: 18, cursor: 'pointer', marginTop: 6 }}
            />
            <span style={{
              minWidth: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 14, borderRadius: 6, marginTop: 2,
              color: Number(form.correctIndex) === i ? 'var(--success)' : 'var(--muted)',
              background: Number(form.correctIndex) === i ? '#a7f3d0' : 'var(--surface)',
            }}>
              {optionLabels[i]}
            </span>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* Type toggle */}
              <div style={{ display: 'flex', gap: 4 }}>
                <button type="button"
                  onClick={() => setOptType(i, 'text')}
                  style={{
                    padding: '3px 10px', fontSize: 12, borderRadius: 6, cursor: 'pointer',
                    border: opt.type === 'text' ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: opt.type === 'text' ? '#dbeafe' : 'white',
                    color: opt.type === 'text' ? 'var(--primary)' : 'var(--muted)',
                    fontWeight: 600,
                  }}>
                  Aa Text
                </button>
                <button type="button"
                  onClick={() => setOptType(i, 'image')}
                  style={{
                    padding: '3px 10px', fontSize: 12, borderRadius: 6, cursor: 'pointer',
                    border: opt.type === 'image' ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: opt.type === 'image' ? '#dbeafe' : 'white',
                    color: opt.type === 'image' ? 'var(--primary)' : 'var(--muted)',
                    fontWeight: 600,
                  }}>
                  🖼 Image
                </button>
              </div>

              {/* Value input */}
              {opt.type === 'text' ? (
                <input className="input" style={{ margin: 0 }} value={opt.value}
                  onChange={(e) => setOptValue(i, e.target.value)}
                  placeholder={`Option ${optionLabels[i]}`} />
              ) : (
                <ImageUploadButton
                  adminToken={adminToken}
                  currentUrl={opt.value}
                  onUploaded={(url) => setOptValue(i, url)}
                  label={`Upload Option ${optionLabels[i]}`}
                />
              )}
            </div>
          </div>
        ))}

        <label className="form-label" style={{ marginTop: 16 }}>Explanation (Optional)</label>
        <textarea className="input" rows={2} value={form.explanation}
          onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
          placeholder="Explain why this is the correct answer..." />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <div>
            <label className="form-label">Difficulty Level</label>
            <select className="input" value={form.difficulty}
              onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="form-label">Target Class</label>
            <select className="input" value={form.classLevel}
              onChange={(e) => setForm((f) => ({ ...f, classLevel: e.target.value }))}>
              <option value="">All Classes</option>
              <option value="5">Class 5</option>
              <option value="6">Class 6</option>
              <option value="7">Class 7</option>
              <option value="8">Class 8</option>
              <option value="9">Class 9</option>
            </select>
          </div>
        </div>

        <label className="form-label" style={{ marginTop: 16 }}>Tags (comma-separated)</label>
        <input className="input" value={form.tags}
          onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
          placeholder="e.g., series, pattern, logical" />

        <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-light)', borderRadius: 8, border: '1px solid var(--border)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isPYQ}
              onChange={(e) => setForm((f) => ({ ...f, isPYQ: e.target.checked }))} 
              style={{ width: 18, height: 18, cursor: 'pointer' }} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>📚 Previous Year Question (PYQ)</span>
          </label>
          
          {form.isPYQ && (
            <div style={{ marginTop: 8 }}>
              <label className="form-label" style={{ fontSize: 13 }}>Exam Year</label>
              <select className="input" value={form.examYear}
                onChange={(e) => setForm((f) => ({ ...f, examYear: e.target.value }))}>
                <option value="">Select Year</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
                <option value="2019">2019</option>
                <option value="2018">2018</option>
                <option value="2017">2017</option>
                <option value="2016">2016</option>
                <option value="2015">2015</option>
              </select>
            </div>
          )}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.isPremium}
            onChange={(e) => setForm((f) => ({ ...f, isPremium: e.target.checked }))} 
            style={{ width: 18, height: 18, cursor: 'pointer' }} />
          <span style={{ fontWeight: 500 }}>Premium Question</span>
        </label>

        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}
            disabled={!form.text.trim() || !allOptionsFilled}>
            {initial ? 'Update Question' : 'Add Question'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Questions Panel
// ─────────────────────────────────────────────────────────────────────────────
function QuestionsPanel({ adminToken, chapter }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [error, setError] = useState('')
  const del = useConfirmDelete(async (q) => {
    try {
      await deletePracticeQuestion(adminToken, q.id)
      load()
    } catch (e) {
      setError(e.message)
    }
  })

  async function load() {
    setLoading(true)
    setError('')
    try { 
      const data = await listPracticeQuestions(adminToken, chapter.id)
      setQuestions(data)
    }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [chapter.id])

  async function handleSave(form) {
    try {
      if (modal && modal !== 'create') {
        await updatePracticeQuestion(adminToken, modal.id, form)
      } else {
        await createPracticeQuestion(adminToken, chapter.id, form)
      }
      setModal(null)
      setError('')
      load()
    } catch (e) { 
      setError(e.message)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Questions</h3>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>
            Chapter: {chapter.title} ({questions.length} question{questions.length !== 1 ? 's' : ''})
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')}>
          + Add Question
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading && (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          Loading questions...
        </div>
      )}

      {!loading && questions.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: 64, 
          background: 'var(--surface)', 
          borderRadius: 12,
          border: '2px dashed var(--border)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No questions yet</p>
          <p style={{ color: 'var(--muted)', marginBottom: 20 }}>Get started by adding your first question</p>
          <button className="btn btn-primary" onClick={() => setModal('create')}>
            + Add Your First Question
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {questions.map((q, i) => (
          <div key={q.id} style={{
            background: 'var(--surface)', 
            border: '2px solid var(--border)', 
            borderRadius: 12,
            padding: 20,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{
                minWidth: 36,
                height: 36,
                borderRadius: 8,
                background: 'var(--primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 14,
              }}>
                {i + 1}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  <DiffBadge d={q.difficulty} />
                  {q.isPremium && (
                    <span style={{ 
                      background: '#fef3c7', 
                      color: '#92400e', 
                      borderRadius: 12, 
                      padding: '4px 10px', 
                      fontSize: 12, 
                      fontWeight: 600,
                      border: '1px solid #f59e0b',
                    }}>★ Premium</span>
                  )}
                  {q.classLevel && (
                    <span style={{ 
                      fontSize: 12, 
                      color: 'var(--muted)',
                      background: 'var(--bg)',
                      padding: '4px 10px',
                      borderRadius: 12,
                      fontWeight: 500,
                    }}>
                      Class {q.classLevel}
                    </span>
                  )}
                </div>
                
                <p style={{ margin: '0 0 12px', fontSize: 15, color: 'var(--text)', lineHeight: 1.6, fontWeight: 500 }}>
                  {q.text}
                </p>
                
                {q.imageUrl && (
                  <div style={{ marginBottom: 12 }}>
                    <img src={getImageUrl(q.imageUrl)} alt="Question" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, border: '1px solid var(--border)', objectFit: 'contain' }} />
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, marginBottom: 10 }}>
                  {q.options?.map((opt, oi) => {
                    const optType = typeof opt === 'string' ? 'text' : (opt.type || 'text')
                    const optValue = typeof opt === 'string' ? opt : (opt.value || '')
                    return (
                    <div key={oi} style={{
                      fontSize: 13, 
                      padding: '8px 12px', 
                      borderRadius: 8,
                      background: oi === q.correctIndex ? '#d1fae5' : 'var(--bg)',
                      border: oi === q.correctIndex ? '2px solid var(--success)' : '2px solid var(--border)',
                      color: oi === q.correctIndex ? 'var(--success)' : 'var(--text)',
                      fontWeight: oi === q.correctIndex ? 600 : 400,
                      display: 'flex',
                      alignItems: optType === 'image' ? 'flex-start' : 'center',
                      gap: 8,
                    }}>
                      <span style={{ 
                        fontWeight: 700,
                        minWidth: 20,
                      }}>
                        {['A', 'B', 'C', 'D'][oi]}.
                      </span>
                      {optType === 'image' ? (
                        <img src={getImageUrl(optValue)} alt={`Option ${['A','B','C','D'][oi]}`} style={{ maxWidth: 140, maxHeight: 80, borderRadius: 4, objectFit: 'contain' }} />
                      ) : (
                        <span>{optValue}</span>
                      )}
                    </div>
                    )
                  })}
                </div>
                
                {q.explanation && (
                  <div style={{ 
                    fontSize: 13, 
                    color: 'var(--muted)', 
                    marginTop: 12,
                    padding: 12,
                    background: 'var(--bg)',
                    borderRadius: 8,
                    borderLeft: '3px solid var(--primary)',
                  }}>
                    <strong style={{ color: 'var(--primary)' }}>💡 Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                <button className="btn btn-outline btn-sm" onClick={() => setModal(q)}>
                  Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => del.ask(q)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(modal === 'create' || (modal && modal !== 'create')) && (
        <QuestionModal
          initial={modal === 'create' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
          adminToken={adminToken}
        />
      )}

      {del.pending && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 420 }}>
            <h3>Delete Question?</h3>
            <p style={{ color: 'var(--muted)', margin: '12px 0 24px', lineHeight: 1.6 }}>
              This question will be permanently removed from the chapter. This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={del.cancel}>Cancel</button>
              <button className="btn btn-danger" onClick={del.confirm}>Delete Question</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Chapters Panel
// ─────────────────────────────────────────────────────────────────────────────
function ChaptersPanel({ adminToken, subject, onBack }) {
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [error, setError] = useState('')
  const del = useConfirmDelete(async (ch) => {
    try {
      await deleteChapter(adminToken, ch.id)
      load()
    } catch (e) {
      setError(e.message)
    }
  })

  async function load() {
    setLoading(true)
    setError('')
    try { 
      const data = await listChapters(adminToken, subject.id)
      setChapters(data)
    }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [subject.id])

  async function handleSave(form) {
    try {
      if (modal && modal !== 'create') {
        await updateChapter(adminToken, modal.id, form)
      } else {
        await createChapter(adminToken, subject.id, form)
      }
      setModal(null)
      setError('')
      load()
    } catch (e) { 
      setError(e.message)
    }
  }

  if (selectedChapter) {
    return (
      <div>
        <button className="btn btn-outline" style={{ marginBottom: 20 }}
          onClick={() => setSelectedChapter(null)}>
          ← Back to Chapters
        </button>
        <QuestionsPanel adminToken={adminToken} chapter={selectedChapter} />
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="btn btn-outline" onClick={onBack}>← Back</button>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: subject.color + '20',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
        }}>
          {subject.icon}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{subject.name}</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 2 }}>Manage chapters and questions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')}>
          + Add Chapter
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading && (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          Loading chapters...
        </div>
      )}

      {!loading && chapters.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: 64, 
          background: 'var(--surface)', 
          borderRadius: 12,
          border: '2px dashed var(--border)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No chapters yet</p>
          <p style={{ color: 'var(--muted)', marginBottom: 20 }}>Create your first chapter to organize questions</p>
          <button className="btn btn-primary" onClick={() => setModal('create')}>
            + Add First Chapter
          </button>
        </div>
      )}

      {!loading && chapters.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Order</th>
                <th>Chapter Title</th>
                <th>Description</th>
                <th style={{ width: 80, textAlign: 'center' }}>Type</th>
                <th style={{ width: 240 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {chapters.map((ch) => (
                <tr key={ch.id}>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{ch.order}</td>
                  <td>
                    <button style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--primary)', 
                      cursor: 'pointer', 
                      fontWeight: 600, 
                      fontSize: 14, 
                      padding: 0,
                      textDecoration: 'underline',
                    }}
                      onClick={() => setSelectedChapter(ch)}>
                      {ch.title}
                    </button>
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: 13 }}>{ch.description || '—'}</td>
                  <td style={{ textAlign: 'center' }}>
                    {ch.isPremium ? (
                      <span style={{ color: '#d97706', fontSize: 16 }}>⭐</span>
                    ) : (
                      <span style={{ color: 'var(--success)', fontSize: 16 }}>✓</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => setModal(ch)}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => del.ask(ch)}>
                        Delete
                      </button>
                      <button className="btn btn-primary btn-sm" onClick={() => setSelectedChapter(ch)}>
                        Questions →
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(modal === 'create' || (modal && modal !== 'create')) && (
        <ChapterModal
          initial={modal === 'create' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {del.pending && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 420 }}>
            <h3>Delete Chapter?</h3>
            <p style={{ color: 'var(--muted)', margin: '12px 0 24px', lineHeight: 1.6 }}>
              "{del.pending.title}" and all its questions will be permanently removed. This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={del.cancel}>Cancel</button>
              <button className="btn btn-danger" onClick={del.confirm}>Delete Chapter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main PracticeHub (Subjects list)
// ─────────────────────────────────────────────────────────────────────────────
export default function PracticeHub({ adminToken }) {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [error, setError] = useState('')
  const del = useConfirmDelete(async (s) => {
    try {
      await deleteSubject(adminToken, s.id)
      load()
    } catch (e) {
      setError(e.message)
    }
  })

  async function load() {
    setLoading(true)
    setError('')
    try { 
      const data = await listSubjects(adminToken)
      setSubjects(data)
    }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleSave(form) {
    try {
      if (modal && modal !== 'create') {
        await updateSubject(adminToken, modal.id, form)
      } else {
        await createSubject(adminToken, form)
      }
      setModal(null)
      setError('')
      load()
    } catch (e) { 
      setError(e.message)
    }
  }

  if (selectedSubject) {
    return (
      <ChaptersPanel
        adminToken={adminToken}
        subject={selectedSubject}
        onBack={() => setSelectedSubject(null)}
      />
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Practice Hub</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>
            Manage subjects, chapters, and practice questions
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')}>
          + New Subject
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}
      
      {loading && (
        <div style={{ textAlign: 'center', padding: 64, color: 'var(--muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <p style={{ fontSize: 16 }}>Loading subjects...</p>
        </div>
      )}

      {!loading && subjects.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: 80, 
          background: 'var(--surface)', 
          borderRadius: 16,
          border: '2px dashed var(--border)',
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📚</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No subjects yet</h3>
          <p style={{ color: 'var(--muted)', marginBottom: 24, fontSize: 15 }}>
            Create your first subject to get started with the practice hub
          </p>
          <button className="btn btn-primary" onClick={() => setModal('create')}>
            + Create First Subject
          </button>
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: 20,
      }}>
        {subjects.map((s) => (
          <div key={s.id} style={{
            background: 'var(--surface)', 
            borderRadius: 16, 
            padding: 24,
            border: `3px solid ${s.color || '#2563eb'}20`,
            boxShadow: 'var(--shadow)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'var(--shadow)'
          }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
              <div style={{
                width: 56, 
                height: 56, 
                borderRadius: 14,
                background: `linear-gradient(135deg, ${s.color || '#2563eb'}20, ${s.color || '#2563eb'}40)`,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: 28,
                flexShrink: 0,
              }}>
                {s.icon || '📚'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4, color: 'var(--text)' }}>
                  {s.name}
                </h3>
                {s.description && (
                  <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.4 }}>
                    {s.description}
                  </p>
                )}
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: 8,
              paddingTop: 16,
              borderTop: '1px solid var(--border)',
            }}>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, fontSize: 13 }}
                onClick={() => setSelectedSubject(s)}
              >
                View Chapters →
              </button>
              <button 
                className="btn btn-outline btn-sm" 
                onClick={(e) => { e.stopPropagation(); setModal(s) }}
              >
                Edit
              </button>
              <button 
                className="btn btn-danger btn-sm" 
                onClick={(e) => { e.stopPropagation(); del.ask(s) }}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {(modal === 'create' || (modal && modal !== 'create')) && (
        <SubjectModal
          initial={modal === 'create' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {del.pending && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 420 }}>
            <h3>Delete Subject?</h3>
            <p style={{ color: 'var(--muted)', margin: '12px 0 24px', lineHeight: 1.6 }}>
              "{del.pending.name}" and all its chapters and questions will be permanently removed. This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={del.cancel}>Cancel</button>
              <button className="btn btn-danger" onClick={del.confirm}>Delete Subject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
