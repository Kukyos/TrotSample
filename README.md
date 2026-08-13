# GlobeTrotter

GlobeTrotter is a visual, budget-aware multi-city trip planner. This repository is the relaxed dry run for the Odoo hackathon build pipeline.

## Current build

The first build contains the public landing page and the shared project guardrails. Product screens and the Supabase-backed service layer follow in later builds.

## Local setup

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite. For environment-backed screens, copy `.env.example` to `frontend/.env.local` and fill in the shared Supabase values.

## Checks

```powershell
cd frontend
npm run lint
npm run build
```

## Deployment

Import the repository root in Vercel. The root `vercel.json` installs and builds the frontend, publishes `frontend/dist`, and rewrites deep links to the SPA entry point.

## Team contract

Read `AGENTS.md` before making changes. Armaan owns frontend integration and design. Praneet owns Supabase and `frontend/src/services/`. Every code change updates `docs/TASKS.md`, runs locally, and is reviewed before push.
