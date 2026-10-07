import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getSession, setSession, clearSession, onSessionChange } from '../lib/session.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(() => getSession())

  useEffect(() => onSessionChange(() => setSessionState(getSession())), [])

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    isAdmin: session?.user?.role === 'ADMIN',
    signIn: (authResponse) => setSession(authResponse),
    signOut: () => clearSession(),
  }), [session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}
