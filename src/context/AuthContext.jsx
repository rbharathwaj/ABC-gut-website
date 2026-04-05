import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem('abcgut_user')
    return stored ? JSON.parse(stored) : null
  })

  function login(email, password) {
    // TODO: replace with real API call when backend is ready
    // Example:
    // const res = await fetch('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    // const data = await res.json()
    // if (!res.ok) throw new Error(data.message)
    // setUser(data.user)

    // Stub: hardcoded credentials — add more entries here as needed
    const USERS = [
      { email: 'rbharathwaj2003@gmail.com', password: 'abcguttest' },
    ]
    const match = USERS.find(u => u.email === email.toLowerCase() && u.password === password)
    if (match) {
      const userData = { email: match.email }
      setUser(userData)
      sessionStorage.setItem('abcgut_user', JSON.stringify(userData))
      return true
    }
    return false
  }

  function logout() {
    setUser(null)
    sessionStorage.removeItem('abcgut_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
