import { createContext, useContext, useState } from 'react'
import { findUser, registerUser, getUserById } from '../data/db'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem('abcgut_user')
    if (!stored) return null
    // Re-fetch from DB so any new fields (e.g. role) are picked up immediately
    const parsed = JSON.parse(stored)
    const fresh = getUserById(parsed.id)
    if (fresh) {
      sessionStorage.setItem('abcgut_user', JSON.stringify(fresh))
      return fresh
    }
    return parsed
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

  function register(name, email, password, plan, code) {
    const result = registerUser({ name, email, password, plan, code })
    if (result.error) return result
    // Auto-login after registration
    setUser(result.user)
    sessionStorage.setItem('abcgut_user', JSON.stringify(result.user))
    return result
  }

  function logout() {
    setUser(null)
    sessionStorage.removeItem('abcgut_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
