import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Navbar.module.css'

const NAV_LINKS = [
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'What You Get', href: '/#features' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Science', href: '/#science' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { user } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [location])

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <nav className={styles.nav}>
        <Link to={user ? '/dashboard' : '/'} className={styles.brand}>
          <span className={styles.brandDot} />
          <span className={styles.brandName}>ABC Gut</span>
        </Link>

        {!user && (
          <ul className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a href={href} className={styles.link}>{label}</a>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.actions}>
          {user ? (
            <>
              <Link to="/" className={styles.btnGhost}>Home</Link>
              <Link to="/dashboard" className={styles.btnGhost}>Dashboard</Link>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.btnGhost}>Sign In</Link>
              <a href="/#pricing" className={styles.btnOutline}>Get Your Kit</a>
            </>
          )}
          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>
    </header>
  )
}
