import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/auth-context'

const NAV = [
  { to: '/dashboard', label: 'Home' },
  { to: '/trips', label: 'Trips' },
  { to: '/explore', label: 'Explore' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/community', label: 'Community' },
]

export function AppShell() {
  const { viewer, signOut } = useAuth()
  const navigate = useNavigate()
  const identity = viewer?.displayName || viewer?.email || 'Your account'
  const initial = identity.trim().charAt(0).toUpperCase()

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="app-frame">
      <a className="skip-link" href="#app-main">Skip to content</a>

      <header className="app-dock">
        <Link className="wordmark dock-mark" to="/dashboard">
          GLOBE<span>/</span>TROTTER
        </Link>

        <nav className="dock-nav" aria-label="Primary">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/dashboard'}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="dock-account">
          <Link className="dock-new" to="/trips/new">
            <span aria-hidden="true">+</span> New trip
          </Link>
          <Link className="dock-avatar" to="/profile" aria-label={`Profile for ${identity}`}>
            <span aria-hidden="true">{initial}</span>
          </Link>
          <button type="button" className="dock-signout" onClick={() => void handleSignOut()}>
            Log out
          </button>
        </div>
      </header>

      <main className="app-main" id="app-main">
        <Outlet />
      </main>
    </div>
  )
}
