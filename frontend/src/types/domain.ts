export type TripState = 'draft' | 'planned' | 'archived'
export type TripVisibility = 'private' | 'public'
export type ItemKind = 'transport' | 'stay' | 'activity' | 'meal' | 'other'

export type City = {
  id: number
  geonames_id: number
  name: string
  country_code: string
  region: string | null
  timezone: string
  latitude: number
  longitude: number
  population: number | null
  description: string | null
  image_url: string | null
  cost_index: number | null
}

export type Activity = {
  id: number
  city_id: number
  fsq_place_id: string
  name: string
  category: 'sightseeing' | 'food' | 'adventure' | 'culture' | 'nightlife' | 'other'
  provider_category_name: string | null
  description: string | null
  latitude: number
  longitude: number
  duration_minutes: number | null
  estimated_cost: number | null
  currency_code: string | null
}

export type ItineraryItem = {
  id: string
  stop_id: string
  activity_id: number | null
  kind: ItemKind
  title: string
  description: string | null
  starts_at: string | null
  ends_at: string | null
  position: number
  estimated_cost: number | null
  notes: string | null
}

export type TripStop = {
  id: string
  trip_id: string
  city_id: number
  position: number
  start_date: string | null
  end_date: string | null
  notes: string | null
  city: City
  itinerary_items: ItineraryItem[]
}

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
  trip_stops: TripStop[]
}
