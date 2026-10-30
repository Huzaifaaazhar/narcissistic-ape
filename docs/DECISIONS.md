# Decisions

One line per non-obvious choice. Newest at the bottom.

- **School name is original** ("St. Alder's", `src/config/brand.ts`). The posters' school name is from the film; spec bans film names. One-line rename if the event partner clears it.
- **Navy is darker than the spec** (`#101D3A`, sampled from poster dividers) vs spec `#0E1B44`. Maroon `#6E0C16` sampled. `--red #A8202B` kept for UI/Red House though it isn't in the posters.
- **Display faces:** Anton (condensed sans, "DRESS CODE"), Alfa Slab One (slab heads + prices), Graduate (varsity/collegiate), Montserrat (body), Zilla Slab Italic ("per person"). Ultra matched "TICKETS" slightly better but a 3rd display face isn't worth the bytes. Evidence: `shots/type-*.png` via `/dev/type`.
- **Fonts via @fontsource npm packages**, not `next/font/google`, so builds never depend on Google's servers.
- **Varsity lettering is two stacked text layers + rings of text-shadows** (round joins). `-webkit-text-stroke` miters spike on "A" apexes and can't draw two concentric outlines.
- **Paper grain is a 12 KB procedurally generated, quantised PNG tile** (low alpha, mostly fine grain). First two versions were too blotchy (see gallery critique log in phase reports).
- **Torn edges are deterministic `clip-path: polygon()`** from a seeded RNG → identical on server/client; shadow lives on a wrapper with `filter: drop-shadow` because clip-path cuts box-shadows.
- **Buttons are "ticket stubs"**: CSS mask notches; drop-shadow on the outer `<button>`, mask on the inner face (filters run before masks).
- **Next.js 16 uses `proxy.ts`** (middleware renamed). Proxy runtime is Node.
- **CSP is nonce-based on every HTML route, so every route renders dynamically** (`await headers()` in root layout). Revisit in Phase 1 for LCP: static landing + hash-based CSP if TTFB hurts.
- **`style-src-attr 'unsafe-inline'`**: React SSR emits `style=""` attributes (clip paths, CSS vars). Attribute styles can't load scripts; `<style>` elements still need the nonce. Dev additionally allows inline `<style>` for HMR.
- **Dev-only routes are `page.dev.tsx`**; `pageExtensions` excludes them from production builds, and `proxy.ts` 404s `/dev/*` in production as a second guard.
- **Env validation is tiered** (`FEATURE_BACKEND`, `FEATURE_DEAN`) so Phase 0 deploys with zero secrets; once a tier is on, the server exits(1) at boot if any of its vars are missing. Errors name variables, never values.
- **Supabase auth cookies are `httpOnly`**: the browser never talks to Supabase auth directly; all auth/score calls go through our route handlers. Clients have zero INSERT/UPDATE/DELETE grants.
- **Leaderboard is a view owned by postgres (security_invoker=false)** exposing only public columns; base tables stay owner-only under RLS.
- **Nickname filter prefers false positives** (substring stems, Scunthorpe problem accepted) for a public board; stems < 4 chars match whole tokens only.
- **`playwright-core` overridden to 1.63.0** so `@axe-core/playwright` uses the same core as the preinstalled Chromium.
- **TypeScript 6.0** rather than 7.x (native port): Next's type plugin relies on the JS compiler API.
- **Archetype picker uses emblem patches in Phase 0**; original illustrated characters replace them in Phase 1 enrolment.
- **Lighthouse CI deferred to Phase 1**: Phase 0 has no real landing to measure.
