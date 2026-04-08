import { useState, useRef, useEffect } from 'react'
import styles from './ChatBot.module.css'

const SUGGESTED = [
  'What does my Gut Wellness Score mean?',
  'How can I increase my butyrate levels?',
  'What is Akkermansia muciniphila?',
  'How long until I see results?',
  'What foods support Bifidobacterium?',
  'Is shotgun sequencing better than 16S?',
]

// Stub responses — replace with real API call when backend is ready
function getStubResponse(message) {
  const lower = message.toLowerCase()
  if (lower.includes('butyrate'))
    return 'Butyrate is a short-chain fatty acid produced by your gut bacteria when they ferment dietary fiber. It\'s the primary fuel for colonocytes (colon cells) and is critical for gut barrier integrity, inflammation control, and even colon cancer prevention. The best way to raise butyrate is to increase resistant starch intake (15–30g/day) from foods like slightly underripe bananas, cooled cooked potatoes, and legumes. Inulin-rich foods (garlic, asparagus, chicory root) also feed the bacteria that produce butyrate.'
  if (lower.includes('akkermansia'))
    return 'Akkermansia muciniphila is one of the most-studied bacteria in microbiome science. It lives in your gut\'s mucus layer and is strongly associated with metabolic health, insulin sensitivity, and a healthy gut barrier. Levels above 1% are generally considered beneficial — truly excellent levels (like 25%+) are associated with reduced risk of metabolic disease and better responses to immunotherapy. To support Akkermansia: consume polyphenol-rich foods (pomegranate, cranberry, green tea) and prebiotic fibers.'
  if (lower.includes('score') || lower.includes('wellness'))
    return 'Your Gut Wellness Score (0–100) is a composite metric integrating four equally-weighted pillars: probiotic abundance, commensal balance, pathobiont control, and functional capacity (SCFAs, neurotransmitter pathways). A score of 70–84 is "Good — Room for Optimization." Scores above 85 are considered Optimal. The score updates with each retest so you can track your progress over time.'
  if (lower.includes('bifidobacterium') || lower.includes('bifido'))
    return 'Bifidobacterium is a key probiotic genus critical for immune regulation, B-vitamin synthesis, and gut barrier support. Levels typically decline with age. To restore Bifidobacterium: take a multi-strain probiotic (B. longum, B. breve, B. infantis at 10B+ CFU/day), eat GOS prebiotic (5g/day), include kefir or yogurt daily, and eliminate artificial sweeteners — saccharin, aspartame, and sucralose directly reduce Bifidobacterium abundance.'
  if (lower.includes('16s') || lower.includes('shotgun'))
    return 'Yes — significantly. 16S rRNA sequencing reads only a small marker gene (~500 base pairs) and can identify roughly 80% of bacteria, often only to genus level. Shotgun metagenomic sequencing reads all the DNA in your sample — bacterial, fungal, viral, and archaeal — and can identify species-level taxonomy plus functional genes (what your microbes are actually doing). It\'s the method used by academic research institutions including the NIH Human Microbiome Project.'
  if (lower.includes('how long') || lower.includes('results'))
    return 'Lab processing takes 2–3 weeks from sample receipt. Most clients start noticing subjective improvements (energy, digestion, mood) within 4 weeks of implementing their action plan. Measurable microbiome changes — confirmed by retest — typically occur within 8–12 weeks of targeted dietary and supplement interventions. Significant shifts in butyrate levels and Bifidobacterium are usually visible at the 8-week retest.'
  return 'That\'s a great question about gut health. Our AI assistant will be fully operational soon. In the meantime, our team at support@abcgut.com can answer detailed questions about your microbiome, test results, or recommendations. You can also explore our science section for evidence-based information on key gut health markers.'
}

// triggerMessage: { text: string, id: number } — when id changes, the message is auto-sent
export default function ChatBot({ triggerMessage }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hi! I\'m Gutly, your ABC Gut AI assistant. I can help you understand your microbiome, interpret your results, and explain what the science says. What would you like to know?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Auto-send when a tooltip's "Ask Gutly" button is clicked
  useEffect(() => {
    if (triggerMessage?.text && triggerMessage?.id) {
      sendMessage(triggerMessage.text)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerMessage?.id])

  function sendMessage(text) {
    if (!text.trim()) return
    const userMsg = { role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    fetch('https://takeapeek-abcgutwebsite.hf.space/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: text }),
    })
      .then(r => r.json())
      .then(data => {
        const sources = data.sources?.length
          ? `\n\nSources: ${data.sources.join(', ')}`
          : ''
        setMessages(prev => [...prev, { role: 'assistant', text: data.answer + sources }])
        setLoading(false)
      })
      .catch(() => {
        setMessages(prev => [...prev, { role: 'assistant', text: getStubResponse(text) }])
        setLoading(false)
      })
  }

  function handleSubmit(e) {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className={styles.chat}>
      <div className={styles.messages}>
        {messages.map((m, i) => (
          <div key={i} className={`${styles.bubble} ${m.role === 'user' ? styles.bubbleUser : styles.bubbleBot}`}>
            {m.role === 'assistant' && (
              <div className={styles.avatar}>
                <span className={styles.avatarDot} />
              </div>
            )}
            <div className={styles.bubbleText}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div className={`${styles.bubble} ${styles.bubbleBot}`}>
            <div className={styles.avatar}><span className={styles.avatarDot} /></div>
            <div className={styles.typing}>
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div className={styles.suggested}>
          <p className={styles.suggestedLabel}>Try asking:</p>
          <div className={styles.chips}>
            {SUGGESTED.map(s => (
              <button key={s} className={styles.chip} onClick={() => sendMessage(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          type="text"
          placeholder="Ask Gutly about your gut health..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button className={styles.send} type="submit" disabled={loading || !input.trim()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  )
}
