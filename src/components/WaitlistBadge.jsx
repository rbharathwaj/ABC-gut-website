import { useState } from 'react'
import s from './WaitlistBadge.module.css'

export default function WaitlistBadge() {
  const [open, setOpen]         = useState(false)
  const [firstName, setFirst]   = useState('')
  const [lastName, setLast]     = useState('')
  const [email, setEmail]       = useState('')
  const [submitted, setSubmit]  = useState(false)

  function handleClose() {
    setOpen(false); setSubmit(false)
    setFirst(''); setLast(''); setEmail('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    // TODO: wire to backend / email service
    console.log('Waitlist signup:', { firstName, lastName, email })
    setSubmit(true)
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
              <button className={s.submit} type="submit">Request Early Access</button>
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
