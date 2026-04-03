import { Link } from 'react-router-dom'
import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.badge}>Shotgun Metagenomic Sequencing</div>
        <h1 className={styles.headline}>
          Know Your Gut.<br />
          <em>Transform</em> Your Health.
        </h1>
        <p className={styles.sub}>
          The most comprehensive microbiome test available. We sequence 100% of your gut DNA
          and deliver a personalized action plan — not just raw data.
        </p>
        <div className={styles.ctas}>
          <a href="#pricing" className={styles.btnPrimary}>Order Your Kit — from $299</a>
          <Link to="/chat" className={styles.btnSecondary}>Ask Our AI</Link>
        </div>
        <div className={styles.trust}>
          <span>CLIA Certified</span>
          <span className={styles.dot} />
          <span>Results in 3–5 weeks</span>
          <span className={styles.dot} />
          <span>10,000+ tests processed</span>
        </div>
      </div>

      <div className={styles.visual}>
        <ScoreRing score={78} />
        <div className={styles.floatCards}>
          <div className={styles.floatCard}>
            <span className={styles.floatNum}>6.12</span>
            <span className={styles.floatLabel}>Shannon Diversity</span>
            <span className={styles.floatBadge}>Optimal</span>
          </div>
          <div className={`${styles.floatCard} ${styles.floatCardAlt}`}>
            <span className={styles.floatNum}>243</span>
            <span className={styles.floatLabel}>Bacterial Species</span>
            <span className={styles.floatBadge}>Normal range</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function ScoreRing({ score }) {
  const r = 72
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  return (
    <div className={styles.ring}>
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={r} fill="none" stroke="#e8f2e4" strokeWidth="10" />
        <circle
          cx="100" cy="100" r={r} fill="none"
          stroke="#4a9e3f" strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
        />
      </svg>
      <div className={styles.ringInner}>
        <span className={styles.ringNum}>{score}</span>
        <span className={styles.ringLabel}>Gut Score</span>
      </div>
    </div>
  )
}
