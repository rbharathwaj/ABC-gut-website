import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem('abcgut_user')
    return stored ? JSON.parse(stored) : null
  })

  function login(username, password) {
    // TODO: replace with real API call when backend is ready
    // Example:
    // const res = await fetch('/api/login', { method: 'POST', body: JSON.stringify({ username, password }) })
    // const data = await res.json()
    // if (!res.ok) throw new Error(data.message)
    // setUser(data.user)

    // Stub: hardcoded credentials for now
    if (username === 'demo' && password === 'abcgut2026') {
      const userData = { username }
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
