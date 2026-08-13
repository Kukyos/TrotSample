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

Before starting Vite, copy the environment template into the frontend directory:

```powershell
Copy-Item ..\.env.example .env.local
```

On macOS or Linux, use `cp ../.env.example .env.local` instead. Fill in
`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from **Supabase
Dashboard -> Project Settings -> API**. Vite only loads the file from the
`frontend/` directory during local development.

The publishable key is expected to be visible in the browser; database access
must still be protected with Row Level Security. Never put a Supabase secret
key, legacy `service_role` key, database password, or personal access token in
a `VITE_*` variable.

Open the local URL printed by Vite after the environment file is in place.

## Supabase CLI project link

The CLI link used for migrations is separate from the frontend environment
variables. From the repository root, authenticate and link the project with:

```powershell
supabase login
cd backend
supabase link --project-ref YOUR_PROJECT_REF
```

The project ref is the subdomain in
`https://YOUR_PROJECT_REF.supabase.co`. The generated link metadata under
`backend/supabase/.temp/` is ignored by Git, so each developer links their own
checkout. Do not add the database password or Supabase access token to
`.env.example`.

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
