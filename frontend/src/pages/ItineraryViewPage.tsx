import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getTrip } from '../services/trips'
import type { ItineraryItem } from '../types/domain'
import {
  formatDateRange,
  formatDay,
  formatMoney,
  formatTime,
  KIND_LABELS,
  tripBudget,
  tripNights,
  tripPhase,
} from '../lib/trip'
import { BarSeries, ChartTable, DonutChart, StatTile } from '../components/ui/charts'
import { NotFoundPanel } from './NotFoundPanel'

export function ItineraryViewPage() {
  const { tripId } = useParams()
  const tripQuery = useQuery({ queryKey: ['trip', tripId], queryFn: () => getTrip(tripId!), enabled: Boolean(tripId) })
  const trip = tripQuery.data

  const days = useMemo(() => {
    if (!trip) return []
    const buckets = new Map<string, { stopName: string; timezone: string; items: ItineraryItem[] }>()

    for (const stop of trip.trip_stops) {
      for (const item of stop.itinerary_items) {
        if (!item.starts_at) continue
        const dayKey = new Intl.DateTimeFormat('en-CA', { timeZone: stop.city.timezone }).format(new Date(item.starts_at))
        const bucket = buckets.get(dayKey) ?? { stopName: stop.city.name, timezone: stop.city.timezone, items: [] }
        bucket.items.push(item)
        buckets.set(dayKey, bucket)
      }
    }

    return [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, bucket]) => ({
        date,
        stopName: bucket.stopName,
        timezone: bucket.timezone,
        items: [...bucket.items].sort((a, b) => (a.starts_at ?? '').localeCompare(b.starts_at ?? '')),
      }))
  }, [trip])

  if (tripQuery.isLoading) return <div className="empty-state"><p>Loading itinerary…</p></div>
  if (tripQuery.isError) return <div className="empty-state"><p role="alert">{tripQuery.error.message}</p></div>
  if (!trip) return <NotFoundPanel what="trip" />

  const budget = tripBudget(trip)
  const phase = tripPhase(trip)
  const slices = budget.slices.map((slice) => ({
    label: slice.label,
    value: slice.amount,
    display: formatMoney(slice.amount, budget.currency),
  }))

  return (
    <div className="page itinerary-page">
      <header className="page-head">
        <div>
          <p className="hero-kicker">ITINERARY</p>
          <h1>{trip.title}</h1>
          <p className="muted-copy">
            {formatDateRange(trip.start_date, trip.end_date)} · {tripNights(trip)} days ·{' '}
            {trip.trip_stops.length} cities
          </p>
        </div>
        <div className="head-actions">
          <span className={`phase-tag is-${phase}`}>{phase}</span>
          <Link className="button button-primary" to={`/trips/${trip.id}/build`}>
            Edit itinerary <span aria-hidden="true">&#8599;</span>
          </Link>
        </div>
      </header>

      <section className="budget-panel" aria-labelledby="budget-heading">
        <div className="section-stamp">
          <span id="budget-heading">BUDGET</span>
          <span>{trip.currency_code}</span>
        </div>

        <div className="budget-grid">
          <DonutChart
            title={`Spend by category for ${trip.title}`}
            slices={slices}
            centerValue={budget.share !== null ? `${Math.round(budget.share * 100)}%` : '—'}
            centerLabel={budget.budget !== null ? 'of budget' : 'no budget set'}
          />

          <div className="budget-side">
            <div className="stat-row">
              <StatTile label="Costed" value={formatMoney(budget.spent, budget.currency)} />
              <StatTile
                label={budget.overBudget ? 'Over by' : 'Remaining'}
                value={budget.remaining === null ? '—' : formatMoney(Math.abs(budget.remaining), budget.currency)}
                note={budget.budget === null ? 'No budget set' : `of ${formatMoney(budget.budget, budget.currency)}`}
              />
              <StatTile label="Average day" value={formatMoney(budget.perDay, budget.currency)} />
            </div>

            <BarSeries
              title="Where the money goes"
              slices={slices}
              caption="Sorted by amount. Shading follows rank, not category."
            />

            <ChartTable caption={`Spend by category for ${trip.title}`} slices={slices} />
          </div>
        </div>
      </section>

      <section className="day-list" aria-labelledby="days-heading">
        <div className="section-stamp">
          <span id="days-heading">DAY BY DAY</span>
          <span>{days.length} PLANNED DAYS</span>
        </div>

        {days.length === 0 ? (
          <div className="empty-state">
            <p>Nothing planned yet.</p>
            <Link className="button button-primary" to={`/trips/${trip.id}/build`}>Start building</Link>
          </div>
        ) : (
          <ol className="days">
            {days.map((day, index) => (
              <li key={day.date}>
                <div className="day-head">
                  <span className="stop-index">DAY {String(index + 1).padStart(2, '0')}</span>
                  <h3>{formatDay(`${day.date}T12:00:00Z`, day.timezone)}</h3>
                  <span className="day-city">{day.stopName}</span>
                </div>
                <ul className="day-items">
                  {day.items.map((item) => (
                    <li key={item.id}>
                      <span className="item-time">{formatTime(item.starts_at!, day.timezone)}</span>
                      <span className={`kind-tag is-${item.kind}`}>{KIND_LABELS[item.kind]}</span>
                      <span className="item-title">
                        <strong>{item.title}</strong>
                        {item.description && <small>{item.description}</small>}
                        {item.notes && <small className="item-note">{item.notes}</small>}
                      </span>
                      <span className="item-cost">
                        {item.estimated_cost === null ? 'Cost unset' : item.estimated_cost > 0 ? formatMoney(item.estimated_cost, trip.currency_code) : 'Free'}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}
