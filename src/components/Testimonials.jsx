import styles from './Testimonials.module.css'

const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    role: 'Marathon runner, 34',
    quote: 'I had GI issues for years that no doctor could explain. ABC Gut found critically low butyrate and high Proteobacteria. Six weeks later my symptoms are 80% better.',
    score: 84,
    improvement: '+12 pts',
  },
  {
    name: 'David K.',
    role: 'Executive, 48',
    quote: 'The report is unlike anything I\'ve seen. Not just data — actual steps with specific foods and doses. My Akkermansia levels are now excellent and my energy has transformed.',
    score: 79,
    improvement: '+8 pts',
  },
  {
    name: 'Priya N.',
    role: 'Functional medicine patient, 41',
    quote: 'My practitioner recommended ABC Gut to guide my autoimmune protocol. The disease risk panels and the immunotherapy response predictor were eye-opening.',
    score: 71,
    improvement: '+15 pts',
  },
]

export default function Testimonials() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <span className={styles.label}>Results</span>
          <h2 className={styles.title}>Real people, <em>real</em> outcomes</h2>
        </div>
        <div className={styles.grid}>
          {TESTIMONIALS.map(t => (
            <div key={t.name} className={styles.card}>
              <p className={styles.quote}>"{t.quote}"</p>
              <div className={styles.footer}>
                <div className={styles.avatar}>{t.name[0]}</div>
                <div>
                  <div className={styles.name}>{t.name}</div>
                  <div className={styles.role}>{t.role}</div>
                </div>
                <div className={styles.scores}>
                  <div className={styles.scoreVal}>{t.score}<span>/100</span></div>
                  <div className={styles.scoreImprove}>{t.improvement} at retest</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
