# GlobeTrotter Decisions

## Current build

### Product message

GlobeTrotter turns a multi-city idea into one clear route with dates, daily plans, costs, and sharing kept together.

### Visual direction

The first landing-page direction was rejected. The rebuild uses the supplied dope.security reference as a quality and composition benchmark, not a content template.

- Near-black canvas with one signal-violet accent.
- Full-bleed twilight cloud photography in the hero.
- Editorial italic display type paired with a precise geometric sans and mono utility labels.
- A translucent trip-pass panel shows the route, dates, budget, and plan status.
- Hairlines and translucent washes create structure. No card shadows.
- The page stays travel-specific and does not copy dope.security branding or product content.

### Authentication handoff

- Public landing route: `/`, owned by Armaan.
- Login route and auth state: `/login`, owned by Praneet.
- Authenticated destination: `/dashboard`.
- The landing navigation supports anonymous, loading, and authenticated viewer states.
- The session source of truth is the auth provider. The landing page never reads Supabase storage or imports the Supabase client directly.
- Until the provider lands, the compiled landing page renders the anonymous state and links to `/login`.

### Implementation

- React 18, TypeScript, Vite, and Tailwind CSS.
- Native CSS handles motion and respects `prefers-reduced-motion`.
- One generated WebP hero image is the only raster asset required by the redesign.
- No additional UI or animation dependency is needed.
