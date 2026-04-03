import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [location])

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandDot} />
          <span className={styles.brandName}>ABC Gut</span>
        </Link>

        <ul className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a href={href} className={styles.link}>{label}</a>
            </li>
          ))}
          <li>
            <Link to="/chat" className={styles.link}>Ask AI</Link>
          </li>
        </ul>

        <div className={styles.actions}>
          <a href="/#pricing" className={styles.btnOutline}>Get Your Kit</a>
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
