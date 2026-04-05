import { Link } from 'react-router-dom'
import ChatBot from '../components/ChatBot'
import styles from './ChatPage.module.css'

export default function ChatPage() {
  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarInner}>
          <Link to="/" className={styles.back}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to site
          </Link>

          <div className={styles.sidebarHeader}>
            <div className={styles.brandRow}>
              <span className={styles.brandDot} />
              <span className={styles.brandName}>Gutly</span>
            </div>
            <p className={styles.sidebarDesc}>
              Ask anything about your microbiome, test results, gut health science, or your personalized recommendations.
            </p>
          </div>

          <div className={styles.capabilities}>
            <div className={styles.capLabel}>I can help with</div>
            {[
              { icon: '📊', text: 'Interpreting your gut report' },
              { icon: '🥦', text: 'Food & supplement guidance' },
              { icon: '🔬', text: 'Understanding the science' },
              { icon: '🎯', text: 'Personalized action steps' },
              { icon: '📈', text: 'Tracking your progress' },
            ].map(c => (
              <div key={c.text} className={styles.cap}>
                <span>{c.icon}</span>
                <span>{c.text}</span>
              </div>
            ))}
          </div>

          <div className={styles.disclaimer}>
            This AI provides educational information only. Always consult a qualified healthcare professional before making health decisions.
          </div>
        </div>
      </aside>

      <div className={styles.chatArea}>
        <div className={styles.chatHeader}>
          <div className={styles.chatHeaderLeft}>
            <div className={styles.onlineDot} />
            <span className={styles.chatHeaderTitle}>Gutly</span>
          </div>
          <span className={styles.chatHeaderSub}>ABC Gut's AI assistant</span>
        </div>
        <ChatBot />
      </div>
    </div>
  )
}
