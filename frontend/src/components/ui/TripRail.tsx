import { Link } from 'react-router-dom'
import type { Trip } from '../../types/domain'
import { formatDateRange, formatMoney, tripBudget, tripCityNames, tripPhase } from '../../lib/trip'
import { Reveal, Spotlight } from './motion'

/** The trip card rail, shared by the signed-in home and `/trips`. */
export function TripRail({ trips }: { trips: Trip[] }) {
  return (
    <ul className="trip-rail">
      {trips.map((trip, index) => {
        const budget = tripBudget(trip)
        const phase = tripPhase(trip)

        return (
          <li key={trip.id}>
            <Reveal delay={index * 0.07}>
              <Spotlight>
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
              </Spotlight>
            </Reveal>
          </li>
        )
      })}
    </ul>
  )
}
