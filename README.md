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

Open the local URL printed by Vite. For environment-backed screens, copy `.env.example` to `frontend/.env.local` and fill in the shared Supabase values. The public landing page must render without them.

## Checks

```powershell
cd frontend
npm run lint
npm run build
```

## Deployment

Import the repository root in Vercel. The root `vercel.json` installs and builds the frontend, publishes `frontend/dist`, and rewrites deep links to the SPA entry point.

## Team contract

Read `AGENTS.md` before making changes. Armaan owns the landing page and integration. Praneet owns Supabase, auth, `/login`, and `frontend/src/services/`. The landing/auth handoff is documented in `docs/AUTH.md`.

Hi armaan
