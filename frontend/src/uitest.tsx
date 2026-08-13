// DEV-ONLY UI harness. Not an auth path and never shipped.
//
// Every application screen sits behind ProtectedRoute, so with no Supabase
// credentials none of them can be opened and no interaction can be tested. This
// entry mounts the real routes with a stubbed auth context so the UI can be
// clicked through locally. It is the browser twin of smoke.tsx.
//
// It touches nothing in src/auth and issues no queries — every screen reads
// fixtures — so it cannot produce the phantom-401 problem docs/AUTH.md warns
// about. vite build only emits index.html, so this never reaches production.
//
// Serve with: npm run dev  →  http://localhost:5173/uitest.html
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from './router'
import { AuthContext, type AuthContextValue } from './auth/auth-context'
import './styles.css'

if (!import.meta.env.DEV) {
  throw new Error('The UI harness must never run outside development.')
}

const stub: AuthContextValue = {
  status: 'authenticated',
  viewer: {
    id: '00000000-0000-4000-8000-000000000001',
    email: 'armaan@example.com',
    displayName: 'Armaan Mohamed',
    avatarUrl: null,
  },
  signOut: async () => {
    console.log('[uitest] signOut called')
  },
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthContext.Provider value={stub}>
      {/* MemoryRouter: a hard URL navigation would resolve to index.html and
          land back in the auth-gated app. In-memory keeps every route reachable
          through the app's own navigation. */}
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppRoutes />
      </MemoryRouter>
    </AuthContext.Provider>
  </StrictMode>,
)
