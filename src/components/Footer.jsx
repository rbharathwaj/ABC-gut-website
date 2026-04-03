import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.brandRow}>
              <span className={styles.brandDot} />
              <span className={styles.brandName}>ABC Gut</span>
            </div>
            <p className={styles.brandDesc}>
              The most comprehensive microbiome test available.
              Know your gut. Transform your health.
            </p>
            <p className={styles.cert}>CLIA Certified Laboratory</p>
          </div>

          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <div className={styles.linkTitle}>Product</div>
              <a href="/#how-it-works" className={styles.link}>How It Works</a>
              <a href="/#features" className={styles.link}>What You Get</a>
              <a href="/#science" className={styles.link}>The Science</a>
              <a href="/#pricing" className={styles.link}>Pricing</a>
            </div>
            <div className={styles.linkGroup}>
              <div className={styles.linkTitle}>Company</div>
              <a href="#" className={styles.link}>About</a>
              <a href="#" className={styles.link}>Blog</a>
              <a href="#" className={styles.link}>Research</a>
              <a href="#" className={styles.link}>Careers</a>
            </div>
            <div className={styles.linkGroup}>
              <div className={styles.linkTitle}>Support</div>
              <Link to="/chat" className={styles.link}>Ask Our AI</Link>
              <a href="mailto:support@abcgut.com" className={styles.link}>support@abcgut.com</a>
              <a href="#" className={styles.link}>FAQ</a>
              <a href="#" className={styles.link}>Sample Collection Guide</a>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.legal}>
            © 2026 ABC Gut Diagnostics. This report is for informational purposes only and does not constitute medical advice.
            All treatment decisions should be made in consultation with qualified healthcare professionals.
            Statements have not been evaluated by the FDA.
          </p>
          <div className={styles.legalLinks}>
            <a href="#" className={styles.legalLink}>Privacy Policy</a>
            <a href="#" className={styles.legalLink}>Terms of Service</a>
            <a href="#" className={styles.legalLink}>HIPAA Notice</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
