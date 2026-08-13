import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { cityById } from '../fixtures/catalog'
import {
  itemsForStop,
  stopsForTrip,
  tripById,
  type ItemKind,
  type ItineraryItem,
} from '../fixtures/trips'
import { formatMoney, formatTime, KIND_LABELS } from '../lib/trip'
import { NotFoundPanel } from './NotFoundPanel'

const KINDS: ItemKind[] = ['transport', 'stay', 'activity', 'meal', 'other']

type Draft = { stopId: string; kind: ItemKind; title: string; time: string; cost: string }

const emptyDraft = (stopId: string): Draft => ({
  stopId,
  kind: 'activity',
  title: '',
  time: '09:00',
  cost: '',
})

export function BuildItineraryPage() {
  const { tripId } = useParams()
  const trip = tripById(tripId)

  const initialStops = useMemo(() => (trip ? stopsForTrip(trip.id) : []), [trip])
  const initialItems = useMemo(
    () => Object.fromEntries(initialStops.map((stop) => [stop.id, itemsForStop(stop.id)])),
    [initialStops],
  )

  const [stopOrder, setStopOrder] = useState(() => initialStops.map((stop) => stop.id))
  const [items, setItems] = useState<Record<string, ItineraryItem[]>>(initialItems)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [error, setError] = useState('')

  if (!trip) return <NotFoundPanel what="trip" />

  const stopsById = new Map(initialStops.map((stop) => [stop.id, stop]))

  const moveStop = (stopId: string, direction: -1 | 1) => {
    setStopOrder((current) => {
      const index = current.indexOf(stopId)
      const target = index + direction
      if (target < 0 || target >= current.length) return current
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const moveItem = (stopId: string, itemId: string, direction: -1 | 1) => {
    setItems((current) => {
      const list = current[stopId] ?? []
      const index = list.findIndex((item) => item.id === itemId)
      const target = index + direction
      if (index < 0 || target < 0 || target >= list.length) return current
      const next = [...list]
      ;[next[index], next[target]] = [next[target], next[index]]
      return { ...current, [stopId]: next }
    })
  }

  const removeItem = (stopId: string, itemId: string) => {
    setItems((current) => ({
      ...current,
      [stopId]: (current[stopId] ?? []).filter((item) => item.id !== itemId),
    }))
  }

  const addItem = () => {
    if (!draft) return
    if (!draft.title.trim()) return setError('Give the plan a title.')
    const cost = draft.cost ? Number(draft.cost) : 0
    if (Number.isNaN(cost) || cost < 0) return setError('Cost must be zero or more.')

    const stop = stopsById.get(draft.stopId)
    if (!stop) return

    const list = items[draft.stopId] ?? []
    const created: ItineraryItem = {
      id: `draft-${draft.stopId}-${Date.now()}`,
      stop_id: draft.stopId,
      activity_id: null,
      kind: draft.kind,
      title: draft.title.trim(),
      description: null,
      starts_at: `${stop.start_date}T${draft.time}:00Z`,
      ends_at: null,
      position: list.length + 1,
      estimated_cost: cost,
      notes: null,
    }

    setItems((current) => ({ ...current, [draft.stopId]: [...(current[draft.stopId] ?? []), created] }))
    setDraft(null)
    setError('')
  }

  const orderedStops = stopOrder.map((id) => stopsById.get(id)).filter(Boolean)
  const total = Object.values(items).flat().reduce((sum, item) => sum + item.estimated_cost, 0)

  return (
    <div className="page builder-page">
      <header className="page-head">
        <div>
          <p className="hero-kicker">BUILD ITINERARY</p>
          <h1>{trip.title}</h1>
          <p className="muted-copy">
            {orderedStops.length} stops · {formatMoney(total, trip.currency_code)} costed so far
          </p>
        </div>
        <div className="head-actions">
          <Link className="text-link" to={`/trips/${trip.id}`}>View itinerary &#8594;</Link>
          <Link className="button button-primary" to="/trips">Done</Link>
        </div>
      </header>

      {error && <p className="auth-message is-error" role="alert">{error}</p>}

      <ol className="builder-stops">
        {orderedStops.map((stop, index) => {
          if (!stop) return null
          const city = cityById.get(stop.city_id)
          const stopItems = items[stop.id] ?? []
          const stopTotal = stopItems.reduce((sum, item) => sum + item.estimated_cost, 0)

          return (
            <li key={stop.id} className="builder-stop">
              <div className="builder-stop-head">
                <span className="stop-index">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h2>{city?.name ?? 'Unknown city'}</h2>
                  <p>{stop.start_date} → {stop.end_date}</p>
                  {stop.notes && <p className="muted-copy">{stop.notes}</p>}
                </div>
                <div className="builder-stop-meta">
                  <strong>{formatMoney(stopTotal, trip.currency_code)}</strong>
                  <div className="reorder-controls">
                    <button type="button" className="icon-button" onClick={() => moveStop(stop.id, -1)} disabled={index === 0} aria-label={`Move ${city?.name} earlier`}>&#8963;</button>
                    <button type="button" className="icon-button" onClick={() => moveStop(stop.id, 1)} disabled={index === orderedStops.length - 1} aria-label={`Move ${city?.name} later`}>&#8964;</button>
                  </div>
                </div>
              </div>

              {stopItems.length === 0 ? (
                <p className="muted-copy builder-empty">Nothing planned in this city yet.</p>
              ) : (
                <ul className="builder-items">
                  {stopItems.map((item, itemIndex) => (
                    <li key={item.id}>
                      <span className={`kind-tag is-${item.kind}`}>{KIND_LABELS[item.kind]}</span>
                      <span className="item-time">{formatTime(item.starts_at)}</span>
                      <span className="item-title">
                        <strong>{item.title}</strong>
                        {item.description && <small>{item.description}</small>}
                      </span>
                      <span className="item-cost">{formatMoney(item.estimated_cost, trip.currency_code)}</span>
                      <span className="reorder-controls">
                        <button type="button" className="icon-button" onClick={() => moveItem(stop.id, item.id, -1)} disabled={itemIndex === 0} aria-label={`Move ${item.title} earlier`}>&#8963;</button>
                        <button type="button" className="icon-button" onClick={() => moveItem(stop.id, item.id, 1)} disabled={itemIndex === stopItems.length - 1} aria-label={`Move ${item.title} later`}>&#8964;</button>
                        <button type="button" className="icon-button" onClick={() => removeItem(stop.id, item.id)} aria-label={`Remove ${item.title}`}>&#10005;</button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {draft?.stopId === stop.id ? (
                <div className="item-draft">
                  <label>
                    Type
                    <select value={draft.kind} onChange={(event) => setDraft({ ...draft, kind: event.target.value as ItemKind })}>
                      {KINDS.map((kind) => <option key={kind} value={kind}>{KIND_LABELS[kind]}</option>)}
                    </select>
                  </label>
                  <label>
                    Title
                    <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Sagrada Familia" />
                  </label>
                  <label>
                    Starts
                    <input type="time" value={draft.time} onChange={(event) => setDraft({ ...draft, time: event.target.value })} />
                  </label>
                  <label>
                    Cost
                    <input type="number" min="0" step="1" value={draft.cost} onChange={(event) => setDraft({ ...draft, cost: event.target.value })} placeholder="0" />
                  </label>
                  <div className="item-draft-actions">
                    <button type="button" className="auth-submit" onClick={addItem}>Add</button>
                    <button type="button" className="text-link" onClick={() => { setDraft(null); setError('') }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button type="button" className="ghost-button" onClick={() => { setDraft(emptyDraft(stop.id)); setError('') }}>
                  + Add item to {city?.name}
                </button>
              )}
            </li>
          )
        })}
      </ol>

      <p className="muted-copy builder-note">
        Reordering and new items live in this session only until the trip services land.
      </p>
    </div>
  )
}
