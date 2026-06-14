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
          <p style={styles.lastUpdated}>Last updated: June 2026</p>

          <p style={styles.intro}>
            NavodayaSarthi ("we", "our", or "us") is committed to protecting the privacy of every student
            who uses our platform. This Privacy Policy explains what personal data we collect, why we
            collect it, how we use and store it, when we share it, and what rights you have over your data.
            This Policy is prepared in compliance with the Information Technology Act, 2000, the SPDI Rules, 2011,
            and the Digital Personal Data Protection Act, 2023 (DPDP Act). By using the Platform, you consent
            to the data practices described in this Policy.
          </p>

          {SECTIONS.map((s) => (
            <section key={s.heading} style={styles.section}>
              <h2 style={styles.sectionHeading}>{s.heading}</h2>
              <p style={styles.sectionBody}>{s.body}</p>
            </section>
          ))}

          <div style={styles.contactBox}>
            <p style={styles.contactText}>
              For any privacy-related concerns or data requests, please contact our Privacy Team:
            </p>
            <p style={styles.contactEmail}>📧 navodayasarthi.help@gmail.com</p>
            <p style={styles.contactPhone}>📞 +91 8175947318</p>
            <p style={styles.contactPhone}>Response: Acknowledged within 48 hours · Resolved within 30 days</p>
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
    body: 'When you register, we collect your full name, mobile phone number (10 digits), and class level (Classes VI–XII).\n\nAs you use the app, we automatically record: every practice question you attempt and your selected answer, chapter and course completion progress, mock test attempt records (answers, scores, time taken), daily challenge attempts including time taken in milliseconds, live class quiz responses, and the date of each day you open the app for streak tracking.\n\nFor Premium purchases, we store your Razorpay Payment ID, Order ID, payment status, and amount. We do NOT store your card number, UPI ID, or bank credentials — those are handled exclusively by Razorpay.\n\nIf you post doubts, we collect the doubt text and any images you choose to attach.',
  },
  {
    heading: '2. How We Use Your Information',
    body: 'We use your data solely to:\n\n• Authenticate your account via OTP\n• Track your study progress and personalise content to your class level\n• Display performance analytics (subject-wise accuracy, score trends, weak areas)\n• Maintain your daily study streak and send milestone push notifications\n• Answer your academic doubts\n• Verify Premium subscription payments and restore access\n• Deliver push notifications — reminders, streak alerts, new content, and admin announcements\n• Respond to contact form enquiries\n\nWe do not use your data for advertising, third-party marketing profiling, or sale to data brokers.',
  },
  {
    heading: '3. Study Streak and Behavioural Tracking',
    body: 'Every time you use the app, we record today\'s date as your last active date. If you were active the previous day, your streak increments by one. If you missed a day, it resets to one. Same-day repeat visits make no change.\n\nWe do not track the specific times you are active within a day, how long you spend on individual screens, or time-of-day usage patterns. Streak data is used only for motivational purposes and to trigger push notifications at 7, 30, and 100-day milestones.',
  },
  {
    heading: '4. Push Notifications',
    body: 'We send the following types of push notifications:\n\n• Daily Challenge reminder at 9:00 AM IST\n• Streak-at-risk reminder at 8:00 PM IST (if you have not studied today)\n• Streak milestones when you reach 7, 30, or 100 consecutive days\n• When a teacher or admin answers your doubt\n• When a new mock test or lesson is published\n• When a live class starts\n• When your leaderboard rank improves\n• One-off announcements from admins\n\nYou may disable push notifications at any time through your device settings. Doing so does not affect your account or content access.',
  },
  {
    heading: '5. Data Sharing and Third-Party Services',
    body: 'We do not sell, rent, or trade your personal data. We share data only with the following service providers as strictly necessary to operate the platform:\n\n• 2Factor.in — delivers your OTP via SMS; receives your phone number only\n• Razorpay — processes Premium payments; receives transaction metadata only, not card/UPI details\n• Agora — powers live video classes; receives your user ID and a time-limited RTC token valid for one session\n• Cloudinary — stores images you upload such as doubt attachments; stored under our account folder\n• Expo Push Service — delivers push notifications to your device; receives your push token only\n\nAll third-party providers are bound by their own privacy policies. We may also disclose data to law enforcement if required by a court order or applicable Indian law.',
  },
  {
    heading: '6. Data Security',
    body: 'We implement reasonable technical and organisational safeguards including:\n\n• OTP-only student authentication — no passwords stored for students\n• bcrypt one-way hashing for admin and teacher passwords\n• JWT session tokens signed with HMAC-SHA256 (student tokens expire in 30 days; admin tokens in 7 days)\n• Razorpay webhook payload verification via HMAC-SHA256 signatures before any account update\n• All app-to-server communication encrypted using TLS (HTTPS)\n• Third-party API credentials stored in server-side environment variables, never exposed to clients\n\nIn the event of a security breach likely to affect your rights, we will notify the Data Protection Board and affected users as required under the DPDP Act, 2023.',
  },
  {
    heading: '7. Data Retention',
    body: 'OTP records are deleted within 5 minutes of use or expiry. User account and activity data is retained for the duration of your account plus 3 years after a deletion request. Payment records are kept for 7 years as required by Indian accounting law. Push notification logs are retained for 1 year. Contact form submissions are retained for 1 year.\n\nWhen you request account deletion, we will delete or anonymise your personal data within 30 days, except where legally required to retain it (e.g., payment records) or where needed to resolve a pending dispute.',
  },
  {
    heading: '8. Children\'s Privacy',
    body: 'NavodayaSarthi serves students in Classes VI–XII, many of whom are below 18 years of age. By using the app, a user under 18 confirms that their parent or legal guardian has reviewed this Privacy Policy and consented to its terms on their behalf.\n\nIf you are a parent and believe your child has registered without your consent, contact navodayasarthi.help@gmail.com — we will promptly investigate and delete the account upon verification.\n\nWe collect only the minimum data necessary for the educational service. We do not use minors\' data for profiling, advertising, or any purpose beyond delivering the platform. The app does not support direct messaging between student users.',
  },
  {
    heading: '9. Your Rights',
    body: 'Under the Digital Personal Data Protection Act, 2023, you have the following rights:\n\n• Right to Access — request a summary of the personal data we hold about you\n• Right to Correction — update name and class level in the app; contact us for other corrections\n• Right to Erasure — request deletion of your account and all associated data\n• Right to Withdraw Consent — disable push notifications via device settings at any time\n• Right to Grievance Redressal — raise a complaint with our Grievance Officer\n\nTo exercise any right, email navodayasarthi.help@gmail.com with your registered phone number and a description of your request. We will acknowledge within 48 hours and resolve within 30 days.',
  },
  {
    heading: '10. Cookies and Local Storage',
    body: 'The NavodayaSarthi mobile app does not use cookies. We use Expo SecureStore (device-level encrypted storage) to store your login token locally so you remain signed in between sessions. This token expires automatically in 30 days.\n\nNo third-party analytics SDKs, advertising SDKs, or tracking pixels are embedded in the app. The admin web portal uses browser session storage solely to maintain your admin login state.',
  },
  {
    heading: '11. Leaderboard',
    body: 'The weekly mock test leaderboard displays your name alongside your cumulative score rank among the top 50 users nationally. Your phone number is never shown on the leaderboard. The leaderboard refreshes weekly and covers mock test scores from the last 7 days only.\n\nIf you do not wish to appear on the leaderboard, please contact navodayasarthi.help@gmail.com to opt out.',
  },
  {
    heading: '12. Cross-Border Data Transfers',
    body: 'Some third-party services we use — including Cloudinary, Expo, and Agora — may store or process data outside India. We ensure that such transfers occur only with providers who maintain appropriate data protection standards. Your core account and activity data is stored on our servers.',
  },
  {
    heading: '13. Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. For material changes, we will notify you via push notification or in-app banner at least 14 days before the changes take effect. Continued use of the app after the effective date constitutes acceptance of the revised Policy.',
  },
  {
    heading: '14. Grievance Officer and Contact',
    body: 'In accordance with the Information Technology Act, 2000 and the DPDP Act, 2023, a Grievance Officer is designated to address privacy concerns.\n\nNavodayaSarthi\nEmail: navodayasarthi.help@gmail.com\nPhone: +91 8175947318\n\nGrievances are acknowledged within 48 hours and resolved within 30 days of receipt.',
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
