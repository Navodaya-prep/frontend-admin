import { useState, useEffect, useRef, useCallback } from 'react'
import AgoraRTC from 'agora-rtc-sdk-ng'
import { WS_BASE, pushLiveQuestion, endLiveQuestion, getAgoraToken } from '../api.js'

const EMPTY_Q = { text: '', options: ['', '', '', ''], correctIndex: 0, isReadOnly: false, timerSeconds: 30 }

export default function LiveClassRoom({ adminToken, liveClass, onBack }) {
  const [messages, setMessages] = useState([])
  const [connected, setConnected] = useState(false)
  const [activeQuestion, setActiveQuestion] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [showQuizForm, setShowQuizForm] = useState(false)
  const [form, setForm] = useState(EMPTY_Q)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Agora state
  const [broadcasting, setBroadcasting] = useState(false)
  const [agoraError, setAgoraError] = useState('')
  const localVideoRef = useRef(null)
  const agoraClientRef = useRef(null)
  const localTracksRef = useRef([])

  const wsRef = useRef(null)
  const chatEndRef = useRef(null)

  // ── WebSocket ──────────────────────────────────────────────────────────────
  const connect = useCallback(() => {
    const url = `${WS_BASE}/ws/live/${liveClass.id}?adminToken=${encodeURIComponent(adminToken)}&name=${encodeURIComponent(liveClass.teacherName)}`
    const socket = new WebSocket(url)
    socket.onopen = () => setConnected(true)
    socket.onclose = () => {
      setConnected(false)
      setTimeout(connect, 3000)
    }
    socket.onmessage = (e) => handleServerEvent(JSON.parse(e.data))
    wsRef.current = socket
  }, [adminToken, liveClass])

  useEffect(() => {
    connect()
    return () => { wsRef.current?.close() }
  }, [connect])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cleanup Agora on unmount
  useEffect(() => {
    return () => { stopBroadcast() }
  }, [])

  function handleServerEvent(msg) {
    switch (msg.type) {
      case 'chat_message':
        setMessages(prev => [...prev.slice(-200), msg.payload])
        break
      case 'quiz_start':
        setActiveQuestion(msg.payload)
        setLeaderboard([])
        break
      case 'quiz_end':
        setActiveQuestion(null)
        setLeaderboard(msg.payload.leaderboard || [])
        break
      case 'class_end':
        stopBroadcast()
        onBack()
        break
    }
  }

  // ── Agora Broadcasting ─────────────────────────────────────────────────────
  async function startBroadcast() {
    setAgoraError('')
    try {
      const { token, appId, channelName, uid } = await getAgoraToken(adminToken, liveClass.id)

      const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' })
      agoraClientRef.current = client

      await client.setClientRole('host')
      await client.join(appId, channelName, token || null, uid || 1)

      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks()
      localTracksRef.current = [audioTrack, videoTrack]

      await client.publish([audioTrack, videoTrack])

      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current)
      }

      setBroadcasting(true)
    } catch (err) {
      setAgoraError(err.message || 'Failed to start broadcast')
    }
  }

  async function stopBroadcast() {
    try {
      for (const track of localTracksRef.current) {
        track.stop()
        track.close()
      }
      localTracksRef.current = []
      if (agoraClientRef.current) {
        await agoraClientRef.current.leave()
        agoraClientRef.current = null
      }
    } catch (_) {}
    setBroadcasting(false)
  }

  // ── Quiz ───────────────────────────────────────────────────────────────────
  function setOption(i, val) {
    setForm(f => { const opts = [...f.options]; opts[i] = val; return { ...f, options: opts } })
  }

  async function handlePushQuestion(e) {
    e.preventDefault()
    setFormError('')
    if (!form.text.trim()) { setFormError('Question text is required'); return }
    if (!form.isReadOnly && form.options.some(o => !o.trim())) { setFormError('All options required'); return }
    setSubmitting(true)
    try {
      await pushLiveQuestion(adminToken, liveClass.id, {
        text: form.text,
        options: form.isReadOnly ? [] : form.options,
        correctIndex: parseInt(form.correctIndex),
        isReadOnly: form.isReadOnly,
        timerSeconds: parseInt(form.timerSeconds),
      })
      setForm(EMPTY_Q)
      setShowQuizForm(false)
    } catch (e) { setFormError(e.message) }
    finally { setSubmitting(false) }
  }

  async function handleEndQuestion() {
    if (!activeQuestion) return
    try {
      await endLiveQuestion(adminToken, liveClass.id, activeQuestion.questionId)
    } catch (e) { alert(e.message) }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-outline btn-sm" onClick={onBack}>← Back</button>
          <h2 style={{ marginTop: 8 }}>{liveClass.title}</h2>
          <p className="muted">{liveClass.subject} · {liveClass.teacherName} · {liveClass.classLevel}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className={`badge ${connected ? 'badge-live' : ''}`}>
            {connected ? '🟢 Connected' : '🔴 Reconnecting...'}
          </span>
        </div>
      </div>

      <div className="room-grid">
        {/* Left: Video + Quiz */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Agora Camera Panel */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', aspectRatio: '16/9', background: '#111', position: 'relative' }}>
            <div ref={localVideoRef} style={{ width: '100%', height: '100%' }} />
            {!broadcasting && (
              <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
              }}>
                <p style={{ color: '#fff', margin: 0 }}>Camera is off</p>
                <button className="btn btn-primary" onClick={startBroadcast}>
                  📹 Start Broadcasting
                </button>
                {agoraError && <p style={{ color: '#f87171', fontSize: 13 }}>{agoraError}</p>}
              </div>
            )}
            {broadcasting && (
              <div style={{ position: 'absolute', bottom: 12, right: 12 }}>
                <button className="btn btn-sm btn-danger" onClick={stopBroadcast}>⏹ Stop Camera</button>
              </div>
            )}
          </div>

          {/* Active Question */}
          {activeQuestion && (
            <div className="card" style={{ borderColor: '#f59e0b', borderWidth: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span className="badge badge-gold">⏱ Active Question — {activeQuestion.timerSeconds}s</span>
                <button className="btn btn-sm btn-danger" onClick={handleEndQuestion}>End Now</button>
              </div>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>{activeQuestion.text}</p>
              {!activeQuestion.isReadOnly && activeQuestion.options?.map((opt, i) => (
                <div key={i} className={`option ${i === activeQuestion.correctIndex ? 'option-correct' : ''}`}>
                  {i + 1}. {opt}
                </div>
              ))}
            </div>
          )}

          {/* Quiz Form */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3>Push Question</h3>
              <button className="btn btn-sm btn-outline" onClick={() => setShowQuizForm(v => !v)}>
                {showQuizForm ? 'Cancel' : '+ New Question'}
              </button>
            </div>
            {showQuizForm && (
              <form onSubmit={handlePushQuestion}>
                <div className="form-group">
                  <label>Question Text</label>
                  <textarea rows={3} value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} placeholder="Ask your students..." />
                </div>
                <div className="form-row" style={{ marginBottom: 12 }}>
                  <div className="form-group form-checkbox">
                    <label>
                      <input type="checkbox" checked={form.isReadOnly} onChange={e => setForm(f => ({ ...f, isReadOnly: e.target.checked }))} />
                      Read-only (no answers)
                    </label>
                  </div>
                  <div className="form-group">
                    <label>Timer (seconds)</label>
                    <input type="number" min="5" max="300" value={form.timerSeconds} onChange={e => setForm(f => ({ ...f, timerSeconds: e.target.value }))} />
                  </div>
                </div>
                {!form.isReadOnly && (
                  <>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>Options</label>
                    {form.options.map((opt, i) => (
                      <div className="option-row" key={i}>
                        <span className={`option-badge ${form.correctIndex === i ? 'correct' : ''}`}>{i + 1}</span>
                        <input value={opt} onChange={e => setOption(i, e.target.value)} placeholder={`Option ${i + 1}`} />
                        <button type="button" className={`btn btn-sm ${form.correctIndex === i ? 'btn-success' : 'btn-outline'}`}
                          onClick={() => setForm(f => ({ ...f, correctIndex: i }))}>
                          {form.correctIndex === i ? '✓ Correct' : 'Mark'}
                        </button>
                      </div>
                    ))}
                  </>
                )}
                {formError && <p className="error-text" style={{ marginTop: 8 }}>{formError}</p>}
                <div className="modal-actions" style={{ marginTop: 12 }}>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Pushing...' : '📤 Push to Students'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Leaderboard */}
          {leaderboard.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: 12 }}>Quiz Leaderboard</h3>
              {leaderboard.map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontWeight: 700, color: i < 3 ? 'var(--primary)' : 'var(--muted)', width: 28 }}>#{e.rank}</span>
                  <span style={{ flex: 1 }}>{e.userName}</span>
                  <span className={`badge ${e.isCorrect ? 'badge-success' : ''}`}>{e.isCorrect ? '✓ Correct' : '✗ Wrong'}</span>
                  <span className="muted" style={{ fontSize: 12 }}>{e.timeTaken}s</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Chat */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
          <h3 style={{ marginBottom: 12 }}>Live Chat</h3>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.length === 0 && <p className="muted" style={{ textAlign: 'center', paddingTop: 24 }}>No messages yet</p>}
            {messages.map((m, i) => (
              <div key={i} style={{ padding: '8px 10px', background: 'var(--bg)', borderRadius: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{m.userName}</span>
                <span className="muted" style={{ fontSize: 11, marginLeft: 8 }}>{new Date(m.sentAt).toLocaleTimeString()}</span>
                <p style={{ marginTop: 2, fontSize: 14 }}>{m.message}</p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>
    </div>
  )
}
