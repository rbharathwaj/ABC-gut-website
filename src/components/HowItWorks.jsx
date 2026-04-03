import styles from './HowItWorks.module.css'

const STEPS = [
  {
    num: '01',
    title: 'Order Your Kit',
    body: 'Choose your plan and receive a collection kit at your door within 2–3 business days. Everything you need is included.',
    icon: '📦',
  },
  {
    num: '02',
    title: 'Collect Your Sample',
    body: 'A simple, at-home stool collection. Takes 5 minutes. Secure, lab-grade packaging ensures sample integrity.',
    icon: '🧪',
  },
  {
    num: '03',
    title: 'We Sequence Everything',
    body: 'Shotgun metagenomic sequencing reads 100% of your gut DNA — bacteria, fungi, viruses, and more. 3–5 week turnaround.',
    icon: '🔬',
  },
  {
    num: '04',
    title: 'Get Your Report',
    body: 'A beautifully designed, clinically detailed report with your microbiome composition, functional markers, and a personalized action plan.',
    icon: '📋',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <span className={styles.label}>How It Works</span>
          <h2 className={styles.title}>From sample to <em>insight</em> in 4 steps</h2>
          <p className={styles.sub}>No lab visit. No complexity. Just results you can act on.</p>
        </div>

        <div className={styles.steps}>
          {STEPS.map((step, i) => (
            <div key={step.num} className={styles.step}>
              <div className={styles.stepTop}>
                <span className={styles.stepNum}>{step.num}</span>
                <span className={styles.stepIcon}>{step.icon}</span>
              </div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepBody}>{step.body}</p>
              {i < STEPS.length - 1 && <div className={styles.connector} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
