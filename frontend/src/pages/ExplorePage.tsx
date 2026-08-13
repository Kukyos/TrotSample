import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { activities, cities, cityById } from '../fixtures/catalog'
import { formatMoney } from '../lib/trip'

type Tab = 'cities' | 'activities'
type Sort = 'popular' | 'name' | 'cost'

const CATEGORIES = ['all', 'sightseeing', 'food', 'adventure', 'culture', 'nightlife'] as const

export function ExplorePage() {
  const [params, setParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>('cities')
  const [sort, setSort] = useState<Sort>('popular')
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('all')

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
    const matched = activities.filter((activity) => {
      const city = cityById.get(activity.city_id)
      const haystack = `${activity.name} ${activity.description ?? ''} ${city?.name ?? ''}`.toLowerCase()
      const matchesQuery = !needle || haystack.includes(needle)
      const matchesCategory = category === 'all' || activity.category === category
      return matchesQuery && matchesCategory
    })
    return [...matched].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'cost') return a.estimated_cost - b.estimated_cost
      return b.popularity_score - a.popularity_score
    })
  }, [needle, sort, category])

  const count = tab === 'cities' ? visibleCities.length : visibleActivities.length

  return (
    <div className="page explore-page">
      <header className="page-head">
        <div>
          <p className="hero-kicker">EXPLORE</p>
          <h1>Find the next<span className="display-italic">place to add.</span></h1>
        </div>
      </header>

      <div className="explore-search" role="search">
        <label className="visually-hidden" htmlFor="explore-input">Search cities and activities</label>
        <input
          id="explore-input"
          type="search"
          value={query}
          placeholder="Search a city, a region, or something to do"
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

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
            <option value="cost">{tab === 'cities' ? 'Cost index' : 'Price'}</option>
          </select>
        </div>
      </div>

      <p className="result-count" role="status">
        {count} {count === 1 ? 'result' : 'results'}{query && ` for “${query}”`}
      </p>

      {count === 0 ? (
        <div className="empty-state">
          <p>Nothing matches that search yet.</p>
          <button type="button" className="text-link" onClick={() => setQuery('')}>Clear the search</button>
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
                <button type="button" className="ghost-button">Add to a trip</button>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="activity-list">
          {visibleActivities.map((activity) => (
            <li key={activity.id}>
              <article className="activity-row">
                <div>
                  <span className={`kind-tag is-${activity.category}`}>{activity.category}</span>
                  <h3>{activity.name}</h3>
                  <p>{activity.description}</p>
                  <span className="city-meta">
                    {cityById.get(activity.city_id)?.name} · {activity.duration_minutes ?? 0} min
                  </span>
                </div>
                <div className="activity-cost">
                  <strong>
                    {activity.estimated_cost > 0
                      ? formatMoney(activity.estimated_cost, activity.currency_code)
                      : 'Free'}
                  </strong>
                  <button type="button" className="ghost-button">Add to a trip</button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
