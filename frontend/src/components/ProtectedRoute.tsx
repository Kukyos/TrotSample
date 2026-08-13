import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'

/** The single auth gate for every app screen. HACKATHON_PLAN.md assumes this
 *  exists; dev auto-login is expected to produce a real session so this path
 *  stays exercised in development rather than being bypassed. */
export function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <main className="auth-state" role="status">
        <span className="session-dot" aria-hidden="true" />
        Checking your session…
      </main>
    )
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
