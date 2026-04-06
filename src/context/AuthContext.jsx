import { createContext, useContext, useState } from 'react'
import { findUser } from '../data/db'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem('abcgut_user')
    return stored ? JSON.parse(stored) : null
  })

  function login(email, password) {
    // TODO: replace with real API call when backend is ready
    // const res = await fetch('/api/login', { method: 'POST', ... })
    const found = findUser(email, password)
    if (found) {
      setUser(found)
      sessionStorage.setItem('abcgut_user', JSON.stringify(found))
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
