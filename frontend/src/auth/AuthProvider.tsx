import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  getCurrentViewer,
  signOutCurrentUser,
  subscribeToAuthChanges,
  type AuthViewer,
} from '../services/auth'
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [viewer, setViewer] = useState<AuthViewer | null>(null)

  useEffect(() => {
    let active = true

    const applyViewer = (nextViewer: AuthViewer | null) => {
      if (!active) return
      setViewer(nextViewer)
      setStatus(nextViewer ? 'authenticated' : 'anonymous')
    }

    const unsubscribe = subscribeToAuthChanges(applyViewer)

    void getCurrentViewer()
      .then(applyViewer)
      .catch(() => applyViewer(null))

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      viewer,
      signOut: signOutCurrentUser,
    }),
    [status, viewer],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
