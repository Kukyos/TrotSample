// Placeholder trip data shaped to the `trips`, `trip_stops`, and
// `itinerary_items` columns in docs/SCHEMA.md. Swap for services/ at integration.

export type TripState = 'draft' | 'planned' | 'archived'
export type TripVisibility = 'private' | 'public'
export type ItemKind = 'transport' | 'stay' | 'activity' | 'meal' | 'other'

export type Trip = {
  id: string
  owner_id: string
  title: string
  description: string | null
  start_date: string
  end_date: string
  cover_url: string | null
  budget_amount: number | null
  currency_code: string
  state: TripState
  visibility: TripVisibility
  share_slug: string | null
  published_at: string | null
}

export type TripStop = {
  id: string
  trip_id: string
  city_id: number
  position: number
  start_date: string
  end_date: string
  notes: string | null
}

export type ItineraryItem = {
  id: string
  stop_id: string
  activity_id: number | null
  kind: ItemKind
  title: string
  description: string | null
  starts_at: string
  ends_at: string | null
  position: number
  estimated_cost: number
  notes: string | null
}

const OWNER = '00000000-0000-4000-8000-000000000001'

export const trips: Trip[] = [
  {
    id: 'trip-europe-loop',
    owner_id: OWNER,
    title: 'Europe Loop',
    description: 'Three cities down the Iberian coast and across to Tuscany.',
    start_date: '2026-05-04',
    end_date: '2026-05-17',
    cover_url: '/images/cloud-route.webp',
    budget_amount: 5000,
    currency_code: 'EUR',
    state: 'planned',
    visibility: 'public',
    share_slug: 'europe-loop-2026',
    published_at: '2026-03-02T09:20:00Z',
  },
  {
    id: 'trip-kansai-spring',
    owner_id: OWNER,
    title: 'Kansai in Shoulder Season',
    description: 'Kyoto base, day trips outward, deliberately unhurried.',
    start_date: '2026-08-09',
    end_date: '2026-08-19',
    cover_url: null,
    budget_amount: 420000,
    currency_code: 'JPY',
    state: 'planned',
    visibility: 'private',
    share_slug: null,
    published_at: null,
  },
  {
    id: 'trip-iceland-ring',
    owner_id: OWNER,
    title: 'Iceland, Four Days',
    description: 'Short window, one car, no attempt at the full ring road.',
    start_date: '2026-10-02',
    end_date: '2026-10-06',
    cover_url: null,
    budget_amount: 310000,
    currency_code: 'ISK',
    state: 'draft',
    visibility: 'private',
    share_slug: null,
    published_at: null,
  },
  {
    id: 'trip-morocco-medinas',
    owner_id: OWNER,
    title: 'Marrakesh and the Atlas Edge',
    description: 'Medina week with two nights out towards the mountains.',
    start_date: '2026-02-14',
    end_date: '2026-02-22',
    cover_url: null,
    budget_amount: 14000,
    currency_code: 'MAD',
    state: 'archived',
    visibility: 'public',
    share_slug: 'atlas-edge',
    published_at: '2026-01-08T17:45:00Z',
  },
  {
    id: 'trip-baltic-rail',
    owner_id: OWNER,
    title: 'Slovenia by Rail',
    description: 'Ljubljana and the lakes, entirely without a car.',
    start_date: '2025-09-11',
    end_date: '2025-09-18',
    cover_url: null,
    budget_amount: 1800,
    currency_code: 'EUR',
    state: 'archived',
    visibility: 'private',
    share_slug: null,
    published_at: null,
  },
]

export const tripStops: TripStop[] = [
  { id: 'stop-lis', trip_id: 'trip-europe-loop', city_id: 1, position: 1, start_date: '2026-05-04', end_date: '2026-05-08', notes: 'Alfama apartment, two flights of stairs.' },
  { id: 'stop-bcn', trip_id: 'trip-europe-loop', city_id: 2, position: 2, start_date: '2026-05-08', end_date: '2026-05-13', notes: null },
  { id: 'stop-flr', trip_id: 'trip-europe-loop', city_id: 3, position: 3, start_date: '2026-05-13', end_date: '2026-05-17', notes: 'Return flight leaves at 06:40.' },
  { id: 'stop-kyo', trip_id: 'trip-kansai-spring', city_id: 5, position: 1, start_date: '2026-08-09', end_date: '2026-08-19', notes: 'Single base for the whole trip.' },
  { id: 'stop-rey', trip_id: 'trip-iceland-ring', city_id: 6, position: 1, start_date: '2026-10-02', end_date: '2026-10-06', notes: null },
  { id: 'stop-rak', trip_id: 'trip-morocco-medinas', city_id: 7, position: 1, start_date: '2026-02-14', end_date: '2026-02-22', notes: null },
  { id: 'stop-lju', trip_id: 'trip-baltic-rail', city_id: 8, position: 1, start_date: '2025-09-11', end_date: '2025-09-18', notes: null },
]

export const itineraryItems: ItineraryItem[] = [
  { id: 'item-01', stop_id: 'stop-lis', activity_id: null, kind: 'transport', title: 'Flight to Lisbon', description: 'TP1043, lands 11:20 local.', starts_at: '2026-05-04T08:15:00Z', ends_at: '2026-05-04T11:20:00Z', position: 1, estimated_cost: 210, notes: 'Hold luggage included.' },
  { id: 'item-02', stop_id: 'stop-lis', activity_id: null, kind: 'stay', title: 'Alfama apartment', description: 'Four nights, self check-in.', starts_at: '2026-05-04T15:00:00Z', ends_at: '2026-05-08T10:00:00Z', position: 2, estimated_cost: 480, notes: null },
  { id: 'item-03', stop_id: 'stop-lis', activity_id: 1, kind: 'activity', title: 'Tram 28 end to end', description: 'Board at Campo Ourique to get a seat.', starts_at: '2026-05-05T09:00:00Z', ends_at: '2026-05-05T10:15:00Z', position: 3, estimated_cost: 3, notes: null },
  { id: 'item-04', stop_id: 'stop-lis', activity_id: 2, kind: 'meal', title: 'Time Out Market lunch', description: null, starts_at: '2026-05-05T12:30:00Z', ends_at: '2026-05-05T14:00:00Z', position: 4, estimated_cost: 24, notes: null },
  { id: 'item-05', stop_id: 'stop-lis', activity_id: 3, kind: 'activity', title: 'Belem tower and pasteis', description: null, starts_at: '2026-05-06T10:00:00Z', ends_at: '2026-05-06T13:00:00Z', position: 5, estimated_cost: 18, notes: null },
  { id: 'item-06', stop_id: 'stop-lis', activity_id: 4, kind: 'activity', title: 'Sunset at Senhora do Monte', description: null, starts_at: '2026-05-07T19:30:00Z', ends_at: '2026-05-07T20:30:00Z', position: 6, estimated_cost: 0, notes: 'Bring something to sit on.' },

  { id: 'item-07', stop_id: 'stop-bcn', activity_id: null, kind: 'transport', title: 'Lisbon to Barcelona', description: 'Direct, two hours.', starts_at: '2026-05-08T13:40:00Z', ends_at: '2026-05-08T15:40:00Z', position: 1, estimated_cost: 145, notes: null },
  { id: 'item-08', stop_id: 'stop-bcn', activity_id: null, kind: 'stay', title: 'Eixample studio', description: 'Five nights.', starts_at: '2026-05-08T17:00:00Z', ends_at: '2026-05-13T11:00:00Z', position: 2, estimated_cost: 640, notes: null },
  { id: 'item-09', stop_id: 'stop-bcn', activity_id: 5, kind: 'activity', title: 'Sagrada Familia', description: 'First entry slot, 09:00.', starts_at: '2026-05-09T09:00:00Z', ends_at: '2026-05-09T11:00:00Z', position: 3, estimated_cost: 26, notes: 'Passport needed at the gate.' },
  { id: 'item-10', stop_id: 'stop-bcn', activity_id: 7, kind: 'meal', title: 'El Born tapas crawl', description: null, starts_at: '2026-05-09T20:00:00Z', ends_at: '2026-05-09T23:00:00Z', position: 4, estimated_cost: 45, notes: null },
  { id: 'item-11', stop_id: 'stop-bcn', activity_id: 6, kind: 'activity', title: 'Park Guell terrace', description: null, starts_at: '2026-05-10T10:30:00Z', ends_at: '2026-05-10T13:00:00Z', position: 5, estimated_cost: 10, notes: null },
  { id: 'item-12', stop_id: 'stop-bcn', activity_id: 8, kind: 'activity', title: 'Montjuic cable car', description: null, starts_at: '2026-05-11T15:00:00Z', ends_at: '2026-05-11T16:30:00Z', position: 6, estimated_cost: 14, notes: null },
  { id: 'item-13', stop_id: 'stop-bcn', activity_id: null, kind: 'other', title: 'Laundry and repack', description: null, starts_at: '2026-05-12T17:00:00Z', ends_at: null, position: 7, estimated_cost: 12, notes: null },

  { id: 'item-14', stop_id: 'stop-flr', activity_id: null, kind: 'transport', title: 'Barcelona to Florence', description: 'Early flight, airport bus at 04:30.', starts_at: '2026-05-13T06:50:00Z', ends_at: '2026-05-13T08:40:00Z', position: 1, estimated_cost: 120, notes: null },
  { id: 'item-15', stop_id: 'stop-flr', activity_id: null, kind: 'stay', title: 'Oltrarno guesthouse', description: 'Four nights, breakfast included.', starts_at: '2026-05-13T14:00:00Z', ends_at: '2026-05-17T10:00:00Z', position: 2, estimated_cost: 520, notes: null },
  { id: 'item-16', stop_id: 'stop-flr', activity_id: 9, kind: 'activity', title: 'Uffizi Gallery', description: null, starts_at: '2026-05-14T08:30:00Z', ends_at: '2026-05-14T11:30:00Z', position: 3, estimated_cost: 25, notes: 'Timed ticket, no re-entry.' },
  { id: 'item-17', stop_id: 'stop-flr', activity_id: 10, kind: 'activity', title: 'Duomo cupola climb', description: null, starts_at: '2026-05-15T08:15:00Z', ends_at: '2026-05-15T09:45:00Z', position: 4, estimated_cost: 30, notes: null },
  { id: 'item-18', stop_id: 'stop-flr', activity_id: 12, kind: 'meal', title: 'Mercato Centrale dinner', description: null, starts_at: '2026-05-15T19:30:00Z', ends_at: '2026-05-15T21:00:00Z', position: 5, estimated_cost: 28, notes: null },
  { id: 'item-19', stop_id: 'stop-flr', activity_id: 11, kind: 'activity', title: 'Oltrarno workshops', description: null, starts_at: '2026-05-16T11:00:00Z', ends_at: '2026-05-16T13:00:00Z', position: 6, estimated_cost: 0, notes: null },

  { id: 'item-20', stop_id: 'stop-kyo', activity_id: null, kind: 'stay', title: 'Machiya near Nishiki', description: 'Ten nights, one booking.', starts_at: '2026-08-09T15:00:00Z', ends_at: '2026-08-19T10:00:00Z', position: 1, estimated_cost: 186000, notes: null },
  { id: 'item-21', stop_id: 'stop-kyo', activity_id: 15, kind: 'activity', title: 'Fushimi Inari at dawn', description: null, starts_at: '2026-08-10T05:30:00Z', ends_at: '2026-08-10T08:00:00Z', position: 2, estimated_cost: 0, notes: null },
  { id: 'item-22', stop_id: 'stop-kyo', activity_id: 17, kind: 'activity', title: 'Arashiyama bamboo grove', description: null, starts_at: '2026-08-12T07:00:00Z', ends_at: '2026-08-12T09:00:00Z', position: 3, estimated_cost: 0, notes: null },
  { id: 'item-23', stop_id: 'stop-kyo', activity_id: 16, kind: 'meal', title: 'Nishiki Market', description: null, starts_at: '2026-08-13T11:00:00Z', ends_at: '2026-08-13T12:30:00Z', position: 4, estimated_cost: 2200, notes: null },

  { id: 'item-24', stop_id: 'stop-rey', activity_id: 19, kind: 'activity', title: 'Golden Circle day loop', description: null, starts_at: '2026-10-03T08:00:00Z', ends_at: '2026-10-03T16:00:00Z', position: 1, estimated_cost: 12000, notes: null },
  { id: 'item-25', stop_id: 'stop-rey', activity_id: 18, kind: 'activity', title: 'Blue Lagoon', description: null, starts_at: '2026-10-05T14:00:00Z', ends_at: '2026-10-05T17:00:00Z', position: 2, estimated_cost: 9500, notes: null },

  { id: 'item-26', stop_id: 'stop-rak', activity_id: 20, kind: 'activity', title: 'Jemaa el-Fnaa after dark', description: null, starts_at: '2026-02-15T19:00:00Z', ends_at: '2026-02-15T21:00:00Z', position: 1, estimated_cost: 80, notes: null },
  { id: 'item-27', stop_id: 'stop-rak', activity_id: 21, kind: 'activity', title: 'Jardin Majorelle', description: null, starts_at: '2026-02-16T08:30:00Z', ends_at: '2026-02-16T10:00:00Z', position: 2, estimated_cost: 160, notes: null },

  { id: 'item-28', stop_id: 'stop-lju', activity_id: 22, kind: 'activity', title: 'Ljubljana castle funicular', description: null, starts_at: '2025-09-12T10:00:00Z', ends_at: '2025-09-12T12:00:00Z', position: 1, estimated_cost: 13, notes: null },
]

export function stopsForTrip(tripId: string) {
  return tripStops
    .filter((stop) => stop.trip_id === tripId)
    .sort((a, b) => a.position - b.position)
}

export function itemsForStop(stopId: string) {
  return itineraryItems
    .filter((item) => item.stop_id === stopId)
    .sort((a, b) => a.position - b.position)
}

export function itemsForTrip(tripId: string) {
  const stopIds = new Set(stopsForTrip(tripId).map((stop) => stop.id))
  return itineraryItems.filter((item) => stopIds.has(item.stop_id))
}

export function tripById(tripId: string | undefined) {
  return trips.find((trip) => trip.id === tripId) ?? null
}
