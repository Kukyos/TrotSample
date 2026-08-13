// Temporary render smoke check — renders every route to a string so a crash in
// any screen fails loudly. Not part of the app; deleted after the run.
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from './src/router'
import { AuthContext, type AuthContextValue } from './src/auth/auth-context'

const viewer: AuthContextValue = {
  status: 'authenticated',
  viewer: {
    id: '00000000-0000-4000-8000-000000000001',
    email: 'armaan@example.com',
    displayName: 'Armaan Mohamed',
    avatarUrl: null,
  },
  signOut: async () => {},
}

const anonymous: AuthContextValue = { status: 'anonymous', viewer: null, signOut: async () => {} }

const ROUTES = [
  '/',
  '/dashboard',
  '/trips',
  '/trips/new',
  '/trips/trip-europe-loop',
  '/trips/trip-europe-loop/build',
  '/trips/trip-kansai-spring',
  '/trips/does-not-exist',
  '/explore',
  '/explore?q=barcelona',
  '/calendar',
  '/community',
  '/profile',
  '/admin',
]

let failures = 0

for (const route of ROUTES) {
  try {
    const html = renderToString(
      <AuthContext.Provider value={viewer}>
        <MemoryRouter initialEntries={[route]}>
          <AppRoutes />
        </MemoryRouter>
      </AuthContext.Provider>,
    )
    if (html.length < 200) throw new Error(`suspiciously short output (${html.length} chars)`)
    console.log(`  ok    ${route.padEnd(34)} ${html.length} chars`)
  } catch (error) {
    failures += 1
    console.log(`  FAIL  ${route}`)
    console.log(`        ${error instanceof Error ? error.message : String(error)}`)
  }
}

// The guard must bounce an anonymous visitor off every protected route.
for (const route of ['/dashboard', '/trips', '/admin']) {
  const html = renderToString(
    <AuthContext.Provider value={anonymous}>
      <MemoryRouter initialEntries={[route]}>
        <AppRoutes />
      </MemoryRouter>
    </AuthContext.Provider>,
  )
  const leaked = html.includes('app-dock')
  if (leaked) {
    failures += 1
    console.log(`  FAIL  guard leaked ${route} to an anonymous visitor`)
  } else {
    console.log(`  ok    guard blocks ${route}`)
  }
}

console.log(failures === 0 ? '\nall routes rendered' : `\n${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
