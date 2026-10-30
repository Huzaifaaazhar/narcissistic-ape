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

## Phase 1
- **three pinned to 0.186.1** (not 0.187): `postprocessing@6.39.5` peers `three < 0.187`. npm `overrides` dedupes the copy drei's `stats-gl` pulls in.
- **IBL from drei `Lightformer` softboxes, no HDRI download** (a 1k Poly Haven HDR is 1.6 MB). Studio env for the trophy, golden-hour env for the corridor. Revisit only if reflections read fake on real devices.
- **ACES filmic, not AgX**: AgX turned the gold muddy brown in side-by-side shots. The composer disables renderer tone mapping, so `<ToneMapping>` runs in the post chain; without post (low tier) the renderer applies ACES.
- **All textures procedural** (noise roughness + scratches, locker normal map from a drawn height map, red-oxide floor, walnut, felt banners, engraved plate). Zero image requests for 3D; text textures wait on `document.fonts.load`.
- **Red-oxide polished floor** as a deliberate South Asian school detail; **Roll of Honour** names are fictional initials + common surnames, ending "2026 · ?".
- **Corridor FOV is computed from aspect**: ~58° horizontal on wide screens, 44° portrait, vertical clamped 34–66°. Portrait needs more vertical FOV than the spec's 30–40° hero guidance to keep the lockers in frame; the trophy viewer stays at 32°.
- **`react-hooks/immutability` off for `src/three/**`**: R3F mutates three objects in `useFrame` by design.
- **Poster first, 3D second**: posters are pre-rendered by `npm run posters` (software GL, frozen camera) as 29–41 KB WebP. Desktop boots 3D on `load` + idle; phones boot it on first scroll/touch only (no timer: an idle reader shouldn't pay for it). The scroll-input object lives in `src/three/input.ts` so the page never imports three.js eagerly.
- **Tier logic** (`decideTier`): no WebGL2 / reduced motion / Save-Data → poster; phone with ≤4 cores → poster; other phones → low; desktop → high. `PerformanceMonitor` drops post, then DPR, then falls back to the poster. Graphics Auto/High/Low in Settings.
- **Low tier keeps the sun shadow** (1024 map): the pillar stripes are the scene's signature and the live scene must not look worse than the poster it replaces.
- **Above-the-fold fonts self-hosted in `public/fonts`** (Montserrat latin/latin-ext, Graduate latin) and preloaded; paper grain preloaded because the CTA's background makes it the LCP candidate (Chrome ignores the full-bleed poster as a background-like image).
- **Enrolment is local (zustand persist) until Phase 2** mirrors it server-side. Stores only the chosen handle, house and archetype.
- **House flood uses the Web Animations API**, not Framer Motion: one effect didn't justify the dependency yet.
- **Prettier config** (`semi: false, singleQuote, printWidth 140`) added to match the hand-written style.

## Core game (playable loop, local-first)
- **Re-prioritised on request: game before polish.** All four rounds + hub + finale are playable end to end in the browser. Scores live on the device (`sty-season`); the server-authoritative version (Supabase, anti-cheat, leaderboard) layers on next without changing round logic.
- **Rounds in any order**; finale unlocks at 4/4. "Play another season" archives the run to local history (best season shown on the hub).
- **Pure, tested round logic** in `src/game/` (quiz, hunt, football, dance, dean). Normalisation maxima come from the logic (`QUIZ_MAX`=2626, `HUNT_MAX`=2500, `FOOTBALL_MAX`=750, `DANCE_MAX`=2000), so the 0–1000 total stays honest.
- **Football is 2D canvas, not Rapier 3D**: swipe vector scaled so a ~⅓-screen swipe reaches mid-goal; curve from path bulge; keeper reads you more each kick; tap-a-spot and arrow keys as alternatives.
- **Dance beat is synthesised in WebAudio** (original loop, no files) and judged against `AudioContext.currentTime` minus output latency, never timers.
- **Quiz facts** limited to ones I'm confident in; no film dialogue/lyrics. Content is easy to extend in `src/game/quiz.ts`.
- **Dean verdicts are canned** (by score band) — also the future fallback for the AI Dean.
