# Hackathon Plan — Decisions Log

Everything we've locked in so far. This plan is the shared, versioned operating
manual. Builder-specific `AGENTS.md` and `CLAUDE.md` files stay local, while the
schema and service contracts are written and iterated in the repository.

Practice run target: **GlobeTrotter** (Odoo Phase 1, originally 8 hours).
Running it **relaxed, no clock** — the point is rehearsing the pipeline, not
finishing fast.

---

## 1. Team

| Person | Role | Owns |
|---|---|---|
| **Armaan** | Lead / integrator / design | `main`, all merges, design system, UI primitives, integration, deploy health |
| **Praneet** | Backend | Supabase schema, RLS, seed data, SQL functions, `src/services/` layer |
| **Pooja** | Frontend | Pages — self-assigns |
| **Athira** | Frontend | Pages — self-assigns |

**Split is horizontal.** One person owns the whole data layer; the rest own
pages. Pages rarely collide, the data layer would collide constantly.

**Run 1 is complete** (see the retro in §10). It was just Armaan + Praneet. Armaan owns the landing redesign and integration. Praneet owns Supabase, the auth provider, and the login page. Pooja and Athira join from Run 2 and claim their own pages in the task doc — first to claim owns it.

**Core rule:** nobody edits outside their ownership lane without asking. This
is the entire reason four AI sessions can share one repo.

---

## 2. Stack (locked)

React 18 · TypeScript · Vite · Tailwind · React Router v6 · Supabase · Vercel

**No Next.js, no Express.** Supabase is the backend; `src/services/` is the
contract in front of it.

**Why Express got dropped:** it would mostly proxy Supabase, cost two deploys
plus CORS setup, and invite "why does this layer exist?" from a judge. The
services layer gives the same separation with none of the plumbing.

**Praneet's backend scope** — decided as: Supabase schema + RLS + seed + a
`src/services/` query layer in the repo + SQL functions for any real
aggregation logic. Schema-and-RLS alone leaves nothing in the repo to point at when a judge asks to see the backend.

**Edge Functions were reinstated in Run 1.** They were originally skipped for
deploy friction, but third-party place search needs a server-side holder for the
Foursquare service key — shipping it to the browser would expose it. The
`search-places` function runs with `verify_jwt = true` and the frontend reaches
it through `services/places.ts`. The cost is real: the function and its secret
must be deployed to Supabase separately from the Vercel build, so a green Vercel
deploy no longer implies a working place search.

---

## 3. Repo shape

Keep the backend and frontend in separate top-level folders. This boundary is
mandatory: application UI belongs in `frontend/`, while database migrations,
seed data, and backend configuration belong in `backend/`.

```
frontend/src/
  components/ui/        ← Armaan only
  components/layout/    ← Armaan only
  pages/<screen>/       ← page owner's lane
  services/             ← Praneet only. ALL Supabase access.
  context/AuthProvider  ← Praneet for Run 1 auth work
  hooks/
  lib/devAuth.ts
  types/database.ts     ← generated, never hand-edited
  router.tsx            ← Armaan only
backend/supabase/
  migrations/           ← Praneet only
  seed.sql              ← Praneet only
docs/
```

**Frontend never imports `supabase` directly.** Pages call services, services
call Supabase. If a function doesn't exist, ask Praneet — don't reach around
the layer.

---

## 4. Git & merge discipline

- Branch per page: `feat/<page-name>`. Backend: `feat/schema`, `fix/rls`.
- Push branch → Vercel auto-builds a **preview URL** for it → verify there.
- Tell Armaan when ready.
- **Armaan pulls the branch, integrates, tests, then merges to `main`.**
- **Only Armaan pushes to `main`.**
- Always `git pull` main before starting a new branch.
- Before starting a feature, claim it or mark it **in progress** in
  `docs/TASKS.md`, commit that task change, and push it so every builder can see
  the active ownership before implementation begins.
- Read the latest `docs/TASKS.md` before every work session and update it as the
  work changes. It is the team's most important coordination file, not a
  checklist saved for the end.
- If a merge breaks production: **revert first, debug after.** A broken `main`
  blocks everyone; a revert costs thirty seconds.

**`main` must always have a working deployed link.**

---

## 5. Environment & the login wall

Everyone runs `npm run dev` against the **same shared Supabase project** — one
schema, one source of truth, no drift across four laptops. Only Praneet runs
migrations; destructive changes get announced first.

### Dev auto-login

Seed one dev account, auto-sign-in when there's no session, gate it behind
`import.meta.env.DEV`:

```
VITE_DEV_AUTOLOGIN=true
VITE_DEV_EMAIL=dev@...
VITE_DEV_PASSWORD=...
```

`ensureDevSession()` runs once in `AuthProvider` before first render.
`<ProtectedRoute>` stays **untouched** — it just always finds a session in dev,
so we're never shipping an untested auth path.

**Not a fake user object.** A mock user passes the route guard but every query
still goes out without a JWT, RLS rejects it, and you lose the day to phantom
401s. This produces a real session.

`import.meta.env.DEV` is replaced at build time, so Vite tree-shakes it out of
`npm run build`. Even committed by accident, it's dead code in production.

**Never set `VITE_DEV_AUTOLOGIN` in Vercel env vars.**

### Praneet's testing

Deployed links only, never localhost. Every branch push gets its own preview
URL with the real Supabase project and the real auth wall behind it — the
environment that matches judging. He doesn't wait for `main`.

### Two things to commit in the first commit

- `vercel.json` with the SPA rewrite. Without it a Vite SPA on Vercel 404s on
  any deep-link refresh — you'll lose twenty minutes assuming the router broke.
- `.env.example` so nobody is blocked asking where the keys are.

### Types

`npx supabase gen types typescript` after every migration, committed. With four
AI sessions writing queries, this is the single thing stopping them inventing
four spellings of the same column.

---

## 6. Docs to write on the day

Written in the **first commit**, once the real problem statement is known:

| file | purpose |
|---|---|
| `AGENTS.md` | local builder-specific Codex instructions; ignored by Git |
| `CLAUDE.md` | local builder-specific Claude instructions; ignored by Git |
| `docs/SCHEMA.md` | tables, columns, types, RLS policies. Praneet's source of truth |
| `docs/SERVICES.md` | every function the frontend may call. The backend/frontend contract |
| `docs/TASKS.md` | tiered task list, claim-by-name, ticked in the same push as the work |
| `docs/AUTH.md` | landing/login session-state and routing contract |

Every builder's local agent instructions must preserve this load-bearing rule:
**if it's not in SCHEMA or SERVICES, stop and ask — do not invent a column or a
service function.**

`TASKS.md` gets updated in the same commit as the code. A push that changes code
but not tasks is an incomplete push.

`AGENTS.md` and `CLAUDE.md` are local builder-specific instruction files and are
intentionally listed in `.gitignore`. Each builder maintains their own versions;
neither file is committed or pushed.

### Living build lessons

When any builder learns a reusable lesson during implementation, add it to this
hackathon plan in the same work cycle. Do not leave process knowledge in chat or
memory. This document is the shared operating manual and should become more
accurate after every build.

Lessons from the screen build:

- **A one-accent design system cannot carry a categorical palette.** Budget
  categories needed five distinguishable series; the palette allows one violet
  and otherwise achromatic, and greys fail a chroma floor. The fix is to treat it
  as a *sequential* encoding — sort by magnitude, shade by rank, and direct-label
  every slice so identity never depends on colour. Validate the ramp for
  monotonic lightness and a 3:1 contrast floor rather than eyeballing it.
- **Fixtures belong outside `services/`.** Pages need placeholder data before the
  data layer exists, but `services/` is one owner's lane. `frontend/src/fixtures/`
  shaped to documented `SCHEMA.md` columns invents nothing and turns integration
  into a one-line import swap per page.
- **An auth wall makes unbuilt-backend screens unreviewable.** Everything behind
  `ProtectedRoute` is invisible until credentials exist. A render smoke check that
  walks every route catches crashes in the meantime and costs one file.

Lessons from the visual pass and the first real integration:

- **A doc that describes the app is not the app.** `docs/DESIGN.md` named the
  type stack from the first commit. Nobody ever loaded the fonts, so every
  screen rendered in Arial and Times while four people read a document saying
  otherwise, and the build "looked cheap" for reasons no one could name. Any doc
  that describes an *artifact* needs a task that verifies the artifact matches it.
  Cheapest version: one line in the definition of done — "matches DESIGN.md,
  checked in a browser."
- **Scope every descendant selector in shared CSS.** `.hero h1 span { display:
  block }` was harmless for a year and then stacked a third-party component's
  generated spans one word per line. With one stylesheet and four people adding
  components that inject DOM, write `>` by default and reach for a descendant
  selector deliberately.
- **A negative assertion must be paired with a positive one.** The smoke test
  proved the auth guard worked by checking the HTML did *not* contain
  `app-dock`. When `app-dock` was deleted the check passed vacuously and would
  have passed forever, guarding nothing. Every "this must be absent" test needs
  a sibling "this is present when it should be" test, or it silently retires.
- **A harness that stubs a terminal state cannot catch transition bugs.**
  `uitest.tsx` pins `status: 'authenticated'` from the first render. A reveal
  hook keyed only on `pathname` observed the DOM before the gated screens
  mounted and left their content permanently invisible on the real
  loading → authenticated flip — and the harness was structurally blind to it.
  Exercise the transitions, not just the end states.
- **Moving pages from fixtures to services is a repo-wide event.** One commit
  moved every page to react-query, which is correct and was the plan — but it
  landed while another lane had in-flight work on the same pages. Announce it,
  and either freeze page work for the window or migrate page by page.
- **Never conclude "slow" from an automated browser.** A backgrounded tab gets
  zero `requestAnimationFrame` callbacks, so every JS-driven animation freezes
  mid-tween and screenshots capture the frozen state. That artefact was read as
  a rendering performance problem twice, and a working component was deleted
  over it. Check `document.visibilityState` before trusting any timing
  measurement, and have a human look at motion — it cannot be reviewed from a
  screenshot.
- **Animation libraries cost real bytes.** React Bits pulled in GSAP and
  `motion` and took the bundle from ~374 kB to ~678 kB (gzip 111 → 218 kB).
  Worth it or not, decide before adopting, not after.
- **Vendored third-party source gets its own directory and a lint exclusion.**
  `src/components/reactbits/` is kept exactly as shipped so it can be re-pulled
  from upstream; linting it against house rules only creates pressure to edit
  files we do not own.

The schema is also a living contract. Design it step by step, starting with the
smallest structure required by the active feature. Update `docs/SCHEMA.md`, the
migrations, generated types, and affected service documentation together as the
product develops. Iteration is expected; speculative tables and columns are not.

---

## 7. Scope triage — tiered

Don't start a tier until the one above is genuinely done.

- **Tier 1** — the demo dies without these. Auth, dashboard, core create flow,
  the main list view, and the hardest primary screen.
- **Tier 2** — what makes it competitive. Search, aggregation/charts, public
  sharing. The features that make it read as a product rather than CRUD.
- **Tier 3** — only if 1 and 2 are polished. Calendar views, profile settings,
  admin analytics.

**Seed data is Tier 1 even though it isn't a screen.** Any search feature is
undemoable against an empty table — an empty search bar kills the demo. Seed
early, not late.

Judging is on **creative, polished, feature-rich**. Six excellent screens beat
thirteen hollow ones — but only if the six include something beyond CRUD.

---

## 8. Build phases

**Phase 0 — Foundation.** No feature work until this is green. Repo + docs,
`vercel.json`, Supabase project, schema, RLS tested, types generated, seed data,
dev account with a populated demo record, Vite scaffold, router, auth shell,
design tokens, UI primitives, **and the fonts actually loaded and verified on
screen** — Run 1 shipped an entire build in fallback Arial because that step was
documented but never done. **Deployed — live link exists before any feature.**

**Current Run 1 exception:** landing design and login/auth are being built in parallel. The boundary is `docs/AUTH.md`: Armaan does not edit `/login` or auth services; Praneet does not replace the landing composition.

**Phase 1 — Tier 1.** Backend and frontend in parallel. Praneet's services land
ahead of the pages consuming them. Stub every service signature with fixture
data first, then fill in real queries — frontend is never blocked, and the
contract is proven before it's implemented.

**Phase 2 — First full integration.** Everything merged, real services, no
fixtures left. Expect this to be ugly. This is the phase we're actually
rehearsing.

**Phase 3 — Tier 2.**

**Phase 4 — Polish.** Loading, empty, and error states everywhere. Responsive
pass. Design consistency sweep across everyone's pages — Armaan owns this.

**Phase 5 — Demo readiness.** Realistic seeded data, never "Trip 1" or lorem.
Zero console errors. Fresh-browser test of the production link. README with
setup, screenshots, architecture note.

**Definition of done for a page:** uses services (no direct Supabase), uses UI
primitives (no ad-hoc styling), matches `docs/DESIGN.md` checked in a real
browser, has loading + empty + error states, works at mobile width, zero console
errors, preview URL works, tasks ticked.

---

## 9. Known risks

**Codex account sharing.** Praneet shares one account with Pooja and Athira.
Three people on one account can trip rate limits. **Test concurrent usage before
the real event** — hour 4 of a real hackathon is the worst time to find out. If
limits bite: stagger usage, or move one person to a separate account.

**RLS policies.** The one place AI output looks correct and silently isn't —
policies come out either too permissive or locking you out. Test each manually
against the dev account before moving on.

**Long-lived branches.** Pull from `main` every time one of your branches gets
merged. Otherwise you hit a two-hour conflict at the worst moment.

**Shared files are the real collision surface — not pages.** The horizontal
split works: two lanes touched almost no common page code. Every conflict in Run
1 landed in a file nobody owns. Assign an owner to each before Run 2:

| file | why it collides |
|---|---|
| `frontend/package.json` + lock | two people adding dependencies in the same window |
| `frontend/src/styles.css` | one stylesheet, every builder adding to it |
| `frontend/smoke.tsx` | every new or moved route touches it |
| `frontend/src/router.tsx` | already Armaan's; keep it that way |
| `docs/TASKS.md` | everyone, every commit — append-only sections per lane help |

**Deleting or moving a file needs an announcement, not just a commit.** The one
merge conflict git could not resolve was a page deleted in one lane and
rewritten in another on the same day. Both changes were correct; only the
sequencing was wrong. Say it in the task doc before doing it.

---

## 10. Retro — Run 1 (Armaan + Praneet, no clock)

**Did the services contract hold?** Yes, and it is the single thing that made
the integration survivable. Because pages only ever called `services/`, swapping
fixtures for real Supabase queries was mechanical rather than a rewrite. Nobody
reached around the layer. Keep this rule exactly as written.

**Where did the AI sessions produce incompatible code?** Only in unowned files —
`package.json`, `smoke.tsx`, and one page deleted in one lane while being
rewritten in the other. Zero conflicts inside either person's actual lane. The
horizontal split works; it is the shared files that need owners (see §9).

**What blocked longest?** Verification, not implementation. Building the visual
pass was fast. Establishing whether it *worked* consumed most of the session:
animations that turned out to be frozen only because the automation tab was
backgrounded, a screenshot path that kept timing out, and two wrong diagnoses
that cost a working component. Budget for verification explicitly, and decide up
front which things only a human can check.

**What we would cut at 8 hours.** The React Bits integration — it is a polish
item that added a dependency, a bundle cost, and a class of layout bug, and it
landed after the product already worked. Fonts and the single shared header were
almost free and did most of the visual work; those are Phase 0 items, not Phase
4 ones. Wire the type stack in the first commit.

**What to keep.** The smoke test paid for itself repeatedly — SSR-rendering all
fourteen routes catches crashes, and it caught the route restructure
immediately. The "no push until integration approves" rule meant an unexpected
merge to `main` cost nothing: the work sat on a branch and merged cleanly.

**Phase 0 duration:** not measured this run — no clock was kept. Measure it in
Run 2; it is still the number that matters most.

---

## 11. Still open

- Page split between Pooja and Athira — they decide when building, and update
  the task doc with it.
- Whether Run 2 adds a clock. Recommended: yes, at least for Phase 0, since
  that duration is the one thing Run 1 failed to produce.
- Owners for the shared files listed in §9, agreed before Run 2 starts.
- Whether the React Bits dependency stays. It is currently on
  `design/visual-pass`, unmerged.
- Whether Jonathan (manual coder, for judge defensibility) is on this team for
  the real event — he was in the earlier plan but isn't in the current roster.
