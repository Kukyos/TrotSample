import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/auth-context'
import ClickSpark from '../reactbits/ClickSpark'
import { prefersReducedMotion } from '../../lib/motion'

const APP_NAV = [
  { to: '/', label: 'Home' },
  { to: '/trips', label: 'Trips' },
  { to: '/explore', label: 'Explore' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/community', label: 'Community' },
]

/** Anonymous visitors only ever see this nav on `/`, so in-page anchors are safe. */
const MARKETING_NAV = [
  { href: '#why', label: 'Why GlobeTrotter' },
  { href: '#inside', label: 'Inside the plan' },
]

/** The landing header, reused verbatim on every screen. Only the links and the
 *  right-hand session slot change with auth state — never the bar itself. */
export function AppShell() {
  const { status, viewer, signOut } = useAuth()
  const navigate = useNavigate()
  const isLanding = useLocation().pathname === '/'
  const authenticated = status === 'authenticated'
  const identity = viewer?.displayName || viewer?.email || 'Your account'

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  const links = authenticated
    ? APP_NAV.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.to === '/'}>
          {item.label}
        </NavLink>
      ))
    : MARKETING_NAV.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)

  const session = (
    <>
      {status === 'loading' && (
        <span className="session-action is-loading" role="status">
          <span className="session-dot" aria-hidden="true" />
          Checking session
        </span>
      )}

      {status === 'anonymous' && (
        <Link className="session-action" to="/login">
          Log in <span aria-hidden="true">&#8599;</span>
        </Link>
      )}

      {authenticated && (
        <>
          <Link className="session-action is-new" to="/trips/new">
            <span aria-hidden="true">+</span> New trip
          </Link>
          <Link className="session-action is-authenticated" to="/profile">
            <span className="session-dot" aria-hidden="true" />
            <span className="session-identity">{identity}</span>
          </Link>
          <button type="button" className="session-action is-signout" onClick={() => void handleSignOut()}>
            Log out
          </button>
        </>
      )}
    </>
  )

  const frame = (
    <div className={`app-frame${isLanding ? ' is-landing' : ''}`} data-auth-state={status}>
      <a className="skip-link" href="#app-main">Skip to content</a>
      <div className="frame-aurora" aria-hidden="true" />

      <header className="site-header">
        {/* Always `/` — the landing page is home whether or not you are signed in. */}
        <Link className="wordmark" to="/" aria-label="GlobeTrotter home">
          GLOBE<span>/</span>TROTTER
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">{links}</nav>

        <div className="desktop-session">{session}</div>

        <details className="mobile-menu">
          <summary aria-label="Open navigation">Menu</summary>
          <nav aria-label="Mobile navigation">
            {links}
            {session}
          </nav>
        </details>
      </header>

      <main className={`app-main${isLanding ? ' is-bleed' : ''}`} id="app-main">
        <Outlet />
      </main>

      {/* Landing brings its own full footer. */}
      {!isLanding && (
        <footer className="app-foot">
          <span>GLOBETROTTER / ONE CLEAR PLAN</span>
          <span>&copy; 2026</span>
        </footer>
      )}
    </div>
  )

  if (prefersReducedMotion()) return frame

  // ClickSpark paints into a canvas sized to its parent, so it wraps the frame
  // rather than sitting inside it.
  return (
    <ClickSpark sparkColor="#e1bdff" sparkSize={9} sparkRadius={17} sparkCount={7} duration={420}>
      {frame}
    </ClickSpark>
  )
}
