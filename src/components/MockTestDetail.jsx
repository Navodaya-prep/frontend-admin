import { useState, useEffect } from 'react'
import { listQuestions, addQuestion } from '../api.js'

const DIFFICULTIES = ['easy', 'medium', 'hard']
const SUBJECTS = ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'General Knowledge']
const CLASS_LEVELS = ['6', '7', '8', '9', 'both']

const EMPTY_Q = {
  text: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
  subject: '',
  difficulty: 'medium',
  classLevel: '6',
  isPremium: false,
  tags: '',
}

export default function MockTestDetail({ adminKey, test, onBack }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_Q)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => { fetchQuestions() }, [])

  async function fetchQuestions() {
    setLoading(true)
    setError('')
    try {
      const data = await listQuestions(adminKey, test._id)
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
      options[index] = value
      return { ...f, options }
    })
  }

  async function handleAddQuestion(e) {
    e.preventDefault()
    if (!form.text.trim()) { setFormError('Question text is required'); return }
    if (form.options.some(o => !o.trim())) { setFormError('All 4 options are required'); return }
    setSubmitting(true)
    setFormError('')
    try {
      await addQuestion(adminKey, test._id, {
        text: form.text,
        options: form.options,
        correctIndex: parseInt(form.correctIndex),
        explanation: form.explanation,
        subject: form.subject,
        difficulty: form.difficulty,
        classLevel: form.classLevel,
        isPremium: form.isPremium,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      })
      setForm(EMPTY_Q)
      setShowForm(false)
      fetchQuestions()
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-outline btn-sm" onClick={onBack}>← Back</button>
          <h2 style={{ marginTop: 8 }}>{test.title}</h2>
          <p className="muted">{test.subject} · Class {test.classLevel} · {test.duration} min</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Cancel' : '+ Add Question'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>New Question</h3>
          <form onSubmit={handleAddQuestion}>
            <div className="form-group">
              <label>Question Text</label>
              <textarea
                rows={3}
                value={form.text}
                onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                placeholder="Enter the question..."
              />
            </div>

            <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>Options</label>
            {form.options.map((opt, i) => (
              <div className="option-row" key={i}>
                <span className={`option-badge ${form.correctIndex === i ? 'correct' : ''}`}>{i + 1}</span>
                <input
                  value={opt}
                  onChange={e => setOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                />
                <button
                  type="button"
                  className={`btn btn-sm ${form.correctIndex === i ? 'btn-success' : 'btn-outline'}`}
                  onClick={() => setForm(f => ({ ...f, correctIndex: i }))}
                >
                  {form.correctIndex === i ? 'Correct' : 'Mark correct'}
                </button>
              </div>
            ))}

            <div className="form-row" style={{ marginTop: 16 }}>
              <div className="form-group">
                <label>Subject</label>
                <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
                  <option value="">Select subject</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Difficulty</label>
                <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Class Level</label>
                <select value={form.classLevel} onChange={e => setForm(f => ({ ...f, classLevel: e.target.value }))}>
                  {CLASS_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Explanation (optional)</label>
              <textarea
                rows={2}
                value={form.explanation}
                onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
                placeholder="Why is this the correct answer?"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tags (comma separated)</label>
                <input
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="e.g. algebra, fractions"
                />
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
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Add Question'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Questions ({questions.length})</h3>
        {loading && <p className="muted">Loading...</p>}
        {error && <p className="error-text">{error}</p>}
        {!loading && questions.length === 0 && (
          <p className="muted">No questions yet. Add one above.</p>
        )}
        {questions.map((q, i) => (
          <div className="question-item" key={q.id || i}>
            <div className="question-header">
              <span className="question-num">Q{i + 1}</span>
              <span className="badge">{q.difficulty}</span>
              {q.isPremium && <span className="badge badge-gold">Premium</span>}
            </div>
            <p className="question-text">{q.text}</p>
            <div className="options-list">
              {q.options.map((opt, idx) => (
                <div key={idx} className={`option ${idx === q.correctIndex ? 'option-correct' : ''}`}>
                  <span>{idx + 1}.</span> {opt}
                </div>
              ))}
            </div>
            {q.explanation && <p className="explanation">Explanation: {q.explanation}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
