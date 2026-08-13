import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'

export function DashboardPage() {
  const { status, viewer, signOut } = useAuth()

  if (status === 'loading') return <main className="auth-state" role="status">Opening your dashboard…</main>
  if (status === 'anonymous') return <Navigate to="/login" replace />

  return (
    <main className="dashboard-placeholder">
      <Link className="wordmark" to="/">GLOBE<span>/</span>TROTTER</Link>
      <section>
        <p className="hero-kicker">SESSION CONNECTED</p>
        <h1>Welcome, {viewer?.displayName || viewer?.email}.</h1>
        <p>Your account is ready. The trip dashboard will be connected during integration.</p>
        <button type="button" onClick={() => void signOut()}>Log out</button>
      </section>
    </main>
  )
}
