const journeyStops = [
  { city: 'Lisbon', detail: 'Land, settle in, walk Alfama' },
  { city: 'Barcelona', detail: 'Architecture, markets, late dinners' },
  { city: 'Florence', detail: 'Rail arrival, galleries, slow mornings' },
]

const capabilities = [
  {
    title: 'Every stop in order.',
    body: 'Add cities, set dates, and move the route until the journey feels right.',
    className: 'capability capability-route',
  },
  {
    title: 'Costs stay visible.',
    body: 'See transport, stays, activities, and meals together before the budget drifts.',
    className: 'capability capability-accent',
  },
  {
    title: 'Days become a plan.',
    body: 'Turn saved places into a clear daily itinerary with time and cost attached.',
    className: 'capability capability-dark',
  },
  {
    title: 'Share the whole trip.',
    body: 'Publish a clean read-only itinerary friends can follow or copy for themselves.',
    className: 'capability capability-photo',
  },
]

function Header() {
  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="GlobeTrotter home">
        GlobeTrotter<span>®</span>
      </a>
      <nav className="desktop-nav" aria-label="Primary navigation">
        <a href="#journey">The journey</a>
        <a href="#inside">Inside the plan</a>
        <a className="nav-cta" href="#journey">See how it works</a>
      </nav>
      <details className="mobile-menu">
        <summary>Menu</summary>
        <nav aria-label="Mobile navigation">
          <a href="#journey">The journey</a>
          <a href="#inside">Inside the plan</a>
          <a href="#journey">See how it works</a>
        </nav>
      </details>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero" id="top">
      <Header />
      <div className="hero-grid">
        <div className="hero-copy load-in">
          <p className="eyebrow">Multi-city travel, made clear</p>
          <h1>Plan the whole journey.</h1>
          <p className="hero-intro">
            Keep every city, date, activity, and cost connected in one living plan.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#journey">See how it works</a>
            <a className="text-link" href="#inside">Inside the plan <span aria-hidden="true">↘</span></a>
          </div>
        </div>
        <figure className="hero-visual load-in load-in-late">
          <img
            src="/images/journey-map.webp"
            alt="A map, travel tickets, camera, and passport arranged for a multi-city journey"
            width="1536"
            height="1024"
          />
        </figure>
      </div>
    </section>
  )
}

function Journey() {
  return (
    <section className="journey-section section" id="journey">
      <div className="section-heading">
        <h2>One trip. No loose ends.</h2>
        <p>GlobeTrotter turns scattered tabs and notes into a route you can understand at a glance.</p>
      </div>
      <div className="journey-board" aria-label="Sample multi-city journey">
        <p className="sample-label">Sample journey</p>
        <ol className="route-list">
          {journeyStops.map((stop, index) => (
            <li key={stop.city}>
              <div className="route-marker" aria-hidden="true">{index + 1}</div>
              <div>
                <p className="route-city">{stop.city}</p>
                <p className="route-detail">{stop.detail}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="budget-row">
          <p>Budget follows the route</p>
          <div className="budget-categories" aria-label="Budget categories">
            <span>Transport</span>
            <span>Stays</span>
            <span>Activities</span>
            <span>Meals</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function Arrival() {
  return (
    <section className="arrival section">
      <figure className="arrival-image">
        <img
          src="/images/city-arrival.webp"
          alt="A traveler arriving by train in a quiet city at dawn"
          width="1120"
          height="1400"
          loading="lazy"
        />
      </figure>
      <div className="arrival-copy">
        <p className="pull-quote">“The plan should disappear the moment the trip begins.”</p>
        <p>
          Build the complicated parts before departure, then open a calm daily view when you arrive.
        </p>
        <a className="text-link" href="#inside">Look inside the plan <span aria-hidden="true">↘</span></a>
      </div>
    </section>
  )
}

function Capabilities() {
  return (
    <section className="inside section" id="inside">
      <div className="section-heading compact-heading">
        <h2>Everything travels together.</h2>
        <p>Search, schedule, budget, and sharing stay connected from the first city to the final day.</p>
      </div>
      <div className="capability-grid">
        {capabilities.map((capability) => (
          <article className={capability.className} key={capability.title}>
            <h3>{capability.title}</h3>
            <p>{capability.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="how section">
      <h2>From idea to itinerary.</h2>
      <div className="how-grid">
        <article>
          <p className="step-verb">Choose</p>
          <h3>Shape the route.</h3>
          <p>Pick the cities and dates that define the trip.</p>
        </article>
        <article>
          <p className="step-verb">Build</p>
          <h3>Fill the days.</h3>
          <p>Add activities and keep the running budget in view.</p>
        </article>
        <article>
          <p className="step-verb">Go</p>
          <h3>Travel with clarity.</h3>
          <p>Use the timeline, share the plan, and adjust as you move.</p>
        </article>
      </div>
    </section>
  )
}

function FinalCall() {
  return (
    <section className="final-call section">
      <div>
        <p className="eyebrow">Your next route starts here</p>
        <h2>Dream widely.<br />Plan clearly.</h2>
      </div>
      <a className="button button-light" href="#journey">
        See how it works
      </a>
    </section>
  )
}

function Footer() {
  return (
    <footer>
      <a className="footer-wordmark" href="#top">GlobeTrotter</a>
      <p>Multi-city travel, made clear.</p>
      <p>Built for the Odoo hackathon dry run.</p>
    </footer>
  )
}

export default function App() {
  return (
    <main>
      <Hero />
      <Journey />
      <Arrival />
      <Capabilities />
      <HowItWorks />
      <FinalCall />
      <Footer />
    </main>
  )
}
