# GlobeTrotter Tasks

Update this file in the same change as the work. A code change without a task update is incomplete.

## Landing redesign

Owner: Armaan

- [x] Review the replacement `DESIGN.md` and dope.security reference.
- [x] Replace the rejected landing page with the dark editorial travel direction.
- [x] Add anonymous, loading, and authenticated navigation treatments.
- [x] Link anonymous users to `/login` and authenticated users to `/dashboard`.
- [x] Verify mobile, keyboard, reduced-motion, lint, build, and local rendering.
- [x] Run locally for Armaan's approval.
- [ ] Push only after approval.

## Authentication and login

Owner: Praneet

- [ ] Add a maintained, audit-clean React Router release.
- [ ] Preserve `/` as the public landing page.
- [ ] Build `/login` without editing the landing-page composition.
- [ ] Implement the auth provider contract in `docs/AUTH.md`.
- [ ] Add login, signup, logout, session restore, loading, and error states.
- [ ] Redirect a successful login to `/dashboard`.
- [ ] Wire the real auth state into the landing navigation.
- [ ] Keep all Supabase access behind the provider and `frontend/src/services/`.

## Supabase foundation

Owner: Praneet

- [ ] Document tables, relationships, and RLS policies in `docs/SCHEMA.md`.
- [ ] Create migrations and seed data in `backend/supabase/`.
- [ ] Generate `frontend/src/types/database.ts` from the live schema.
- [ ] Document frontend service functions in `docs/SERVICES.md`.
- [ ] Test RLS with the seeded development account.

## Integration gate

Owner: Armaan

- [ ] Pull Praneet's auth work after the landing redesign is approved.
- [ ] Resolve router and auth-provider wiring without bypassing the service boundary.
- [ ] Verify anonymous, loading, authenticated, logout, refresh, and deep-link flows.
- [ ] Confirm the production Vercel build and preview URL.
