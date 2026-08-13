import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { activities, cityById } from '../fixtures/catalog'
import { communityPosts } from '../fixtures/community'
import { tripById } from '../fixtures/trips'

type Scope = 'all' | 'trips' | 'activities'

const activityById = new Map(activities.map((activity) => [activity.id, activity]))

export function CommunityPage() {
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<Scope>('all')

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return communityPosts.filter((post) => {
      const matchesScope =
        scope === 'all' ||
        (scope === 'trips' && post.trip_id !== null) ||
        (scope === 'activities' && post.activity_id !== null)
      const matchesQuery =
        !needle || `${post.title} ${post.body} ${post.author_name}`.toLowerCase().includes(needle)
      return matchesScope && matchesQuery
    })
  }, [query, scope])

  return (
    <div className="page community-page">
      <header className="page-head">
        <div>
          <p className="hero-kicker">COMMUNITY</p>
          <h1>What other people<span className="display-italic">wish they had known.</span></h1>
        </div>
      </header>

      <div className="filter-bar">
        <label className="visually-hidden" htmlFor="community-search">Search posts</label>
        <input
          id="community-search"
          type="search"
          value={query}
          placeholder="Search experiences"
          onChange={(event) => setQuery(event.target.value)}
        />
        <label htmlFor="community-scope">Show</label>
        <select id="community-scope" value={scope} onChange={(event) => setScope(event.target.value as Scope)}>
          <option value="all">Everything</option>
          <option value="trips">About a trip</option>
          <option value="activities">About an activity</option>
        </select>
      </div>

      {visible.length === 0 ? (
        <div className="empty-state">
          <p>No posts match that filter.</p>
          <button type="button" className="text-link" onClick={() => { setQuery(''); setScope('all') }}>
            Reset filters
          </button>
        </div>
      ) : (
        <ul className="post-list">
          {visible.map((post) => {
            const trip = post.trip_id ? tripById(post.trip_id) : null
            const activity = post.activity_id ? activityById.get(post.activity_id) : null
            const city = activity ? cityById.get(activity.city_id) : null

            return (
              <li key={post.id}>
                <article className="post-card">
                  <header>
                    <span className="post-avatar" aria-hidden="true">
                      {post.author_name.charAt(0)}
                    </span>
                    <div>
                      <strong>{post.author_name}</strong>
                      <small>
                        {new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(post.created_at))}
                      </small>
                    </div>
                  </header>

                  <h2>{post.title}</h2>
                  <p>{post.body}</p>

                  <footer className="post-tags">
                    {trip && (
                      <Link className="post-tag" to={`/trips/${trip.id}`}>
                        Trip · {trip.title}
                      </Link>
                    )}
                    {activity && (
                      <Link className="post-tag" to={`/explore?q=${encodeURIComponent(activity.name)}`}>
                        {city?.name} · {activity.name}
                      </Link>
                    )}
                  </footer>
                </article>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
