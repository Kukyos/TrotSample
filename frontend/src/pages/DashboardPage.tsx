import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth/auth-context'
import { getPopularCities } from '../services/catalog'
import { listTrips } from '../services/trips'
import { formatDateRange, formatMoney, tripBudget, tripCityNames, tripPhase } from '../lib/trip'

export function DashboardPage() {
  const { viewer } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const tripsQuery = useQuery({ queryKey: ['trips'], queryFn: listTrips })
  const citiesQuery = useQuery({ queryKey: ['cities', 'popular'], queryFn: () => getPopularCities(6) })
  const trips = useMemo(() => tripsQuery.data ?? [], [tripsQuery.data])
  const cities = useMemo(() => citiesQuery.data ?? [], [citiesQuery.data])

  const firstName = (viewer?.displayName || viewer?.email || 'traveller').split(' ')[0]

  const upcoming = useMemo(
    () => trips.filter((trip) => tripPhase(trip) !== 'completed').slice(0, 3),
    [trips],
  )
  const topRegional = useMemo(
    () => cities,
    [cities],
  )

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    navigate(query.trim() ? `/explore?q=${encodeURIComponent(query.trim())}` : '/explore')
  }

  return (
    <div className="page dashboard">
      <section className="dash-banner">
        <div className="dash-banner-copy">
          <p className="hero-kicker">WELCOME BACK</p>
          <h1>
            Where next,
            <span className="display-italic">{firstName}?</span>
          </h1>
          <p className="dash-lede">
            Pick up a route you started, or begin something new. Everything stays
            connected — stops, days, and what it costs.
          </p>

          <form className="dash-search" onSubmit={handleSearch} role="search">
            <label className="visually-hidden" htmlFor="dash-search-input">
              Search cities and activities
            </label>
            <input
              id="dash-search-input"
              type="search"
              placeholder="Search a city or an activity"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="submit">Search <span aria-hidden="true">&#8594;</span></button>
          </form>

          <div className="dash-actions">
            <Link className="button button-primary" to="/trips/new">
              Plan a trip <span aria-hidden="true">&#8599;</span>
            </Link>
            <Link className="text-link" to="/trips">See all trips &#8594;</Link>
          </div>
        </div>
      </section>

      <section className="dash-section" aria-labelledby="dash-continue">
        <div className="section-stamp">
          <span id="dash-continue">CONTINUE PLANNING</span>
          <span>{upcoming.length} ACTIVE</span>
        </div>

        {upcoming.length === 0 ? (
          <div className="empty-state">
            <p>No active trips yet.</p>
            <Link className="button button-primary" to="/trips/new">Start your first trip</Link>
          </div>
        ) : (
          <ul className="trip-rail" aria-busy={tripsQuery.isLoading}>
            {upcoming.map((trip) => {
              const budget = tripBudget(trip)
              const phase = tripPhase(trip)
              return (
                <li key={trip.id}>
                  <Link className="trip-card" to={`/trips/${trip.id}`}>
                    <span className={`phase-tag is-${phase}`}>{phase}</span>
                    <h3>{trip.title}</h3>
                    <p className="trip-card-route">{tripCityNames(trip).join(' → ')}</p>
                    <dl className="trip-card-meta">
                      <div>
                        <dt>Dates</dt>
                        <dd>{formatDateRange(trip.start_date, trip.end_date)}</dd>
                      </div>
                      <div>
                        <dt>Costed</dt>
                        <dd>{formatMoney(budget.spent, budget.currency)}</dd>
                      </div>
                    </dl>
                    {budget.share !== null && (
                      <span className="budget-meter" aria-hidden="true">
                        <i style={{ width: `${Math.min(budget.share * 100, 100)}%` }} />
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="dash-section" aria-labelledby="dash-regional">
        <div className="section-stamp">
          <span id="dash-regional">TOP REGIONAL SELECTIONS</span>
          <span>BY POPULARITY</span>
        </div>

        <ul className="city-grid" aria-busy={citiesQuery.isLoading}>
          {topRegional.map((city) => (
            <li key={city.id}>
              <Link className="city-card" to={`/explore?q=${encodeURIComponent(city.name)}`}>
                <span className="city-code">{city.country_code}</span>
                <h3>{city.name}</h3>
                <p>{city.description ?? city.region ?? `Explore ${city.name}`}</p>
                <span className="city-meta">
                  {city.region ?? city.country_code} · population {city.population?.toLocaleString() ?? '—'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
