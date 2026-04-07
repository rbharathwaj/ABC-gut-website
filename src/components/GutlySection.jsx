import styles from './GutlySection.module.css'

const EXAMPLE_MESSAGES = [
  {
    role: 'user',
    text: 'My Akkermansia is low — what does that mean for me?',
  },
  {
    role: 'ai',
    text: 'Low Akkermansia muciniphila is linked to increased intestinal permeability ("leaky gut") and reduced mucus layer integrity. A 2022 meta-analysis in Nature Microbiology found Akkermansia abundance is inversely correlated with BMI, insulin resistance, and systemic inflammation.',
    cite: 'Plovier et al., Nature Microbiology 2022',
  },
  {
    role: 'user',
    text: 'What can I do to raise it?',
  },
  {
    role: 'ai',
    text: 'Polyphenol-rich foods are the strongest dietary lever — pomegranate, cranberry, and grape seed extract all significantly increase Akkermansia in RCTs. Intermittent fasting and avoiding emulsifiers (CMC, polysorbate-80) also help.',
    cite: 'Dao et al., Gut 2021 · Depommier et al., Cell Metabolism 2019',
  },
]

const PILLARS = [
  {
    title: 'Trained on peer-reviewed research',
    body: 'Gutly is built on a curated corpus of published studies from journals including Nature, Cell, Gut, and The Lancet — not blog posts or generic nutrition databases.',
  },
  {
    title: 'Answers grounded in your results',
    body: 'Every response is contextualized to your specific microbiome profile. Gutly knows your Wellness Score, which taxa are elevated or depleted, and your SCFA output.',
  },
  {
    title: 'Citations included',
    body: 'Gutly surfaces the papers behind each answer so you — or your doctor — can verify the evidence. No black-box recommendations.',
  },
]

export default function GutlySection() {
  return (
    <section id="gutly" className={styles.section}>
      <div className={styles.inner}>

        <div className={styles.layout}>

          {/* ── Left: copy ── */}
          <div className={styles.copy}>
            <span className={styles.label}>Included with every test</span>
            <h2 className={styles.title}>
              Meet <em>Gutly</em> —<br />
              your gut health AI
            </h2>
            <p className={styles.sub}>
              Gutly is our proprietary AI assistant trained on thousands of peer-reviewed
              microbiome studies. Ask it anything about your results and it answers with
              the science to back it up.
            </p>

            <ul className={styles.pillars}>
              {PILLARS.map(p => (
                <li key={p.title} className={styles.pillar}>
                  <div className={styles.pillarDot} />
                  <div>
                    <div className={styles.pillarTitle}>{p.title}</div>
                    <div className={styles.pillarBody}>{p.body}</div>
                  </div>
                </li>
              ))}
            </ul>

            <div className={styles.cta}>
              <a href="#pricing" className={styles.btnPrimary}>Get access with your kit</a>
              <span className={styles.ctaNote}>Gutly is included in every ABC Gut test</span>
            </div>
          </div>

          {/* ── Right: mock chat ── */}
          <div className={styles.chatWrap}>
            <div className={styles.chatWindow}>
              <div className={styles.chatHeader}>
                <div className={styles.chatHeaderDot} />
                <span className={styles.chatHeaderName}>Gutly</span>
                <span className={styles.chatHeaderTag}>AI · science-backed</span>
              </div>

              <div className={styles.chatBody}>
                {EXAMPLE_MESSAGES.map((msg, i) => (
                  <div
                    key={i}
                    className={`${styles.msg} ${msg.role === 'user' ? styles.msgUser : styles.msgAi}`}
                  >
                    {msg.role === 'ai' && (
                      <div className={styles.msgAvatar}>G</div>
                    )}
                    <div className={styles.msgBubble}>
                      <p>{msg.text}</p>
                      {msg.cite && (
                        <div className={styles.cite}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                          </svg>
                          {msg.cite}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.chatInput}>
                <span>Ask about your results…</span>
                <div className={styles.chatSend}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* floating badge */}
            <div className={styles.badge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Answers grounded in published research
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
