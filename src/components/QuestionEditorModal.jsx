import { useState, useRef, useEffect } from 'react'
import { uploadImage, getImageUrl } from '../api.js'
import Icon from './Icons.jsx'

const OPTION_LABELS = ['A', 'B', 'C', 'D']

// ─── Shared image upload control ─────────────────────────────────────────────
export function ImageUpload({ adminToken, currentUrl, onUploaded, label = 'Upload image' }) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const url = await uploadImage(adminToken, file)
      onUploaded(url)
    } catch (err) {
      setError('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {currentUrl && (
        <div style={{ position: 'relative', display: 'inline-block', alignSelf: 'flex-start' }}>
          <img
            src={getImageUrl(currentUrl)}
            alt="Uploaded"
            style={{ maxWidth: 220, maxHeight: 130, borderRadius: 8, border: '1.5px solid var(--border)', objectFit: 'contain', background: 'var(--bg-light)' }}
          />
          <button
            type="button"
            onClick={() => onUploaded('')}
            title="Remove image"
            style={{
              position: 'absolute', top: -8, right: -8,
              width: 22, height: 22, borderRadius: '50%',
              background: 'var(--danger)', color: '#fff', border: 'none',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          ><Icon name="x" size={12} strokeWidth={2.5} /></button>
        </div>
      )}
      <div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleFile} style={{ display: 'none' }} />
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          <Icon name={uploading ? 'clock' : 'image'} size={14} />
          {uploading ? 'Uploading…' : label}
        </button>
      </div>
      {error && <span className="error-msg">{error}</span>}
    </div>
  )
}

// ─── Question editor modal ────────────────────────────────────────────────────
// Shared by Mock Tests and Practice Hub.
// features: { hindi: bool, subject: bool }
// subjects: list shown when features.subject is true
// classLevels: [{ value, label }]
export default function QuestionEditorModal({
  initial,
  onSave,
  onClose,
  adminToken,
  features = {},
  subjects = [],
  classLevels = [],
  contextLabel = '',
}) {
  const empty = {
    text: '', textHi: '', imageUrl: '',
    options: OPTION_LABELS.map(() => ({ type: 'text', value: '' })),
    correctIndex: 0,
    explanation: '',
    subject: '',
    difficulty: 'medium',
    classLevel: classLevels[0]?.value ?? '',
    isPremium: false,
    isPYQ: false,
    examYear: '',
    tags: '',
  }

  function parseInitial(init) {
    if (!init) return empty
    const options = (init.options || []).map(opt => {
      if (typeof opt === 'string') return { type: 'text', value: opt }
      return { type: opt.type || 'text', value: opt.value || '' }
    })
    while (options.length < 4) options.push({ type: 'text', value: '' })
    return {
      ...empty,
      ...init,
      textHi: init.textHi || '',
      imageUrl: init.imageUrl || '',
      options,
      correctIndex: Number(init.correctIndex) || 0,
      explanation: init.explanation || '',
      subject: init.subject || '',
      difficulty: init.difficulty || 'medium',
      classLevel: init.classLevel ?? (classLevels[0]?.value ?? ''),
      isPremium: !!init.isPremium,
      isPYQ: !!init.isPYQ,
      examYear: init.examYear || '',
      tags: Array.isArray(init.tags) ? init.tags.join(', ') : (init.tags || ''),
    }
  }

  const [form, setForm] = useState(() => parseInitial(initial))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  function setOption(i, patch) {
    setForm(f => {
      const options = [...f.options]
      options[i] = { ...options[i], ...patch }
      return { ...f, options }
    })
  }

  function validate() {
    if (!form.text.trim()) return 'Question text is required.'
    const missing = form.options.findIndex(o => !o.value.trim())
    if (missing !== -1) {
      const o = form.options[missing]
      return o.type === 'image'
        ? `Option ${OPTION_LABELS[missing]} needs an image.`
        : `Option ${OPTION_LABELS[missing]} is empty.`
    }
    if (form.isPYQ && !form.examYear) return 'Select the exam year for this previous year question.'
    return ''
  }

  async function handleSave() {
    const problem = validate()
    if (problem) { setError(problem); return }
    setError('')
    setSaving(true)
    const payload = {
      text: form.text.trim(),
      imageUrl: form.imageUrl || '',
      options: form.options.map(o => ({ type: o.type || 'text', value: o.value })),
      correctIndex: Number(form.correctIndex),
      explanation: form.explanation,
      difficulty: form.difficulty,
      classLevel: form.classLevel,
      // Per-question premium only applies where the feature is enabled (e.g.
      // Practice Hub). For mock tests the whole test is premium or free.
      isPremium: features.premium ? form.isPremium : false,
      isPYQ: form.isPYQ,
      examYear: form.isPYQ ? form.examYear : '',
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    }
    if (features.hindi) payload.textHi = form.textHi
    if (features.subject) payload.subject = form.subject
    try {
      await onSave(payload)
    } catch (e) {
      setError(e.message || 'Failed to save the question.')
      setSaving(false)
      return
    }
    setSaving(false)
  }

  const isEdit = !!initial

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="modal-lg-header">
          <div>
            <h2>{isEdit ? 'Edit Question' : 'New Question'}</h2>
            {contextLabel && <div className="modal-lg-sub">{contextLabel}</div>}
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-lg-body">
          {/* Question */}
          <div className="editor-section">
            <div className="editor-section-title">Question</div>

            <label className="form-label">Question text {features.hindi ? '(English)' : ''} *</label>
            <textarea
              className="input"
              rows={3}
              value={form.text}
              onChange={e => set('text', e.target.value)}
              placeholder="Type the question…"
              autoFocus
            />

            {features.hindi && (
              <>
                <label className="form-label" style={{ marginTop: 14 }}>Question text (Hindi — optional)</label>
                <textarea
                  className="input"
                  rows={3}
                  value={form.textHi}
                  onChange={e => set('textHi', e.target.value)}
                  placeholder="प्रश्न हिंदी में दर्ज करें…"
                />
              </>
            )}

            <div style={{ marginTop: 14 }}>
              <label className="form-label">Question image (optional)</label>
              <ImageUpload
                adminToken={adminToken}
                currentUrl={form.imageUrl}
                onUploaded={url => set('imageUrl', url)}
                label="Add question image"
              />
            </div>
          </div>

          {/* Options */}
          <div className="editor-section">
            <div className="editor-section-title">Answer options</div>
            <p className="form-hint">
              Each option can be text or an image. Click <strong>Correct</strong> on the right answer.
            </p>

            {form.options.map((opt, i) => {
              const isCorrect = Number(form.correctIndex) === i
              const type = opt.type || 'text'
              return (
                <div key={i} className={`option-edit-row ${isCorrect ? 'correct' : ''}`}>
                  <span className="option-letter">{OPTION_LABELS[i]}</span>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
                    <div className="seg-toggle" style={{ alignSelf: 'flex-start' }}>
                      <button type="button" className={type === 'text' ? 'active' : ''} onClick={() => setOption(i, { type: 'text', value: type === 'text' ? opt.value : '' })}>
                        Text
                      </button>
                      <button type="button" className={type === 'image' ? 'active' : ''} onClick={() => setOption(i, { type: 'image', value: type === 'image' ? opt.value : '' })}>
                        Image
                      </button>
                    </div>

                    {type === 'text' ? (
                      <input
                        className="input"
                        value={opt.value}
                        onChange={e => setOption(i, { value: e.target.value })}
                        placeholder={`Option ${OPTION_LABELS[i]}`}
                      />
                    ) : (
                      <ImageUpload
                        adminToken={adminToken}
                        currentUrl={opt.value}
                        onUploaded={url => setOption(i, { value: url })}
                        label={`Upload option ${OPTION_LABELS[i]}`}
                      />
                    )}
                  </div>

                  <button
                    type="button"
                    className={`mark-correct-btn ${isCorrect ? 'correct' : ''}`}
                    onClick={() => set('correctIndex', i)}
                  >
                    {isCorrect ? '✓ Correct' : 'Correct'}
                  </button>
                </div>
              )
            })}

            <label className="form-label" style={{ marginTop: 14 }}>Explanation (optional)</label>
            <textarea
              className="input"
              rows={2}
              value={form.explanation}
              onChange={e => set('explanation', e.target.value)}
              placeholder="Explain why this answer is correct — shown to students after they attempt the question."
            />
          </div>

          {/* Classification */}
          <div className="editor-section">
            <div className="editor-section-title">Classification</div>
            <div style={{ display: 'grid', gridTemplateColumns: features.subject ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: 14 }}>
              {features.subject && (
                <div>
                  <label className="form-label">Subject</label>
                  <select className="input" value={form.subject} onChange={e => set('subject', e.target.value)}>
                    <option value="">Select subject</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="form-label">Difficulty</label>
                <select className="input" value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="form-label">Class level</label>
                <select className="input" value={form.classLevel} onChange={e => set('classLevel', e.target.value)}>
                  {classLevels.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <label className="form-label" style={{ marginTop: 14 }}>Tags (comma-separated)</label>
            <input
              className="input"
              value={form.tags}
              onChange={e => set('tags', e.target.value)}
              placeholder="e.g. algebra, fractions, number-series"
            />
          </div>

          {/* Flags */}
          <div className="editor-section" style={{ marginBottom: 0 }}>
            <div className="editor-section-title">Visibility & source</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {features.premium && (
                <label className="form-checkbox" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.isPremium}
                    onChange={e => set('isPremium', e.target.checked)}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: 500 }}>Premium only</span>
                  <span className="muted" style={{ fontSize: 12.5 }}>— visible to subscribed students only</span>
                </label>
              )}

              <div style={{ padding: 14, background: 'var(--bg-light)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <label className="form-checkbox" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.isPYQ}
                    onChange={e => setForm(f => ({ ...f, isPYQ: e.target.checked, examYear: e.target.checked ? f.examYear : '' }))}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: 600 }}>Previous Year Question (PYQ)</span>
                </label>
                <p className="muted" style={{ fontSize: 12.5, margin: '4px 0 0 24px' }}>
                  Mark this if the question appeared in an actual JNVST exam.
                </p>
                {form.isPYQ && (
                  <div style={{ marginTop: 12, marginLeft: 24, maxWidth: 220 }}>
                    <label className="form-label">Exam year *</label>
                    <select className="input" value={form.examYear} onChange={e => set('examYear', e.target.value)}>
                      <option value="">Select year</option>
                      {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i).map(y => (
                        <option key={y} value={String(y)}>{y}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-lg-footer">
          <div className="error-msg" style={{ minHeight: 18 }}>{error}</div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <button className="btn btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : (isEdit ? 'Save changes' : 'Add question')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
