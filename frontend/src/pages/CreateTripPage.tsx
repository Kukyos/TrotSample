import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { searchCities } from '../services/catalog'
import { searchPlaces, savePlace, type PlaceSearchResult } from '../services/places'
import { createTrip } from '../services/trips'
import type { City } from '../types/domain'

type StopDraft = {
  key: string
  city: City | null
  cityQuery: string
  cityResults: City[]
  citySearching: boolean
  activityQuery: string
  activityResults: PlaceSearchResult[]
  activitySearching: boolean
  selectedPlaces: PlaceSearchResult[]
  startDate: string
  endDate: string
}

const CURRENCIES = ['EUR', 'GBP', 'USD', 'JPY', 'ISK', 'MAD', 'INR']
let nextKey = 0
const makeStop = (): StopDraft => ({
  key: `stop-${nextKey++}`,
  city: null,
  cityQuery: '',
  cityResults: [],
  citySearching: false,
  activityQuery: '',
  activityResults: [],
  activitySearching: false,
  selectedPlaces: [],
  startDate: '',
  endDate: '',
})

export function CreateTripPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [stops, setStops] = useState<StopDraft[]>([makeStop()])
  const [error, setError] = useState('')

  const updateStop = (key: string, patch: Partial<StopDraft>) => {
    setStops((current) => current.map((stop) => (stop.key === key ? { ...stop, ...patch } : stop)))
  }

  const searchForCities = async (stop: StopDraft) => {
    if (stop.cityQuery.trim().length < 2) return setError('Enter at least two letters to search cities.')
    updateStop(stop.key, { citySearching: true })
    setError('')
    try {
      updateStop(stop.key, { cityResults: await searchCities(stop.cityQuery), citySearching: false })
    } catch (reason) {
      updateStop(stop.key, { citySearching: false })
      setError(reason instanceof Error ? reason.message : 'City search failed.')
    }
  }

  const searchForActivities = async (stop: StopDraft) => {
    if (!stop.city) return setError('Choose a city before searching for activities.')
    if (stop.activityQuery.trim().length < 2) return setError('Enter at least two letters to search activities.')
    updateStop(stop.key, { activitySearching: true })
    setError('')
    try {
      const result = await searchPlaces({
        query: stop.activityQuery.trim(),
        latitude: stop.city.latitude,
        longitude: stop.city.longitude,
        radiusMeters: 30_000,
        limit: 10,
        sort: 'relevance',
      })
      updateStop(stop.key, { activityResults: result.places, activitySearching: false })
    } catch (reason) {
      updateStop(stop.key, { activitySearching: false })
      setError(reason instanceof Error ? reason.message : 'Activity search failed.')
    }
  }

  const togglePlace = (stop: StopDraft, place: PlaceSearchResult) => {
    const selected = stop.selectedPlaces.some((entry) => entry.fsqPlaceId === place.fsqPlaceId)
    updateStop(stop.key, {
      selectedPlaces: selected
        ? stop.selectedPlaces.filter((entry) => entry.fsqPlaceId !== place.fsqPlaceId)
        : [...stop.selectedPlaces, place],
    })
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      const normalizedStops = await Promise.all(stops.map(async (stop) => {
        if (!stop.city) throw new Error('Every stop needs a selected city.')
        const activityIds = await Promise.all(
          stop.selectedPlaces.map((place) => savePlace({ cityId: stop.city!.id, fsqPlaceId: place.fsqPlaceId })),
        )
        return {
          cityId: stop.city.id,
          startDate: stop.startDate,
          endDate: stop.endDate,
          activityIds,
        }
      }))
      return createTrip({
        title: title.trim(),
        description: description.trim(),
        startDate,
        endDate,
        budgetAmount: budget,
        currencyCode: currency,
        stops: normalizedStops,
      })
    },
    onSuccess: (tripId) => navigate(`/trips/${tripId}/build`, { replace: true }),
    onError: (reason) => setError(reason instanceof Error ? reason.message : 'Trip creation failed.'),
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!title.trim()) return setError('Give the trip a name.')
    if (!startDate || !endDate) return setError('Set both a start and an end date.')
    if (endDate < startDate) return setError('The end date cannot be before the start date.')
    if (budget && Number(budget) < 0) return setError('A budget cannot be negative.')
    if (stops.some((stop) => !stop.city)) return setError('Choose a city for every stop.')
    if (stops.some((stop) => !stop.startDate || !stop.endDate)) return setError('Set arrival and departure dates for every stop.')
    if (stops.some((stop) => stop.startDate < startDate || stop.endDate > endDate || stop.endDate < stop.startDate)) {
      return setError('Every stop must have valid dates inside the trip.')
    }
    createMutation.mutate()
  }

  return (
    <div className="page create-page">
      <header className="page-head">
        <div>
          <p className="hero-kicker">PLAN A NEW TRIP</p>
          <h1>Start with the shape.<span className="display-italic">Fill in the days later.</span></h1>
        </div>
        <Link className="text-link" to="/trips">&#8592; Back to trips</Link>
      </header>

      <form className="create-form" onSubmit={handleSubmit} noValidate>
        <section className="form-block">
          <div className="section-stamp"><span>THE BASICS</span><span>01 / 03</span></div>
          <label>Trip name<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Europe Loop" /></label>
          <label>Description<textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What should you remember about this route?" /></label>
          <div className="field-row">
            <label>Start date<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
            <label>End date<input type="date" value={endDate} min={startDate || undefined} onChange={(event) => setEndDate(event.target.value)} /></label>
          </div>
          <div className="field-row">
            <label>Budget<input type="number" min="0" step="50" value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="5000" /></label>
            <label>Currency<select value={currency} onChange={(event) => setCurrency(event.target.value)}>{CURRENCIES.map((code) => <option key={code}>{code}</option>)}</select></label>
          </div>
        </section>

        <section className="form-block">
          <div className="section-stamp"><span>THE ROUTE</span><span>02 / 03</span></div>
          <ol className="stop-drafts">
            {stops.map((stop, index) => (
              <li key={stop.key}>
                <span className="stop-index">{String(index + 1).padStart(2, '0')}</span>
                <div className="stop-draft-fields">
                  <div className="catalog-picker">
                    <label>City<input value={stop.cityQuery} onChange={(event) => updateStop(stop.key, { cityQuery: event.target.value, city: null })} placeholder="Search a city" /></label>
                    <button type="button" className="ghost-button" disabled={stop.citySearching} onClick={() => void searchForCities(stop)}>{stop.citySearching ? 'Searching…' : 'Find city'}</button>
                    {stop.cityResults.length > 0 && !stop.city && (
                      <ul className="picker-results">
                        {stop.cityResults.map((city) => (
                          <li key={city.id}><button type="button" onClick={() => updateStop(stop.key, { city, cityQuery: `${city.name}, ${city.country_code}`, cityResults: [] })}>{city.name}, {city.region ? `${city.region}, ` : ''}{city.country_code}</button></li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <label>Arrive<input type="date" value={stop.startDate} min={startDate || undefined} max={endDate || undefined} onChange={(event) => updateStop(stop.key, { startDate: event.target.value })} /></label>
                  <label>Leave<input type="date" value={stop.endDate} min={stop.startDate || startDate || undefined} max={endDate || undefined} onChange={(event) => updateStop(stop.key, { endDate: event.target.value })} /></label>
                </div>
                <button type="button" className="icon-button" onClick={() => setStops((current) => current.filter((entry) => entry.key !== stop.key))} disabled={stops.length === 1} aria-label={`Remove stop ${index + 1}`}>&#10005;</button>
              </li>
            ))}
          </ol>
          <button type="button" className="ghost-button" onClick={() => setStops((current) => [...current, makeStop()])}>+ Add another section</button>
        </section>

        <section className="form-block">
          <div className="section-stamp"><span>FIND PLACES</span><span>03 / 03</span></div>
          <p className="muted-copy">Foursquare is called only when you press Search. Selected places enter the builder unscheduled.</p>
          <div className="creation-suggestions">
            {stops.map((stop) => (
              <section key={stop.key} className="suggestion-stop">
                <h3>{stop.city?.name ?? 'Choose a city first'}</h3>
                <div className="suggestion-search">
                  <input value={stop.activityQuery} onChange={(event) => updateStop(stop.key, { activityQuery: event.target.value })} placeholder="Museum, restaurant, landmark…" disabled={!stop.city} />
                  <button type="button" className="ghost-button" disabled={!stop.city || stop.activitySearching} onClick={() => void searchForActivities(stop)}>{stop.activitySearching ? 'Searching…' : 'Search Foursquare'}</button>
                </div>
                {stop.activityResults.length > 0 && (
                  <ul className="suggestion-list">
                    {stop.activityResults.map((place) => {
                      const selected = stop.selectedPlaces.some((entry) => entry.fsqPlaceId === place.fsqPlaceId)
                      return <li key={place.fsqPlaceId}><div><strong>{place.name}</strong><small>{place.providerCategoryName ?? place.category}</small></div><button type="button" className="text-link" aria-pressed={selected} onClick={() => togglePlace(stop, place)}>{selected ? 'Selected ✓' : 'Select'}</button></li>
                    })}
                  </ul>
                )}
              </section>
            ))}
          </div>
          <p className="provider-attribution">Powered by Foursquare · City data © GeoNames</p>
        </section>

        {error && <p className="auth-message is-error" role="alert">{error}</p>}
        {createMutation.isPending && <p className="auth-message is-success" role="status">Saving selected places and creating your trip…</p>}
        <div className="form-actions">
          <button className="auth-submit" type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? 'Creating…' : 'Create trip →'}</button>
          <Link className="text-link" to="/trips">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
