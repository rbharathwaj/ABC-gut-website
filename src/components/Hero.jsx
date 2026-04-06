import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <h1 className={styles.headline}>
          Know Your Gut.<br />
          <em>Transform</em> Your Health.
        </h1>
        <p className={styles.sub}>
          The most comprehensive microbiome test available. We sequence 100% of your gut DNA
          and deliver a personalized action plan — not just raw data.
          Every report includes access to <strong>Gutly</strong>, our AI health assistant.
        </p>
        <div className={styles.ctas}>
          <a href="#pricing" className={styles.btnPrimary}>Order Your Kit — from $205</a>
          <a href="#how-it-works" className={styles.btnSecondary}>See How It Works</a>
        </div>
        <div className={styles.trust}>
          <span>Results in 2–3 weeks</span>
          <span className={styles.dot} />
          <span>Free shipping both ways</span>
          <span className={styles.dot} />
          <span>FSA / HSA eligible</span>
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
