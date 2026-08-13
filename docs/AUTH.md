# Authentication Contract

This document is the landing-page and login-page handoff. It defines UI state and navigation only. Supabase implementation details remain in Praneet's lane.

## Routes

| Route | Access | Owner | Behavior |
| --- | --- | --- | --- |
| `/` | Public | Armaan | Landing page. Shows login or account state in the navigation. |
| `/login` | Public-only | Praneet | Login and signup. Redirect authenticated users to `/dashboard`. |
| `/dashboard` | Authenticated | Integration | Product home. Redirect anonymous users to `/login`. |

## Provider shape

The auth provider must expose this semantic state. Names may differ, but consumers must not need Supabase-specific types.

```ts
type AuthStatus = 'loading' | 'anonymous' | 'authenticated'

type Viewer = {
  id: string
  email: string
  displayName: string | null
  avatarUrl: string | null
}

type AuthContextValue = {
  status: AuthStatus
  viewer: Viewer | null
  signOut: () => Promise<void>
}
```

## Landing navigation

| State | Control |
| --- | --- |
| Loading | Non-interactive `Checking session` label. |
| Anonymous | `Log in` link to `/login`. |
| Authenticated | Display name or email plus `Open dashboard` link to `/dashboard`. |

The landing page may accept the semantic viewer state as props until the provider is integrated. It must not inspect Supabase local storage, parse JWTs, or import the Supabase client.

## Login behavior

- Use email and password for the first build.
- Show field-level validation and a clear request error.
- Disable the submit button while the request is pending.
- Restore an existing session before deciding whether to show the form.
- Redirect successful login to `/dashboard`.
- Do not implement a fake development user object. Development auto-login, if added, must create a real Supabase session and remain gated by `import.meta.env.DEV`.

## Acceptance checks

- Anonymous visitor sees `Log in` on `/`.
- Existing session survives refresh and changes the landing navigation.
- Authenticated visitor cannot remain on `/login`.
- Logout returns the navigation to its anonymous state.
- No page imports the Supabase client directly.
