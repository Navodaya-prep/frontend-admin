import { useState, useEffect } from 'react'
import {
  listNotificationTemplates, updateNotificationTemplate,
  sendBroadcastNotification, listNotificationLogs,
} from '../api.js'
import Icon from './Icons.jsx'

// Sample values used by the live preview so admins see a realistic notification.
const SAMPLE_VALUES = {
  name: 'Anjali',
  streak: '7',
  subject: 'Mathematics',
  difficulty: 'Medium',
  testName: 'Class 6 Full Mock Test',
  classLevel: '6',
  lessonTitle: 'Number Series Basics',
  title: 'Algebra Live Session',
  rank: '12',
}

function renderPreview(text) {
  return (text || '').replace(/\{(\w+)\}/g, (m, key) => SAMPLE_VALUES[key] ?? m)
}

// Phone-style notification preview
function NotificationPreview({ title, body }) {
  return (
    <div className="notif-preview">
      <div className="notif-preview-label">Preview</div>
      <div className="notif-preview-card">
        <img src="/logo.png" alt="" style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <div className="notif-preview-app">NavodayaSarthi · now</div>
          <div className="notif-preview-title">{renderPreview(title) || 'Notification title'}</div>
          <div className="notif-preview-body">{renderPreview(body) || 'Notification message'}</div>
        </div>
      </div>
    </div>
  )
}

// ─── One editable template card ───────────────────────────────────────────────
function TemplateCard({ template, adminToken, onSaved }) {
  const [form, setForm] = useState({
    title: template.title,
    body: template.body,
    enabled: template.enabled,
    sendTime: template.sendTime || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedFlash, setSavedFlash] = useState(false)

  const dirty =
    form.title !== template.title ||
    form.body !== template.body ||
    form.enabled !== template.enabled ||
    form.sendTime !== (template.sendTime || '')

  async function save() {
    setSaving(true)
    setError('')
    try {
      const payload = { title: form.title, body: form.body, enabled: form.enabled }
      if (template.kind === 'scheduled') payload.sendTime = form.sendTime
      const data = await updateNotificationTemplate(adminToken, template.key, payload)
      onSaved(data.template)
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 2500)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  function insertPlaceholder(p) {
    setForm(f => ({ ...f, body: `${f.body}${f.body.endsWith(' ') || !f.body ? '' : ' '}{${p}}` }))
  }

  return (
    <div className="card" style={{ opacity: form.enabled ? 1 : 0.72 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 4 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{template.name}</h4>
            {template.kind === 'scheduled'
              ? <span className="badge badge-blue"><Icon name="clock" size={12} /> Daily {form.sendTime} IST</span>
              : <span className="badge badge-purple"><Icon name="zap" size={12} /> Event-triggered</span>}
          </div>
          <p className="muted" style={{ fontSize: 12.5, margin: '4px 0 0', lineHeight: 1.5 }}>{template.description}</p>
        </div>
        <label className="switch" title={form.enabled ? 'Enabled — sends automatically' : 'Disabled — will not send'}>
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))}
          />
          <span className="switch-slider" />
        </label>
      </div>

      <div className="notif-edit-grid">
        <div>
          <label className="form-label" style={{ marginTop: 10 }}>Title</label>
          <input
            className="input"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            maxLength={80}
          />

          <label className="form-label" style={{ marginTop: 12 }}>Message</label>
          <textarea
            className="input"
            rows={3}
            value={form.body}
            onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            maxLength={180}
          />

          {template.placeholders?.length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span className="muted" style={{ fontSize: 12 }}>Variables:</span>
              {template.placeholders.map(p => (
                <button key={p} type="button" className="placeholder-chip" onClick={() => insertPlaceholder(p)}
                  title={`Insert {${p}} — becomes e.g. "${SAMPLE_VALUES[p] ?? p}"`}>
                  {'{'}{p}{'}'}
                </button>
              ))}
            </div>
          )}

          {template.kind === 'scheduled' && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <label className="form-label" style={{ margin: 0 }}>Send daily at</label>
              <input
                type="time"
                className="input"
                style={{ width: 130 }}
                value={form.sendTime}
                onChange={e => setForm(f => ({ ...f, sendTime: e.target.value }))}
              />
              <span className="muted" style={{ fontSize: 12 }}>IST (India)</span>
            </div>
          )}
        </div>

        <NotificationPreview title={form.title} body={form.body} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
        <span className="error-msg">{error}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {savedFlash && <span className="badge badge-green"><Icon name="check" size={12} /> Saved</span>}
          <button className="btn btn-primary btn-sm" onClick={save} disabled={!dirty || saving || !form.title.trim() || !form.body.trim()}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Broadcast composer ───────────────────────────────────────────────────────
function BroadcastComposer({ adminToken, onSent }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  async function send() {
    setSending(true)
    setError('')
    try {
      const data = await sendBroadcastNotification(adminToken, { title: title.trim(), body: body.trim() })
      setResult(data.recipients)
      setTitle('')
      setBody('')
      setConfirming(false)
      onSent()
      setTimeout(() => setResult(null), 6000)
    } catch (e) {
      setError(e.message)
      setConfirming(false)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="card" style={{ marginBottom: 28, borderColor: '#c7d2fe', background: 'linear-gradient(135deg, #eef2ff40, #ffffff)' }}>
      <h3 className="section-title"><Icon name="send" size={16} /> Send an announcement</h3>
      <p className="muted" style={{ fontSize: 13, marginTop: -6, marginBottom: 14 }}>
        Goes out immediately to every student with the app installed. Use for exam updates, new content drops, or important announcements.
      </p>

      <div className="notif-edit-grid">
        <div>
          <input
            className="input"
            placeholder="Title — e.g. 📢 JNVST admit cards are out!"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={80}
          />
          <textarea
            className="input"
            rows={3}
            placeholder="Message — keep it short, students see ~2 lines on their lock screen."
            value={body}
            onChange={e => setBody(e.target.value)}
            maxLength={180}
            style={{ marginTop: 10 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <span className="muted" style={{ fontSize: 12 }}>{body.length}/180 characters</span>
            <button className="btn btn-primary" disabled={!title.trim() || !body.trim() || sending} onClick={() => setConfirming(true)}>
              <Icon name="send" size={15} /> Send to all students
            </button>
          </div>
        </div>
        <NotificationPreview title={title} body={body} />
      </div>

      {error && <div className="error-banner" style={{ marginTop: 12, marginBottom: 0 }}>{error}</div>}
      {result !== null && (
        <div className="success-banner" style={{ marginTop: 12, marginBottom: 0 }}>
          Announcement delivered to {result} device{result !== 1 ? 's' : ''}.
        </div>
      )}

      {confirming && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setConfirming(false)}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <h3>Send to all students?</h3>
            <p className="muted" style={{ margin: '10px 0 16px', lineHeight: 1.6 }}>
              This will instantly notify every registered device. It cannot be unsent.
            </p>
            <NotificationPreview title={title} body={body} />
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setConfirming(false)} disabled={sending}>Cancel</button>
              <button className="btn btn-primary" onClick={send} disabled={sending}>
                {sending ? 'Sending…' : 'Yes, send now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Notifications({ adminToken, isSuperAdmin }) {
  const [templates, setTemplates] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [tpls, history] = await Promise.all([
        listNotificationTemplates(adminToken),
        listNotificationLogs(adminToken),
      ])
      setTemplates(tpls || [])
      setLogs(history || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function handleSaved(updated) {
    if (!updated) return
    setTemplates(ts => ts.map(t => (t.key === updated.key ? updated : t)))
  }

  async function refreshLogs() {
    try { setLogs(await listNotificationLogs(adminToken) || []) } catch { /* non-critical */ }
  }

  const scheduled = templates.filter(t => t.kind === 'scheduled')
  const events = templates.filter(t => t.kind !== 'scheduled')

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Push Notifications</h1>
          <p className="page-desc">
            Every message the app sends is editable here — nothing is hard-coded. Toggle a notification off to stop it entirely, and use variables like {'{name}'} to personalise messages.
          </p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading && <div className="loading-block"><div className="spinner" />Loading notifications…</div>}

      {!loading && (
        <>
          {isSuperAdmin && <BroadcastComposer adminToken={adminToken} onSent={refreshLogs} />}

          {scheduled.length > 0 && (
            <>
              <h3 className="section-title"><Icon name="clock" size={17} /> Scheduled — sent automatically every day</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
                {scheduled.map(t => (
                  <TemplateCard key={t.key} template={t} adminToken={adminToken} onSaved={handleSaved} />
                ))}
              </div>
            </>
          )}

          {events.length > 0 && (
            <>
              <h3 className="section-title"><Icon name="zap" size={17} /> Event-triggered — sent when something happens</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
                {events.map(t => (
                  <TemplateCard key={t.key} template={t} adminToken={adminToken} onSaved={handleSaved} />
                ))}
              </div>
            </>
          )}

          <h3 className="section-title"><Icon name="fileText" size={17} /> Recent sends</h3>
          {logs.length === 0 ? (
            <div className="empty-state" style={{ padding: 36 }}>
              <p style={{ margin: 0 }}>Nothing sent yet. Notification history will appear here.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Type</th>
                    <th>Message</th>
                    <th style={{ textAlign: 'right' }}>Devices</th>
                    <th>Sent by</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(l => (
                    <tr key={l.id}>
                      <td className="muted" style={{ whiteSpace: 'nowrap' }}>{new Date(l.createdAt).toLocaleString()}</td>
                      <td><span className="badge badge-gray">{l.key}</span></td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{l.title}</div>
                        <div className="muted" style={{ fontSize: 12.5 }}>{l.body}</div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{l.recipients}</td>
                      <td className="muted">{l.sentBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
