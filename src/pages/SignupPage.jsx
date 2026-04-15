import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './SignupPage.module.css'

const API = 'https://api.abcgut.com'

async function recordSignup(name, email, plan) {
  try {
    await fetch(`${API}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, plan: plan || '' }),
    })
  } catch {
    // non-blocking — local account still created
  }
}

const PLANS = [
  {
    id: 'kit',
    name: 'Test Kit',
    cadence: 'Single test · one-time',
    price: '$205',
    features: [
      'Complete gut DNA sequencing',
      'Gut Wellness Score (0–100)',
      'SCFA functional analysis',
      '6 disease risk panels',
      'Gutly AI access included',
    ],
  },
  {
    id: 'annual',
    name: 'Annual Subscription',
    cadence: '4 tests/year · billed annually',
    price: '$615/yr',
    priceNote: '~$154/test — save 25%',
    badge: 'Best Value',
    features: [
      '4 tests per year',
      'Progress comparison across tests',
      'Longitudinal trend tracking',
      'Priority lab processing',
      'Gutly AI access included',
    ],
  },
]

export default function SignupPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const initialPlan = searchParams.get('plan') === 'annual' ? 'annual' : 'kit'

  const [mode, setMode] = useState('buy') // 'buy' | 'code'
  const [selectedPlan, setSelectedPlan] = useState(initialPlan)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function switchMode(next) {
    setMode(next)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'buy') {
      const plan = PLANS.find(p => p.id === selectedPlan)
      const result = register(name.trim(), email.trim(), password, plan.name, null)
      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }
      await recordSignup(name.trim(), email.trim(), plan.name)
      // TODO: redirect to Stripe checkout when payment is integrated
      navigate('/dashboard')
    } else {
      const result = register(name.trim(), email.trim(), password, null, code.trim())
      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }
      await recordSignup(name.trim(), email.trim(), result.user?.plan || '')
      navigate('/dashboard')
    }

    setLoading(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandDot} />
          <span className={styles.brandName}>ABC Gut</span>
        </Link>

        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.sub}>Get access to your gut health report and Gutly AI.</p>

        {/* Mode toggle */}
        <div className={styles.toggle}>
          <button
            type="button"
            className={`${styles.toggleBtn} ${mode === 'buy' ? styles.toggleActive : ''}`}
            onClick={() => switchMode('buy')}
          >
            Buy a plan
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${mode === 'code' ? styles.toggleActive : ''}`}
            onClick={() => switchMode('code')}
          >
            I have a code
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>

          {/* ── Buy a plan: plan selector ── */}
          {mode === 'buy' && (
            <div className={styles.plans}>
              {PLANS.map(plan => (
                <button
                  key={plan.id}
                  type="button"
                  className={`${styles.planCard} ${selectedPlan === plan.id ? styles.planSelected : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.badge && <span className={styles.planBadge}>{plan.badge}</span>}
                  <div className={styles.planName}>{plan.name}</div>
                  <div className={styles.planPrice}>{plan.price}</div>
                  <div className={styles.planCadence}>{plan.cadence}</div>
                  {plan.priceNote && <div className={styles.planNote}>{plan.priceNote}</div>}
                  <ul className={styles.planFeatures}>
                    {plan.features.map(f => (
                      <li key={f}><span className={styles.check}>✓</span>{f}</li>
                    ))}
                  </ul>
                  <div className={styles.planSelect}>
                    {selectedPlan === plan.id ? 'Selected' : 'Select'}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ── Redeem code: code input ── */}
          {mode === 'code' && (
            <div className={styles.codeSection}>
              <div className={styles.codeIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M9 9h.01M15 9h.01M9 15h.01M15 15h.01M12 12h.01"/>
                </svg>
              </div>
              <p className={styles.codeHint}>
                Enter the redemption code found on the insert inside your ABC Gut box, purchased at Walgreens or CVS.
              </p>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="code">Redemption Code</label>
                <input
                  id="code"
                  className={`${styles.input} ${styles.codeInput}`}
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="ABCGUT-XXXX-XXXX"
                  autoComplete="off"
                  spellCheck={false}
                  required
                />
              </div>
            </div>
          )}

          {/* ── Common: account details ── */}
          <div className={styles.divider}><span>Your account details</span></div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="name">Full Name</label>
              <input
                id="name"
                className={styles.input}
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jane Smith"
                autoComplete="name"
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              className={styles.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              className={styles.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.btn} type="submit" disabled={loading}>
            {loading
              ? 'Creating account…'
              : mode === 'buy'
                ? 'Create account & continue to checkout'
                : 'Activate & create account'}
          </button>

          {mode === 'buy' && (
            <p className={styles.payNote}>
              You'll be taken to secure checkout after creating your account. FSA/HSA eligible.
            </p>
          )}
        </form>

        <p className={styles.hint}>
          Already have an account?{' '}
          <Link to="/login" className={styles.hintLink}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
