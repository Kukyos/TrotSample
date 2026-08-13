# Frontend Services

Pages and components never import the Supabase client. They use the functions
below; only files inside `frontend/src/services/` may create or call the client.

## Authentication

| Function | Purpose |
| --- | --- |
| `getCurrentViewer()` | Restores the locally persisted Supabase session and returns the semantic viewer, or `null`. |
| `subscribeToAuthChanges(onChange)` | Subscribes to login, token refresh, and logout events; returns an unsubscribe function. |
| `signInWithPassword(email, password)` | Signs in with email and password and returns the viewer. |
| `signUpWithPassword(input)` | Creates an Auth user with `display_name` metadata and reports whether email confirmation is required. |
| `signOutCurrentUser()` | Ends the current browser session. |

`AuthViewer` contains `id`, `email`, `displayName`, and `avatarUrl`. Authorization
must never depend on `displayName`, `avatarUrl`, or other user-editable metadata.
