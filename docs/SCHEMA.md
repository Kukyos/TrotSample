# GlobeTrotter Schema

This is the source of truth for the GlobeTrotter database. If a table or column
is not listed here, update this file before using it in code.

The schema has nine application tables:

```text
auth.users
├── profiles
├── trips ── trip_members
│   └── trip_stops ── itinerary_items
├── saved_cities
└── community_posts

cities ── activities
```

## Basic conventions

- Supabase Auth owns login credentials and email in `auth.users`.
- Use lowercase `snake_case` names.
- User-owned records use `uuid`; catalog records use `bigint identity`.
- Use `date` for trip dates, `timestamptz` for exact times, and
  `numeric(12,2)` for money.
- Every table has `created_at timestamptz default now()`. Mutable tables also
  have `updated_at timestamptz default now()`; these shared fields are omitted
  from the table lists below.
- All tables in `public` use RLS and explicit Data API grants.

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

Shared destination catalog used by search and recommendations.

| Column | Type | Notes |
|---|---|---|
| `id` | `bigint identity` | PK |
| `name` | `text` | Required |
| `country_code` | `text` | Required ISO country code |
| `region` | `text` | Optional |
| `timezone` | `text` | Required IANA timezone |
| `description` | `text` | Optional |
| `image_url` | `text` | Optional |
| `cost_index` | `numeric(3,2)` | Optional, from 1 to 5 |
| `popularity_score` | `integer` | Default 0 |

Unique: city name plus country code.

### `activities`

Things users can discover and add to an itinerary.

| Column | Type | Notes |
|---|---|---|
| `id` | `bigint identity` | PK |
| `city_id` | `bigint` | FK -> `cities.id` |
| `name` | `text` | Required |
| `category` | `text` | Such as sightseeing, food, or adventure |
| `description` | `text` | Optional |
| `image_url` | `text` | Optional |
| `duration_minutes` | `integer` | Optional, must be positive |
| `estimated_cost` | `numeric(12,2)` | Default 0 |
| `currency_code` | `text` | Three-letter currency code |
| `popularity_score` | `integer` | Default 0 |

Unique: activity name within a city.

### `trips`

The top-level record for a user's travel plan.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `owner_id` | `uuid` | FK -> `auth.users.id` |
| `title` | `text` | Required |
| `description` | `text` | Optional |
| `start_date` | `date` | Required |
| `end_date` | `date` | Required, not before start date |
| `cover_url` | `text` | Optional |
| `budget_amount` | `numeric(12,2)` | Optional, non-negative |
| `currency_code` | `text` | Three-letter currency code |
| `state` | `text` | `draft`, `planned`, or `archived` |
| `visibility` | `text` | `private` or `public` |
| `share_slug` | `text` | Unique public URL slug |
| `source_trip_id` | `uuid` | Optional FK -> copied trip |
| `published_at` | `timestamptz` | Set when made public |

Upcoming, ongoing, and completed are calculated from the trip dates; they are
not stored as another status. A public trip must have a `share_slug` and
`published_at`; a private trip has neither.

### `trip_members`

Users invited to view or edit a trip.

| Column | Type | Notes |
|---|---|---|
| `trip_id` | `uuid` | FK -> `trips.id` |
| `user_id` | `uuid` | FK -> `auth.users.id` |
| `role` | `text` | `viewer` or `editor` |

Primary key: trip plus user. The owner is stored only in `trips.owner_id`.

### `trip_stops`

Ordered cities in a multi-city trip.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `trip_id` | `uuid` | FK -> `trips.id` |
| `city_id` | `bigint` | FK -> `cities.id` |
| `position` | `integer` | Order within the trip |
| `start_date` | `date` | Must be within trip dates |
| `end_date` | `date` | Must be within trip dates |
| `notes` | `text` | Optional |

Unique: position within a trip.

### `itinerary_items`

Ordered plans inside a stop. One table handles travel, stays, activities,
meals, and custom entries.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `stop_id` | `uuid` | FK -> `trip_stops.id` |
| `activity_id` | `bigint` | Optional FK -> `activities.id` |
| `kind` | `text` | `transport`, `stay`, `activity`, `meal`, or `other` |
| `title` | `text` | Required |
| `description` | `text` | Optional |
| `starts_at` | `timestamptz` | Required |
| `ends_at` | `timestamptz` | Optional, after start time |
| `position` | `integer` | Order within the stop |
| `estimated_cost` | `numeric(12,2)` | Default 0, in the trip's currency |
| `notes` | `text` | Optional |

Unique: position within a stop. Catalog details are copied into the item so an
existing itinerary does not change when an activity is edited later.

### `saved_cities`

User destination bookmarks.

| Column | Type | Notes |
|---|---|---|
| `user_id` | `uuid` | FK -> `auth.users.id` |
| `city_id` | `bigint` | FK -> `cities.id` |

Primary key: user plus city.

### `community_posts`

Public travel experiences shared by users.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `author_id` | `uuid` | FK -> `auth.users.id` |
| `trip_id` | `uuid` | Optional FK -> `trips.id` |
| `activity_id` | `bigint` | Optional FK -> `activities.id` |
| `title` | `text` | Required |
| `body` | `text` | Required |
| `image_url` | `text` | Optional |

Comments and reactions are outside the first-build scope.

## Access rules

| Table | Who can read? | Who can change it? |
|---|---|---|
| `profiles` | Everyone | The profile owner |
| `cities`, `activities` | Everyone | Admins |
| `trips` | Owner, members, or everyone if public | Owner |
| `trip_members` | Members of that trip | Trip owner |
| `trip_stops`, `itinerary_items` | Anyone who can read the trip | Owner and editors |
| `saved_cities` | The owning user | The owning user |
| `community_posts` | Everyone | The post author |

Admin access must use trusted Auth `app_metadata`, never user-editable
`user_metadata`. The frontend must never contain a service-role or secret key.

## Calculated data

These values come from queries or views and are not separate tables:

- trip status and destination count;
- total budget used, category breakdown, average daily cost, and over-budget days;
- calendar and timeline views;
- popular cities, popular activities, and admin analytics.

Images live in Supabase Storage; tables store only their paths or URLs.

## Migration requirements

Migrations must add the checks described above, index all foreign keys and RLS
columns, enable RLS on every public table, and grant only the Data API operations
each role needs. Deleting a trip cascades to its stops, items, and memberships.
