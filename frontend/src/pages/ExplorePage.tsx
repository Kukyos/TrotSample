import { useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { searchCities } from '../services/catalog'
import { searchPlaces, savePlace, type PlaceSearchResult } from '../services/places'
import { addActivityToStop, listTrips } from '../services/trips'
import type { City } from '../types/domain'

type Tab = 'cities' | 'activities'
type Sort = 'popular' | 'name' | 'cost'
type SearchStatus = 'idle' | 'loading' | 'success' | 'error'

const CATEGORIES = ['all', 'sightseeing', 'food', 'adventure', 'culture', 'nightlife'] as const

function priceTierLabel(priceTier: number | null) {
  if (priceTier === null) return 'Price unknown'
  return '$'.repeat(Math.max(1, Math.min(4, Math.round(priceTier))))
}

function placeLocation(place: PlaceSearchResult) {
  return [place.locality, place.region, place.countryCode].filter(Boolean).join(', ')
    || place.formattedAddress
    || 'Location details unavailable'
}

export function ExplorePage() {
  const [params, setParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>('cities')
  const [sort, setSort] = useState<Sort>('popular')
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('all')
  const [near, setNear] = useState('')
  const [cities, setCities] = useState<City[]>([])
  const [places, setPlaces] = useState<PlaceSearchResult[]>([])
  const [attribution, setAttribution] = useState('')
  const [activitySearchLabel, setActivitySearchLabel] = useState('')
  const [searchStatus, setSearchStatus] = useState<SearchStatus>('idle')
  const [searchError, setSearchError] = useState('')
  const [placeToAdd, setPlaceToAdd] = useState<PlaceSearchResult | null>(null)
  const queryClient = useQueryClient()
  const tripsQuery = useQuery({ queryKey: ['trips'], queryFn: listTrips })
  const addMutation = useMutation({
    mutationFn: async ({ stopId, cityId }: { stopId: string; cityId: number }) => {
      if (!placeToAdd) throw new Error('Choose a place first.')
      const activityId = await savePlace({ cityId, fsqPlaceId: placeToAdd.fsqPlaceId })
      await addActivityToStop(stopId, activityId)
    },
    onSuccess: async () => {
      setPlaceToAdd(null)
      setSearchError('')
      await queryClient.invalidateQueries({ queryKey: ['trips'] })
    },
    onError: (reason) => {
      setSearchStatus('error')
      setSearchError(reason instanceof Error ? reason.message : 'Place could not be added.')
    },
  })

  const query = params.get('q') ?? ''

  const setQuery = (value: string) => {
    setParams(value ? { q: value } : {}, { replace: true })
  }

  const visibleCities = useMemo(() => {
    return [...cities].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'cost') return (a.cost_index ?? 0) - (b.cost_index ?? 0)
      return (b.population ?? 0) - (a.population ?? 0)
    })
  }, [cities, sort])

  const visibleActivities = useMemo(() => {
    const matched = places.filter((place) => category === 'all' || place.category === category)
    return [...matched].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'cost') return (a.priceTier ?? Number.POSITIVE_INFINITY) - (b.priceTier ?? Number.POSITIVE_INFINITY)
      return (b.providerPopularity ?? -1) - (a.providerPopularity ?? -1)
    })
  }, [places, sort, category])

  const submitSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedQuery = query.trim()
    if (tab === 'cities') {
      if (normalizedQuery.length < 2) {
        setSearchStatus('error')
        setSearchError('Enter at least two letters to search cities.')
        return
      }
      setSearchStatus('loading')
      setSearchError('')
      try {
        setCities(await searchCities(normalizedQuery))
        setSearchStatus('success')
      } catch (error) {
        setCities([])
        setSearchStatus('error')
        setSearchError(error instanceof Error ? error.message : 'City search failed.')
      }
      return
    }

    const normalizedNear = near.trim()
    if (normalizedQuery.length < 2 || normalizedNear.length < 2) {
      setSearchStatus('error')
      setSearchError('Enter both something to do and a city or destination.')
      return
    }

    setSearchStatus('loading')
    setSearchError('')
    try {
      const result = await searchPlaces({
        query: normalizedQuery,
        near: normalizedNear,
        limit: 20,
        sort: sort === 'popular' ? 'popularity' : sort === 'cost' ? 'relevance' : 'relevance',
      })
      setPlaces(result.places)
      setAttribution(result.attribution)
      setActivitySearchLabel(`${normalizedQuery} near ${normalizedNear}`)
      setSearchStatus('success')
    } catch (error) {
      setPlaces([])
      setAttribution('')
      setSearchStatus('error')
      setSearchError(error instanceof Error ? error.message : 'Place search failed.')
    }
  }

  const count = tab === 'cities' ? visibleCities.length : visibleActivities.length

  return (
    <div className="page explore-page">
      <header className="page-head">
        <div>
          <p className="hero-kicker">EXPLORE</p>
          <h1>Find the next<span className="display-italic">place to add.</span></h1>
        </div>
      </header>

      <form className="explore-search" role="search" onSubmit={submitSearch}>
        <label className="visually-hidden" htmlFor="explore-input">Search cities and activities</label>
        <input
          id="explore-input"
          type="search"
          value={query}
          placeholder={tab === 'cities' ? 'Search a city or region' : 'What would you like to do?'}
          onChange={(event) => setQuery(event.target.value)}
        />
        {tab === 'activities' && (
          <>
            <label className="visually-hidden" htmlFor="explore-near">City or destination</label>
            <input
              id="explore-near"
              type="search"
              value={near}
              placeholder="Near city or destination"
              onChange={(event) => setNear(event.target.value)}
            />
          </>
        )}
        <button type="submit" className="ghost-button" disabled={searchStatus === 'loading'}>
          {searchStatus === 'loading' ? 'Searching…' : 'Search'}
        </button>
      </form>

      <div className="explore-controls">
        <div className="tab-row" role="tablist" aria-label="Result type">
          <button type="button" role="tab" aria-selected={tab === 'cities'} onClick={() => setTab('cities')}>
            Cities
          </button>
          <button type="button" role="tab" aria-selected={tab === 'activities'} onClick={() => setTab('activities')}>
            Activities
          </button>
        </div>

        <div className="filter-bar is-inline">
          {tab === 'activities' && (
            <>
              <label htmlFor="explore-category">Category</label>
              <select
                id="explore-category"
                value={category}
                onChange={(event) => setCategory(event.target.value as (typeof CATEGORIES)[number])}
              >
                {CATEGORIES.map((value) => (
                  <option key={value} value={value}>{value === 'all' ? 'All categories' : value}</option>
                ))}
              </select>
            </>
          )}
          <label htmlFor="explore-sort">Sort by</label>
          <select id="explore-sort" value={sort} onChange={(event) => setSort(event.target.value as Sort)}>
            <option value="popular">Most popular</option>
            <option value="name">Name</option>
            <option value="cost">{tab === 'cities' ? 'Cost index' : 'Price tier'}</option>
          </select>
        </div>
      </div>

      {searchStatus === 'error' ? (
        <p className="explore-message is-error" role="alert">{searchError}</p>
      ) : (
        <p className="result-count" role="status" aria-live="polite">
          {searchStatus === 'loading'
            ? tab === 'activities' ? 'Searching Foursquare…' : 'Searching GeoNames cities…'
            : `${count} ${count === 1 ? 'result' : 'results'}${tab === 'cities' && query ? ` for “${query}”` : activitySearchLabel ? ` for “${activitySearchLabel}”` : ''}`}
        </p>
      )}

      {searchStatus === 'idle' ? (
        <div className="empty-state">
          <p>{tab === 'activities' ? 'Enter an activity and destination, then search Foursquare.' : 'Enter a city or region, then search the GeoNames catalog.'}</p>
        </div>
      ) : searchStatus === 'loading' ? (
        <div className="empty-state" aria-hidden="true"><p>Looking for places…</p></div>
      ) : count === 0 ? (
        <div className="empty-state">
          <p>Nothing matches that search yet.</p>
          {tab === 'cities' && <button type="button" className="text-link" onClick={() => setQuery('')}>Clear the search</button>}
        </div>
      ) : tab === 'cities' ? (
        <ul className="city-grid is-wide">
          {visibleCities.map((city) => (
            <li key={city.id}>
              <article className="city-card is-static">
                <span className="city-code">{city.country_code}</span>
                <h3>{city.name}</h3>
                <p>{city.description ?? `Explore ${city.name}${city.region ? ` in ${city.region}` : ''}.`}</p>
                <span className="city-meta">
                  {city.region ?? city.country_code} · population {city.population?.toLocaleString() ?? '—'}
                </span>
                <Link className="ghost-button" to="/trips">Add to a trip</Link>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <ul className="activity-list">
            {visibleActivities.map((place) => (
              <li key={place.fsqPlaceId}>
                <article className="activity-row">
                  <div>
                    <span className={`kind-tag is-${place.category}`}>{place.category}</span>
                    <h3>{place.name}</h3>
                    <p>{place.description || place.providerCategoryName || 'No description is available.'}</p>
                    <span className="city-meta">
                      {placeLocation(place)}
                      {place.rating !== null && ` · rated ${place.rating.toFixed(1)}`}
                      {place.distanceMeters !== null && ` · ${Math.round(place.distanceMeters)} m away`}
                    </span>
                  </div>
                  <div className="activity-cost">
                    <strong>{priceTierLabel(place.priceTier)}</strong>
                    <button type="button" className="ghost-button" onClick={() => setPlaceToAdd(place)}>Add to a trip</button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
          {attribution && <p className="provider-attribution">{attribution}</p>}
          {placeToAdd && (
            <section className="trip-picker" aria-labelledby="trip-picker-title">
              <div><h2 id="trip-picker-title">Add {placeToAdd.name}</h2><button type="button" className="icon-button" onClick={() => setPlaceToAdd(null)} aria-label="Close trip picker">&#10005;</button></div>
              <p className="muted-copy">Choose a draft trip stop. The place will be added unscheduled.</p>
              <ul className="picker-results">
                {(tripsQuery.data ?? []).filter((trip) => trip.state === 'draft').flatMap((trip) => trip.trip_stops.map((stop) => (
                  <li key={stop.id}><button type="button" disabled={addMutation.isPending} onClick={() => addMutation.mutate({ stopId: stop.id, cityId: stop.city_id })}><strong>{trip.title}</strong> · {stop.city.name}</button></li>
                ))) }
              </ul>
              {!tripsQuery.isLoading && !(tripsQuery.data ?? []).some((trip) => trip.state === 'draft') && <p className="muted-copy">Create a draft trip first.</p>}
            </section>
          )}
        </>
      )}
    </div>
  )
}
