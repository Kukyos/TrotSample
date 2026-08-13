import "@supabase/functions-js/edge-runtime.d.ts"
import { withSupabase } from "@supabase/server"
import {
  buildFoursquareUrl,
  normalizeFoursquarePlace,
  parseSearchRequest,
  ValidationError,
  type FoursquareSearchResponse,
} from "./search.ts"

const FOURSQUARE_SEARCH_URL = "https://places-api.foursquare.com/places/search"
const FOURSQUARE_API_VERSION = "2025-06-17"
const FUNCTION_VERSION = "2026-08-13-pro-fields"
const REQUEST_TIMEOUT_MS = 8_000

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  })
}

export default {
  fetch: withSupabase({ auth: "user" }, async (request) => {
    if (request.method !== "POST") {
      return json({ error: { code: "method_not_allowed", message: "Use POST." } }, 405)
    }

    let input
    try {
      input = parseSearchRequest(await request.json())
    } catch (error) {
      if (error instanceof ValidationError) {
        return json({ error: { code: "invalid_request", message: error.message } }, 400)
      }
      return json({ error: { code: "invalid_json", message: "Send a valid JSON body." } }, 400)
    }

    const serviceKey = Deno.env.get("FOURSQUARE_SERVICE_KEY")
    if (!serviceKey) {
      console.error("search-places is missing FOURSQUARE_SERVICE_KEY")
      return json({ error: { code: "service_unavailable", message: "Place search is not configured." } }, 503)
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const response = await fetch(buildFoursquareUrl(FOURSQUARE_SEARCH_URL, input), {
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          Accept: "application/json",
          "X-Places-Api-Version": FOURSQUARE_API_VERSION,
        },
        signal: controller.signal,
      })

      if (!response.ok) {
        console.error("Foursquare place search failed", { status: response.status })

        if (response.status === 429) {
          const providerError = await response.clone().json().catch(() => null) as { message?: unknown } | null
          const providerMessage = typeof providerError?.message === "string" ? providerError.message : ""
          if (/no API credits remaining|Purchasing credits is required/i.test(providerMessage)) {
            return json({
              error: {
                code: "provider_credits_unavailable",
                message: "Foursquare rejected this request because the account has no API credits for it.",
                retryable: false,
              },
              functionVersion: FUNCTION_VERSION,
            }, 503)
          }
          return json({ error: { code: "rate_limited", message: "Place search is temporarily busy. Try again shortly.", retryable: true } }, 503)
        }
        if (response.status >= 400 && response.status < 500 && response.status !== 401 && response.status !== 403) {
          return json({ error: { code: "provider_rejected_request", message: "Foursquare could not search that location." } }, 400)
        }
        return json({ error: { code: "provider_unavailable", message: "Place search is temporarily unavailable.", retryable: true } }, 502)
      }

      const payload = await response.json() as FoursquareSearchResponse
      const places = Array.isArray(payload.results)
        ? payload.results.map(normalizeFoursquarePlace).filter((place) => place !== null)
        : []

      return json({
        places,
        attribution: "Powered by Foursquare",
        functionVersion: FUNCTION_VERSION,
      })
    } catch (error) {
      const timedOut = error instanceof DOMException && error.name === "AbortError"
      console.error("Foursquare place search request failed", { timedOut })
      return json({
        error: {
          code: timedOut ? "provider_timeout" : "provider_unavailable",
          message: "Place search is temporarily unavailable.",
          retryable: true,
        },
      }, 502)
    } finally {
      clearTimeout(timeout)
    }
  }),
}
