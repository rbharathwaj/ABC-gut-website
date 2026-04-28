import { useState, useEffect } from 'react'
import s from './WaitlistBadge.module.css'

const API = 'https://api.abcgut.com'

export default function WaitlistBadge() {
  const [open, setOpen]         = useState(false)
  const [firstName, setFirst]   = useState('')
  const [lastName, setLast]     = useState('')
  const [email, setEmail]       = useState('')
  const [submitted, setSubmit]  = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('open-waitlist', handler)
    return () => window.removeEventListener('open-waitlist', handler)
  }, [])

  function handleClose() {
    setOpen(false); setSubmit(false)
    setFirst(''); setLast(''); setEmail(''); setError('')
  }

  const SHEETS_URL = 'https://script.google.com/macros/s/AKfycby4wyEo6yToiXSFieSweI-PE5VwsVoQFxcR1UTiuryoL2QtxluuHh10neuk6SjVkyjD5A/exec'

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')
    try {
      // Save to Oracle server DB
      fetch(`${API}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email }),
      }).catch(() => {})

      // Save to Google Sheet
      const params = new URLSearchParams({ first_name: firstName, last_name: lastName, email })
      await fetch(`${SHEETS_URL}?${params}`, { mode: 'no-cors' })
      setSubmit(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={s.badge}>
      {open && (
        <div className={s.card}>
          <button className={s.close} onClick={handleClose}>✕</button>
          <p className={s.cardTitle}>Join the Beta Pilot</p>
          <p className={s.cardSub}>Be among the first to get your personalised gut health report.</p>
          {submitted ? (
            <p className={s.success}>You're on the list! We'll be in touch.</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className={s.nameRow}>
                <input
                  className={s.input}
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={e => setFirst(e.target.value)}
                  required
                />
                <input
                  className={s.input}
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={e => setLast(e.target.value)}
                  required
                />
              </div>
              <input
                className={s.input}
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              {error && <p className={s.error}>{error}</p>}
              <button className={s.submit} type="submit" disabled={loading}>
                {loading ? 'Submitting…' : 'Request Early Access'}
              </button>
            </form>
          )}
        </div>
      )}

      <button className={s.trigger} onClick={() => setOpen(o => !o)}>
        <span className={s.dot} />
        Join Beta Pilot
      </button>
    </div>
  )
}
