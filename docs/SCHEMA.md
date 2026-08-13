# GlobeTrotter Schema

This is the source of truth for the GlobeTrotter database and its external
catalog dependencies. If a table, column, RPC, or calculated result is not
listed here, update this file before using it in code.

The current frontend needs seven application tables:

```text
auth.users
├── profiles
├── trips
│   └── trip_stops
│       └── itinerary_items
└── community_posts

cities ── activities
```

`trip_members` and `saved_cities` are not part of this build because the
frontend has no collaboration or bookmarking controls. They should not be
created until those workflows exist.

## User flow and data touchpoints

- An anonymous visitor enters at `/`, then uses `/login` to sign in or create an
  account. A successful login currently goes to `/dashboard`.
- Every application route is protected. Opening a protected deep link while
  anonymous redirects to `/login`; the current login implementation then goes
  to `/dashboard`, rather than returning to the original deep link.
- `/dashboard` reads the viewer's active trips, budget totals, and popular
  cities. Search forwards to `/explore?q=...`.
- `/trips/new` creates a trip and its ordered city stops in one transaction,
  then opens `/trips/:tripId/build`.
- `/trips` searches and sorts the viewer's trips. `/trips/:tripId` presents the
  itinerary and calculated budget, while `/trips/:tripId/build` changes stop
  order and itinerary items.
- `/explore` searches cities and live Foursquare places. Its current "Add to a
  trip" link only opens `/trips`; selecting a destination trip is a future UI
  step, not a separate schema feature.
- `/calendar` derives trip spans from trip dates. `/community` reads public
  experience posts. `/profile` reads the user's trips alongside the already
  implemented profile. `/admin` reads trusted aggregate and user-search RPCs.

## Basic conventions

- Supabase Auth owns login credentials and email in `auth.users`.
- Use lowercase `snake_case` names.
- User-owned records use `uuid`; catalog records use `bigint identity`.
- Use `date` for trip and stop dates, `timestamptz` for exact instants, and
  `numeric(12,2)` for money.
- Currency codes are uppercase ISO 4217 codes and country codes are uppercase
  ISO 3166-1 alpha-2 codes.
- Every table has `created_at timestamptz not null default now()`. Mutable tables
  also have `updated_at timestamptz not null default now()`; these shared fields
  are omitted from the table lists below.
- Every public table has RLS enabled. Data API privileges are explicitly granted
  per role; a grant makes an object reachable and RLS limits its rows.
- Provider secrets, the Supabase service-role key, and secret keys never enter
  the Vite bundle.

## Tables

### `profiles`

Public-safe information for a user. Email remains in Supabase Auth; phone
numbers are not stored here.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, FK -> `auth.users.id` |
| `display_name` | `text` | Required |
| `avatar_url` | `text` | Optional |
| `bio` | `text` | Optional |
| `home_city` | `text` | Optional |
| `home_country_code` | `text` | Optional ISO country code |
| `language_code` | `text` | Default `en` |

### `cities`

Stable destination records used for trip stops, city search, and regional
recommendations. Import these from the GeoNames cities dataset rather than
creating a runtime dependency on its web service.

| Column | Type | Notes |
|---|---|---|
| `id` | `bigint identity` | PK |
| `geonames_id` | `bigint` | Required, unique GeoNames identifier |
| `name` | `text` | Required display name |
| `country_code` | `text` | Required ISO country code |
| `region` | `text` | Optional administrative region |
| `timezone` | `text` | Required IANA timezone identifier |
| `latitude` | `numeric(9,6)` | Required, between -90 and 90 |
| `longitude` | `numeric(9,6)` | Required, between -180 and 180 |
| `population` | `bigint` | Optional, non-negative |
| `description` | `text` | Optional GlobeTrotter editorial copy |
| `image_url` | `text` | Optional owned or licensed image URL |
| `cost_index` | `numeric(3,2)` | Optional GlobeTrotter value from 1 to 5 |

`geonames_id` is unique. Normalized name plus country code is indexed but not
unique because different regions can contain cities with the same name. City
popularity is calculated from trip usage; population is only its cold-start
fallback.

### `activities`

Places returned by the live Foursquare Places API that have been selected for a
trip, community post, or short-lived search cache. This table records provider
identity and normalized fields; it is not a bulk copy of Foursquare's catalog.

| Column | Type | Notes |
|---|---|---|
| `id` | `bigint identity` | PK |
| `city_id` | `bigint` | FK -> `cities.id` |
| `fsq_place_id` | `text` | Required, unique Foursquare place identifier |
| `name` | `text` | Required provider display name |
| `category` | `text` | `sightseeing`, `food`, `adventure`, `culture`, `nightlife`, or `other` |
| `provider_category_id` | `text` | Optional Foursquare category identifier |
| `provider_category_name` | `text` | Optional Foursquare category label |
| `description` | `text` | Optional provider description |
| `latitude` | `numeric(9,6)` | Required, between -90 and 90 |
| `longitude` | `numeric(9,6)` | Required, between -180 and 180 |
| `image_url` | `text` | Optional provider photo URL, subject to provider rules |
| `duration_minutes` | `integer` | Optional local estimate, positive when present |
| `estimated_cost` | `numeric(12,2)` | Optional local estimate, non-negative when present |
| `currency_code` | `text` | Required when `estimated_cost` is present |
| `price_tier` | `smallint` | Optional Foursquare tier from 1 to 4 |
| `rating` | `numeric(3,1)` | Optional Foursquare rating from 0 to 10 |
| `provider_popularity` | `numeric(5,4)` | Optional Foursquare score from 0 to 1 |
| `provider_synced_at` | `timestamptz` | Required timestamp of the last provider response |

An unknown price is `null`, not zero; zero explicitly means free. Foursquare
does not reliably provide visit duration or an exact ticket cost, so these are
optional local estimates. Search results may be returned without persisting
them; persist a normalized activity before referencing it from another table.

### `trips`

The top-level record for a user's travel plan.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `owner_id` | `uuid` | Required FK -> `auth.users.id` |
| `title` | `text` | Required, non-blank |
| `description` | `text` | Optional |
| `start_date` | `date` | Required |
| `end_date` | `date` | Required, not before `start_date` |
| `cover_url` | `text` | Optional owned or licensed image URL |
| `budget_amount` | `numeric(12,2)` | Optional, non-negative |
| `currency_code` | `text` | Required trip reporting currency |
| `state` | `text` | `draft`, `planned`, or `archived` |
| `visibility` | `text` | `private` or `public` |
| `share_slug` | `text` | Optional, unique when present |
| `published_at` | `timestamptz` | Optional publication time |

Upcoming, ongoing, and completed are calculated from trip dates; they are not
stored states. A public trip must have `share_slug` and `published_at`; a private
trip has neither. The current UI does not clone trips, so there is no
`source_trip_id`.

### `trip_stops`

Ordered cities in a multi-city trip.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `trip_id` | `uuid` | Required FK -> `trips.id` on delete cascade |
| `city_id` | `bigint` | Required FK -> `cities.id` |
| `position` | `integer` | Required positive order within the trip |
| `start_date` | `date` | Optional while draft; otherwise within trip dates |
| `end_date` | `date` | Optional while draft; otherwise within trip dates and not before start |
| `notes` | `text` | Optional |

Unique: `(trip_id, position)`. A `planned` trip requires complete stop dates.
Stops must follow their position order without overlapping; adjacent stops may
share a travel day.

### `itinerary_items`

Ordered plans inside a stop. One table handles transport, stays, activities,
meals, and custom entries.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `stop_id` | `uuid` | Required FK -> `trip_stops.id` on delete cascade |
| `activity_id` | `bigint` | Optional FK -> `activities.id` on delete set null |
| `kind` | `text` | `transport`, `stay`, `activity`, `meal`, or `other` |
| `title` | `text` | Required non-blank snapshot |
| `description` | `text` | Optional snapshot |
| `starts_at` | `timestamptz` | Optional while the trip is a draft; required before it becomes planned |
| `ends_at` | `timestamptz` | Optional, after `starts_at` |
| `position` | `integer` | Required positive order within the stop |
| `estimated_cost` | `numeric(12,2)` | Optional, non-negative, in the trip currency |
| `notes` | `text` | Optional user-authored notes |

Unique: `(stop_id, position)`. Provider details are copied into the title and
description when an item is created so an existing itinerary remains stable if
the provider changes or removes a place. Item timestamps must fall within the
stop's local dates using the linked city's IANA timezone.

### `community_posts`

Public travel experiences displayed by the current read-only community feed.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `author_id` | `uuid` | Required FK -> `auth.users.id` |
| `trip_id` | `uuid` | Optional FK -> `trips.id` on delete set null |
| `activity_id` | `bigint` | Optional FK -> `activities.id` on delete set null |
| `title` | `text` | Required, non-blank |
| `body` | `text` | Required, non-blank |
| `image_url` | `text` | Optional owned or licensed image URL |

If `trip_id` is set, the linked trip must be public. The frontend does not yet
create, edit, react to, or comment on posts, so authenticated clients receive
read access only. Seed or trusted admin tooling owns writes for this build.

## Database API and mutations

Pages call functions in `frontend/src/services/`; pages never call Supabase or
Foursquare directly.

| Operation | Contract |
|---|---|
| `create_trip(input jsonb)` | Authenticated RPC that validates the trip and at least one stop, inserts the trip and ordered stops atomically, and returns the new trip ID. The owner always comes from `auth.uid()`. |
| `search_city_catalog(query text, limit integer)` | Authenticated, indexed lookup over imported GeoNames city names and regions. |
| `add_activity_to_stop(stop_id uuid, activity_id bigint)` | Owner-authorized RPC that snapshots a normalized activity into the next unscheduled itinerary position. |
| `schedule_itinerary_item(...)` | Resolves a city-local date/time through the stored IANA timezone and schedules a draft item inside its stop. |
| `add_custom_itinerary_item(...)` | Adds a scheduled transport, stay, activity, meal, or custom entry to an owned draft stop. |
| `reorder_trip_stops(trip_id uuid, ordered_stop_ids uuid[])` | Owner-authorized RPC that requires exactly the trip's current stop IDs, then rewrites positions atomically. |
| `reorder_itinerary_items(stop_id uuid, ordered_item_ids uuid[])` | Owner-authorized RPC with the same complete-set and atomicity rules for a stop's items. |
| `finish_trip(trip_id uuid)` | Narrow authenticated RPC that refuses to plan a trip until all stop dates and itinerary schedules are valid. |
| Trip/stop/item CRUD | Owner-scoped Data API operations for ordinary edits and deletion; catalog-linked activity selection first normalizes the provider record. |
| `admin_dashboard()` | Admin-only RPC returning registered-user, trip, city, and community counts plus monthly registrations and popular city/activity series. |
| `admin_search_users(query text)` | Admin-only RPC returning profile ID/name/home city, owned-trip count, join date, and active/dormant status. |

Reordering uses RPCs because temporary unique-position collisions and partial
updates must not be visible. Privileged functions use an empty `search_path`,
derive the caller from `auth.uid()`, reject unauthorized callers explicitly,
and revoke `EXECUTE` from `PUBLIC` before granting it narrowly.

## Access rules

| Table | Who can read? | Who can change it? |
|---|---|---|
| `profiles` | Everyone | The profile owner |
| `cities`, `activities` | Everyone | Trusted ingestion/admin code only |
| `trips` | Owner, or authenticated users when public | Owner |
| `trip_stops`, `itinerary_items` | Anyone allowed to read the parent trip | Trip owner |
| `community_posts` | Authenticated users | Trusted seed/admin code only in this build |

Catalog tables grant `SELECT` to `authenticated`; ingestion writes use a secret
server context. User tables grant only the operations needed above and combine
grants with ownership RLS. Child-table policies check ownership or public access
through their parent trip. `UPDATE` policies include both `USING` and
`WITH CHECK` and have matching `SELECT` policies.

Admin access is based only on trusted Auth `app_metadata`, never editable
`user_metadata`. Admin RPCs perform that check inside the database. The `/admin`
route must also be UI-gated, but hiding a route is not authorization.

## Calculated data and indexes

These values come from queries, `security_invoker` views, or RPCs rather than
stored duplicate columns:

- trip phase, duration, city names, destination count, and calendar spans;
- total costed amount, remaining budget, category breakdown, average daily cost,
  and over-budget state;
- active trips for the dashboard and profile trip history;
- city popularity from distinct trip/stop usage, falling back to population;
- activity popularity from itinerary usage, falling back to Foursquare's score;
- admin counts, monthly registrations, and active/dormant users. For the admin
  screen, active means `auth.users.last_sign_in_at` is within the last 30 days.

Index every foreign key and every ownership/RLS predicate. Add indexes supporting
trip date/calendar queries and normalized text search over trip titles and stop
cities. Add PostgreSQL full-text or trigram indexes for city/activity discovery,
community title/body/author search, and admin display-name/home-city search.

Views exposed through the Data API use `security_invoker = true`; otherwise keep
aggregations behind narrowly granted RPCs. Images live in Supabase Storage or at
provider-approved URLs; tables store only paths or URLs.

## External APIs and datasets

### Foursquare Places API

- Use the current `places-api.foursquare.com` endpoints with
  `X-Places-Api-Version: 2025-06-17` for autocomplete, place search, place
  details, and optional photos.
- Call Foursquare from a Supabase Edge Function or another trusted server-side
  function. Store the service key only as a server secret.
- Request only fields the UI uses. Premium fields such as description, photos,
  rating, price, and popularity affect billing.
- Show the required "Powered by Foursquare" attribution anywhere Foursquare data
  appears. Respect its caching, rate-limit, anti-crawling, and non-bulk-export
  terms. Reconfirm the current license before deciding how long normalized
  provider fields or photo URLs may be retained.
- On provider errors or quota exhaustion, return a clear retryable error; already
  saved itinerary snapshots continue to work without Foursquare.

### GeoNames and IANA timezones

- Import GeoNames `cities15000` plus `admin1CodesASCII` for stable city identity,
  coordinates, country/region, population, and timezone. The repeatable importer
  upserts by `geonames_id`; record its required attribution.
- Resolve and store an IANA timezone for each city during ingestion, using the
  GeoNames timezone service where needed. Runtime trip rendering uses the stored
  identifier and the platform's current IANA timezone data.

No map, routing, weather, foreign-exchange, flight, hotel, or booking API is
required by the current frontend. Those are future features and must receive a
separate workflow and schema review before introduction.

## Migration and verification requirements

Migrations must add the checks and unique constraints described above, index all
foreign keys and RLS predicates, enable RLS on every public table, explicitly
revoke default privileges, and grant only required Data API operations. Deleting
a trip cascades to its stops and items; provider or publication references use
the delete behavior stated per column.

Before integration, verify with authenticated database tests that:

- an owner can create a trip and stops atomically, while invalid dates roll the
  entire request back;
- another user cannot read a private trip or mutate any trip they do not own;
- an authenticated user can read a public trip and its children but not edit it;
- reorder RPCs reject missing, duplicate, foreign, and unauthorized IDs without
  leaving partial positions;
- an unknown provider cost remains `null`, while a free activity remains zero;
- community posts cannot expose a private trip;
- non-admin users cannot call either admin RPC;
- catalog ingestion works without granting catalog writes to browser roles; and
- the application remains able to render saved trips when Foursquare is down.
