export type PlaceCategory =
  | "sightseeing"
  | "food"
  | "adventure"
  | "culture"
  | "nightlife"
  | "other"

export type PlaceSearchInput = {
  query: string
  near?: string
  latitude?: number
  longitude?: number
  radiusMeters: number
  limit: number
  sort: "RELEVANCE" | "RATING" | "DISTANCE" | "POPULARITY"
}

type FoursquareCategory = { fsq_category_id?: string; name?: string }
type FoursquareLocation = {
  locality?: string
  region?: string
  country?: string
  country_code?: string
  formatted_address?: string
}

export type FoursquarePlace = {
  fsq_place_id?: string
  name?: string
  categories?: FoursquareCategory[]
  description?: string
  latitude?: number
  longitude?: number
  location?: FoursquareLocation
  distance?: number
  price?: number
  rating?: number
  popularity?: number
}

export type FoursquareSearchResponse = { results?: FoursquarePlace[] }

export class ValidationError extends Error {}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ValidationError("The request body must be a JSON object.")
  }
  return value as Record<string, unknown>
}

function optionalString(value: unknown, field: string, maxLength: number): string | undefined {
  if (value === undefined || value === null || value === "") return undefined
  if (typeof value !== "string") throw new ValidationError(`${field} must be text.`)
  const normalized = value.trim()
  if (normalized.length < 2 || normalized.length > maxLength) {
    throw new ValidationError(`${field} must contain 2 to ${maxLength} characters.`)
  }
  return normalized
}

function optionalNumber(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ValidationError(`${field} must be a finite number.`)
  }
  return value
}

export function parseSearchRequest(value: unknown): PlaceSearchInput {
  const body = record(value)
  const query = optionalString(body.query, "query", 100)
  if (!query) throw new ValidationError("query is required.")

  const near = optionalString(body.near, "near", 120)
  const latitude = optionalNumber(body.latitude, "latitude")
  const longitude = optionalNumber(body.longitude, "longitude")
  const hasCoordinates = latitude !== undefined || longitude !== undefined

  if (!near && !hasCoordinates) {
    throw new ValidationError("Provide near or both latitude and longitude.")
  }
  if (near && hasCoordinates) {
    throw new ValidationError("Provide near or coordinates, not both.")
  }
  if (hasCoordinates && (latitude === undefined || longitude === undefined)) {
    throw new ValidationError("Both latitude and longitude are required.")
  }
  if (latitude !== undefined && (latitude < -90 || latitude > 90)) {
    throw new ValidationError("latitude must be between -90 and 90.")
  }
  if (longitude !== undefined && (longitude < -180 || longitude > 180)) {
    throw new ValidationError("longitude must be between -180 and 180.")
  }

  const radius = body.radiusMeters ?? 20_000
  if (!Number.isInteger(radius) || (radius as number) < 1 || (radius as number) > 100_000) {
    throw new ValidationError("radiusMeters must be an integer from 1 to 100000.")
  }

  const limit = body.limit ?? 10
  if (!Number.isInteger(limit) || (limit as number) < 1 || (limit as number) > 20) {
    throw new ValidationError("limit must be an integer from 1 to 20.")
  }

  const rawSort = body.sort ?? "relevance"
  if (typeof rawSort !== "string" || !["relevance", "rating", "distance", "popularity"].includes(rawSort)) {
    throw new ValidationError("sort must be relevance, rating, distance, or popularity.")
  }

  return {
    query,
    near,
    latitude,
    longitude,
    radiusMeters: radius as number,
    limit: limit as number,
    sort: rawSort.toUpperCase() as PlaceSearchInput["sort"],
  }
}

export function buildFoursquareUrl(baseUrl: string, input: PlaceSearchInput): URL {
  const url = new URL(baseUrl)
  url.searchParams.set("query", input.query)
  url.searchParams.set("limit", String(input.limit))
  url.searchParams.set("sort", input.sort)
  url.searchParams.set("fields", [
    "fsq_place_id",
    "name",
    "categories",
    "latitude",
    "longitude",
    "location",
    "distance",
  ].join(","))

  if (input.near) {
    url.searchParams.set("near", input.near)
  } else {
    url.searchParams.set("ll", `${input.latitude},${input.longitude}`)
    url.searchParams.set("radius", String(input.radiusMeters))
  }
  return url
}

function appCategory(providerName: string): PlaceCategory {
  const name = providerName.toLowerCase()
  if (/night|club|cocktail|pub|bar/.test(name)) return "nightlife"
  if (/restaurant|food|cafe|coffee|bakery|dessert/.test(name)) return "food"
  if (/museum|gallery|theat|culture|library|historic/.test(name)) return "culture"
  if (/park|trail|hiking|beach|outdoor|sport|adventure/.test(name)) return "adventure"
  if (/landmark|monument|attraction|temple|church|palace|viewpoint/.test(name)) return "sightseeing"
  return "other"
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

export function normalizeFoursquarePlace(place: FoursquarePlace) {
  if (!place.fsq_place_id || !place.name) return null
  const providerCategory = place.categories?.find((category) => category.name) ?? place.categories?.[0]
  const providerCategoryName = providerCategory?.name ?? ""

  return {
    provider: "foursquare" as const,
    fsqPlaceId: place.fsq_place_id,
    name: place.name,
    category: appCategory(providerCategoryName),
    providerCategoryId: providerCategory?.fsq_category_id ?? null,
    providerCategoryName: providerCategoryName || null,
    description: place.description ?? null,
    latitude: finiteNumber(place.latitude),
    longitude: finiteNumber(place.longitude),
    locality: place.location?.locality ?? null,
    region: place.location?.region ?? null,
    countryCode: place.location?.country_code ?? place.location?.country ?? null,
    formattedAddress: place.location?.formatted_address ?? null,
    distanceMeters: finiteNumber(place.distance),
    durationMinutes: null,
    estimatedCost: null,
    currencyCode: null,
    priceTier: finiteNumber(place.price),
    rating: finiteNumber(place.rating),
    providerPopularity: finiteNumber(place.popularity),
  }
}
