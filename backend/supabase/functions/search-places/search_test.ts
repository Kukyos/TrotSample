import {
  buildFoursquareUrl,
  normalizeFoursquarePlace,
  parseSearchRequest,
  ValidationError,
} from "./search.ts"

Deno.test("parses and normalizes a near search", () => {
  const input = parseSearchRequest({ query: "  museums ", near: " Paris, France ", limit: 5 })
  if (input.query !== "museums" || input.near !== "Paris, France" || input.limit !== 5) {
    throw new Error("search input was not normalized")
  }

  const url = buildFoursquareUrl("https://example.test/search", input)
  if (url.searchParams.get("near") !== "Paris, France" || url.searchParams.has("ll")) {
    throw new Error("near search URL is incorrect")
  }
  const fields = url.searchParams.get("fields") ?? ""
  if (["description", "price", "rating", "popularity"].some((field) => fields.split(",").includes(field))) {
    throw new Error("search requests must not consume unavailable premium credits")
  }
})

Deno.test("requires an explicit search location", () => {
  try {
    parseSearchRequest({ query: "museum" })
    throw new Error("expected validation to fail")
  } catch (error) {
    if (!(error instanceof ValidationError)) throw error
  }
})

Deno.test("normalizes a Foursquare result to the application contract", () => {
  const place = normalizeFoursquarePlace({
    fsq_place_id: "fsq-1",
    name: "City Museum",
    categories: [{ fsq_category_id: "10027", name: "History Museum" }],
    latitude: 48.86,
    longitude: 2.34,
    price: 2,
  })

  if (!place || place.category !== "culture" || place.priceTier !== 2) {
    throw new Error("place result was not normalized")
  }
  if (place.estimatedCost !== null || place.durationMinutes !== null) {
    throw new Error("unknown application estimates must remain null")
  }
})
