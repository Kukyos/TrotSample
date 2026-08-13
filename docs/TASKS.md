# GlobeTrotter Tasks

Update this file in the same change as the work. A code change without a task update is incomplete.

## Build 1: Foundation and landing page

Owner: Armaan

- [x] Read the GlobeTrotter brief, FAQ, mockup export, design reference, and pipeline plan.
- [x] Scaffold React 18, TypeScript, Vite, and Tailwind CSS in `frontend/`.
- [x] Build the responsive public landing page with real travel imagery.
- [x] Add reduced-motion, keyboard-focus, mobile navigation, and color-scheme support.
- [x] Add the Vercel build configuration and SPA rewrite.
- [x] Add repository ownership and build rules in `AGENTS.md` and `CLAUDE.md`.
- [x] Add environment variable documentation.
- [x] Verify lint, production build, and production dependency audit.
- [x] Run locally for Armaan's review.
- [ ] Push to `main` after approval.

## Backend foundation

Owner: Praneet

- [ ] Document tables, relationships, and RLS policies in `docs/SCHEMA.md`.
- [x] Create and deploy the `profiles` table migration with Auth linkage and RLS.
- [ ] Create Supabase migrations and seed data in `backend/supabase/`.
- [ ] Generate `frontend/src/types/database.ts` from the live schema.
- [ ] Document the frontend contract in `docs/SERVICES.md`.
- [ ] Implement Supabase access only in `frontend/src/services/`.
- [ ] Test RLS with the seeded development account.

## Next frontend build

Owner: Armaan

- [ ] Add the router and authenticated application shell using a non-vulnerable React Router release.
- [ ] Add the real development auto-login flow behind `import.meta.env.DEV`.
- [ ] Build shared UI primitives in `frontend/src/components/ui/`.
- [ ] Build the login and signup screen.
