import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { AuthStatus } from './auth/auth-context'
import type { AuthViewer } from './services/auth'
import { TripRail } from './components/ui/TripRail'
import { Reveal, Spotlight } from './components/ui/motion'
import SplitText from './components/reactbits/SplitText'
import ShinyText from './components/reactbits/ShinyText'
import ScrollVelocity from './components/reactbits/ScrollVelocity'
import { getPopularCities } from './services/catalog'
import { listTrips } from './services/trips'
import { tripPhase } from './lib/trip'

type LandingPageProps = {
  authStatus?: AuthStatus
  viewer?: AuthViewer | null
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

/** A single hero headline line. Each line is its own SplitText so the serif and
 *  sans runs keep their own class, which one shared instance could not do.
 *  `stagger` is SplitText's per-character delay in ms. */
function HeroLine({ text, className = '', stagger = 18 }: { text: string; className?: string; stagger?: number }) {
  return (
    <SplitText
      tag="span"
      text={text}
      className={`hero-line ${className}`}
      splitType="chars"
      delay={stagger}
      duration={0.9}
      from={{ opacity: 0, y: 64, rotateX: -40 }}
      to={{ opacity: 1, y: 0, rotateX: 0 }}
      threshold={0.05}
      rootMargin="0px"
      textAlign="left"
    />
  )
}

function Hero({ authStatus, viewer }: Required<LandingPageProps>) {
  const authenticated = authStatus === 'authenticated'
  const firstName = (viewer?.displayName || viewer?.email || '').split(' ')[0]

  return (
    <section className="hero" id="top">
      <div className="hero-atmosphere" aria-hidden="true" />

      <div className="hero-content">
        <div className="hero-copy">
          <p className="hero-kicker">
            <ShinyText
              text={authenticated ? 'WELCOME BACK / YOUR TRIPS ARE WAITING' : 'MULTI-CITY TRAVEL / ONE CLEAR PLAN'}
              color="#8f8b92"
              shineColor="#e1bdff"
              speed={4}
            />
          </p>
          <h1>
            {authenticated ? (
              <>
                <HeroLine className="display-italic" text="Where next," />
                <HeroLine className="display-indent" text={`${firstName || 'traveller'}?`} />
              </>
            ) : (
              <>
                <HeroLine className="display-italic" text="Your next" />
                <HeroLine text="great journey," />
                <HeroLine className="display-italic display-indent" text="all in one place." />
              </>
            )}
          </h1>
          <div className="hero-bottom">
            <p>
              {authenticated
                ? 'Pick up a route you started, or begin something new. Everything stays connected — stops, days, and what it costs.'
                : 'Route the cities. Shape the days. Keep the cost in sight. GlobeTrotter turns a scattered travel idea into a trip ready to take.'}
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" to={authenticated ? '/trips/new' : '/login'}>
                {authenticated ? 'Plan a trip' : 'Start planning'} <span aria-hidden="true">&#8599;</span>
              </Link>
              <a className="text-link" href={authenticated ? '#continue' : '#why'}>
                {authenticated ? 'Continue planning' : 'See the journey'} &#8595;
              </a>
            </div>
          </div>

          {authenticated && <HeroSearch />}
        </div>

        <TripPass />
      </div>

      <p className="hero-coordinate">38.7223&deg; N &nbsp; 9.1393&deg; W</p>
    </section>
  )
}

function HeroSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    navigate(query.trim() ? `/explore?q=${encodeURIComponent(query.trim())}` : '/explore')
  }

  return (
    <form className="dash-search" onSubmit={handleSearch} role="search">
      <label className="visually-hidden" htmlFor="hero-search-input">
        Search cities and activities
      </label>
      <input
        id="hero-search-input"
        type="search"
        placeholder="Search a city or an activity"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <button type="submit">Search <span aria-hidden="true">&#8594;</span></button>
    </form>
  )
}

/** Everything below the hero once you are signed in. This is the dashboard —
 *  there is no separate `/dashboard` screen, only this page in its logged-in
 *  state, which is why `/dashboard` redirects here. Data comes from
 *  `services/`, never from Supabase directly, per the boundary in CLAUDE.md. */
function SignedInHome() {
  const tripsQuery = useQuery({ queryKey: ['trips'], queryFn: listTrips })
  const citiesQuery = useQuery({ queryKey: ['cities', 'popular'], queryFn: () => getPopularCities(6) })

  const active = (tripsQuery.data ?? []).filter((trip) => tripPhase(trip) !== 'completed').slice(0, 3)
  const topRegional = citiesQuery.data ?? []

  return (
    <>
      <section className="landing-continue section-shell" id="continue" aria-labelledby="home-continue">
        <div className="section-stamp">
          <span id="home-continue">CONTINUE PLANNING</span>
          <span>{tripsQuery.isLoading ? 'LOADING' : `${active.length} ACTIVE`}</span>
        </div>

        {tripsQuery.isError && (
          <p className="auth-message is-error" role="alert">{tripsQuery.error.message}</p>
        )}

        {tripsQuery.isLoading && (
          <div className="empty-state"><p>Loading your trips…</p></div>
        )}

        {!tripsQuery.isLoading && !tripsQuery.isError && active.length === 0 && (
          <div className="empty-state">
            <p>No active trips yet.</p>
            <Link className="button button-primary" to="/trips/new">Start your first trip</Link>
          </div>
        )}

        {active.length > 0 && (
          <>
            <TripRail trips={active} />
            <Link className="arrow-link" to="/trips">SEE ALL YOUR TRIPS <span>&#8594;</span></Link>
          </>
        )}
      </section>

      <section className="landing-continue section-shell" aria-labelledby="home-regional">
        <div className="section-stamp">
          <span id="home-regional">TOP REGIONAL SELECTIONS</span>
          <span>BY POPULARITY</span>
        </div>

        {citiesQuery.isError && (
          <p className="auth-message is-error" role="alert">{citiesQuery.error.message}</p>
        )}

        {citiesQuery.isLoading ? (
          <div className="empty-state"><p>Loading cities…</p></div>
        ) : (
          <ul className="city-grid">
            {topRegional.map((city, index) => (
              <li key={city.id}>
                <Reveal delay={index * 0.06}>
                  <Spotlight>
                    <Link className="city-card" to={`/explore?q=${encodeURIComponent(city.name)}`}>
                      <span className="city-code">{city.country_code}</span>
                      <h3>{city.name}</h3>
                      <p>{city.description}</p>
                      <span className="city-meta">
                        {city.region} · cost index {city.cost_index?.toFixed(1) ?? '—'}
                      </span>
                    </Link>
                  </Spotlight>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

const SIGNALS = ['PLAN', 'ROUTE', 'BUDGET', 'SHARE', 'STAY', 'SPLIT', 'SHIP IT']

function SignalStrip() {
  return (
    <div className="signal-strip" aria-label="Plan, route, budget, and share">
      <ScrollVelocity
        texts={[SIGNALS.join('  ·  ')]}
        velocity={38}
        damping={48}
        stiffness={340}
        className="signal-word"
      />
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
        {features.map((feature, index) => (
          <Reveal key={feature.number} delay={index * 0.08}>
            <article className="feature-row">
              <span className="feature-number">{feature.number}</span>
              <span className="feature-label">{feature.label}</span>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
              <span className="feature-arrow" aria-hidden="true">&#8599;</span>
            </article>
          </Reveal>
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

function FinalCall() {
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
      <Link className="button button-light" to="/login">
        Start your first trip <span aria-hidden="true">&#8599;</span>
      </Link>
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
        <Link to="/login">Log in</Link>
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
    <div className="landing" data-auth-state={authStatus}>
      <Hero {...authProps} />
      <SignalStrip />
      {authStatus === 'authenticated' ? (
        <SignedInHome />
      ) : (
        <>
          <WhyGlobeTrotter />
          <FeatureSystem />
          <JourneyPanel />
          <FinalCall />
        </>
      )}
      <Footer />
    </div>
  )
}

export default LandingPage
