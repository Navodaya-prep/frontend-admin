import { useState, useEffect, useRef } from 'react'
import { listMockTests, listSubjects, listAdminCourses, listLiveClasses, listDoubts } from '../api.js'
import Icon from './Icons.jsx'

const STAT_COLORS = {
  indigo: { bg: '#eef2ff', fg: '#4f46e5' },
  cyan: { bg: '#ecfeff', fg: '#0891b2' },
  violet: { bg: '#f5f3ff', fg: '#7c3aed' },
  rose: { bg: '#fff1f2', fg: '#e11d48' },
  amber: { bg: '#fffbeb', fg: '#d97706' },
  green: { bg: '#f0fdf4', fg: '#16a34a' },
}

const BAR_COLORS = ['#4f46e5', '#0891b2', '#7c3aed', '#e11d48', '#d97706', '#16a34a', '#64748b']

// ─── Count-up animation ───────────────────────────────────────────────────────
function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0)
  const raf = useRef(null)

  useEffect(() => {
    const to = Number(target) || 0
    if (to === 0) { setValue(0); return }
    const start = performance.now()
    function tick(now) {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3) // ease-out cubic
      setValue(Math.round(to * eased))
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])

  return value
}

function relativeTime(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

function StatCard({ icon, label, value, hint, color = 'indigo', loading, onClick }) {
  const c = STAT_COLORS[color]
  const animated = useCountUp(loading ? 0 : value)
  return (
    <button className="stat-card stat-card-clickable" onClick={onClick}>
      <div className="stat-icon" style={{ background: c.bg, color: c.fg }}>
        <Icon name={icon} size={20} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="stat-label">{label}</div>
        {loading
          ? <div className="skeleton" style={{ width: 56, height: 28, marginTop: 4 }} />
          : <div className="stat-value">{animated}</div>}
        {hint && !loading && <div className="stat-hint">{hint}</div>}
      </div>
      <Icon name="chevronRight" size={16} className="stat-card-arrow" />
    </button>
  )
}

const TIPS = [
  { title: 'Balance the difficulty mix', text: 'Roughly 40% easy, 40% medium and 20% hard questions works well for JNVST preparation — check the difficulty cards inside each mock test.' },
  { title: 'Tag previous year questions', text: 'Mark PYQs with their exam year so students can filter authentic JNVST questions when they practice.' },
  { title: 'Always add explanations', text: 'Students learn more from reviewing answers than from the score itself. Every question deserves a short explanation.' },
  { title: 'Answer doubts within 24 hours', text: 'Response time is the biggest driver of student engagement. A quick reply keeps a student studying.' },
  { title: 'Use images where words fail', text: 'Figure-based reasoning questions land better as images — both the question and each option can be an image.' },
]

const MODULE_GUIDE = [
  { icon: 'clipboard', color: 'indigo', tab: 'mocktests', title: 'Mock Tests', desc: 'Timed, exam-style tests with auto-scoring and a student leaderboard.' },
  { icon: 'layers', color: 'violet', tab: 'practice', title: 'Practice Hub', desc: 'Self-paced practice organized as Subject → Chapter → Questions, with bilingual support.' },
  { icon: 'video', color: 'cyan', tab: 'recorded', title: 'Recorded Classes', desc: 'Video courses split into chapters and lessons, with automatic progress tracking.' },
  { icon: 'broadcast', color: 'rose', tab: 'live', title: 'Live Classes', desc: 'Live video sessions with real-time quiz pushes and instant leaderboards.' },
  { icon: 'message', color: 'green', tab: 'doubts', title: 'Doubts', desc: 'Students post questions from the app; you and your teachers answer them here.' },
  { icon: 'zap', color: 'amber', tab: 'daily', title: 'Daily Challenge', desc: 'One curated question per day — a small habit that builds streaks.', superAdminOnly: true },
]

export default function Overview({ adminToken, adminInfo, onNavigate }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [tipIndex, setTipIndex] = useState(0)
  const [tipPaused, setTipPaused] = useState(false)
  const [barsVisible, setBarsVisible] = useState(false)

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true)
    const [tests, subjects, courses, live, doubts] = await Promise.allSettled([
      listMockTests(adminToken),
      listSubjects(adminToken),
      listAdminCourses(adminToken),
      listLiveClasses(adminToken),
      listDoubts(adminToken),
    ])
    const testList = tests.status === 'fulfilled' ? (tests.value.tests || []) : []
    const doubtList = doubts.status === 'fulfilled' ? (doubts.value || []) : []
    setData({
      tests: testList,
      doubts: doubtList,
      subjects: subjects.status === 'fulfilled' ? (subjects.value || []).length : 0,
      courses: courses.status === 'fulfilled' ? (courses.value || []).length : 0,
      liveClasses: live.status === 'fulfilled' ? ((live.value?.classes || live.value || []).length || 0) : 0,
    })
    setLoading(false)
    setRefreshing(false)
    // retrigger bar animation
    setBarsVisible(false)
    requestAnimationFrame(() => requestAnimationFrame(() => setBarsVisible(true)))
  }

  useEffect(() => {
    let cancelled = false
    load().then(() => { if (cancelled) return })
    return () => { cancelled = true }
  }, [adminToken])

  // Auto-rotate tips; pause while hovered or when the tab is in the background
  useEffect(() => {
    const t = setInterval(() => {
      if (!tipPaused && !document.hidden) setTipIndex(i => (i + 1) % TIPS.length)
    }, 7000)
    return () => clearInterval(t)
  }, [tipPaused])

  const tests = data?.tests || []
  const doubts = data?.doubts || []
  const totalQuestions = tests.reduce((sum, t) => sum + (t.questionCount || 0), 0)
  const openDoubts = doubts.filter(d => d.status === 'open')
  const emptyTests = tests.filter(t => !t.questionCount)

  // Mock tests per subject (for the distribution chart)
  const bySubject = Object.entries(
    tests.reduce((acc, t) => {
      acc[t.subject || 'Other'] = (acc[t.subject || 'Other'] || 0) + 1
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1])
  const maxSubject = Math.max(1, ...bySubject.map(([, n]) => n))

  const recentDoubts = [...doubts]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const tip = TIPS[tipIndex]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{greeting}{adminInfo?.firstName ? `, ${adminInfo.firstName}` : ''} 👋</h1>
          <p className="page-desc">
            Here's what's happening on NavodayaSarthi today. Click any card to jump straight in.
          </p>
        </div>
        <button className="btn btn-outline" onClick={() => load(true)} disabled={refreshing || loading}>
          <Icon name="clock" size={15} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Stats — all clickable */}
      <div className="stat-grid">
        <StatCard icon="clipboard" color="indigo" label="Mock Tests" loading={loading}
          value={tests.length} hint={`${totalQuestions} questions total`} onClick={() => onNavigate('mocktests')} />
        <StatCard icon="layers" color="violet" label="Practice Subjects" loading={loading}
          value={data?.subjects ?? 0} onClick={() => onNavigate('practice')} />
        <StatCard icon="video" color="cyan" label="Courses" loading={loading}
          value={data?.courses ?? 0} onClick={() => onNavigate('recorded')} />
        <StatCard icon="broadcast" color="rose" label="Live Classes" loading={loading}
          value={data?.liveClasses ?? 0} onClick={() => onNavigate('live')} />
        <StatCard icon="message" color={openDoubts.length ? 'amber' : 'green'} label="Open Doubts" loading={loading}
          value={openDoubts.length} hint={`${doubts.length} total received`} onClick={() => onNavigate('doubts')} />
      </div>

      {/* Two-column: content health + recent doubts */}
      <div className="overview-columns">
        {/* Content health */}
        <div className="card">
          <h3 className="section-title"><Icon name="award" size={17} /> Content health</h3>

          {loading ? (
            <div>
              {[0, 1, 2].map(i => <div key={i} className="skeleton" style={{ height: 22, marginBottom: 12 }} />)}
            </div>
          ) : bySubject.length === 0 ? (
            <p className="muted" style={{ fontSize: 13.5 }}>
              No mock tests yet — <button className="link-btn" onClick={() => onNavigate('mocktests')}>create your first test</button> to see the subject breakdown here.
            </p>
          ) : (
            <>
              <p className="muted" style={{ fontSize: 12.5, marginBottom: 14 }}>Mock tests by subject</p>
              {bySubject.map(([subject, count], i) => (
                <button key={subject} className="dist-row" onClick={() => onNavigate('mocktests')} title={`View ${subject} tests`}>
                  <span className="dist-label">{subject}</span>
                  <span className="dist-bar-track">
                    <span
                      className="dist-bar"
                      style={{
                        width: barsVisible ? `${(count / maxSubject) * 100}%` : '0%',
                        background: BAR_COLORS[i % BAR_COLORS.length],
                        transitionDelay: `${i * 70}ms`,
                      }}
                    />
                  </span>
                  <span className="dist-count">{count}</span>
                </button>
              ))}
            </>
          )}

          {!loading && emptyTests.length > 0 && (
            <div className="attention-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13, color: 'var(--warning)' }}>
                <Icon name="alert" size={15} /> Needs attention
              </div>
              <p className="muted" style={{ fontSize: 12.5, margin: '6px 0 10px' }}>
                {emptyTests.length} test{emptyTests.length !== 1 ? 's' : ''} published with no questions yet:
              </p>
              {emptyTests.slice(0, 3).map(t => (
                <button key={t._id} className="attention-item" onClick={() => onNavigate('mocktests')}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                  <Icon name="chevronRight" size={14} />
                </button>
              ))}
              {emptyTests.length > 3 && (
                <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>…and {emptyTests.length - 3} more</p>
              )}
            </div>
          )}
        </div>

        {/* Recent doubts */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 className="section-title" style={{ marginBottom: 0 }}><Icon name="message" size={17} /> Latest doubts</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('doubts')}>
              View all <Icon name="chevronRight" size={14} />
            </button>
          </div>

          {loading ? (
            <div>
              {[0, 1, 2].map(i => <div key={i} className="skeleton" style={{ height: 52, marginBottom: 10 }} />)}
            </div>
          ) : recentDoubts.length === 0 ? (
            <p className="muted" style={{ fontSize: 13.5 }}>
              No doubts yet. When students post questions from the app, the latest ones appear here.
            </p>
          ) : (
            recentDoubts.map(d => (
              <button key={d.id} className="feed-item" onClick={() => onNavigate('doubts')}>
                <span className={`feed-dot ${d.status === 'open' ? 'open' : ''}`} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="feed-text">{d.text}</span>
                  <span className="feed-meta">
                    {d.userName || 'Student'}{d.subject ? ` · ${d.subject}` : ''} · {relativeTime(d.createdAt)}
                  </span>
                </span>
                <span className={`badge ${d.status === 'open' ? 'badge-amber' : 'badge-green'}`} style={{ flexShrink: 0 }}>
                  {d.status === 'open' ? 'Open' : 'Answered'}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Rotating tip */}
      <div
        className="tip-carousel card"
        onMouseEnter={() => setTipPaused(true)}
        onMouseLeave={() => setTipPaused(false)}
      >
        <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: 38, height: 38, flexShrink: 0 }}>
          <Icon name="sparkles" size={18} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }} key={tipIndex}>
          <div className="tip-fade">
            <div style={{ fontWeight: 700, fontSize: 14 }}>{tip.title}</div>
            <p className="muted" style={{ fontSize: 13, margin: '3px 0 0', lineHeight: 1.55 }}>{tip.text}</p>
          </div>
        </div>
        <div className="tip-dots">
          {TIPS.map((_, i) => (
            <button
              key={i}
              className={`tip-dot ${i === tipIndex ? 'active' : ''}`}
              onClick={() => setTipIndex(i)}
              aria-label={`Tip ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Platform guide */}
      <h3 className="section-title" style={{ marginTop: 28 }}><Icon name="book" size={17} /> Platform modules</h3>
      <div className="guide-grid">
        {MODULE_GUIDE
          .filter(m => !m.superAdminOnly || adminInfo?.isSuperAdmin)
          .map(m => {
            const c = STAT_COLORS[m.color]
            return (
              <button key={m.title} className="guide-card guide-card-clickable" onClick={() => onNavigate(m.tab)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div className="stat-icon" style={{ background: c.bg, color: c.fg, width: 38, height: 38 }}>
                    <Icon name={m.icon} size={18} />
                  </div>
                  <span className="guide-open">Open <Icon name="chevronRight" size={14} /></span>
                </div>
                <h4>{m.title}</h4>
                <p>{m.desc}</p>
              </button>
            )
          })}
      </div>
    </div>
  )
}
