import { useMemo, useState } from 'react'
import { activities, cities, cityById } from '../fixtures/catalog'
import { communityPosts } from '../fixtures/community'
import { trips } from '../fixtures/trips'
import { BarSeries, StatTile, TrendLine } from '../components/ui/charts'

// Stand-in analytics. docs/SCHEMA.md lists popular cities, popular activities,
// and admin analytics as calculated data, so these become SQL views or RPC
// functions in Praneet's layer — never new columns.
const SIGNUPS = [
  { label: 'Feb', value: 48 },
  { label: 'Mar', value: 61 },
  { label: 'Apr', value: 74 },
  { label: 'May', value: 96 },
  { label: 'Jun', value: 118 },
  { label: 'Jul', value: 141 },
  { label: 'Aug', value: 173 },
]

const MANAGED_USERS = [
  { id: 'u-1', name: 'Nadia Rahman', city: 'Lisbon', trips: 6, joined: '2026-01-14', active: true },
  { id: 'u-2', name: 'Tomas Vidal', city: 'Barcelona', trips: 4, joined: '2026-02-02', active: true },
  { id: 'u-3', name: 'Priya Anand', city: 'Marrakesh', trips: 9, joined: '2025-11-20', active: true },
  { id: 'u-4', name: 'Erik Lindqvist', city: 'Reykjavik', trips: 2, joined: '2026-03-08', active: false },
  { id: 'u-5', name: 'Mei Lin Chow', city: 'Ljubljana', trips: 5, joined: '2026-04-11', active: true },
  { id: 'u-6', name: 'Daniel Okafor', city: 'Florence', trips: 3, joined: '2026-05-30', active: true },
]

export function AdminPage() {
  const [query, setQuery] = useState('')

  const popularCities = useMemo(
    () =>
      [...cities]
        .sort((a, b) => b.popularity_score - a.popularity_score)
        .slice(0, 5)
        .map((city) => ({ label: city.name, value: city.popularity_score, display: String(city.popularity_score) })),
    [],
  )

  const popularActivities = useMemo(
    () =>
      [...activities]
        .sort((a, b) => b.popularity_score - a.popularity_score)
        .slice(0, 5)
        .map((activity) => ({
          label: `${activity.name} · ${cityById.get(activity.city_id)?.name ?? ''}`,
          value: activity.popularity_score,
          display: String(activity.popularity_score),
        })),
    [],
  )

  const visibleUsers = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return MANAGED_USERS.filter((user) =>
      !needle || `${user.name} ${user.city}`.toLowerCase().includes(needle),
    )
  }, [query])

  return (
    <div className="page admin-page">
      <header className="page-head">
        <div>
          <p className="hero-kicker">ADMIN PANEL</p>
          <h1>How the platform<span className="display-italic">is actually being used.</span></h1>
        </div>
      </header>

      <div className="stat-row">
        <StatTile label="Registered users" value="173" note="+32 this month" />
        <StatTile label="Trips created" value={String(trips.length * 47)} note="across all users" />
        <StatTile label="Cities in catalog" value={String(cities.length)} />
        <StatTile label="Community posts" value={String(communityPosts.length * 12)} />
      </div>

      <section className="admin-charts" aria-labelledby="admin-trends">
        <div className="section-stamp">
          <span id="admin-trends">USER TRENDS AND ANALYTICS</span>
          <span>LAST 7 MONTHS</span>
        </div>

        <div className="chart-pair">
          <TrendLine
            title="New registrations per month"
            points={SIGNUPS}
            caption="Cumulative growth since the February launch."
          />
          <BarSeries
            title="Popular cities"
            slices={popularCities}
            caption="Ranked by popularity score. Shading follows rank."
          />
        </div>

        <BarSeries
          title="Popular activities"
          slices={popularActivities}
          caption="Top five across every city in the catalog."
        />
      </section>

      <section className="admin-users" aria-labelledby="admin-users-heading">
        <div className="section-stamp">
          <span id="admin-users-heading">MANAGE USERS</span>
          <span>{visibleUsers.length} SHOWN</span>
        </div>

        <div className="filter-bar">
          <label className="visually-hidden" htmlFor="admin-user-search">Search users</label>
          <input
            id="admin-user-search"
            type="search"
            value={query}
            placeholder="Search by name or city"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        {visibleUsers.length === 0 ? (
          <div className="empty-state">
            <p>No users match “{query}”.</p>
            <button type="button" className="text-link" onClick={() => setQuery('')}>Clear the search</button>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="admin-table">
              <caption className="visually-hidden">Registered users</caption>
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Home city</th>
                  <th scope="col">Trips</th>
                  <th scope="col">Joined</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((user) => (
                  <tr key={user.id}>
                    <th scope="row">{user.name}</th>
                    <td>{user.city}</td>
                    <td>{user.trips}</td>
                    <td>{new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(user.joined))}</td>
                    <td>
                      <span className={`state-tag is-${user.active ? 'planned' : 'archived'}`}>
                        {user.active ? 'active' : 'dormant'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="muted-copy">
          Admin access must come from trusted Auth <code>app_metadata</code>. This screen is
          presentation only until that check exists in the services layer.
        </p>
      </section>
    </div>
  )
}
