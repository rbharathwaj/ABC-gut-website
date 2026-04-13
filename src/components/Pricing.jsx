import { Link } from 'react-router-dom'
import styles from './Pricing.module.css'

export default function Pricing() {
  return (
    <section id="pricing" className={styles.section}>
      <div className={styles.inner}>

        {/* Tracking recommendation banner */}
        <div className={styles.trackingBanner}>
          <div className={styles.trackingIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div>
            <div className={styles.trackingTitle}>We're big on tracking — and the science backs it up.</div>
            <div className={styles.trackingBody}>
              A single test tells you where you are. Multiple tests show you where you're going.
              We recommend testing at least twice — a baseline and a follow-up — so you can
              measure real, quantifiable progress in your gut health.
            </div>
          </div>
        </div>

        <div className={styles.header}>
          <span className={styles.label}>Pricing</span>
          <h2 className={styles.title}>Simple, <em>transparent</em> pricing</h2>
          <p className={styles.sub}>Every test includes the full report and Gutly AI. No hidden fees.</p>
        </div>

        <div className={styles.grid}>

          {/* Single test */}
          <div className={styles.card}>
            <div className={styles.planName}>Test Kit</div>
            <div className={styles.planCadence}>Single test</div>
            <div className={styles.planPrice}>$205</div>
            <div className={styles.planPerNote}>per test · one-time</div>
            <p className={styles.planDesc}>
              A complete snapshot of your gut microbiome. Perfect for getting your baseline
              or trying ABC Gut for the first time.
            </p>
            <ul className={styles.features}>
              {[
                'Complete gut DNA sequencing',
                'Gut Wellness Score (0–100)',
                'SCFA functional analysis',
                '6 disease risk panels',
                'Personalized action plan',
                'Gutly AI access included',
              ].map(f => (
                <li key={f} className={styles.feature}>
                  <span className={styles.check}>✓</span>{f}
                </li>
              ))}
            </ul>
            <Link to="/signup?plan=kit" className={styles.cta}>Order a Kit</Link>
          </div>

          {/* Subscription */}
          <div className={`${styles.card} ${styles.featured}`}>
            <div className={styles.badge}>Best Value — Save 25%</div>
            <div className={styles.planName}>Annual Subscription</div>
            <div className={styles.planCadence}>4 tests per year</div>
            <div className={styles.planPrice}>$615<span className={styles.planPriceYear}>/yr</span></div>
            <div className={styles.planPerNote}>~$154/test · billed annually</div>
            <p className={styles.planDesc}>
              25% off the single-test price. Test quarterly and track exactly how your
              microbiome evolves with your diet, supplements, and lifestyle changes.
            </p>
            <ul className={styles.features}>
              {[
                'Everything in the single kit, 4×/year',
                'Progress comparison across all tests',
                'Longitudinal trend tracking',
                'Priority lab processing',
                'Gutly AI access included',
              ].map(f => (
                <li key={f} className={styles.feature}>
                  <span className={styles.check}>✓</span>{f}
                </li>
              ))}
            </ul>
            <Link to="/signup?plan=annual" className={`${styles.cta} ${styles.ctaFeatured}`}>Start Subscription</Link>
          </div>

        </div>

        <p className={styles.note}>
          FSA/HSA eligible · Free shipping both ways · Results in 2–3 weeks · All tests include Gutly AI
        </p>
      </div>
    </section>
  )
}
