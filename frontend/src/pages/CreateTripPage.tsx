import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { activitiesForCity, cities } from '../fixtures/catalog'
import { formatMoney } from '../lib/trip'

type StopDraft = {
  key: string
  cityId: number | ''
  startDate: string
  endDate: string
}

const CURRENCIES = ['EUR', 'GBP', 'USD', 'JPY', 'ISK', 'MAD']

let nextKey = 0
const makeStop = (): StopDraft => ({ key: `stop-${nextKey++}`, cityId: '', startDate: '', endDate: '' })

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
  const [saved, setSaved] = useState(false)

  const suggestions = useMemo(() => {
    const chosen = stops.map((stop) => stop.cityId).filter((id): id is number => id !== '')
    if (chosen.length === 0) return []
    return chosen.flatMap((cityId) => activitiesForCity(cityId).slice(0, 3))
  }, [stops])

  const updateStop = (key: string, patch: Partial<StopDraft>) => {
    setStops((current) => current.map((stop) => (stop.key === key ? { ...stop, ...patch } : stop)))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError('')

    if (!title.trim()) return setError('Give the trip a name.')
    if (!startDate || !endDate) return setError('Set both a start and an end date.')
    if (endDate < startDate) return setError('The end date cannot be before the start date.')
    if (budget && Number(budget) < 0) return setError('A budget cannot be negative.')

    const filled = stops.filter((stop) => stop.cityId !== '')
    if (filled.length === 0) return setError('Add at least one city.')

    for (const stop of filled) {
      if (stop.startDate && (stop.startDate < startDate || stop.startDate > endDate)) {
        return setError('Every stop must start inside the trip dates.')
      }
      if (stop.endDate && (stop.endDate < startDate || stop.endDate > endDate)) {
        return setError('Every stop must end inside the trip dates.')
      }
    }

    // ponytail: no persistence until Praneet's trip services exist. The form
    // validates for real and then hands off to the builder for the demo path.
    setSaved(true)
    window.setTimeout(() => navigate('/trips/trip-europe-loop/build'), 900)
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

          <label>
            Trip name
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Europe Loop"
            />
          </label>

          <label>
            Description
            <textarea
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Three cities down the Iberian coast and across to Tuscany."
            />
          </label>

          <div className="field-row">
            <label>
              Start date
              <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </label>
            <label>
              End date
              <input type="date" value={endDate} min={startDate || undefined} onChange={(event) => setEndDate(event.target.value)} />
            </label>
          </div>

          <div className="field-row">
            <label>
              Budget
              <input
                type="number"
                min="0"
                step="50"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                placeholder="5000"
              />
            </label>
            <label>
              Currency
              <select value={currency} onChange={(event) => setCurrency(event.target.value)}>
                {CURRENCIES.map((code) => <option key={code} value={code}>{code}</option>)}
              </select>
            </label>
          </div>
        </section>

        <section className="form-block">
          <div className="section-stamp"><span>THE ROUTE</span><span>02 / 03</span></div>

          <ol className="stop-drafts">
            {stops.map((stop, index) => (
              <li key={stop.key}>
                <span className="stop-index">{String(index + 1).padStart(2, '0')}</span>
                <div className="stop-draft-fields">
                  <label>
                    City
                    <select
                      value={stop.cityId}
                      onChange={(event) => updateStop(stop.key, { cityId: event.target.value ? Number(event.target.value) : '' })}
                    >
                      <option value="">Select a place</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>{city.name}, {city.country_code}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Arrive
                    <input
                      type="date"
                      value={stop.startDate}
                      min={startDate || undefined}
                      max={endDate || undefined}
                      onChange={(event) => updateStop(stop.key, { startDate: event.target.value })}
                    />
                  </label>
                  <label>
                    Leave
                    <input
                      type="date"
                      value={stop.endDate}
                      min={stop.startDate || startDate || undefined}
                      max={endDate || undefined}
                      onChange={(event) => updateStop(stop.key, { endDate: event.target.value })}
                    />
                  </label>
                </div>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setStops((current) => current.filter((entry) => entry.key !== stop.key))}
                  disabled={stops.length === 1}
                  aria-label={`Remove stop ${index + 1}`}
                >
                  &#10005;
                </button>
              </li>
            ))}
          </ol>

          <button type="button" className="ghost-button" onClick={() => setStops((current) => [...current, makeStop()])}>
            + Add another section
          </button>
        </section>

        <section className="form-block">
          <div className="section-stamp"><span>SUGGESTIONS</span><span>03 / 03</span></div>

          {suggestions.length === 0 ? (
            <p className="muted-copy">Pick a city and suggested places will appear here.</p>
          ) : (
            <ul className="suggestion-list">
              {suggestions.map((activity) => (
                <li key={activity.id}>
                  <div>
                    <strong>{activity.name}</strong>
                    <small>{activity.category} · {activity.duration_minutes ?? 0} min</small>
                  </div>
                  <span>{formatMoney(activity.estimated_cost, activity.currency_code)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {error && <p className="auth-message is-error" role="alert">{error}</p>}
        {saved && <p className="auth-message is-success" role="status">Trip shape saved. Opening the itinerary builder…</p>}

        <div className="form-actions">
          <button className="auth-submit" type="submit" disabled={saved}>
            {saved ? 'Opening…' : 'Create trip →'}
          </button>
          <Link className="text-link" to="/trips">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
