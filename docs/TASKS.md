# GlobeTrotter Tasks

Read this file before starting any work. Mark a feature in progress, commit, and
push that task claim before implementation begins. Keep it current throughout
the build. A code change without a task update is incomplete.

## Landing redesign

Owner: Armaan

- [x] Review the replacement `DESIGN.md` and dope.security reference.
- [x] Replace the rejected landing page with the dark editorial travel direction.
- [x] Add anonymous, loading, and authenticated navigation treatments.
- [x] Link anonymous users to `/login` and authenticated users to `/dashboard`.
- [x] Verify mobile, keyboard, reduced-motion, lint, build, and local rendering.
- [x] Run locally for Armaan's approval.
- [x] Push only after approval.

## Authentication and login

Owner: Praneet

Status: **IN PROGRESS — login page owned by Praneet.**

- [x] Add the latest React Router v6 patch release. Two moderate advisories remain
  across all v6 releases; current routes use only fixed internal destinations and
  the SPA does not use SSR hydration. Moving to v7 requires a stack decision.
- [ ] Preserve `/` as the public landing page.
- [x] Build `/login` without editing the landing-page composition.
- [x] Implement the auth provider contract in `docs/AUTH.md`.
- [x] Add login, signup, logout, session restore, loading, and error states.
- [x] Redirect a successful login to `/dashboard`.
- [x] Wire the real auth state into the landing navigation.
- [ ] Keep all Supabase access behind the provider and `frontend/src/services/`.

## Supabase foundation

Owner: Praneet

Status: **IN PROGRESS — Praneet is simplifying the schema iteratively.**

- [ ] Reduce the initial schema to the smallest structure required by active features.

- [ ] Document tables, relationships, and RLS policies in `docs/SCHEMA.md`.
- [ ] Create migrations and seed data in `backend/supabase/`.
- [ ] Generate `frontend/src/types/database.ts` from the live schema.
- [x] Document the frontend auth service functions in `docs/SERVICES.md`.
- [ ] Test RLS with the seeded development account.

## Application screens

Owner: Armaan

Status: **BUILT — awaiting Armaan's local review. Not pushed.**

Screens 1 and 2 (login, registration) are Praneet's and are not listed here.
Decisions locked with Armaan before implementation:

- App shell is a floating glass dock, dark canvas and translucent panels on every screen.
- Charts are hand-rolled inline SVG on a violet-to-neutral sequential ramp. No chart dependency.
- The itinerary builder reorders with buttons, not drag and drop.
- City and activity search share one `/explore` route with tabs.
- Placeholder data lives in `frontend/src/fixtures/`, shaped to documented `docs/SCHEMA.md` columns.

- [x] Extract routing into `router.tsx` with a shared `ProtectedRoute`.
- [x] Build the app shell and the fixture set.
- [x] Screen 3 — `/dashboard`, replacing the auth placeholder.
- [x] Screen 4 — `/trips/new`, create a trip.
- [x] Screen 5 — `/trips/:tripId/build`, itinerary builder.
- [x] Screen 6 — `/trips`, trip listing grouped by ongoing, upcoming, and completed.
- [x] Screen 7 — `/profile`.
- [x] Screen 8 — `/explore`, cities and activities.
- [x] Screen 9 — `/trips/:tripId`, itinerary view with the budget breakdown.
- [x] Screen 10 — `/community`.
- [x] Screen 11 — `/calendar`.
- [x] Screen 12 — `/admin`.
- [x] Verify lint, production build, mobile, keyboard, and reduced motion.
- [ ] **Blocked on Praneet:** the ten screens sit behind `ProtectedRoute`, so they
  cannot be opened locally until Supabase env values exist and a session can be
  created. Until then `npm run smoke` renders every route and writes static
  previews to `dist/preview/` for review.
- [ ] Replace each `fixtures/` import with a documented service function once
  trip, city, and activity services are added to `docs/SERVICES.md`.

Known gaps, deliberate:

- `/admin` has no role check, so it is kept out of the primary navigation and is
  reachable only from the profile page. Gate it on Auth `app_metadata` before it
  is exposed anywhere else.
- "Add to a trip" on `/explore` routes to the trip list rather than adding a stop;
  adding one needs a service function that does not exist yet.
- Create-trip and profile forms validate but do not persist.
- The builder seeds its state once per mount, so it will not resync if `:tripId`
  changes without unmounting. Not reachable today; revisit if a trip switcher is
  added inside the builder.

## Integration gate

Owner: Armaan

- [ ] Pull Praneet's auth work after the landing redesign is approved.
- [ ] Resolve router and auth-provider wiring without bypassing the service boundary.
- [ ] Verify anonymous, loading, authenticated, logout, refresh, and deep-link flows.
- [ ] Confirm the production Vercel build and preview URL.
