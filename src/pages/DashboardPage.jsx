import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserReports } from '../data/db'
import styles from './DashboardPage.module.css'

function ScoreRing({ score }) {
  const r = 40
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  return (
    <svg width="96" height="96" viewBox="0 0 96 96">
      <circle cx="48" cy="48" r={r} fill="none" stroke="#e8f2e4" strokeWidth="7" />
      <circle
        cx="48" cy="48" r={r} fill="none"
        stroke="#4a9e3f" strokeWidth="7"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 48 48)"
      />
    </svg>
  )
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [reports, setReports] = useState([])

  useEffect(() => {
    if (user) setReports(getUserReports(user.id))
  }, [user])

  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarInner}>
          <Link to="/" className={styles.brand}>
            <span className={styles.brandDot} />
            <span className={styles.brandName}>ABC Gut</span>
          </Link>

          <nav className={styles.sideNav}>
            <Link to="/dashboard" className={`${styles.sideLink} ${styles.sideLinkActive}`}>
              <span className={styles.sideLinkIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
              </span>
              Dashboard
            </Link>
            <Link to="/chat" className={styles.sideLink}>
              <span className={styles.sideLinkIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </span>
              Ask Gutly
            </Link>
          </nav>

          <div className={styles.sidebarFooter}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>{user?.name?.[0] || '?'}</div>
              <div>
                <div className={styles.userName}>{user?.name}</div>
                <div className={styles.userEmail}>{user?.email}</div>
              </div>
            </div>
            <button className={styles.signOut} onClick={logout}>Sign Out</button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className={styles.main}>
        <div className={styles.topBar}>
          <div>
            <h1 className={styles.welcome}>Welcome back, {firstName}</h1>
            <p className={styles.welcomeSub}>Here's your gut health overview.</p>
          </div>
          <Link to="/chat" className={styles.gutlyBtn}>
            <span className={styles.gutlyDot} />
            Ask Gutly
          </Link>
        </div>

        {/* Reports section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Your Reports</h2>
            <span className={styles.sectionCount}>{reports.length} report{reports.length !== 1 ? 's' : ''}</span>
          </div>

          {reports.length === 0 ? (
            <div className={styles.empty}>
              <p>No reports yet. Your report will appear here once your sample has been processed.</p>
              <a href="/#pricing" className={styles.emptyBtn}>Order a Test</a>
            </div>
          ) : (
            <div className={styles.reportGrid}>
              {reports.map(report => (
                <div key={report.id} className={styles.reportCard}>
                  <div className={styles.reportCardLeft}>
                    <div className={styles.reportScore}>
                      <ScoreRing score={report.score} />
                      <div className={styles.reportScoreText}>
                        <span className={styles.reportScoreNum}>{report.score}</span>
                        <span className={styles.reportScoreDenom}>/ 100</span>
                      </div>
                    </div>
                    <div className={styles.reportMeta}>
                      <div className={styles.reportTitle}>{report.title}</div>
                      <div className={styles.reportDates}>
                        <span>Sample collected: {report.collectionDate}</span>
                        <span className={styles.metaDot} />
                        <span>Report issued: {report.reportDate}</span>
                      </div>
                      <div className={styles.reportIds}>
                        <span>Sample ID: {report.sampleId}</span>
                        <span className={styles.metaDot} />
                        <span>Client ID: {report.clientId}</span>
                      </div>
                      <span className={styles.reportBadge}>Complete</span>
                    </div>
                  </div>
                  <div className={styles.reportCardRight}>
                    <Link to={`/report/${report.id}`} className={styles.viewBtn}>
                      View Report
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </Link>
                    <a
                      href={report.file}
                      download={`ABC-Gut-Report-${report.sampleId}.html`}
                      className={styles.downloadBtn}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Next steps */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Recommended Next Steps</h2>
          <div className={styles.nextGrid}>
            <div className={styles.nextCard}>
              <div className={styles.nextNum}>01</div>
              <div className={styles.nextText}>
                <div className={styles.nextTitle}>Review your report</div>
                <div className={styles.nextBody}>Read through your full report and familiarize yourself with your Gut Wellness Score and key findings.</div>
              </div>
            </div>
            <div className={styles.nextCard}>
              <div className={styles.nextNum}>02</div>
              <div className={styles.nextText}>
                <div className={styles.nextTitle}>Start your action plan</div>
                <div className={styles.nextBody}>Implement the top 3 recommendations from your report. Focus on butyrate production first.</div>
              </div>
            </div>
            <div className={styles.nextCard}>
              <div className={styles.nextNum}>03</div>
              <div className={styles.nextText}>
                <div className={styles.nextTitle}>Ask Gutly anything</div>
                <div className={styles.nextBody}>Our AI assistant can explain any finding in your report, suggest foods, and answer your gut health questions.</div>
              </div>
            </div>
            <div className={styles.nextCard}>
              <div className={styles.nextNum}>04</div>
              <div className={styles.nextText}>
                <div className={styles.nextTitle}>Schedule your retest</div>
                <div className={styles.nextBody}>We recommend retesting in 8–12 weeks to measure progress. Order your next kit when you're ready.</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
