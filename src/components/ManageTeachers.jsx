import { useState, useEffect } from 'react'
import { listTeachers, inviteTeacher, updateTeacher, toggleTeacherStatus, deleteTeacher } from '../api.js'
import DeleteIcon from './DeleteIcon.jsx'

const SUBJECTS = ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'General Knowledge']
const CLASS_LEVELS = ['6', '7', '8', '9', 'both']

const EMPTY_FORM = { firstName: '', lastName: '', email: '', phone: '', subject: '', classLevel: '', bio: '' }

export default function ManageTeachers({ adminToken }) {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [tempPassword, setTempPassword] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => { loadTeachers() }, [])

  async function loadTeachers() {
    setLoading(true)
    setError('')
    try {
      const data = await listTeachers(adminToken)
      setTeachers(data.teachers || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function openInviteModal() {
    setEditingTeacher(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setTempPassword('')
    setShowModal(true)
  }

  function openEditModal(teacher) {
    setEditingTeacher(teacher)
    setForm({
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      phone: teacher.phone || '',
      subject: teacher.subject || '',
      classLevel: teacher.classLevel || '',
      bio: teacher.bio || '',
    })
    setFormError('')
    setTempPassword('')
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingTeacher(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setTempPassword('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.firstName || !form.lastName || (!editingTeacher && !form.email)) {
      setFormError('First name, last name and email are required')
      return
    }
    setSubmitting(true)
    setFormError('')
    try {
      if (editingTeacher) {
        await updateTeacher(adminToken, editingTeacher.id, {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          subject: form.subject,
          classLevel: form.classLevel,
          bio: form.bio,
        })
        setSuccess('Teacher updated successfully!')
        setTimeout(() => setSuccess(''), 3000)
        closeModal()
        loadTeachers()
      } else {
        const data = await inviteTeacher(adminToken, form)
        setTempPassword(data.tempPassword)
        loadTeachers()
      }
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggle(teacher) {
    try {
      await toggleTeacherStatus(adminToken, teacher.id)
      setTeachers(prev => prev.map(t =>
        t.id === teacher.id ? { ...t, isActive: !t.isActive } : t
      ))
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleDelete(teacher) {
    if (!confirm(`Delete ${teacher.firstName} ${teacher.lastName}? This cannot be undone.`)) return
    setError('')
    try {
      await deleteTeacher(adminToken, teacher.id)
      setSuccess('Teacher deleted.')
      setTimeout(() => setSuccess(''), 3000)
      loadTeachers()
    } catch (e) {
      setError(e.message)
    }
  }

  const filtered = teachers.filter(t => {
    if (filterSubject && t.subject !== filterSubject) return false
    if (filterStatus === 'active' && !t.isActive) return false
    if (filterStatus === 'inactive' && t.isActive) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const name = `${t.firstName} ${t.lastName}`.toLowerCase()
      if (!name.includes(q) && !t.email?.toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 6px 0', fontSize: 28 }}>Manage Teachers</h1>
          <p style={{ margin: 0, color: 'var(--muted)' }}>Add and manage teachers for the platform</p>
        </div>
        <button className="btn btn-primary" onClick={openInviteModal}>+ Add Teacher</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, padding: 20, background: 'white', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 24 }}>
        <input
          type="text"
          className="input"
          placeholder="🔍 Search by name or email..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: 1 }}
        />
        <select className="input" value={filterSubject} onChange={e => setFilterSubject(e.target.value)} style={{ minWidth: 180 }}>
          <option value="">All Subjects</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ minWidth: 140 }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {(searchQuery || filterSubject || filterStatus) && (
          <button className="btn btn-outline" onClick={() => { setSearchQuery(''); setFilterSubject(''); setFilterStatus('') }}>
            Clear
          </button>
        )}
      </div>

      {error && <div className="error-banner" style={{ marginBottom: 16 }}>{error}</div>}
      {success && (
        <div style={{ padding: 12, background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb', borderRadius: 6, marginBottom: 16 }}>
          {success}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Teachers', value: teachers.length, color: '#6366f1', bg: '#eef2ff' },
          { label: 'Active', value: teachers.filter(t => t.isActive).length, color: '#16a34a', bg: '#dcfce7' },
          { label: 'Inactive', value: teachers.filter(t => !t.isActive).length, color: '#dc2626', bg: '#fee2e2' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: s.color }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><p style={{ color: 'var(--muted)' }}>Loading teachers...</p></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, background: 'white', borderRadius: 12, border: '2px dashed var(--border)' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>👨‍🏫</div>
          <h3 style={{ margin: '0 0 8px 0' }}>{teachers.length === 0 ? 'No teachers yet' : 'No results found'}</h3>
          <p style={{ margin: '0 0 20px 0', color: 'var(--muted)' }}>
            {teachers.length === 0 ? 'Add your first teacher to get started' : 'Try adjusting your search or filters'}
          </p>
          {teachers.length === 0 && <button className="btn btn-primary" onClick={openInviteModal}>+ Add Teacher</button>}
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--bg-light)' }}>
              <tr>
                {['Name', 'Email', 'Phone', 'Subject', 'Class', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(teacher => (
                <tr key={teacher.id} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-light)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#6366f1', fontSize: 14, flexShrink: 0 }}>
                        {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{teacher.firstName} {teacher.lastName}</div>
                        {teacher.bio && <div style={{ fontSize: 12, color: 'var(--muted)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{teacher.bio}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 14 }}>{teacher.email}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 14 }}>{teacher.phone || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {teacher.subject ? (
                      <span style={{ padding: '3px 10px', background: '#e0f2fe', color: '#0369a1', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{teacher.subject}</span>
                    ) : <span style={{ color: 'var(--muted)' }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {teacher.classLevel ? (
                      <span style={{ padding: '3px 10px', background: '#f3e8ff', color: '#7c3aed', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>Class {teacher.classLevel}</span>
                    ) : <span style={{ color: 'var(--muted)' }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={() => handleToggle(teacher)}
                      style={{ padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: teacher.isActive ? '#dcfce7' : '#fee2e2', color: teacher.isActive ? '#15803d' : '#dc2626' }}
                    >
                      {teacher.isActive ? '● Active' : '○ Inactive'}
                    </button>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: 13 }} onClick={() => openEditModal(teacher)}>
                        ✏️ Edit
                      </button>
                      <button className="btn btn-outline" style={{ padding: '4px 10px' }} onClick={() => handleDelete(teacher)}>
                        <DeleteIcon size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0 }}>{editingTeacher ? 'Edit Teacher' : 'Add Teacher'}</h2>
              <button onClick={closeModal} className="btn btn-outline" style={{ padding: '4px 12px' }}>✕</button>
            </div>

            {/* Temp password banner shown after invite */}
            {tempPassword && (
              <div style={{ padding: 16, background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: 8, marginBottom: 20 }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: 700, color: '#92400e' }}>✅ Teacher Added!</p>
                <p style={{ margin: '0 0 8px 0', fontSize: 14, color: '#78350f' }}>Share this temporary password with the teacher:</p>
                <div style={{ padding: 10, background: 'white', borderRadius: 6, fontFamily: 'monospace', fontSize: 16, letterSpacing: 2, marginBottom: 10 }}>
                  {tempPassword}
                </div>
                <p style={{ margin: 0, fontSize: 12, color: '#78350f' }}>The teacher should change their password on first login.</p>
              </div>
            )}

            {tempPassword ? (
              <button className="btn btn-primary btn-full" onClick={closeModal}>Done</button>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input className="input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="First name" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input className="input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Last name" required />
                  </div>
                </div>

                {!editingTeacher && (
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="teacher@example.com" required />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="input" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <select className="input" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
                      <option value="">Select subject</option>
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Class Level</label>
                    <select className="input" value={form.classLevel} onChange={e => setForm(f => ({ ...f, classLevel: e.target.value }))}>
                      <option value="">Select class</option>
                      {CLASS_LEVELS.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Bio / Note</label>
                  <textarea className="input" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Short bio or notes about the teacher..." rows={3} style={{ resize: 'vertical' }} />
                </div>

                {formError && <div className="error-banner" style={{ marginBottom: 16 }}>{formError}</div>}

                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting} style={{ flex: 1 }}>
                    {submitting ? (editingTeacher ? 'Saving...' : 'Adding...') : (editingTeacher ? 'Save Changes' : 'Add Teacher')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
