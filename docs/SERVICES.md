# Frontend Services

Pages and components never import the Supabase client. They use the functions
below; only files inside `frontend/src/services/` may create or call the client.

## Authentication

| Function | Purpose |
| --- | --- |
| `getCurrentViewer()` | Restores the locally persisted Supabase session and returns the semantic viewer, or `null`. |
| `subscribeToAuthChanges(onChange)` | Subscribes to login, token refresh, and logout events; returns an unsubscribe function. |
| `signInWithPassword(email, password)` | Signs in with email and password and returns the viewer. |
| `signUpWithPassword(input)` | Creates an Auth user with `display_name` metadata and reports whether email confirmation is required. |
| `signOutCurrentUser()` | Ends the current browser session. |

`AuthViewer` contains `id`, `email`, `displayName`, and `avatarUrl`. Authorization
must never depend on `displayName`, `avatarUrl`, or other user-editable metadata.

## Place search

`searchPlaces(input)` invokes the authenticated `search-places` Supabase Edge
Function. The browser never calls Foursquare directly and never receives the
Foursquare service key.

The request body is:

```ts
type PlaceSearchInput = {
  query: string
  near?: string
  latitude?: number
  longitude?: number
  radiusMeters?: number // defaults to 20,000; maximum 100,000
  limit?: number // defaults to 10; maximum 20
  sort?: 'relevance' | 'rating' | 'distance' | 'popularity'
}
```

Each request must provide either `near`, or both coordinates, but not both. The
function returns `{ places, attribution }`; `attribution` must be rendered with
the results. Each place has a stable application shape containing its provider
ID, normalized category, provider category, coordinates, address, distance,
price tier, rating, and provider popularity. Foursquare does not provide a
reliable visit duration or exact admission cost in place search, so
`durationMinutes`, `estimatedCost`, and `currencyCode` remain `null` until the
user supplies them or a separate source is introduced.

The current search request uses only Foursquare Pro fields. Premium fields
(`description`, `priceTier`, `rating`, and `providerPopularity`) remain `null`
unless the project purchases API credits and explicitly adds them to the
function's requested field list. Errors use
`{ error: { code, message, retryable? } }`; the frontend should show the message
and offer retry only when `retryable` is true.
