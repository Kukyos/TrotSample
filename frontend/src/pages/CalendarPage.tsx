import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { trips } from '../fixtures/trips'
import { rampStep } from '../lib/ramp'
import { formatDateRange } from '../lib/trip'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function monthMatrix(year: number, month: number) {
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7 // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = Array.from({ length: offset }, () => null)
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(year, month, day))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

const iso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export function CalendarPage() {
  const today = new Date()
  // Opens on the month holding the fullest trip so the grid is never empty on
  // first paint. Becomes "the current month" once the data is real.
  const [cursor, setCursor] = useState(new Date(2026, 8, 1))

  // Colour is assigned per trip by a stable index so a trip keeps its shade
  // when the month changes — colour follows the entity, never its rank.
  const tripColour = useMemo(
    () => new Map(trips.map((trip, index) => [trip.id, rampStep(index % 5)])),
    [],
  )

  const cells = monthMatrix(cursor.getFullYear(), cursor.getMonth())
  const monthLabel = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(cursor)

  const tripsOnDay = (date: Date) => {
    const day = iso(date)
    return trips.filter((trip) => day >= trip.start_date && day <= trip.end_date)
  }

  const monthTrips = trips.filter((trip) => {
    const monthStart = iso(new Date(cursor.getFullYear(), cursor.getMonth(), 1))
    const monthEnd = iso(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0))
    return trip.start_date <= monthEnd && trip.end_date >= monthStart
  })

  const shiftMonth = (delta: number) =>
    setCursor((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1))

  return (
    <div className="page calendar-page">
      <header className="page-head">
        <div>
          <p className="hero-kicker">CALENDAR</p>
          <h1>Your year,<span className="display-italic">laid out.</span></h1>
        </div>
        <div className="month-controls">
          <button type="button" className="icon-button" onClick={() => shiftMonth(-1)} aria-label="Previous month">&#8592;</button>
          <strong aria-live="polite">{monthLabel}</strong>
          <button type="button" className="icon-button" onClick={() => shiftMonth(1)} aria-label="Next month">&#8594;</button>
        </div>
      </header>

      <div className="calendar-grid" role="grid" aria-label={`Trips in ${monthLabel}`}>
        {WEEKDAYS.map((day) => (
          <span key={day} className="calendar-weekday" role="columnheader">{day}</span>
        ))}

        {cells.map((date, index) => {
          if (!date) return <span key={`pad-${index}`} className="calendar-cell is-empty" role="gridcell" />
          const dayTrips = tripsOnDay(date)
          const isToday = iso(date) === iso(today)

          return (
            <div key={iso(date)} className={`calendar-cell${isToday ? ' is-today' : ''}`} role="gridcell">
              <span className="calendar-date">{date.getDate()}</span>
              {dayTrips.map((trip) => (
                <Link
                  key={trip.id}
                  className="calendar-chip"
                  to={`/trips/${trip.id}`}
                  style={{ background: tripColour.get(trip.id) }}
                >
                  {trip.title}
                </Link>
              ))}
            </div>
          )
        })}
      </div>

      <section className="calendar-key" aria-labelledby="calendar-key-heading">
        <div className="section-stamp">
          <span id="calendar-key-heading">THIS MONTH</span>
          <span>{monthTrips.length} {monthTrips.length === 1 ? 'TRIP' : 'TRIPS'}</span>
        </div>

        {monthTrips.length === 0 ? (
          <p className="muted-copy">Nothing scheduled in {monthLabel}.</p>
        ) : (
          <ul className="calendar-legend">
            {monthTrips.map((trip) => (
              <li key={trip.id}>
                <i aria-hidden="true" style={{ background: tripColour.get(trip.id) }} />
                <Link to={`/trips/${trip.id}`}>{trip.title}</Link>
                <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
