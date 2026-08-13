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
- [x] Create catalog and trip-workflow migrations plus repeatable GeoNames ingestion in `backend/supabase/`.
- [x] Generate `frontend/src/types/database.ts` from the local schema.
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
- [x] Replace trip-workflow fixture imports with documented service functions;
  fixtures remain only for smoke previews and deferred community/admin demos.

## Decisions needed from Armaan

Blocked on a judgement call, not on effort. Each one has a recommendation; say
which way and the work follows immediately.

- [ ] **Mixed-currency trip budgets.** Sorting trips by budget compares raw
  numbers, so JP¥420,000 ranks above €5,000, and the trip list shows four
  currencies side by side. Options: convert everything to one display currency
  with a stored rate; sort and total only within a single selected currency; or
  seed every demo trip in EUR and postpone the problem.
  *Recommended: seed in EUR for Run 1 and note the limitation — conversion needs
  a rate source nobody owns yet.*

- [ ] **Builder edits are lost on navigation.** Add an item, open the itinerary
  view, come back, and it is gone. Correct for session-only state, but it reads
  as a bug in a demo. Options: lift the builder state so it survives within a
  session; leave it and avoid that path in the demo; or wait for the real trip
  services and let persistence solve it.
  *Recommended: wait for the services — lifting state now is work that gets
  deleted.*

- [ ] **"Cities visited" on the profile counts upcoming trips.** Either the label
  is wrong or the count is. Options: rename to "Cities planned", or count only
  cities from completed trips.
  *Recommended: count only completed trips — "visited" is the more useful number.*

- [ ] **Calendar chips lose their text on phones.** Below 760px the chips become
  colour bars and the trip names live only in the legend underneath. Options:
  keep it; show a truncated name; or show a count per day.
  *Recommended: keep it — 44px cells cannot hold a readable name.*

- [ ] **Configuration errors are user-facing.** With no Supabase credentials the
  login form and place search both print "Add VITE_SUPABASE_URL and
  VITE_SUPABASE_PUBLISHABLE_KEY to frontend/.env.local" to the visitor. Needs a
  human-facing fallback, and the real message kept to the console. Confirm the
  wording you want.

- [ ] **Keep or remove the dev-only UI harness** (`frontend/uitest.html`). It is
  what made the end-to-end pass possible and cannot reach production, but it does
  mount the app with a stubbed auth context. Keep it until credentials exist, or
  remove it now.
  *Recommended: keep until the login wall is usable locally, then delete.*

- [ ] **Admin exposure.** `/admin` has no role check and is reachable from the
  profile page. Confirm it stays there until the Auth `app_metadata` check exists,
  or should be unreachable entirely for now.

- [ ] **Is place search in the demo?** The `search-places` Edge Function and its
  Foursquare key deploy to Supabase separately from Vercel, so a green Vercel
  deploy does not mean search works. Someone must deploy the function and set the
  secret, or the Activities tab shows an error in the demo.

## End-to-end UI pass

Owner: Armaan

Every screen was driven through its real event handlers in a browser using the
dev-only harness at `frontend/uitest.html` (`npm run dev` → `/uitest.html`). The
harness mounts the real routes with a stubbed auth context so the screens can be
used before Supabase credentials exist. It is the browser twin of `smoke.tsx`,
touches nothing in `src/auth`, issues no queries, and is excluded from the
production build — `vite build` emits only `index.html`.

Passing: every form validation path, stop and item reordering with correct
disabled ends, add and remove with totals recomputing, all filters, tabs, sorts,
empty states, month navigation, the budget donut and its table fallback, and
zero horizontal overflow on every screen at 386px with the dock docking to the
bottom.

Open issues found:

- [ ] Trip budget sort compares raw numbers across currencies, so JP¥420,000
  ranks above €5,000. Needs a conversion rate or per-currency sorting.
- [ ] The itinerary builder shows time of day with no date, so a stop spanning
  several days reads as out of order. The itinerary view groups by day; the
  builder does not.
- [ ] The profile counts upcoming trips in "Cities visited".
- [ ] Builder edits are lost when navigating away and back, which reads as a bug
  during a demo even though it is the documented session-only behaviour.
- [ ] A missing Supabase configuration surfaces its internal setup message in the
  login form and now in place search. Needs a user-facing fallback.

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

## Visual pass — one shell, real fonts, React Bits

Owner: Armaan. Branch: `design/visual-pass` (merged with `main` @ 8a9a249).

Done:

- [x] Wired the fonts `docs/DESIGN.md` always specified. The stack was falling
  back to Arial and Times: Whyte Inktrap → **Inter Tight**, GrandSlang →
  **Instrument Serif** italic, Whyte Mono → **JetBrains Mono**.
- [x] One header everywhere. The landing `.site-header` is the header on every
  screen; only its links and session slot change with auth state. The floating
  `.app-dock` and its CSS are deleted.
- [x] The dashboard is the landing page. `/` is the whole home — the pitch when
  anonymous, your trips when signed in. `DashboardPage.tsx` is deleted and
  `/dashboard` redirects to `/`. After merging Praneet's services, the
  signed-in home reads `listTrips()` and `getPopularCities()` through
  react-query with loading and error states, not fixtures.
- [x] **React Bits** vendored under `src/components/reactbits/` (TS+CSS
  variants, straight from the upstream repo, excluded from lint so it can be
  re-pulled). In use: SplitText (hero headline), ShinyText (hero kicker),
  ScrollVelocity (signal strip), SpotlightCard (trip and city cards),
  AnimatedContent (scroll reveals), ClickSpark (global). Everything routes
  through `components/ui/motion.tsx` so `prefers-reduced-motion` is honoured in
  one place — GSAP and WebGL cannot be reached by the CSS media query.
  Adds `gsap`, `@gsap/react`, and `motion` to `package.json`; the bundle goes
  from ~374 kB to ~678 kB (gzip 111 kB → 218 kB).
- [x] Deleted the hand-rolled reveal hook (`lib/reveal.ts`) and CSS marquee that
  React Bits now replaces.

Bugs found and fixed, worth remembering:

- `.hero h1 span { display: block }` was unscoped, so it applied to every span
  SplitText generates and stacked the headline one word per line. Now
  `.hero h1 > span`. Any component that injects nested spans will hit this
  class of rule — scope descendant selectors before adding one.
- The grain layer had no `background-size`, so `feTurbulence` rasterised at full
  page height instead of tiling. Fixed at 160px.
- The reveal hook keyed only on `pathname`, so screens mounting after the
  session resolved were observed before they existed and stayed invisible. Moot
  now that AnimatedContent replaced it, but note that `uitest.tsx` cannot catch
  that class of bug: it stubs `status: 'authenticated'` from the first render,
  so the loading → authenticated flip never happens.
- `ProtectedRoute` rendered a second `<main>` inside the shell's `<main>`.

Open — needs a human at a real browser:

- [ ] **No animation in this pass has been seen running.** The automated browser
  tab runs backgrounded, where Chrome suspends `requestAnimationFrame`
  completely (measured: 0 frames in 1s). Every GSAP and `motion` animation
  freezes mid-tween there, and screenshots capture that frozen state. Layout was
  verified by forcing end-states and measuring boxes; **motion, timing, and feel
  are unverified.** Open `npm run dev` and look.
- [ ] The React Bits **Aurora** WebGL background was added to the hero and then
  removed, along with its `ogl` dependency, on the belief that it was stalling
  the compositor. That diagnosis was wrong — the freeze was the hidden-tab rAF
  suspension above. Aurora may well be fine. Restoring it is
  `npm i ogl`, re-adding the two files from the upstream repo, and the
  `HeroAurora` export noted in `components/ui/motion.tsx`.
- [ ] Mobile is still unverified — the tooling would not resize the window below
  ~1500px. Every breakpoint under 820px was reasoned about, not seen.
- [ ] Fonts load from the Google Fonts CDN; a flaky demo network falls back to
  Arial and Times. Self-host before relying on it live.
- [ ] `/login` would not screenshot even on unmodified `main`, so it predates
  this work — but that was probably the same hidden-tab artefact, not a real
  fault. Re-check on a visible browser before investigating.

Verified: `npm run lint`, `npm run build`, and `npm run smoke` (14 routes) all
clean on the merged tree.
