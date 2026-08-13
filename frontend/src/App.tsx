export type AuthStatus = 'loading' | 'anonymous' | 'authenticated'

export type Viewer = {
  displayName: string | null
  email: string
}

type LandingPageProps = {
  authStatus?: AuthStatus
  viewer?: Viewer | null
}

const routeStops = [
  { code: 'LIS', city: 'Lisbon', date: '04 MAY' },
  { code: 'BCN', city: 'Barcelona', date: '08 MAY' },
  { code: 'FLR', city: 'Florence', date: '13 MAY' },
]

const features = [
  {
    number: '01',
    label: 'ROUTE',
    title: 'Build one fluid journey.',
    body: 'Move cities, dates, and stays around until the route finally clicks.',
  },
  {
    number: '02',
    label: 'DAYS',
    title: 'Give every day a shape.',
    body: 'Turn saved places into a calm itinerary you can actually follow.',
  },
  {
    number: '03',
    label: 'BUDGET',
    title: 'Know where the money goes.',
    body: 'Keep transport, stays, food, and plans visible as the trip evolves.',
  },
  {
    number: '04',
    label: 'SHARE',
    title: 'Bring everyone along.',
    body: 'Share one clean plan instead of another trail of links and screenshots.',
  },
]

function SessionAction({ authStatus, viewer }: Required<LandingPageProps>) {
  if (authStatus === 'loading') {
    return (
      <span className="session-action is-loading" role="status">
        <span className="session-dot" aria-hidden="true" />
        Checking session
      </span>
    )
  }

  if (authStatus === 'authenticated') {
    const identity = viewer?.displayName || viewer?.email || 'Your account'

    return (
      <a className="session-action is-authenticated" href="/dashboard">
        <span className="session-dot" aria-hidden="true" />
        <span className="session-identity">{identity}</span>
        <span aria-hidden="true">&#8599;</span>
      </a>
    )
  }

  return (
    <a className="session-action" href="/login">
      Log in <span aria-hidden="true">&#8599;</span>
    </a>
  )
}

function Header(props: Required<LandingPageProps>) {
  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="GlobeTrotter home">
        GLOBE<span>/</span>TROTTER
      </a>

      <nav className="desktop-nav" aria-label="Primary navigation">
        <a href="#why">Why GlobeTrotter</a>
        <a href="#inside">Inside the plan</a>
      </nav>

      <div className="desktop-session">
        <SessionAction {...props} />
      </div>

      <details className="mobile-menu">
        <summary aria-label="Open navigation">Menu</summary>
        <nav aria-label="Mobile navigation">
          <a href="#why">Why GlobeTrotter</a>
          <a href="#inside">Inside the plan</a>
          <SessionAction {...props} />
        </nav>
      </details>
    </header>
  )
}

function TripPass() {
  return (
    <aside className="trip-pass" aria-label="Sample GlobeTrotter trip pass">
      <div className="pass-topline">
        <span>GT / 001</span>
        <span>EUROPE LOOP</span>
      </div>

      <div className="pass-route">
        <div>
          <span>FROM</span>
          <strong>LIS</strong>
          <small>Lisbon</small>
        </div>
        <div className="flight-path" aria-hidden="true">
          <i />
          <span>&#8594;</span>
          <i />
        </div>
        <div className="pass-destination">
          <span>TO</span>
          <strong>FLR</strong>
          <small>via Barcelona</small>
        </div>
      </div>

      <ol className="pass-stops">
        {routeStops.map((stop, index) => (
          <li key={stop.code}>
            <span className="stop-index">0{index + 1}</span>
            <span>
              <strong>{stop.city}</strong>
              <small>{stop.date}</small>
            </span>
            <b>{stop.code}</b>
          </li>
        ))}
      </ol>

      <div className="pass-footer">
        <div>
          <span>DURATION</span>
          <strong>14 DAYS</strong>
        </div>
        <div>
          <span>EST. BUDGET</span>
          <strong>IN VIEW</strong>
        </div>
        <div className="barcode" aria-label="Trip reference 2026 0504" />
      </div>
    </aside>
  )
}

function Hero(props: Required<LandingPageProps>) {
  return (
    <section className="hero" id="top">
      <Header {...props} />
      <div className="hero-atmosphere" aria-hidden="true" />

      <div className="hero-content">
        <div className="hero-copy">
          <p className="hero-kicker">MULTI-CITY TRAVEL / ONE CLEAR PLAN</p>
          <h1>
            <span className="display-italic">Your next</span>
            <span>great journey,</span>
            <span className="display-italic display-indent">all in one place.</span>
          </h1>
          <div className="hero-bottom">
            <p>
              Route the cities. Shape the days. Keep the cost in sight. GlobeTrotter
              turns a scattered travel idea into a trip ready to take.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="/login">
                Start planning <span aria-hidden="true">&#8599;</span>
              </a>
              <a className="text-link" href="#why">See the journey &#8595;</a>
            </div>
          </div>
        </div>

        <TripPass />
      </div>

      <p className="hero-coordinate">38.7223&deg; N &nbsp; 9.1393&deg; W</p>
    </section>
  )
}

function SignalStrip() {
  return (
    <div className="signal-strip" aria-label="Plan, route, budget, and share">
      <span>PLAN</span><i />
      <span>ROUTE</span><i />
      <span>BUDGET</span><i />
      <span>SHARE</span>
    </div>
  )
}

function WhyGlobeTrotter() {
  return (
    <section className="manifesto section-shell" id="why">
      <div className="section-stamp">
        <span>WHY GLOBETROTTER</span>
        <span>01 / 03</span>
      </div>
      <div className="manifesto-grid">
        <h2>
          Travel planning is messy.
          <span className="display-italic">The trip doesn&apos;t have to be.</span>
        </h2>
        <div className="manifesto-copy">
          <p>
            The route lives in one tab, ideas in another, and the budget somewhere
            nobody wants to open. GlobeTrotter connects the whole journey before
            you leave.
          </p>
          <a className="arrow-link" href="#inside">EXPLORE THE SYSTEM <span>&#8594;</span></a>
        </div>
      </div>
    </section>
  )
}

function FeatureSystem() {
  return (
    <section className="feature-system section-shell" id="inside">
      <div className="section-stamp">
        <span>INSIDE THE PLAN</span>
        <span>02 / 03</span>
      </div>

      <div className="feature-list">
        {features.map((feature) => (
          <article className="feature-row" key={feature.number}>
            <span className="feature-number">{feature.number}</span>
            <span className="feature-label">{feature.label}</span>
            <h3>{feature.title}</h3>
            <p>{feature.body}</p>
            <span className="feature-arrow" aria-hidden="true">&#8599;</span>
          </article>
        ))}
      </div>
    </section>
  )
}

function JourneyPanel() {
  return (
    <section className="journey-panel section-shell">
      <div className="journey-panel-inner">
        <div className="journey-panel-copy">
          <div className="section-stamp light-stamp">
            <span>THE WHOLE JOURNEY</span>
            <span>03 / 03</span>
          </div>
          <h2>
            One route.
            <span className="display-italic">Zero loose ends.</span>
          </h2>
          <p>
            Every stop stays connected to its days, costs, and people. Change the
            plan once and everyone sees the same trip.
          </p>
        </div>

        <div className="orbit-card" aria-label="Example connected route">
          <div className="orbit-line" aria-hidden="true"><i /></div>
          {routeStops.map((stop, index) => (
            <div className="orbit-stop" key={stop.code}>
              <span>0{index + 1}</span>
              <strong>{stop.code}</strong>
              <small>{stop.city} / {stop.date}</small>
            </div>
          ))}
          <div className="orbit-meta">
            <span>3 CITIES</span>
            <span>14 DAYS</span>
            <span>1 SHARED PLAN</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function FinalCall({ authStatus }: Pick<Required<LandingPageProps>, 'authStatus'>) {
  const isAuthenticated = authStatus === 'authenticated'

  return (
    <section className="final-call section-shell">
      <p className="final-mark" aria-hidden="true">GT</p>
      <div>
        <p className="hero-kicker">READY WHEN YOU ARE</p>
        <h2>
          Go further.
          <span className="display-italic">Plan clearer.</span>
        </h2>
      </div>
      <a className="button button-light" href={isAuthenticated ? '/dashboard' : '/login'}>
        {isAuthenticated ? 'Open your trips' : 'Start your first trip'} <span aria-hidden="true">&#8599;</span>
      </a>
    </section>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <a className="footer-wordmark" href="#top">GLOBE<span>/</span>TROTTER</a>
      <p>THE WORLD IS WIDE. KEEP THE PLAN CLEAR.</p>
      <div>
        <a href="#why">Why GlobeTrotter</a>
        <a href="#inside">Inside the plan</a>
        <a href="/login">Log in</a>
      </div>
      <small>&copy; 2026 GLOBETROTTER</small>
    </footer>
  )
}

export function LandingPage({
  authStatus = 'anonymous',
  viewer = null,
}: LandingPageProps) {
  const authProps = { authStatus, viewer }

  return (
    <main data-auth-state={authStatus}>
      <Hero {...authProps} />
      <SignalStrip />
      <WhyGlobeTrotter />
      <FeatureSystem />
      <JourneyPanel />
      <FinalCall authStatus={authStatus} />
      <Footer />
    </main>
  )
}

export default function App() {
  return <LandingPage />
}
