# GlobeTrotter Build Rules

## Stack

React 18, TypeScript, Vite, Tailwind CSS, React Router, Supabase, and Vercel.

- Do not add Next.js or Express.
- Frontend code lives in `frontend/`.
- Supabase migrations and seed data live in `backend/supabase/`.
- Keep the Vercel SPA rewrite working.

## Run 1 ownership

| Owner | Lane |
| --- | --- |
| Armaan | Landing page, design system, shared layout, integration, deployment health |
| Praneet | Supabase schema, RLS, seed data, auth provider, `/login`, generated database types, `frontend/src/services/` |

Do not edit another person's lane without asking. If work overlaps, stop and coordinate before changing files.

## Data boundary

Frontend pages never import Supabase directly. Pages call functions in `frontend/src/services/`, and services call Supabase.

If a column is not documented in `docs/SCHEMA.md`, or a function is not documented in `docs/SERVICES.md`, stop and ask. Do not invent either one.

## Current integration contract

- The landing page owns `/` and links anonymous visitors to `/login`.
- Praneet owns `/login`, session creation, logout, and the auth provider.
- The auth provider exposes loading, anonymous, and authenticated states as documented in `docs/AUTH.md`.
- The landing navigation accepts a viewer state. Anonymous users see `Log in`; authenticated users see their display name and a link to `/dashboard`.
- Do not hardcode or mock a Supabase user in the landing page.
- Preserve the public landing page when adding the router. Do not replace `frontend/src/App.tsx` wholesale.

## Build discipline

- Update `docs/TASKS.md` in the same change as the code.
- Run lint and production build checks before requesting review.
- Start the app locally after every build so Armaan can review it.
- Do not push until Armaan explicitly approves the local build.
- Keep `main` deployable.
- Use realistic copy and fixture data. Never use lorem ipsum or labels like `Trip 1`.
- Preserve loading, empty, error, mobile, keyboard, and reduced-motion behavior as screens are added.
