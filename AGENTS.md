# GlobeTrotter Build Rules

## Stack

React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Supabase, and Vercel.

- Do not add Next.js or Express.
- Frontend code lives in `frontend/`.
- Supabase migrations and seed data live in `backend/supabase/`.
- Keep the Vercel SPA rewrite working.

## Run 1 ownership

| Owner | Lane |
| --- | --- |
| Armaan | `main`, integration, design system, UI, layout, router, auth shell, deployment health |
| Praneet | Supabase schema, RLS, seed data, generated database types, `frontend/src/services/` |

Do not edit another person's lane without asking. If work overlaps, stop and coordinate before changing files.

## Data boundary

Frontend pages never import Supabase directly. Pages call functions in `frontend/src/services/`, and services call Supabase.

If a column is not documented in `docs/SCHEMA.md`, or a function is not documented in `docs/SERVICES.md`, stop and ask. Do not invent either one.

## Build discipline

- Update `docs/TASKS.md` in the same change as the code.
- Run lint and production build checks before requesting review.
- Start the app locally after every build so Armaan can review it.
- Do not push until Armaan explicitly approves the local build.
- Keep `main` deployable.
- Use realistic copy and fixture data. Never use lorem ipsum or labels like `Trip 1`.
- Preserve loading, empty, error, mobile, keyboard, and reduced-motion behavior as screens are added.
