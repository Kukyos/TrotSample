import { getSupabaseClient } from './supabase'

export type PlaceCategory =
  | 'sightseeing'
  | 'food'
  | 'adventure'
  | 'culture'
  | 'nightlife'
  | 'other'

export type PlaceSearchResult = {
  provider: 'foursquare'
  fsqPlaceId: string
  name: string
  category: PlaceCategory
  providerCategoryId: string | null
  providerCategoryName: string | null
  description: string | null
  latitude: number | null
  longitude: number | null
  locality: string | null
  region: string | null
  countryCode: string | null
  formattedAddress: string | null
  distanceMeters: number | null
  durationMinutes: null
  estimatedCost: null
  currencyCode: null
  priceTier: number | null
  rating: number | null
  providerPopularity: number | null
}

export type PlaceSearchInput = {
  query: string
  near?: string
  latitude?: number
  longitude?: number
  radiusMeters?: number
  limit?: number
  sort?: 'relevance' | 'rating' | 'distance' | 'popularity'
}

type PlaceSearchResponse = {
  places: PlaceSearchResult[]
  attribution: string
}

type FunctionErrorBody = {
  error?: { message?: unknown }
}

async function functionErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'context' in error) {
    const context = error.context
    if (context instanceof Response) {
      try {
        const body = await context.clone().json() as FunctionErrorBody
        if (typeof body.error?.message === 'string') return body.error.message
      } catch {
        // Fall back to the SDK's error message when the body is not JSON.
      }
    }
  }

  return error instanceof Error ? error.message : 'Place search failed.'
}

export async function searchPlaces(input: PlaceSearchInput) {
  const { data, error } = await getSupabaseClient().functions.invoke<PlaceSearchResponse>(
    'search-places',
    { body: input },
  )

  if (error) throw new Error(await functionErrorMessage(error))
  if (!data || !Array.isArray(data.places)) {
    throw new Error('Place search returned an invalid response.')
  }

  return data
}

export async function savePlace(input: { cityId: number; fsqPlaceId: string }) {
  const { data, error } = await getSupabaseClient().functions.invoke<{ activityId: number }>(
    'save-place',
    { body: input },
  )
  if (error) throw new Error(await functionErrorMessage(error))
  if (!data || !Number.isSafeInteger(data.activityId)) {
    throw new Error('Place saving returned an invalid response.')
  }
  return data.activityId
}
