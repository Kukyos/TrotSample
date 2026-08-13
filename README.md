# GlobeTrotter

GlobeTrotter is a visual, budget-aware multi-city trip planner. This repository is the relaxed dry run for the Odoo hackathon build pipeline.

## Current build

The public landing page owns `/`. Praneet is building the Supabase-backed `/login` route and auth provider in parallel.

## Local setup

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite. For environment-backed screens, copy `frontend/.env.example` to `frontend/.env.local` and fill in the shared Supabase values. The public landing page must render without them; every screen behind `/login` needs them.

## Checks

```powershell
cd frontend
npm run lint
npm run build
npm run smoke
```

`npm run smoke` renders every route to a string and fails if any screen throws or
if the auth guard lets an anonymous visitor through. It is the only way to verify
the authenticated screens before Supabase credentials are available.

## Deployment

Import the repository root in Vercel. The root `vercel.json` installs and builds the frontend, publishes `frontend/dist`, and rewrites deep links to the SPA entry point.

## Team contract

Read `AGENTS.md` before making changes. Armaan owns the landing page and integration. Praneet owns Supabase, auth, `/login`, and `frontend/src/services/`. The landing/auth handoff is documented in `docs/AUTH.md`.

Hi Tigga
