import { useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { cities } from '../fixtures/catalog'
import { searchPlaces, type PlaceSearchResult } from '../services/places'

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
  const [places, setPlaces] = useState<PlaceSearchResult[]>([])
  const [attribution, setAttribution] = useState('')
  const [activitySearchLabel, setActivitySearchLabel] = useState('')
  const [searchStatus, setSearchStatus] = useState<SearchStatus>('idle')
  const [searchError, setSearchError] = useState('')

  const query = params.get('q') ?? ''
  const needle = query.trim().toLowerCase()

  const setQuery = (value: string) => {
    setParams(value ? { q: value } : {}, { replace: true })
  }

  const visibleCities = useMemo(() => {
    const matched = cities.filter((city) =>
      !needle ||
      `${city.name} ${city.country_code} ${city.region ?? ''} ${city.description ?? ''}`
        .toLowerCase()
        .includes(needle),
    )
    return [...matched].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'cost') return (a.cost_index ?? 0) - (b.cost_index ?? 0)
      return b.popularity_score - a.popularity_score
    })
  }, [needle, sort])

  const visibleActivities = useMemo(() => {
    const matched = places.filter((place) => category === 'all' || place.category === category)
    return [...matched].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'cost') return (a.priceTier ?? Number.POSITIVE_INFINITY) - (b.priceTier ?? Number.POSITIVE_INFINITY)
      return (b.providerPopularity ?? -1) - (a.providerPopularity ?? -1)
    })
  }, [places, sort, category])

  const searchActivities = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (tab !== 'activities') return

    const normalizedQuery = query.trim()
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

      <form className="explore-search" role="search" onSubmit={searchActivities}>
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
            <button type="submit" className="ghost-button" disabled={searchStatus === 'loading'}>
              {searchStatus === 'loading' ? 'Searching…' : 'Search'}
            </button>
          </>
        )}
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

      {tab === 'activities' && searchStatus === 'error' ? (
        <p className="explore-message is-error" role="alert">{searchError}</p>
      ) : (
        <p className="result-count" role="status" aria-live="polite">
          {searchStatus === 'loading'
            ? 'Searching Foursquare…'
            : `${count} ${count === 1 ? 'result' : 'results'}${tab === 'cities' && query ? ` for “${query}”` : activitySearchLabel ? ` for “${activitySearchLabel}”` : ''}`}
        </p>
      )}

      {tab === 'activities' && searchStatus === 'idle' ? (
        <div className="empty-state">
          <p>Enter an activity and destination, then search Foursquare.</p>
        </div>
      ) : searchStatus === 'loading' && tab === 'activities' ? (
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
                <p>{city.description}</p>
                <span className="city-meta">
                  {city.region} · cost index {city.cost_index?.toFixed(1) ?? '—'}
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
                    <Link className="ghost-button" to="/trips">Add to a trip</Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>
          {attribution && <p className="provider-attribution">{attribution}</p>}
        </>
      )}
    </div>
  )
}
