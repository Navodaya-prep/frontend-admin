import Icon from './Icons.jsx'

export const NAV_SECTIONS = (isSuperAdmin) => [
  {
    label: null,
    items: [
      { id: 'overview', label: 'Overview', icon: 'home', title: 'Overview', desc: 'A snapshot of everything on your platform' },
    ],
  },
  {
    label: 'Content',
    items: [
      { id: 'mocktests', label: 'Mock Tests', icon: 'clipboard', title: 'Mock Tests', desc: 'Create timed tests, manage questions and difficulty mix' },
      { id: 'practice', label: 'Practice Hub', icon: 'layers', title: 'Practice Hub', desc: 'Organize subjects, chapters and practice questions' },
      { id: 'recorded', label: 'Recorded Classes', icon: 'video', title: 'Recorded Classes', desc: 'Manage courses, chapters and video lessons' },
      { id: 'live', label: 'Live Classes', icon: 'broadcast', title: 'Live Classes', desc: 'Schedule and broadcast live sessions with quizzes' },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { id: 'doubts', label: 'Doubts', icon: 'message', title: 'Student Doubts', desc: 'Review and answer questions posted by students' },
      { id: 'notifications', label: 'Notifications', icon: 'bell', title: 'Push Notifications', desc: 'Edit notification messages, send announcements, view history' },
      ...(isSuperAdmin ? [{ id: 'daily', label: 'Daily Challenge', icon: 'zap', title: 'Daily Challenge', desc: 'One question a day to keep students coming back' }] : []),
    ],
  },
  {
    label: 'Administration',
    items: [
      ...(isSuperAdmin ? [
        { id: 'teachers', label: 'Teachers', icon: 'users', title: 'Manage Teachers', desc: 'Invite teachers and manage their access' },
        { id: 'admins', label: 'Admins', icon: 'userCog', title: 'Admin Management', desc: 'Manage administrator accounts and permissions' },
      ] : []),
      { id: 'settings', label: 'Settings', icon: 'settings', title: 'Settings', desc: 'Application-wide configuration' },
    ],
  },
]

export default function Sidebar({ active, onNavigate, adminInfo, onLogout, open, onClose }) {
  const sections = NAV_SECTIONS(adminInfo?.isSuperAdmin)
  const initials = adminInfo
    ? `${(adminInfo.firstName || ' ')[0] || ''}${(adminInfo.lastName || ' ')[0] || ''}`.trim().toUpperCase() || 'A'
    : 'A'

  return (
    <>
      <div className={`sidebar-backdrop ${open ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <img src="/logo.png" alt="" />
          <div>
            <div className="sidebar-brand-name">NavodayaSarthi</div>
            <div className="sidebar-brand-sub">Admin Console</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sections.map((section, si) => (
            <div key={si}>
              {section.label && section.items.length > 0 && (
                <div className="sidebar-section">{section.label}</div>
              )}
              {section.items.map(item => (
                <button
                  key={item.id}
                  className={`sidebar-link ${active === item.id ? 'active' : ''}`}
                  onClick={() => onNavigate(item.id)}
                >
                  <Icon name={item.icon} size={17} />
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-user" onClick={() => onNavigate('profile')} title="View profile">
            <div className="sidebar-user-avatar">{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div className="sidebar-user-name">
                {adminInfo ? `${adminInfo.firstName} ${adminInfo.lastName}` : 'Admin'}
              </div>
              <div className="sidebar-user-role">
                {adminInfo?.isSuperAdmin ? 'Super Admin' : 'Admin'}
              </div>
            </div>
          </button>
          <button className="sidebar-logout" onClick={onLogout}>
            <Icon name="logout" size={17} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
