// ============================================================
// LOCAL DATABASE — localStorage-based
// TODO: replace all functions here with API calls when
//       the backend server is ready. The call signatures
//       can stay the same; just swap the bodies.
// ============================================================

const DB_KEY = 'abcgut_db'

// Initial seed data — runs once on first load
const SEED = {
  users: [
    {
      id: 'usr_001',
      email: 'rbharathwaj2003@gmail.com',
      // NOTE: never store plain-text passwords in production —
      //       hashing must happen server-side
      password: 'abcguttest',
      name: 'Bharathwaj R',
      plan: 'Before & After',
      joinDate: '2026-04-01',
      reportIds: ['rpt_001'],
    },
  ],
  reports: [
    {
      id: 'rpt_001',
      userId: 'usr_001',
      title: 'Comprehensive Microbiome & Systems Health Report',
      collectionDate: '2026-03-25',
      reportDate: '2026-04-01',
      sampleId: 'ABG-2026-0001',
      clientId: 'CLT-2026-001',
      file: '/reports/ABC_Gut_Report.html',
      score: 78,
      status: 'complete',
    },
  ],
}

function getDb() {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (!raw) {
      localStorage.setItem(DB_KEY, JSON.stringify(SEED))
      return structuredClone(SEED)
    }
    return JSON.parse(raw)
  } catch {
    return structuredClone(SEED)
  }
}

function saveDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

// ── Auth ──────────────────────────────────────────────────

export function findUser(email, password) {
  const db = getDb()
  const user = db.users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  )
  if (!user) return null
  // Return a safe copy without the password
  const { password: _pw, ...safeUser } = user
  return safeUser
}

// ── Reports ───────────────────────────────────────────────

export function getUserReports(userId) {
  const db = getDb()
  const user = db.users.find(u => u.id === userId)
  if (!user) return []
  return db.reports.filter(r => user.reportIds.includes(r.id))
}

export function getReport(reportId) {
  const db = getDb()
  return db.reports.find(r => r.id === reportId) || null
}

// ── Registration ──────────────────────────────────────────

export function registerUser({ name, email, password }) {
  const db = getDb()
  if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { error: 'An account with this email already exists.' }
  }
  const newUser = {
    id: `usr_${Date.now()}`,
    email,
    password, // TODO: hash server-side
    name,
    plan: null,
    joinDate: new Date().toISOString().slice(0, 10),
    reportIds: [],
  }
  db.users.push(newUser)
  saveDb(db)
  const { password: _pw, ...safeUser } = newUser
  return { user: safeUser }
}
