import styles from './Science.module.css'

const STATS = [
  { num: '100%', label: 'Gut DNA sequenced', sub: 'vs ~1% with 16S tests' },
  { num: '38T', label: 'Bacterial cells in your gut', sub: 'outnumber your human cells' },
  { num: '1,000+', label: 'Bacterial species analyzed', sub: 'across all domains of life' },
  { num: '8–12 wk', label: 'Avg time to improvement', sub: 'with targeted interventions' },
]

const MARKERS = [
  { name: 'Shannon Diversity Index', desc: 'Measures ecosystem richness and evenness. Higher = more resilient gut.' },
  { name: 'Firmicutes/Bacteroidetes Ratio', desc: 'Key metabolic marker. Imbalance linked to obesity and inflammation.' },
  { name: 'Akkermansia muciniphila', desc: 'Gut lining guardian. Elevated levels protect against metabolic disease.' },
  { name: 'Butyrate Production', desc: 'Primary fuel for colonocytes. Critical for gut barrier and immune function.' },
  { name: 'β-Glucuronidase Activity', desc: 'Estrogen recirculation enzyme. Elevated levels may disrupt hormonal balance.' },
  { name: 'Pathobiont Load', desc: 'Opportunistic bacteria that cause harm when overgrown. We screen 50+ species.' },
]

export default function Science() {
  return (
    <section id="science" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <span className={styles.label}>The Science</span>
          <h2 className={styles.title}>Built on peer-reviewed <em>research</em></h2>
          <p className={styles.sub}>
            Shotgun metagenomics is the gold standard in microbiome science — used by researchers
            at Harvard, Stanford, and the NIH Human Microbiome Project. We bring it to you.
          </p>
        </div>

        <div className={styles.statsRow}>
          {STATS.map(s => (
            <div key={s.num} className={styles.stat}>
              <span className={styles.statNum}>{s.num}</span>
              <span className={styles.statLabel}>{s.label}</span>
              <span className={styles.statSub}>{s.sub}</span>
            </div>
          ))}
        </div>

        <div className={styles.markersSection}>
          <h3 className={styles.markersTitle}>Key markers we analyze</h3>
          <div className={styles.markersGrid}>
            {MARKERS.map(m => (
              <div key={m.name} className={styles.markerCard}>
                <div className={styles.markerDot} />
                <div>
                  <div className={styles.markerName}>{m.name}</div>
                  <div className={styles.markerDesc}>{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
