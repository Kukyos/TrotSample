// Render check + static preview generator.
//
// Every application screen sits behind ProtectedRoute, so none of them can be
// opened until Supabase credentials exist. This renders each route to a string,
// asserts the things a render can prove, and writes reviewable HTML into
// dist/preview/ so the screens can actually be looked at in the meantime.
//
// Run: npm run smoke   (then npm run preview and open /preview/)
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from './src/router'
import { AuthContext, type AuthContextValue } from './src/auth/auth-context'

const authenticated: AuthContextValue = {
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

const render = (route: string, auth: AuthContextValue) =>
  renderToString(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[route]}>
        <AppRoutes />
      </MemoryRouter>
    </AuthContext.Provider>,
  )

type Case = { route: string; name: string; expect?: string[] }

const CASES: Case[] = [
  { route: '/', name: 'landing', expect: ['GLOBE'] },
  { route: '/dashboard', name: 'dashboard', expect: ['Europe Loop', 'CONTINUE PLANNING'] },
  { route: '/trips', name: 'trips', expect: ['Ongoing', 'Upcoming'] },
  { route: '/trips/new', name: 'create-trip', expect: ['Add another section'] },
  {
    route: '/trips/trip-europe-loop',
    name: 'itinerary-budget',
    // 09:00 proves itinerary times render as authored (UTC), not shifted into
    // the machine's local zone. Run under TZ=Asia/Kolkata to confirm.
    expect: ['09:00', 'Sagrada Familia', 'Transport', 'Where the money goes'],
  },
  { route: '/trips/trip-europe-loop/build', name: 'builder', expect: ['09:00', 'Add item to'] },
  { route: '/trips/trip-kansai-spring', name: 'itinerary-single-stop' },
  { route: '/trips/does-not-exist', name: 'trip-not-found', expect: ['isn’t here'] },
  { route: '/explore', name: 'explore', expect: ['Cities', 'Activities'] },
  { route: '/explore?q=barcelona', name: 'explore-search', expect: ['Barcelona'] },
  { route: '/calendar', name: 'calendar', expect: ['September 2026', 'Europe Loop'] },
  { route: '/community', name: 'community', expect: ['Sagrada'] },
  { route: '/profile', name: 'profile', expect: ['PREPLANNED TRIPS', 'admin panel'] },
  { route: '/admin', name: 'admin', expect: ['MANAGE USERS', 'Popular cities'] },
]

let failures = 0
const fail = (message: string) => {
  failures += 1
  console.log(`  FAIL  ${message}`)
}

// Inline the built stylesheet so the previews look like the real thing.
let css = ''
try {
  const assets = join('dist', 'assets')
  const sheet = readdirSync(assets).find((file) => file.endsWith('.css'))
  if (sheet) css = readFileSync(join(assets, sheet), 'utf8')
} catch {
  console.log('  note  no dist/ build found — previews will be unstyled. Run npm run build first.')
}

const previewDir = join('dist', 'preview')
mkdirSync(previewDir, { recursive: true })

const rendered: { name: string; route: string }[] = []

for (const testCase of CASES) {
  let html = ''
  try {
    html = render(testCase.route, authenticated)
  } catch (error) {
    fail(`${testCase.route} threw: ${error instanceof Error ? error.message : String(error)}`)
    continue
  }

  const missing = (testCase.expect ?? []).filter((needle) => !html.includes(needle))
  if (missing.length > 0) {
    fail(`${testCase.route} missing ${missing.map((value) => `"${value}"`).join(', ')}`)
    continue
  }

  writeFileSync(
    join(previewDir, `${testCase.name}.html`),
    `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${testCase.name} — GlobeTrotter preview</title>
<style>${css}</style></head><body><div id="root">${html}</div></body></html>`,
    'utf8',
  )
  rendered.push({ name: testCase.name, route: testCase.route })
  console.log(`  ok    ${testCase.route.padEnd(34)} ${html.length} chars`)
}

// The guard must bounce anonymous visitors off every protected route.
for (const route of ['/dashboard', '/trips', '/trips/new', '/explore', '/calendar', '/community', '/profile', '/admin']) {
  const html = render(route, anonymous)
  if (html.includes('app-dock')) fail(`guard leaked ${route} to an anonymous visitor`)
}
if (failures === 0) console.log('  ok    guard blocks all protected routes when anonymous')

writeFileSync(
  join(previewDir, 'index.html'),
  `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>GlobeTrotter screen previews</title>
<style>${css}
body{padding:3rem 2rem;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif}
ul{max-width:40rem;margin:2rem 0 0;padding:0;list-style:none;display:grid;gap:.5rem}
li a{display:flex;justify-content:space-between;gap:1rem;padding:1rem 1.25rem;border:1px solid var(--line);border-radius:.8rem;color:var(--paper)}
li a:hover{border-color:var(--violet)}
li a span{color:var(--muted);font-family:var(--mono);font-size:.7rem}</style></head>
<body><p class="hero-kicker">STATIC PREVIEWS</p>
<h1 style="font-family:var(--serif);font-style:italic;font-weight:400;font-size:3rem;margin:.5rem 0 0">Every screen, rendered.</h1>
<p style="color:var(--muted);max-width:34rem;line-height:1.6">Server-rendered snapshots. Layout, type, colour, and copy are real; nothing is interactive. The live app needs Supabase credentials.</p>
<ul>${rendered.map((entry) => `<li><a href="./${entry.name}.html">${entry.name}<span>${entry.route}</span></a></li>`).join('')}</ul>
</body></html>`,
  'utf8',
)

console.log(
  failures === 0
    ? `\nall ${rendered.length} routes rendered · previews in dist/preview/ (npm run preview, then open /preview/)`
    : `\n${failures} FAILURES`,
)
process.exit(failures === 0 ? 0 : 1)
