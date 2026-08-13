import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth/auth-context'
import { getPopularCities } from '../services/catalog'
import { listTrips } from '../services/trips'
import { formatDateRange, formatMoney, tripBudget, tripCityNames, tripPhase } from '../lib/trip'
import { StatTile } from '../components/ui/charts'

export function ProfilePage() {
  const { viewer } = useAuth()

  const [displayName, setDisplayName] = useState(viewer?.displayName ?? '')
  const [bio, setBio] = useState('')
  const [homeCity, setHomeCity] = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [language, setLanguage] = useState('en')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const tripsQuery = useQuery({ queryKey: ['trips'], queryFn: listTrips })
  const citiesQuery = useQuery({ queryKey: ['cities', 'profile'], queryFn: () => getPopularCities(50) })
  const trips = useMemo(() => tripsQuery.data ?? [], [tripsQuery.data])
  const cities = citiesQuery.data ?? []

  const planned = trips.filter((trip) => tripPhase(trip) !== 'completed')
  const previous = trips.filter((trip) => tripPhase(trip) === 'completed')
  const countries = new Set(trips.flatMap((trip) => trip.trip_stops.map((stop) => stop.city.country_code)))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSaved(false)

    if (!displayName.trim()) return setError('A display name is required.')
    if (countryCode && !/^[A-Z]{2}$/.test(countryCode.toUpperCase())) {
      return setError('Country code must be two letters, like PT or JP.')
    }

    // ponytail: validates against the documented profiles constraints, but does
    // not persist — profile writes belong to the services layer.
    setSaved(true)
  }

  return (
    <div className="page profile-page">
      <header className="page-head">
        <div>
          <p className="hero-kicker">YOUR PROFILE</p>
          <h1>{viewer?.displayName || viewer?.email || 'Your account'}</h1>
          <p className="muted-copy">{viewer?.email}</p>
        </div>
      </header>

      <div className="stat-row">
        <StatTile label="Trips planned" value={String(trips.length)} />
        <StatTile label="Cities visited" value={String(countries.size)} />
        <StatTile label="Completed" value={String(previous.length)} />
      </div>

      <div className="profile-grid">
        <form className="profile-form form-block" onSubmit={handleSubmit} noValidate>
          <div className="section-stamp"><span>YOUR DETAILS</span><span>EDITABLE</span></div>

          <label>
            Display name
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          </label>

          <label>
            Bio
            <textarea
              rows={3}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="Slow trips, long walks, and too many photographs of doors."
            />
          </label>

          <div className="field-row">
            <label>
              Home city
              <input
                list="profile-cities"
                value={homeCity}
                onChange={(event) => setHomeCity(event.target.value)}
                placeholder="Lisbon"
              />
              <datalist id="profile-cities">
                {cities.map((city) => <option key={city.id} value={city.name} />)}
              </datalist>
            </label>
            <label>
              Country code
              <input
                value={countryCode}
                maxLength={2}
                onChange={(event) => setCountryCode(event.target.value.toUpperCase())}
                placeholder="PT"
              />
            </label>
          </div>

          <label>
            Language
            <select value={language} onChange={(event) => setLanguage(event.target.value)}>
              <option value="en">English</option>
              <option value="pt">Português</option>
              <option value="es">Español</option>
              <option value="ja">日本語</option>
            </select>
          </label>

          {error && <p className="auth-message is-error" role="alert">{error}</p>}
          {saved && <p className="auth-message is-success" role="status">Details validated. Saving arrives with the profile service.</p>}

          <button className="auth-submit" type="submit">Save changes →</button>

          <p className="muted-copy">
            {/* Admin has no role check yet, so it stays out of the primary nav and
                is reachable only from here. Gate on Auth app_metadata before launch. */}
            Staff only: <Link className="text-link" to="/admin">open the admin panel</Link>
          </p>
        </form>

        <div className="profile-trips">
          <section>
            <div className="section-stamp"><span>PREPLANNED TRIPS</span><span>{planned.length}</span></div>
            {planned.length === 0 ? (
              <p className="muted-copy">Nothing planned yet.</p>
            ) : (
              <ul className="mini-trip-list">
                {planned.map((trip) => {
                  const budget = tripBudget(trip)
                  return (
                    <li key={trip.id}>
                      <Link to={`/trips/${trip.id}`}>
                        <strong>{trip.title}</strong>
                        <small>{formatDateRange(trip.start_date, trip.end_date)}</small>
                        <span>{formatMoney(budget.spent, budget.currency)}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section>
            <div className="section-stamp"><span>PREVIOUS TRIPS</span><span>{previous.length}</span></div>
            {previous.length === 0 ? (
              <p className="muted-copy">No completed trips yet.</p>
            ) : (
              <ul className="mini-trip-list">
                {previous.map((trip) => (
                  <li key={trip.id}>
                    <Link to={`/trips/${trip.id}`}>
                      <strong>{trip.title}</strong>
                      <small>{formatDateRange(trip.start_date, trip.end_date)}</small>
                      <span>{tripCityNames(trip).length} cities</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
