import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { trips } from '../fixtures/trips'
import {
  formatDateRange,
  formatMoney,
  tripBudget,
  tripCityNames,
  tripNights,
  tripPhase,
  type TripPhase,
} from '../lib/trip'

type SortKey = 'start' | 'title' | 'budget'

const GROUPS: { phase: TripPhase; label: string; blurb: string }[] = [
  { phase: 'ongoing', label: 'Ongoing', blurb: 'Happening right now.' },
  { phase: 'upcoming', label: 'Upcoming', blurb: 'Booked and ahead of you.' },
  { phase: 'completed', label: 'Completed', blurb: 'Already travelled.' },
]

export function MyTripsPage() {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('start')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const matches = trips.filter((trip) => {
      if (!needle) return true
      const haystack = [trip.title, trip.description ?? '', ...tripCityNames(trip.id)]
        .join(' ')
        .toLowerCase()
      return haystack.includes(needle)
    })

    return [...matches].sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title)
      if (sort === 'budget') return (b.budget_amount ?? 0) - (a.budget_amount ?? 0)
      return a.start_date.localeCompare(b.start_date)
    })
  }, [query, sort])

  return (
    <div className="page trips-page">
      <header className="page-head">
        <div>
          <p className="hero-kicker">YOUR TRIPS</p>
          <h1>Every route<span className="display-italic">you have going.</span></h1>
        </div>
        <Link className="button button-primary" to="/trips/new">
          New trip <span aria-hidden="true">&#8599;</span>
        </Link>
      </header>

      <div className="filter-bar">
        <label className="visually-hidden" htmlFor="trip-search">Search your trips</label>
        <input
          id="trip-search"
          type="search"
          placeholder="Search by trip or city"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <label htmlFor="trip-sort">Sort by</label>
        <select id="trip-sort" value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
          <option value="start">Start date</option>
          <option value="title">Name</option>
          <option value="budget">Budget</option>
        </select>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <p>No trips match “{query}”.</p>
          <button type="button" className="text-link" onClick={() => setQuery('')}>
            Clear the search
          </button>
        </div>
      )}

      {GROUPS.map((group) => {
        const groupTrips = filtered.filter((trip) => tripPhase(trip) === group.phase)
        if (groupTrips.length === 0) return null

        return (
          <section key={group.phase} className="trip-group" aria-labelledby={`group-${group.phase}`}>
            <div className="section-stamp">
              <span id={`group-${group.phase}`}>{group.label}</span>
              <span>{groupTrips.length} {groupTrips.length === 1 ? 'TRIP' : 'TRIPS'}</span>
            </div>
            <p className="group-blurb">{group.blurb}</p>

            <ul className="trip-list">
              {groupTrips.map((trip) => {
                const budget = tripBudget(trip)
                const stops = tripCityNames(trip.id)
                return (
                  <li key={trip.id}>
                    <article className="trip-row">
                      <div className="trip-row-main">
                        <h3><Link to={`/trips/${trip.id}`}>{trip.title}</Link></h3>
                        <p>{trip.description}</p>
                        <p className="trip-row-route">{stops.join(' → ')}</p>
                      </div>

                      <dl className="trip-row-meta">
                        <div>
                          <dt>Dates</dt>
                          <dd>{formatDateRange(trip.start_date, trip.end_date)}</dd>
                        </div>
                        <div>
                          <dt>Length</dt>
                          <dd>{tripNights(trip)} days</dd>
                        </div>
                        <div>
                          <dt>Cities</dt>
                          <dd>{stops.length}</dd>
                        </div>
                        <div>
                          <dt>Costed</dt>
                          <dd className={budget.overBudget ? 'is-over' : undefined}>
                            {formatMoney(budget.spent, budget.currency)}
                            {budget.budget !== null && ` of ${formatMoney(budget.budget, budget.currency)}`}
                          </dd>
                        </div>
                      </dl>

                      <div className="trip-row-actions">
                        <span className={`state-tag is-${trip.state}`}>{trip.state}</span>
                        <Link className="text-link" to={`/trips/${trip.id}`}>View &#8594;</Link>
                        <Link className="text-link" to={`/trips/${trip.id}/build`}>Edit &#8594;</Link>
                      </div>
                    </article>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
