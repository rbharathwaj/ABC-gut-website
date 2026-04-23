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
      role: 'admin',
      plan: 'Before & After',
      joinDate: '2026-04-01',
      reportIds: ['rpt_001'],
    },
    {
      id: 'usr_002',
      email: 'test@abcgut.com',
      password: 'test@abcgut',
      name: 'Test User',
      role: 'user',
      plan: 'Test Kit',
      joinDate: '2026-04-22',
      reportIds: ['rpt_002'],
    },
  ],
  // Redemption codes for physical kits sold at Walgreens/CVS
  // TODO: generate and validate these server-side in production
  codes: [
    { code: 'ABCGUT-WALG-0001', plan: 'Test Kit', used: false, usedBy: null },
    { code: 'ABCGUT-WALG-0002', plan: 'Test Kit', used: false, usedBy: null },
    { code: 'ABCGUT-WALG-0003', plan: 'Test Kit', used: false, usedBy: null },
    { code: 'ABCGUT-CVS-0001',  plan: 'Test Kit', used: false, usedBy: null },
    { code: 'ABCGUT-CVS-0002',  plan: 'Test Kit', used: false, usedBy: null },
    { code: 'ABCGUT-CVS-0003',  plan: 'Test Kit', used: false, usedBy: null },
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
    {
      id: 'rpt_002',
      userId: 'usr_002',
      title: 'Comprehensive Microbiome & Systems Health Report',
      collectionDate: '2026-03-25',
      reportDate: '2026-04-01',
      sampleId: 'ABG-2026-0002',
      clientId: 'CLT-2026-002',
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
    const db = JSON.parse(raw)

    // ── Migrations ────────────────────────────────────────────
    // Run each time to patch existing DBs that are missing new fields.
    let dirty = false

    // Ensure codes array exists
    if (!db.codes) {
      db.codes = structuredClone(SEED.codes)
      dirty = true
    }

    // Ensure the seed admin user has role: 'admin'
    const adminUser = db.users.find(u => u.id === 'usr_001')
    if (adminUser && !adminUser.role) {
      adminUser.role = 'admin'
      dirty = true
    }

    // Ensure test user and their report exist
    if (!db.users.find(u => u.id === 'usr_002')) {
      db.users.push(structuredClone(SEED.users[1]))
      dirty = true
    }
    if (!db.reports.find(r => r.id === 'rpt_002')) {
      db.reports.push(structuredClone(SEED.reports[1]))
      dirty = true
    }

    if (dirty) saveDb(db)
    return db
  } catch {
    return structuredClone(SEED)
  }
}

function saveDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

// ── Auth ──────────────────────────────────────────────────

export function getUserById(id) {
  const db = getDb()
  const user = db.users.find(u => u.id === id)
  if (!user) return null
  const { password: _pw, ...safeUser } = user
  return safeUser
}

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

export function validateCode(code) {
  const db = getDb()
  const normalized = code.toUpperCase().trim()
  const entry = (db.codes || []).find(c => c.code === normalized)
  if (!entry) return { error: 'Code not found. Check for typos and try again.' }
  if (entry.used) return { error: 'This code has already been redeemed.' }
  return { plan: entry.plan }
}

export function registerUser({ name, email, password, plan, code }) {
  const db = getDb()
  if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { error: 'An account with this email already exists.' }
  }

  // If registering with a redemption code, validate it before creating the account
  let resolvedPlan = plan || null
  if (code) {
    const normalized = code.toUpperCase().trim()
    const entry = (db.codes || []).find(c => c.code === normalized)
    if (!entry) return { error: 'Invalid redemption code. Check for typos and try again.' }
    if (entry.used) return { error: 'This code has already been redeemed.' }
    resolvedPlan = entry.plan
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    email,
    password, // TODO: hash server-side
    name,
    plan: resolvedPlan,
    joinDate: new Date().toISOString().slice(0, 10),
    reportIds: [],
  }
  db.users.push(newUser)

  // Mark the code as used
  if (code && db.codes) {
    const entry = db.codes.find(c => c.code === code.toUpperCase().trim())
    if (entry) {
      entry.used = true
      entry.usedBy = newUser.id
    }
  }

  saveDb(db)
  const { password: _pw, ...safeUser } = newUser
  return { user: safeUser }
}

// ── Admin ─────────────────────────────────────────────────

export function getAllUsers() {
  const db = getDb()
  return db.users.map(({ password: _pw, ...u }) => ({
    ...u,
    reportCount: (u.reportIds || []).length,
  }))
}

export function getAllCodes() {
  const db = getDb()
  const users = db.users
  return (db.codes || []).map(c => {
    const usedByUser = c.usedBy ? users.find(u => u.id === c.usedBy) : null
    return {
      ...c,
      usedByName: usedByUser?.name || null,
      usedByEmail: usedByUser?.email || null,
    }
  })
}

export function addReport(userId, { title, sampleId, clientId, collectionDate, reportDate, score, fileDataUrl }) {
  const db = getDb()
  const user = db.users.find(u => u.id === userId)
  if (!user) return { error: 'User not found.' }

  const report = {
    id: `rpt_${Date.now()}`,
    userId,
    title: title || 'Gut Health Report',
    collectionDate: collectionDate || new Date().toISOString().slice(0, 10),
    reportDate: reportDate || new Date().toISOString().slice(0, 10),
    sampleId: sampleId || `ABG-${Date.now()}`,
    clientId: clientId || `CLT-${Date.now()}`,
    file: fileDataUrl || null,
    score: Number(score) || 0,
    status: 'complete',
  }

  db.reports.push(report)
  if (!user.reportIds) user.reportIds = []
  user.reportIds.push(report.id)
  saveDb(db)
  return { report }
}

export function deleteUser(userId) {
  const db = getDb()
  const user = db.users.find(u => u.id === userId)
  if (!user) return { error: 'User not found.' }
  // Remove their reports too
  db.reports = db.reports.filter(r => !(user.reportIds || []).includes(r.id))
  db.users = db.users.filter(u => u.id !== userId)
  // Free up any codes they used
  if (db.codes) {
    db.codes.forEach(c => { if (c.usedBy === userId) { c.used = false; c.usedBy = null } })
  }
  saveDb(db)
  return { ok: true }
}

export function addCodes(newCodes) {
  const db = getDb()
  if (!db.codes) db.codes = []
  const added = newCodes.map(c => ({
    code: c.code.toUpperCase().trim(),
    plan: c.plan || 'Test Kit',
    used: false,
    usedBy: null,
  }))
  db.codes.push(...added)
  saveDb(db)
  return { count: added.length }
}
