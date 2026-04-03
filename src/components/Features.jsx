import styles from './Features.module.css'

const FEATURES = [
  {
    icon: '🧬',
    title: 'Shotgun Metagenomic Sequencing',
    body: 'We read 100% of your gut DNA — not just 16S amplicons. That means bacteria, fungi, viruses, archaea, and metabolic genes. Far more complete than standard tests.',
  },
  {
    icon: '📊',
    title: 'Gut Wellness Score',
    body: 'A single composite score (0–100) integrating diversity, probiotic abundance, commensal balance, pathobiont control, and SCFA production. Easy to track over time.',
  },
  {
    icon: '⚗️',
    title: 'Functional Markers (SCFAs)',
    body: 'We measure what your microbes actually do — butyrate, propionate, acetate — plus serotonin and GABA pathways, β-glucuronidase, and bile acid ratios.',
  },
  {
    icon: '🛡️',
    title: 'Disease Risk Panels',
    body: 'Six systems panels: metabolic, neurological, respiratory, immune, digestive, and hormonal. Plus longevity scores and immunotherapy response prediction.',
  },
  {
    icon: '🎯',
    title: 'Personalized Action Plan',
    body: 'Not just data — a ranked list of interventions with specific foods, supplements, doses, and timelines. Built for your exact microbiome profile.',
  },
  {
    icon: '🔄',
    title: 'Retest & Track Progress',
    body: 'Monitor your microbiome over time. Compare reports, see what\'s working, and adjust your plan. Most clients see measurable improvement in 8–12 weeks.',
  },
]

export default function Features() {
  return (
    <section id="features" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <span className={styles.label}>What You Get</span>
          <h2 className={styles.title}>The most complete gut test, <em>period</em></h2>
          <p className={styles.sub}>
            Standard microbiome tests show you a species list. We show you what your gut is doing
            and exactly what to do about it.
          </p>
        </div>

        <div className={styles.grid}>
          {FEATURES.map(f => (
            <div key={f.title} className={styles.card}>
              <div className={styles.cardIcon}>{f.icon}</div>
              <h3 className={styles.cardTitle}>{f.title}</h3>
              <p className={styles.cardBody}>{f.body}</p>
            </div>
          ))}
        </div>

        {/* Sample report teaser */}
        <div className={styles.sample}>
          <div className={styles.sampleLeft}>
            <span className={styles.label} style={{ textAlign: 'left', display: 'block' }}>Sample Report</span>
            <h3 className={styles.sampleTitle}>Your report covers 6 major sections</h3>
            <ul className={styles.sampleList}>
              {['Overall Gut Wellness Score', 'Phylum & Genera Profile', 'Short-Chain Fatty Acids', 'Disease Risk Associations', 'Personalized Recommendations', 'Monitoring Timeline'].map(item => (
                <li key={item} className={styles.sampleItem}>
                  <span className={styles.sampleDot} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.sampleRight}>
            <div className={styles.mockReport}>
              <div className={styles.mockHeader}>
                <div className={styles.mockDot} />
                <span>ABC Gut Report</span>
              </div>
              <div className={styles.mockScore}>
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#e8f2e4" strokeWidth="6" />
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#4a9e3f" strokeWidth="6"
                    strokeDasharray="201" strokeDashoffset="44" strokeLinecap="round"
                    transform="rotate(-90 40 40)" />
                </svg>
                <div className={styles.mockScoreText}>
                  <span className={styles.mockNum}>78</span>
                  <span className={styles.mockSub}>/ 100</span>
                </div>
              </div>
              <div className={styles.mockBars}>
                {[
                  { label: 'Firmicutes', pct: 48, color: '#4a9e3f' },
                  { label: 'Bacteroidetes', pct: 36, color: '#62b558' },
                  { label: 'Akkermansia', pct: 25, color: '#7eca73' },
                  { label: 'Proteobacteria', pct: 6, color: '#d4a020' },
                ].map(b => (
                  <div key={b.label} className={styles.mockBar}>
                    <div className={styles.mockBarTop}>
                      <span>{b.label}</span>
                      <span>{b.pct}%</span>
                    </div>
                    <div className={styles.mockBarTrack}>
                      <div style={{ width: `${b.pct * 2}%`, background: b.color, height: '100%', borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
