export default function PrivacyPolicy() {
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
          <h1 style={styles.title}>Privacy Policy</h1>
          <p style={styles.lastUpdated}>Last updated: May 2026</p>

          <p style={styles.intro}>
            NavodayaSarthi ("we", "our", or "us") is committed to protecting the privacy of students
            and their families who use our JNVST preparation platform. This Privacy Policy explains
            what information we collect, how we use it, and your rights.
          </p>

          {SECTIONS.map((s) => (
            <section key={s.heading} style={styles.section}>
              <h2 style={styles.sectionHeading}>{s.heading}</h2>
              <p style={styles.sectionBody}>{s.body}</p>
            </section>
          ))}

          <div style={styles.contactBox}>
            <p style={styles.contactText}>
              For any privacy-related concerns or requests, please contact us:
            </p>
            <p style={styles.contactEmail}>📧 navodayasarthi.help@gmail.com</p>
            <p style={styles.contactPhone}>📞 +91 81759 47318</p>
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

const SECTIONS = [
  {
    heading: '1. Information We Collect',
    body: 'We collect your name and mobile number when you sign up. We also collect usage data such as test scores, practice progress, and activity streaks to personalise your learning experience.',
  },
  {
    heading: '2. How We Use Your Information',
    body: 'Your information is used to provide and improve the app, track your progress, send important notifications (such as live class reminders), and offer personalised study recommendations.',
  },
  {
    heading: '3. Data Sharing',
    body: 'We do not sell or share your personal information with third parties. Data may be shared with trusted service providers (such as cloud hosting) solely to operate the platform.',
  },
  {
    heading: '4. Data Security',
    body: 'We take reasonable technical measures to protect your data. Your OTP-based login ensures that no passwords are stored. However, no method of transmission over the internet is 100% secure.',
  },
  {
    heading: '5. Children\'s Privacy',
    body: 'NavodayaSarthi is designed for students under parental or school guidance. We do not knowingly collect data from children without appropriate consent. Parents may contact us to review or delete their child\'s data.',
  },
  {
    heading: '6. Data Retention',
    body: 'We retain your data for as long as your account is active. You may request deletion of your account and all associated data by contacting us at navodayasarthi.help@gmail.com.',
  },
  {
    heading: '7. Cookies',
    body: 'The NavodayaSarthi mobile app does not use cookies. Our web-based admin portal may use session storage to maintain your login state.',
  },
  {
    heading: '8. Third-Party Services',
    body: 'We use Agora for live video classes and cloud infrastructure for hosting. These services process data only as necessary to provide their functionality and are bound by their own privacy policies.',
  },
  {
    heading: '9. Your Rights',
    body: 'You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at navodayasarthi.help@gmail.com. We will respond within 30 days.',
  },
  {
    heading: '10. Changes to This Policy',
    body: 'We may update this Privacy Policy periodically. We will notify you of significant changes through the app or via SMS. Continued use of the app after changes constitutes acceptance of the updated policy.',
  },
]

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
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    objectFit: 'contain',
  },
  brand: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: 0.3,
  },
  main: {
    flex: 1,
    padding: '32px 16px',
  },
  card: {
    maxWidth: 800,
    margin: '0 auto',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: '40px 48px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
  },
  title: {
    fontSize: 32,
    fontWeight: 800,
    color: '#111827',
    marginBottom: 4,
    marginTop: 0,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 24,
    marginTop: 0,
  },
  intro: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 1.75,
    marginBottom: 32,
    padding: '16px 20px',
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    borderLeft: '4px solid #1a56db',
  },
  section: {
    marginBottom: 28,
    paddingBottom: 28,
    borderBottom: '1px solid #f3f4f6',
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 10,
    marginTop: 0,
  },
  sectionBody: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 1.75,
    margin: 0,
  },
  contactBox: {
    marginTop: 8,
    padding: '20px 24px',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
  },
  contactText: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 8,
    marginTop: 0,
    fontWeight: 600,
  },
  contactEmail: {
    fontSize: 15,
    color: '#1a56db',
    margin: '4px 0',
  },
  contactPhone: {
    fontSize: 15,
    color: '#374151',
    margin: '4px 0 0',
  },
  footer: {
    backgroundColor: '#1a1a2e',
    padding: '24px 16px',
    textAlign: 'center',
  },
  footerText: {
    color: '#b8b8c7',
    fontSize: 14,
    margin: '0 0 4px',
  },
  footerSub: {
    color: '#b8b8c7',
    fontSize: 13,
    margin: 0,
  },
}
