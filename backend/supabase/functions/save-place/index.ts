import "@supabase/functions-js/edge-runtime.d.ts"
import { withSupabase } from "@supabase/server"
import {
  normalizeFoursquarePlace,
  type FoursquarePlace,
} from "../search-places/search.ts"

const FOURSQUARE_URL = "https://places-api.foursquare.com/places"
const FOURSQUARE_API_VERSION = "2025-06-17"
const REQUEST_TIMEOUT_MS = 8_000

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } })
}

function parseBody(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("The request body must be an object.")
  }
  const body = value as Record<string, unknown>
  if (!Number.isSafeInteger(body.cityId) || (body.cityId as number) < 1) {
    throw new Error("cityId must be a positive integer.")
  }
  if (typeof body.fsqPlaceId !== "string" || !/^[A-Za-z0-9_-]{3,100}$/.test(body.fsqPlaceId)) {
    throw new Error("fsqPlaceId is invalid.")
  }
  return { cityId: body.cityId as number, fsqPlaceId: body.fsqPlaceId }
}

export default {
  fetch: withSupabase({ auth: "user" }, async (request, context) => {
    if (request.method !== "POST") {
      return json({ error: { code: "method_not_allowed", message: "Use POST." } }, 405)
    }

    let input
    try {
      input = parseBody(await request.json())
    } catch (error) {
      return json({
        error: {
          code: "invalid_request",
          message: error instanceof Error ? error.message : "Send valid JSON.",
        },
      }, 400)
    }

    const serviceKey = Deno.env.get("FOURSQUARE_SERVICE_KEY")
    if (!serviceKey) {
      console.error("save-place is missing a required server secret")
      return json({ error: { code: "service_unavailable", message: "Place saving is not configured." } }, 503)
    }

    const admin = context.supabaseAdmin
    const { data: city, error: cityError } = await admin
      .from("cities")
      .select("id")
      .eq("id", input.cityId)
      .maybeSingle()

    if (cityError) {
      console.error("save-place city lookup failed", { code: cityError.code })
      return json({ error: { code: "database_error", message: "Place saving is temporarily unavailable." } }, 502)
    }
    if (!city) return json({ error: { code: "unknown_city", message: "Choose a valid catalog city." } }, 400)

    const { data: existing, error: existingError } = await admin
      .from("activities")
      .select("id, city_id")
      .eq("fsq_place_id", input.fsqPlaceId)
      .maybeSingle()
    if (existingError) {
      console.error("save-place existing lookup failed", { code: existingError.code })
      return json({ error: { code: "database_error", message: "Place saving is temporarily unavailable." } }, 502)
    }
    if (existing) {
      if (existing.city_id !== input.cityId) {
        return json({ error: { code: "city_mismatch", message: "That place belongs to another saved city." } }, 409)
      }
      return json({ activityId: existing.id })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
      const fields = "fsq_place_id,name,categories,latitude,longitude,location"
      const response = await fetch(
        `${FOURSQUARE_URL}/${encodeURIComponent(input.fsqPlaceId)}?fields=${fields}`,
        {
          headers: {
            Authorization: `Bearer ${serviceKey}`,
            Accept: "application/json",
            "X-Places-Api-Version": FOURSQUARE_API_VERSION,
          },
          signal: controller.signal,
        },
      )

      if (!response.ok) {
        console.error("Foursquare place detail failed", { status: response.status })
        if (response.status === 404) {
          return json({ error: { code: "unknown_place", message: "Foursquare no longer has that place." } }, 404)
        }
        if (response.status === 429) {
          return json({ error: { code: "rate_limited", message: "Place saving is temporarily busy.", retryable: true } }, 503)
        }
        return json({ error: { code: "provider_unavailable", message: "Foursquare is temporarily unavailable.", retryable: true } }, 502)
      }

      const place = normalizeFoursquarePlace(await response.json() as FoursquarePlace)
      if (!place || place.latitude === null || place.longitude === null) {
        return json({ error: { code: "invalid_provider_data", message: "Foursquare returned an incomplete place." } }, 502)
      }

      const { data: activity, error: saveError } = await admin
        .from("activities")
        .upsert({
          city_id: input.cityId,
          fsq_place_id: place.fsqPlaceId,
          name: place.name,
          category: place.category,
          provider_category_id: place.providerCategoryId,
          provider_category_name: place.providerCategoryName,
          description: place.description,
          latitude: place.latitude,
          longitude: place.longitude,
          price_tier: place.priceTier,
          rating: place.rating,
          provider_popularity: place.providerPopularity,
          provider_synced_at: new Date().toISOString(),
        }, { onConflict: "fsq_place_id" })
        .select("id")
        .single()

      if (saveError) {
        console.error("save-place upsert failed", { code: saveError.code })
        return json({ error: { code: "database_error", message: "Place saving is temporarily unavailable." } }, 502)
      }
      return json({ activityId: activity.id })
    } catch (error) {
      const timedOut = error instanceof DOMException && error.name === "AbortError"
      console.error("save-place request failed", { timedOut })
      return json({ error: { code: timedOut ? "provider_timeout" : "provider_unavailable", message: "Place saving is temporarily unavailable.", retryable: true } }, 502)
    } finally {
      clearTimeout(timeout)
    }
  }),
}
