import { useState, useEffect } from 'react'
import {
  listAdminCourses, createCourse, updateCourse, deleteCourse,
  listAdminChapters, createCourseChapter, updateChapter, deleteChapter,
  listLessons, createLesson, updateLesson, deleteLesson,
} from '../api'

// ─── Type badge ───────────────────────────────────────────────────────────────
function TypeBadge({ type }) {
  const cfg = type === 'video'
    ? { bg: '#e0e7ff', color: '#3730a3', label: '🎥 Video' }
    : { bg: '#fef3c7', color: '#92400e', label: '📝 Note'  }
  return (
    <span style={{ ...cfg, background: cfg.bg, borderRadius: 99, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
      {cfg.label}
    </span>
  )
}

function useConfirmDelete(onDelete) {
  const [pending, setPending] = useState(null)
  const ask = (item) => setPending(item)
  const confirm = () => { if (pending) { onDelete(pending); setPending(null) } }
  const cancel = () => setPending(null)
  return { pending, ask, confirm, cancel }
}

// ─────────────────────────────────────────────────────────────────────────────
// Course Modal
// ─────────────────────────────────────────────────────────────────────────────
const SUBJECTS = [
  { value: 'mental_ability', label: 'Mental Ability' },
  { value: 'arithmetic',     label: 'Arithmetic'     },
  { value: 'language',       label: 'Language'       },
  { value: 'science',        label: 'Science'        },
  { value: 'social_science', label: 'Social Science' },
  { value: 'gk',             label: 'General Knowledge' },
]

function CourseModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ?? {
    title: '', subject: 'mental_ability', classLevel: '',
    thumbnail: '🎥', description: '', order: 0, isPremium: false,
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: 460 }}>
        <h2 style={{ marginBottom: 16 }}>{initial ? 'Edit Course' : 'New Course'}</h2>
        <label className="form-label">Title *</label>
        <input className="input" value={form.title} onChange={set('title')} placeholder="e.g. Mental Ability Masterclass" />
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label className="form-label">Subject *</label>
            <select className="input" value={form.subject} onChange={set('subject')}>
              {SUBJECTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="form-label">Class Level</label>
            <select className="input" value={form.classLevel} onChange={set('classLevel')}>
              <option value="">All</option>
              <option value="6">Class 6</option>
              <option value="7">Class 7</option>
              <option value="8">Class 8</option>
              <option value="9">Class 9</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label className="form-label">Thumbnail Emoji</label>
            <input className="input" value={form.thumbnail} onChange={set('thumbnail')} placeholder="🎥" />
          </div>
          <div style={{ flex: 1 }}>
            <label className="form-label">Display Order</label>
            <input className="input" type="number" value={form.order} onChange={set('order')} />
          </div>
        </div>
        <label className="form-label">Description</label>
        <textarea className="input" rows={2} value={form.description} onChange={set('description')}
          placeholder="Brief course description" style={{ resize: 'vertical' }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.isPremium}
            onChange={(e) => setForm((f) => ({ ...f, isPremium: e.target.checked }))} />
          Premium course
        </label>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)} disabled={!form.title.trim()}>
            {initial ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Lesson Modal
// ─────────────────────────────────────────────────────────────────────────────
function LessonModal({ initial, courseId, onSave, onClose }) {
  const [form, setForm] = useState(initial ?? {
    title: '', type: 'video', youtubeVideoId: '',
    noteContent: '', description: '', durationMins: 0,
    order: 0, isPremium: false,
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: 500 }}>
        <h2 style={{ marginBottom: 16 }}>{initial ? 'Edit Lesson' : 'New Lesson'}</h2>
        <label className="form-label">Title *</label>
        <input className="input" value={form.title} onChange={set('title')} placeholder="e.g. Introduction to Number Series" />
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label className="form-label">Type</label>
            <select className="input" value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              <option value="video">🎥 Video</option>
              <option value="note">📝 Note</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="form-label">Duration (mins)</label>
            <input className="input" type="number" value={form.durationMins} onChange={set('durationMins')} />
          </div>
        </div>

        {form.type === 'video' ? (
          <>
            <label className="form-label">YouTube Video ID / URL</label>
            <input className="input" value={form.youtubeVideoId} onChange={set('youtubeVideoId')}
              placeholder="dQw4w9WgXcQ or full YouTube URL" />
          </>
        ) : (
          <>
            <label className="form-label">Note Content</label>
            <textarea className="input" rows={5} value={form.noteContent} onChange={set('noteContent')}
              placeholder="Write the lesson notes here..." style={{ resize: 'vertical' }} />
          </>
        )}

        <label className="form-label">Description</label>
        <input className="input" value={form.description} onChange={set('description')}
          placeholder="Short description of this lesson" />

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <label className="form-label">Display Order</label>
            <input className="input" type="number" value={form.order} onChange={set('order')} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isPremium}
              onChange={(e) => setForm((f) => ({ ...f, isPremium: e.target.checked }))} />
            Premium
          </label>
        </div>

        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave({ ...form, courseId })}
            disabled={!form.title.trim()}>
            {initial ? 'Update' : 'Add Lesson'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Lessons Panel
// ─────────────────────────────────────────────────────────────────────────────
function LessonsPanel({ adminToken, chapter, courseId }) {
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [error, setError] = useState('')
  const del = useConfirmDelete(async (l) => { await deleteLesson(adminToken, l.id); load() })

  async function load() {
    setLoading(true)
    try { setLessons(await listLessons(adminToken, chapter.id)) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [chapter.id])

  async function handleSave(form) {
    // Extract YouTube ID from URL if needed
    const payload = { ...form }
    if (form.youtubeVideoId?.includes('youtube.com') || form.youtubeVideoId?.includes('youtu.be')) {
      const match = form.youtubeVideoId.match(/(?:v=|youtu\.be\/)([^&?/]+)/)
      if (match) payload.youtubeVideoId = match[1]
    }
    try {
      if (modal && modal !== 'create') {
        await updateLesson(adminToken, modal.id, payload)
      } else {
        await createLesson(adminToken, chapter.id, payload)
      }
      setModal(null); load()
    } catch (e) { setError(e.message) }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Lessons in "{chapter.title}" ({lessons.length})</h3>
        <button className="btn btn-primary" onClick={() => setModal('create')}>+ Add Lesson</button>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading && <p style={{ color: '#888', textAlign: 'center', padding: 32 }}>Loading…</p>}

      {!loading && lessons.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, color: '#888' }}>No lessons yet.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {lessons.map((l, i) => (
          <div key={l.id} style={{
            background: '#fff', border: '1px solid #e0e0e0', borderRadius: 10,
            padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ color: '#888', fontSize: 13, minWidth: 24 }}>#{i + 1}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <TypeBadge type={l.type} />
                {l.durationMins > 0 && <span style={{ fontSize: 12, color: '#888' }}>⏱ {l.durationMins} min</span>}
                {l.isPremium && <span style={{ background: '#fef3c7', color: '#92400e', borderRadius: 99, padding: '2px 6px', fontSize: 11, fontWeight: 600 }}>★ Pro</span>}
              </div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{l.title}</div>
              {l.youtubeVideoId && <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>YT: {l.youtubeVideoId}</div>}
              {l.description && <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{l.description}</div>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: 12 }}
                onClick={() => setModal(l)}>Edit</button>
              <button className="btn btn-danger" style={{ padding: '4px 12px', fontSize: 12 }}
                onClick={() => del.ask(l)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {(modal === 'create' || (modal && modal !== 'create')) && (
        <LessonModal
          initial={modal === 'create' ? null : modal}
          courseId={courseId}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      {del.pending && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: 360 }}>
            <h3>Delete Lesson?</h3>
            <p style={{ color: '#666', margin: '8px 0 20px' }}>"{del.pending.title}" will be removed permanently.</p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={del.cancel}>Cancel</button>
              <button className="btn btn-danger" onClick={del.confirm}>Delete</button>
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
function ChaptersPanel({ adminToken, course, onBack }) {
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [error, setError] = useState('')
  const del = useConfirmDelete(async (ch) => { await deleteChapter(adminToken, ch.id); load() })

  async function load() {
    setLoading(true)
    try { setChapters(await listAdminChapters(adminToken, course.id)) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [course.id])

  async function handleSave(form) {
    try {
      if (modal && modal !== 'create') {
        await updateChapter(adminToken, modal.id, form)
      } else {
        await createCourseChapter(adminToken, course.id, form)
      }
      setModal(null); load()
    } catch (e) { setError(e.message) }
  }

  if (selectedChapter) return (
    <div>
      <button className="btn btn-outline" style={{ marginBottom: 16 }}
        onClick={() => setSelectedChapter(null)}>← Chapters</button>
      <LessonsPanel adminToken={adminToken} chapter={selectedChapter} courseId={course.id} />
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button className="btn btn-outline" onClick={onBack}>← Courses</button>
        <span style={{ fontSize: 20 }}>{course.thumbnail}</span>
        <h2 style={{ margin: 0 }}>{course.title} — Chapters</h2>
        <button className="btn btn-primary" style={{ marginLeft: 'auto' }}
          onClick={() => setModal('create')}>+ Add Chapter</button>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading && <p style={{ textAlign: 'center', padding: 32, color: '#888' }}>Loading…</p>}

      {!loading && chapters.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, color: '#888' }}>No chapters yet.</div>
      )}

      <div className="table-wrap">
        {chapters.length > 0 && (
          <table className="table">
            <thead>
              <tr><th>Order</th><th>Title</th><th>Description</th><th>Premium</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {chapters.map((ch) => (
                <tr key={ch.id}>
                  <td>{ch.order}</td>
                  <td>
                    <button style={{ background: 'none', border: 'none', color: '#1A73E8', cursor: 'pointer', fontWeight: 600, fontSize: 14, padding: 0 }}
                      onClick={() => setSelectedChapter(ch)}>{ch.title}</button>
                  </td>
                  <td style={{ color: '#666', fontSize: 13 }}>{ch.description || '—'}</td>
                  <td>{ch.isPremium ? '★' : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: 12 }}
                        onClick={() => setModal(ch)}>Edit</button>
                      <button className="btn btn-danger" style={{ padding: '4px 12px', fontSize: 12 }}
                        onClick={() => del.ask(ch)}>Delete</button>
                      <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: 12 }}
                        onClick={() => setSelectedChapter(ch)}>Lessons →</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(modal === 'create' || (modal && modal !== 'create')) && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: 420 }}>
            <h2 style={{ marginBottom: 16 }}>{modal === 'create' ? 'New Chapter' : 'Edit Chapter'}</h2>
            <ChapterForm initial={modal === 'create' ? null : modal} onSave={handleSave} onClose={() => setModal(null)} />
          </div>
        </div>
      )}

      {del.pending && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: 360 }}>
            <h3>Delete Chapter?</h3>
            <p style={{ color: '#666', margin: '8px 0 20px' }}>"{del.pending.title}" and all its lessons will be removed.</p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={del.cancel}>Cancel</button>
              <button className="btn btn-danger" onClick={del.confirm}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ChapterForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ?? { title: '', description: '', order: 0, isPremium: false })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  return (
    <>
      <label className="form-label">Title *</label>
      <input className="input" value={form.title} onChange={set('title')} placeholder="e.g. Chapter 1: Intro" />
      <label className="form-label">Description</label>
      <input className="input" value={form.description} onChange={set('description')} />
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <label className="form-label">Display Order</label>
          <input className="input" type="number" value={form.order} onChange={set('order')} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.isPremium}
            onChange={(e) => setForm((f) => ({ ...f, isPremium: e.target.checked }))} />
          Premium
        </label>
      </div>
      <div className="modal-actions">
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onSave(form)} disabled={!form.title.trim()}>
          {initial ? 'Update' : 'Create'}
        </button>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main RecordedClasses (Courses list)
// ─────────────────────────────────────────────────────────────────────────────
export default function RecordedClasses({ adminToken }) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [error, setError] = useState('')
  const del = useConfirmDelete(async (c) => { await deleteCourse(adminToken, c.id); load() })

  async function load() {
    setLoading(true)
    try { setCourses(await listAdminCourses(adminToken)) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleSave(form) {
    try {
      if (modal && modal !== 'create') {
        await updateCourse(adminToken, modal.id, form)
      } else {
        await createCourse(adminToken, form)
      }
      setModal(null); load()
    } catch (e) { setError(e.message) }
  }

  if (selectedCourse) return (
    <ChaptersPanel
      adminToken={adminToken}
      course={selectedCourse}
      onBack={() => setSelectedCourse(null)}
    />
  )

  const SUBJECT_COLORS = {
    mental_ability: '#1A73E8', arithmetic: '#FB8C00', language: '#34A853',
    science: '#8B5CF6', social_science: '#EF4444', gk: '#F59E0B',
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Recorded Classes — Courses</h2>
        <button className="btn btn-primary" onClick={() => setModal('create')}>+ New Course</button>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading && <p style={{ textAlign: 'center', padding: 48, color: '#888' }}>Loading…</p>}

      {!loading && courses.length === 0 && (
        <div style={{ textAlign: 'center', padding: 64, color: '#888' }}>
          <p style={{ fontSize: 48, margin: '0 0 12px' }}>🎥</p>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>No courses yet</p>
          <p>Click "+ New Course" to create the first one.</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {courses.map((c) => {
          const color = SUBJECT_COLORS[c.subject] || '#1A73E8'
          return (
            <div key={c.id} style={{
              background: '#fff', borderRadius: 14, overflow: 'hidden',
              border: `1px solid ${color}30`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              <div style={{ background: color, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 32 }}>{c.thumbnail || '🎥'}</span>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{c.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 }}>
                    {c.subject?.replace('_', ' ')} {c.classLevel ? `· Class ${c.classLevel}` : ''} {c.isPremium ? '· ★ Premium' : ''}
                  </div>
                </div>
              </div>
              <div style={{ padding: '12px 16px' }}>
                {c.description && <p style={{ fontSize: 13, color: '#666', margin: '0 0 10px', lineHeight: 1.5 }}>{c.description}</p>}
                <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
                  {c.chaptersCount || 0} chapters · {c.videosCount || 0} videos
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" style={{ flex: 1, fontSize: 12 }}
                    onClick={() => setSelectedCourse(c)}>Chapters →</button>
                  <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 12 }}
                    onClick={() => setModal(c)}>Edit</button>
                  <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: 12 }}
                    onClick={() => del.ask(c)}>✕</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {(modal === 'create' || (modal && modal !== 'create')) && (
        <CourseModal
          initial={modal === 'create' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      {del.pending && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: 360 }}>
            <h3>Delete Course?</h3>
            <p style={{ color: '#666', margin: '8px 0 20px' }}>"{del.pending.title}" and all its content will be removed.</p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={del.cancel}>Cancel</button>
              <button className="btn btn-danger" onClick={del.confirm}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
