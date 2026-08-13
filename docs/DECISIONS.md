# GlobeTrotter Decisions

## Build 1

### Product message

The landing page focuses on one promise: plan a complete multi-city journey in one visual place while keeping dates, activities, and budget connected.

### Visual direction

The supplied Hyer Aviation reference is adapted into a travel-planning system:

- Cool sky and off-white surfaces with deep ink typography.
- One clay accent for the primary action and route line.
- Oversized sans-serif display type, pill actions, and hard-edged image panels.
- A semantic route line is the signature device. It connects the product story instead of acting as decoration.
- Generated editorial travel photography replaces fake dashboards and generic stock imagery.

### Implementation

- React 18, TypeScript, Vite, and Tailwind CSS.
- React Router is deferred until the authenticated shell needs it. The current v6 release was removed after `npm audit` reported two moderate advisories in its dependency chain.
- Native CSS handles the page motion and respects `prefers-reduced-motion`.
- Color tokens respond to the system color scheme.
- The first build has no Supabase import. Praneet owns the future services layer and schema integration.
