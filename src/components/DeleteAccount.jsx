export default function DeleteAccount() {
  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <img src="/logo.png" alt="NavodayaSarthi" style={styles.logo} />
          <span style={styles.brand}>NavodayaSarthi</span>
        </div>
      </header>

      {/* Content */}
      <main style={styles.main}>
        <div style={styles.card}>
          <h1 style={styles.title}>Delete Your Account</h1>
          <p style={styles.lastUpdated}>NavodayaSarthi — JNVST Preparation Platform</p>

          <div style={styles.warningBox}>
            <span style={styles.warningIcon}>⚠️</span>
            <p style={styles.warningText}>
              Account deletion is permanent and cannot be undone. All your data will be removed.
            </p>
          </div>

          {/* How to delete */}
          <section style={styles.section}>
            <h2 style={styles.sectionHeading}>How to Request Account Deletion</h2>
            <p style={styles.sectionBody}>You can request deletion of your account using any of the following methods:</p>

            <div style={styles.methodCard}>
              <h3 style={styles.methodTitle}>Option 1 — From inside the app</h3>
              <ol style={styles.steps}>
                <li style={styles.step}>Open the NavodayaSarthi app</li>
                <li style={styles.step}>Go to <strong>Profile</strong> tab</li>
                <li style={styles.step}>Tap <strong>Settings</strong></li>
                <li style={styles.step}>Tap <strong>Delete Account</strong></li>
                <li style={styles.step}>Confirm deletion</li>
              </ol>
            </div>

            <div style={styles.methodCard}>
              <h3 style={styles.methodTitle}>Option 2 — Send us an email</h3>
              <p style={styles.sectionBody}>
                Send an email to <a href="mailto:navodayasarthi.help@gmail.com" style={styles.link}>navodayasarthi.help@gmail.com</a> from your registered mobile number or email with the subject line:
              </p>
              <div style={styles.codeBox}>
                <code style={styles.code}>Request: Delete my NavodayaSarthi account — [your phone number]</code>
              </div>
              <p style={styles.sectionBody}>We will process your request within <strong>7 business days</strong>.</p>
            </div>

            <div style={styles.methodCard}>
              <h3 style={styles.methodTitle}>Option 3 — WhatsApp</h3>
              <p style={styles.sectionBody}>
                Send a WhatsApp message to <strong>+91 81759 47318</strong> with the text:
              </p>
              <div style={styles.codeBox}>
                <code style={styles.code}>I want to delete my NavodayaSarthi account. My number is [your phone number]</code>
              </div>
            </div>
          </section>

          {/* What gets deleted */}
          <section style={styles.section}>
            <h2 style={styles.sectionHeading}>What Data Gets Deleted</h2>
            <p style={styles.sectionBody}>Upon account deletion, the following data is <strong>permanently removed</strong>:</p>
            <ul style={styles.list}>
              <li style={styles.listItem}>✅ Your name and phone number</li>
              <li style={styles.listItem}>✅ Practice progress and solved questions</li>
              <li style={styles.listItem}>✅ Mock test attempts and scores</li>
              <li style={styles.listItem}>✅ Daily challenge history and points</li>
              <li style={styles.listItem}>✅ Bookmarks and activity streaks</li>
              <li style={styles.listItem}>✅ Doubts submitted</li>
              <li style={styles.listItem}>✅ All other personal data associated with your account</li>
            </ul>
          </section>

          {/* What is retained */}
          <section style={styles.section}>
            <h2 style={styles.sectionHeading}>Data Retention</h2>
            <p style={styles.sectionBody}>
              After deletion, your data is permanently erased from our systems within <strong>30 days</strong>.
              Anonymised, non-identifiable usage statistics may be retained for platform improvement purposes.
            </p>
          </section>

          {/* Contact */}
          <div style={styles.contactBox}>
            <p style={styles.contactTitle}>Need help? Contact us</p>
            <p style={styles.contactItem}>📧 <a href="mailto:navodayasarthi.help@gmail.com" style={styles.link}>navodayasarthi.help@gmail.com</a></p>
            <p style={styles.contactItem}>📞 +91 81759 47318</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>© 2026 NavodayaSarthi. All rights reserved.</p>
        <p style={styles.footerSub}>Made with ❤️ in India for Indian Students</p>
      </footer>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: '#1a56db',
    padding: '16px 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  headerInner: {
    maxWidth: 800,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logo: { width: 40, height: 40, borderRadius: 8, objectFit: 'contain' },
  brand: { color: '#fff', fontSize: 20, fontWeight: 700 },
  main: { flex: 1, padding: '32px 16px' },
  card: {
    maxWidth: 800,
    margin: '0 auto',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: '40px 48px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
  },
  title: { fontSize: 32, fontWeight: 800, color: '#111827', marginBottom: 4, marginTop: 0 },
  lastUpdated: { fontSize: 14, color: '#9ca3af', marginBottom: 24, marginTop: 0 },
  warningBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#fff7ed',
    border: '1px solid #fed7aa',
    borderRadius: 8,
    padding: '16px 20px',
    marginBottom: 32,
  },
  warningIcon: { fontSize: 20, flexShrink: 0 },
  warningText: { fontSize: 15, color: '#92400e', margin: 0, lineHeight: 1.6 },
  section: { marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid #f3f4f6' },
  sectionHeading: { fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 12, marginTop: 0 },
  sectionBody: { fontSize: 15, color: '#4b5563', lineHeight: 1.75, margin: '0 0 12px' },
  methodCard: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '16px 20px',
    marginBottom: 16,
  },
  methodTitle: { fontSize: 16, fontWeight: 700, color: '#111827', marginTop: 0, marginBottom: 10 },
  steps: { margin: 0, paddingLeft: 20 },
  step: { fontSize: 15, color: '#4b5563', lineHeight: 1.8 },
  codeBox: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    padding: '10px 14px',
    margin: '10px 0',
  },
  code: { fontSize: 14, color: '#1f2937', fontFamily: 'monospace' },
  list: { margin: '8px 0 0', paddingLeft: 0, listStyle: 'none' },
  listItem: { fontSize: 15, color: '#4b5563', lineHeight: 1.9, padding: '2px 0' },
  contactBox: {
    padding: '20px 24px',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
  },
  contactTitle: { fontSize: 15, fontWeight: 700, color: '#374151', margin: '0 0 10px' },
  contactItem: { fontSize: 15, color: '#374151', margin: '4px 0' },
  link: { color: '#1a56db', textDecoration: 'none' },
  footer: { backgroundColor: '#1a1a2e', padding: '24px 16px', textAlign: 'center' },
  footerText: { color: '#b8b8c7', fontSize: 14, margin: '0 0 4px' },
  footerSub: { color: '#b8b8c7', fontSize: 13, margin: 0 },
}
