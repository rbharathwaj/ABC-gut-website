import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAllUsers, getAllCodes, addReport, addCodes, deleteUser } from '../data/db'
import styles from './AdminPage.module.css'

const EMPTY_REPORT_FORM = {
  title: 'Comprehensive Microbiome & Systems Health Report',
  sampleId: '',
  clientId: '',
  collectionDate: '',
  reportDate: new Date().toISOString().slice(0, 10),
  score: '',
}

// ── Stat card ────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }) {
  return (
    <div className={`${styles.statCard} ${accent ? styles.statAccent : ''}`}>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────
export default function AdminPage() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState([])
  const [codes, setCodes] = useState([])
  const [search, setSearch] = useState('')
  const [uploadTarget, setUploadTarget] = useState(null) // user object
  const [reportForm, setReportForm] = useState(EMPTY_REPORT_FORM)
  const [fileDataUrl, setFileDataUrl] = useState(null)
  const [fileName, setFileName] = useState('')
  const [submitMsg, setSubmitMsg] = useState('')
  const [submitErr, setSubmitErr] = useState('')
  const [addCodeText, setAddCodeText] = useState('')
  const [addCodeMsg, setAddCodeMsg] = useState('')
  const fileInputRef = useRef(null)

  function reload() {
    setUsers(getAllUsers())
    setCodes(getAllCodes())
  }

  useEffect(reload, [])

  // ── Stats ──
  const totalUsers = users.length
  const usersWithReports = users.filter(u => u.reportCount > 0).length
  const pendingReports = users.filter(u => u.reportCount === 0).length
  const codesUsed = codes.filter(c => c.used).length
  const codesAvailable = codes.filter(c => !c.used).length

  // ── File picker ──
  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = ev => setFileDataUrl(ev.target.result)
    reader.readAsDataURL(file)
  }

  // ── Report upload submit ──
  function handleReportSubmit(e) {
    e.preventDefault()
    setSubmitErr('')
    setSubmitMsg('')
    if (!uploadTarget) return
    const result = addReport(uploadTarget.id, { ...reportForm, fileDataUrl })
    if (result.error) {
      setSubmitErr(result.error)
    } else {
      setSubmitMsg(`Report uploaded for ${uploadTarget.name}.`)
      setUploadTarget(null)
      setReportForm(EMPTY_REPORT_FORM)
      setFileDataUrl(null)
      setFileName('')
      reload()
    }
  }

  function handleDeleteUser(u) {
    if (!window.confirm(`Delete ${u.name} (${u.email})? This also removes their reports.`)) return
    deleteUser(u.id)
    reload()
  }

  function openUpload(u) {
    setUploadTarget(u)
    setReportForm(EMPTY_REPORT_FORM)
    setFileDataUrl(null)
    setFileName('')
    setSubmitErr('')
    setSubmitMsg('')
  }

  // ── Add codes ──
  function handleAddCodes(e) {
    e.preventDefault()
    setAddCodeMsg('')
    const lines = addCodeText.trim().split('\n').map(l => l.trim()).filter(Boolean)
    if (!lines.length) return
    const newCodes = lines.map(l => ({ code: l, plan: 'Test Kit' }))
    const result = addCodes(newCodes)
    setAddCodeMsg(`Added ${result.count} code${result.count !== 1 ? 's' : ''}.`)
    setAddCodeText('')
    reload()
  }

  // ── Filtered users ──
  const filteredUsers = users.filter(u =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const signupMethod = u => {
    // Heuristic: if plan is 'Test Kit' and reportCount is 0, likely code-based
    // In a real app this would be stored on the user record
    return u.plan ? u.plan : '—'
  }

  return (
    <div className={styles.page}>

      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarInner}>
          <Link to="/" className={styles.brand}>
            <span className={styles.brandDot} />
            <span className={styles.brandName}>ABC Gut</span>
          </Link>
          <div className={styles.sidebarLabel}>Admin</div>
          <nav className={styles.sideNav}>
            <button
              className={`${styles.sideBtn} ${tab === 'users' ? styles.sideBtnActive : ''}`}
              onClick={() => setTab('users')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Users
            </button>
            <button
              className={`${styles.sideBtn} ${tab === 'codes' ? styles.sideBtnActive : ''}`}
              onClick={() => setTab('codes')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M9 9h.01M15 9h.01M9 15h.01M15 15h.01M12 12h.01"/>
              </svg>
              Codes
            </button>
          </nav>
          <div className={styles.sidebarFooter}>
            <div className={styles.adminBadge}>Admin</div>
            <div className={styles.adminEmail}>{user?.email}</div>
            <button className={styles.signOut} onClick={logout}>Sign Out</button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className={styles.main}>
        <div className={styles.topBar}>
          <div>
            <h1 className={styles.pageTitle}>Admin Panel</h1>
            <p className={styles.pageSub}>Manage users, upload reports, and track codes.</p>
          </div>
          <Link to="/dashboard" className={styles.viewSiteBtn}>View Dashboard</Link>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          <StatCard label="Total Users" value={totalUsers} />
          <StatCard label="Reports Uploaded" value={usersWithReports} sub={`${pendingReports} pending`} />
          <StatCard label="Codes Used" value={codesUsed} accent />
          <StatCard label="Codes Available" value={codesAvailable} />
        </div>

        {submitMsg && <div className={styles.globalSuccess}>{submitMsg}</div>}

        {/* ── Users tab ── */}
        {tab === 'users' && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Users ({filteredUsers.length})</h2>
              <input
                className={styles.search}
                type="search"
                placeholder="Search by name or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Plan</th>
                    <th>Joined</th>
                    <th>Reports</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={7} className={styles.emptyRow}>No users found.</td></tr>
                  )}
                  {filteredUsers.map(u => (
                    <tr key={u.id} className={styles.row}>
                      <td className={styles.tdName}>{u.name}</td>
                      <td className={styles.tdEmail}>{u.email}</td>
                      <td>
                        {u.plan
                          ? <span className={styles.planBadge}>{u.plan}</span>
                          : <span className={styles.noPlan}>—</span>}
                      </td>
                      <td className={styles.tdDate}>{u.joinDate}</td>
                      <td>
                        <span className={u.reportCount > 0 ? styles.hasReports : styles.noReports}>
                          {u.reportCount} report{u.reportCount !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td>
                        {u.role === 'admin'
                          ? <span className={styles.adminTag}>Admin</span>
                          : <span className={styles.userTag}>User</span>}
                      </td>
                      <td className={styles.actionsCell}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => openUpload(u)}
                        >
                          Upload Report
                        </button>
                        {u.role !== 'admin' && (
                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleDeleteUser(u)}
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Upload Report panel ── */}
            {uploadTarget && (
              <div className={styles.uploadPanel}>
                <div className={styles.uploadPanelHeader}>
                  <div>
                    <div className={styles.uploadPanelTitle}>Upload Report</div>
                    <div className={styles.uploadPanelSub}>For: <strong>{uploadTarget.name}</strong> ({uploadTarget.email})</div>
                  </div>
                  <button className={styles.closeBtn} onClick={() => setUploadTarget(null)}>✕</button>
                </div>

                <form className={styles.uploadForm} onSubmit={handleReportSubmit}>
                  <div className={styles.uploadGrid}>
                    <div className={styles.field}>
                      <label className={styles.label}>Report Title</label>
                      <input
                        className={styles.input}
                        type="text"
                        value={reportForm.title}
                        onChange={e => setReportForm(f => ({ ...f, title: e.target.value }))}
                        required
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Gut Wellness Score (0–100)</label>
                      <input
                        className={styles.input}
                        type="number"
                        min="0"
                        max="100"
                        value={reportForm.score}
                        onChange={e => setReportForm(f => ({ ...f, score: e.target.value }))}
                        placeholder="e.g. 78"
                        required
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Sample ID</label>
                      <input
                        className={styles.input}
                        type="text"
                        value={reportForm.sampleId}
                        onChange={e => setReportForm(f => ({ ...f, sampleId: e.target.value }))}
                        placeholder="ABG-2026-0001"
                        required
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Client ID</label>
                      <input
                        className={styles.input}
                        type="text"
                        value={reportForm.clientId}
                        onChange={e => setReportForm(f => ({ ...f, clientId: e.target.value }))}
                        placeholder="CLT-2026-001"
                        required
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Collection Date</label>
                      <input
                        className={styles.input}
                        type="date"
                        value={reportForm.collectionDate}
                        onChange={e => setReportForm(f => ({ ...f, collectionDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Report Date</label>
                      <input
                        className={styles.input}
                        type="date"
                        value={reportForm.reportDate}
                        onChange={e => setReportForm(f => ({ ...f, reportDate: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  {/* File upload */}
                  <div className={styles.fileDrop} onClick={() => fileInputRef.current?.click()}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".html,.htm,.pdf"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    {fileName
                      ? <span className={styles.fileSelected}>{fileName}</span>
                      : <span>Click to upload HTML or PDF report</span>}
                  </div>

                  {submitErr && <p className={styles.error}>{submitErr}</p>}

                  <div className={styles.uploadActions}>
                    <button type="button" className={styles.cancelBtn} onClick={() => setUploadTarget(null)}>
                      Cancel
                    </button>
                    <button type="submit" className={styles.submitBtn}>
                      Upload & Assign Report
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>
        )}

        {/* ── Codes tab ── */}
        {tab === 'codes' && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Redemption Codes ({codes.length})</h2>
              <div className={styles.codeSummary}>
                <span className={styles.codeAvailBadge}>{codesAvailable} available</span>
                <span className={styles.codeUsedBadge}>{codesUsed} used</span>
              </div>
            </div>

            {/* Add codes form */}
            <div className={styles.addCodesBox}>
              <div className={styles.addCodesTitle}>Add New Codes</div>
              <p className={styles.addCodesHint}>One code per line. They will be saved as Test Kit redemption codes.</p>
              <form onSubmit={handleAddCodes} className={styles.addCodesForm}>
                <textarea
                  className={styles.codeTextarea}
                  rows={4}
                  placeholder={'ABCGUT-WALG-0010\nABCGUT-CVS-0010'}
                  value={addCodeText}
                  onChange={e => setAddCodeText(e.target.value)}
                />
                <button type="submit" className={styles.submitBtn}>Add Codes</button>
              </form>
              {addCodeMsg && <p className={styles.addCodeMsg}>{addCodeMsg}</p>}
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Used By</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map(c => (
                    <tr key={c.code} className={styles.row}>
                      <td className={styles.codeCell}>{c.code}</td>
                      <td>{c.plan}</td>
                      <td>
                        {c.used
                          ? <span className={styles.usedBadge}>Redeemed</span>
                          : <span className={styles.availBadge}>Available</span>}
                      </td>
                      <td>{c.usedByName || '—'}</td>
                      <td className={styles.tdEmail}>{c.usedByEmail || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
