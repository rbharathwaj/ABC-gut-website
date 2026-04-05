import styles from './Pricing.module.css'

const PLANS = [
  {
    name: 'Essential',
    price: '$299',
    desc: 'Everything you need to understand your gut health baseline.',
    features: [
      'Shotgun metagenomic sequencing',
      'Gut Wellness Score (0–100)',
      'Phylum & genera breakdown',
      'Pathogen screen (50+ targets)',
      'Digital report PDF',
      'Email support',
    ],
    cta: 'Order Essential',
    highlight: false,
  },
  {
    name: 'Complete',
    price: '$449',
    desc: 'The full picture — functional markers, disease risk panels, and your action plan.',
    features: [
      'Everything in Essential, plus:',
      'SCFA functional analysis (butyrate, propionate, acetate)',
      'Serotonin & GABA pathways',
      '6 disease risk panels',
      'Longevity & immunotherapy scores',
      'Personalized action plan',
      'Supplement & diet recommendations',
      'Practitioner review call (30 min)',
    ],
    cta: 'Order Complete',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Ongoing',
    price: '$349',
    desc: 'Two Complete tests per year to track your progress and refine your plan.',
    perNote: '/test · billed as $698/yr',
    features: [
      'Everything in Complete, twice a year',
      'Progress comparison reports',
      'Priority lab processing',
      'Dedicated health consultant',
      'Quarterly check-in calls',
    ],
    cta: 'Subscribe',
    highlight: false,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <span className={styles.label}>Pricing</span>
          <h2 className={styles.title}>Simple, <em>transparent</em> pricing</h2>
          <p className={styles.sub}>No hidden fees. No subscription lock-in on single tests. Results shipped to your door.</p>
        </div>

        <div className={styles.grid}>
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className={`${styles.card} ${plan.highlight ? styles.featured : ''}`}
            >
              {plan.badge && <div className={styles.badge}>{plan.badge}</div>}
              <div className={styles.planName}>{plan.name}</div>
              <div className={styles.planPrice}>
                {plan.price}
                {plan.perNote && <span className={styles.perNote}>{plan.perNote}</span>}
              </div>
              <p className={styles.planDesc}>{plan.desc}</p>
              <ul className={styles.features}>
                {plan.features.map(f => (
                  <li key={f} className={`${styles.feature} ${f.startsWith('Everything') ? styles.featureHeader : ''}`}>
                    {!f.startsWith('Everything') && <span className={styles.check}>✓</span>}
                    {f}
                  </li>
                ))}
              </ul>
              <a href="#" className={`${styles.cta} ${plan.highlight ? styles.ctaFeatured : ''}`}>
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        <p className={styles.note}>
          FSA/HSA eligible · Free shipping both ways · Results in 2–3 weeks
        </p>
      </div>
    </section>
  )
}
