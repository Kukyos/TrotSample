import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { searchPlaces, savePlace, type PlaceSearchResult } from '../services/places'
import {
  addActivityToStop,
  addCustomItem,
  finishTrip,
  getTrip,
  removeItem,
  reorderItems,
  reorderStops,
  scheduleItem,
} from '../services/trips'
import { formatMoney, formatTime, KIND_LABELS } from '../lib/trip'
import type { ItemKind } from '../types/domain'
import { NotFoundPanel } from './NotFoundPanel'

const KINDS: ItemKind[] = ['transport', 'stay', 'activity', 'meal', 'other']
type CustomDraft = { stopId: string; kind: ItemKind; title: string; date: string; time: string; cost: string }
type ScheduleDraft = { itemId: string; date: string; time: string; cost: string }
type SearchDraft = { stopId: string; query: string; loading: boolean; results: PlaceSearchResult[] }

export function BuildItineraryPage() {
  const { tripId } = useParams()
  const queryClient = useQueryClient()
  const tripQuery = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => getTrip(tripId!),
    enabled: Boolean(tripId),
  })
  const [customDraft, setCustomDraft] = useState<CustomDraft | null>(null)
  const [scheduleDraft, setScheduleDraft] = useState<ScheduleDraft | null>(null)
  const [placeSearch, setPlaceSearch] = useState<SearchDraft | null>(null)
  const [error, setError] = useState('')

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['trip', tripId] })
    await queryClient.invalidateQueries({ queryKey: ['trips'] })
  }
  const mutation = useMutation({
    mutationFn: async (action: () => Promise<unknown>) => action(),
    onSuccess: () => { setError(''); void refresh() },
    onError: (reason) => setError(reason instanceof Error ? reason.message : 'The change could not be saved.'),
  })

  if (tripQuery.isLoading) return <div className="empty-state"><p>Loading itinerary…</p></div>
  if (tripQuery.isError) return <div className="empty-state"><p role="alert">{tripQuery.error.message}</p></div>
  const trip = tripQuery.data
  if (!trip) return <NotFoundPanel what="trip" />

  const stops = trip.trip_stops
  const total = stops.flatMap((stop) => stop.itinerary_items).reduce((sum, item) => sum + (item.estimated_cost ?? 0), 0)
  const editable = trip.state === 'draft'

  const moveStop = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= stops.length) return
    const ids = stops.map((stop) => stop.id)
    ;[ids[index], ids[target]] = [ids[target], ids[index]]
    mutation.mutate(() => reorderStops(trip.id, ids))
  }

  const moveItem = (stopId: string, itemIndex: number, direction: -1 | 1) => {
    const stop = stops.find((entry) => entry.id === stopId)
    if (!stop) return
    const target = itemIndex + direction
    if (target < 0 || target >= stop.itinerary_items.length) return
    const ids = stop.itinerary_items.map((item) => item.id)
    ;[ids[itemIndex], ids[target]] = [ids[target], ids[itemIndex]]
    mutation.mutate(() => reorderItems(stopId, ids))
  }

  const runPlaceSearch = async (stopId: string) => {
    const stop = stops.find((entry) => entry.id === stopId)
    const query = placeSearch?.stopId === stopId ? placeSearch.query.trim() : ''
    if (!stop || query.length < 2) return setError('Enter at least two letters before searching.')
    setPlaceSearch({ stopId, query, loading: true, results: [] })
    setError('')
    try {
      const result = await searchPlaces({
        query,
        latitude: stop.city.latitude,
        longitude: stop.city.longitude,
        radiusMeters: 30_000,
        limit: 10,
        sort: 'relevance',
      })
      setPlaceSearch({ stopId, query, loading: false, results: result.places })
    } catch (reason) {
      setPlaceSearch({ stopId, query, loading: false, results: [] })
      setError(reason instanceof Error ? reason.message : 'Place search failed.')
    }
  }

  const addPlace = (stopId: string, cityId: number, place: PlaceSearchResult) => {
    mutation.mutate(async () => {
      const activityId = await savePlace({ cityId, fsqPlaceId: place.fsqPlaceId })
      await addActivityToStop(stopId, activityId)
      setPlaceSearch(null)
    })
  }

  const submitCustom = () => {
    if (!customDraft?.title.trim() || !customDraft.date || !customDraft.time) return setError('Set a title, date, and time.')
    const cost = customDraft.cost === '' ? null : Number(customDraft.cost)
    if (cost !== null && (!Number.isFinite(cost) || cost < 0)) return setError('Cost must be zero or more.')
    mutation.mutate(async () => {
      await addCustomItem({ ...customDraft, estimatedCost: cost })
      setCustomDraft(null)
    })
  }

  const submitSchedule = () => {
    if (!scheduleDraft?.date || !scheduleDraft.time) return setError('Set a date and time.')
    const cost = scheduleDraft.cost === '' ? null : Number(scheduleDraft.cost)
    if (cost !== null && (!Number.isFinite(cost) || cost < 0)) return setError('Cost must be zero or more.')
    mutation.mutate(async () => {
      await scheduleItem({ itemId: scheduleDraft.itemId, date: scheduleDraft.date, time: scheduleDraft.time, estimatedCost: cost })
      setScheduleDraft(null)
    })
  }

  return (
    <div className="page builder-page">
      <header className="page-head">
        <div>
          <p className="hero-kicker">BUILD ITINERARY</p>
          <h1>{trip.title}</h1>
          <p className="muted-copy">{stops.length} stops · {formatMoney(total, trip.currency_code)} costed so far</p>
        </div>
        <div className="head-actions">
          <Link className="text-link" to={`/trips/${trip.id}`}>View itinerary &#8594;</Link>
          {editable ? (
            <button className="button button-primary" type="button" disabled={mutation.isPending} onClick={() => mutation.mutate(() => finishTrip(trip.id))}>Finish planning</button>
          ) : <Link className="button button-primary" to="/trips">Done</Link>}
        </div>
      </header>

      {!editable && <p className="auth-message is-success">This trip is planned and read-only.</p>}
      {error && <p className="auth-message is-error" role="alert">{error}</p>}

      <ol className="builder-stops">
        {stops.map((stop, index) => (
          <li key={stop.id} className="builder-stop">
            <div className="builder-stop-head">
              <span className="stop-index">{String(index + 1).padStart(2, '0')}</span>
              <div><h2>{stop.city.name}</h2><p>{stop.start_date ?? 'Dates unset'} → {stop.end_date ?? 'Dates unset'}</p></div>
              <div className="builder-stop-meta">
                <strong>{formatMoney(stop.itinerary_items.reduce((sum, item) => sum + (item.estimated_cost ?? 0), 0), trip.currency_code)}</strong>
                {editable && <div className="reorder-controls"><button type="button" className="icon-button" disabled={index === 0 || mutation.isPending} onClick={() => moveStop(index, -1)} aria-label={`Move ${stop.city.name} earlier`}>&#8963;</button><button type="button" className="icon-button" disabled={index === stops.length - 1 || mutation.isPending} onClick={() => moveStop(index, 1)} aria-label={`Move ${stop.city.name} later`}>&#8964;</button></div>}
              </div>
            </div>

            {stop.itinerary_items.length === 0 ? <p className="muted-copy builder-empty">Nothing planned in this city yet.</p> : (
              <ul className="builder-items">
                {stop.itinerary_items.map((item, itemIndex) => (
                  <li key={item.id} className={item.starts_at ? undefined : 'is-unscheduled'}>
                    <span className={`kind-tag is-${item.kind}`}>{KIND_LABELS[item.kind]}</span>
                    <span className="item-time">{item.starts_at ? formatTime(item.starts_at, stop.city.timezone) : 'Unscheduled'}</span>
                    <span className="item-title"><strong>{item.title}</strong>{item.description && <small>{item.description}</small>}</span>
                    <span className="item-cost">{item.estimated_cost === null ? 'Cost unset' : formatMoney(item.estimated_cost, trip.currency_code)}</span>
                    {editable && <span className="reorder-controls">
                      {!item.starts_at && <button type="button" className="text-link" onClick={() => setScheduleDraft({ itemId: item.id, date: stop.start_date ?? '', time: '09:00', cost: item.estimated_cost?.toString() ?? '' })}>Schedule</button>}
                      <button type="button" className="icon-button" disabled={itemIndex === 0 || mutation.isPending} onClick={() => moveItem(stop.id, itemIndex, -1)} aria-label={`Move ${item.title} earlier`}>&#8963;</button>
                      <button type="button" className="icon-button" disabled={itemIndex === stop.itinerary_items.length - 1 || mutation.isPending} onClick={() => moveItem(stop.id, itemIndex, 1)} aria-label={`Move ${item.title} later`}>&#8964;</button>
                      <button type="button" className="icon-button" disabled={mutation.isPending} onClick={() => mutation.mutate(() => removeItem(item.id))} aria-label={`Remove ${item.title}`}>&#10005;</button>
                    </span>}
                  </li>
                ))}
              </ul>
            )}

            {editable && scheduleDraft && stop.itinerary_items.some((item) => item.id === scheduleDraft.itemId) && (
              <div className="item-draft"><label>Date<input type="date" min={stop.start_date ?? undefined} max={stop.end_date ?? undefined} value={scheduleDraft.date} onChange={(event) => setScheduleDraft({ ...scheduleDraft, date: event.target.value })} /></label><label>Starts<input type="time" value={scheduleDraft.time} onChange={(event) => setScheduleDraft({ ...scheduleDraft, time: event.target.value })} /></label><label>Cost<input type="number" min="0" value={scheduleDraft.cost} onChange={(event) => setScheduleDraft({ ...scheduleDraft, cost: event.target.value })} placeholder="Unknown" /></label><div className="item-draft-actions"><button type="button" className="auth-submit" disabled={mutation.isPending} onClick={submitSchedule}>Save schedule</button><button type="button" className="text-link" onClick={() => setScheduleDraft(null)}>Cancel</button></div></div>
            )}

            {editable && customDraft?.stopId === stop.id ? (
              <div className="item-draft"><label>Type<select value={customDraft.kind} onChange={(event) => setCustomDraft({ ...customDraft, kind: event.target.value as ItemKind })}>{KINDS.map((kind) => <option key={kind} value={kind}>{KIND_LABELS[kind]}</option>)}</select></label><label>Title<input value={customDraft.title} onChange={(event) => setCustomDraft({ ...customDraft, title: event.target.value })} /></label><label>Date<input type="date" min={stop.start_date ?? undefined} max={stop.end_date ?? undefined} value={customDraft.date} onChange={(event) => setCustomDraft({ ...customDraft, date: event.target.value })} /></label><label>Starts<input type="time" value={customDraft.time} onChange={(event) => setCustomDraft({ ...customDraft, time: event.target.value })} /></label><label>Cost<input type="number" min="0" value={customDraft.cost} onChange={(event) => setCustomDraft({ ...customDraft, cost: event.target.value })} /></label><div className="item-draft-actions"><button type="button" className="auth-submit" onClick={submitCustom}>Add</button><button type="button" className="text-link" onClick={() => setCustomDraft(null)}>Cancel</button></div></div>
            ) : editable && <button type="button" className="ghost-button" onClick={() => setCustomDraft({ stopId: stop.id, kind: 'activity', title: '', date: stop.start_date ?? '', time: '09:00', cost: '' })}>+ Add custom item</button>}

            {editable && (
              <div className="builder-place-search">
                <div className="suggestion-search"><input value={placeSearch?.stopId === stop.id ? placeSearch.query : ''} onChange={(event) => setPlaceSearch({ stopId: stop.id, query: event.target.value, loading: false, results: [] })} placeholder={`Search places near ${stop.city.name}`} /><button type="button" className="ghost-button" disabled={placeSearch?.stopId === stop.id && placeSearch.loading} onClick={() => void runPlaceSearch(stop.id)}>{placeSearch?.stopId === stop.id && placeSearch.loading ? 'Searching…' : 'Search Foursquare'}</button></div>
                {placeSearch?.stopId === stop.id && placeSearch.results.length > 0 && <ul className="suggestion-list">{placeSearch.results.map((place) => <li key={place.fsqPlaceId}><div><strong>{place.name}</strong><small>{place.providerCategoryName ?? place.category}</small></div><button type="button" className="text-link" disabled={mutation.isPending} onClick={() => addPlace(stop.id, stop.city_id, place)}>Add</button></li>)}</ul>}
              </div>
            )}
          </li>
        ))}
      </ol>
      <p className="provider-attribution">Powered by Foursquare · City data © GeoNames</p>
    </div>
  )
}
