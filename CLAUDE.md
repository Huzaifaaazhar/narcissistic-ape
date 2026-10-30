# CLAUDE.md — Student of the Year (St. Alder's)

Mobile-first browser game: enrol, pick Red/Blue house, play 4 rounds, win the trophy.
Full spec lives in the original build prompt; this file holds what you need every session.

## Commands
- `npm run dev`: dev server (Turbopack)
- `npm run build`: production build (dev-only `page.dev.tsx` routes excluded)
- `npm test`: Vitest (pure logic: scoring, rng, sanitiser, env)
- `npm run lint` / `npm run typecheck`
- `npm run shots [-- gallery type home /any/path]`: Playwright screenshots → `shots/<name>-{phone,desktop}.png` (390×844, 1440×900). **Open them and critique after every visual change.**
- `npm run posters`: re-render LCP/fallback posters from the 3D scenes into `public/posters/` (run after any scene change)
- `node scripts/flow-enrol.mjs`: walk the enrol flow and screenshot each step (needs a dev server, `BASE_URL`)
- `npm run a11y`: axe + security-header checks (Playwright)
- `npm run audit`: `npm audit` + client-bundle secret scan (needs a build)

## Stack (pinned exact versions; read node_modules types/docs before using an API)
Next 16.4 (App Router, `proxy.ts` not middleware, ESLint CLI flat config) · React 19.3 · TypeScript 6 strict ·
Tailwind 4 (tokens via `@theme` in `src/app/globals.css`, default palette removed) · Zod 4 · Supabase (`@supabase/ssr`) ·
Vitest 5 · Playwright 1.63 (matches preinstalled Chromium; don't reinstall). Next bundles its docs in `node_modules/next/dist/docs/`.
three 0.186.1 (pinned for postprocessing) · R3F 9.8 · drei 10.7 · postprocessing 6.39 · zustand 5.
Planned: rapier (Phase 3), Framer Motion + GSAP, Howler, Upstash, Turnstile, Serwist.

## Layout
`src/app` routes · `src/components/{ui,icons}` · `src/three` · `src/game` (pure TS) · `src/config` (brand, copy, tokens, motion, scoring) ·
`src/lib` (env, sanitise, security-headers, supabase) · `supabase/migrations` · `docs/` · `design-refs/` (source of truth).
Dev routes: `/dev/gallery`, `/dev/type`, `/dev/scenes` (+ `?debug=1` fps/calls/tris, `&tier=low`, `&freeze=1&p=0..1`), `/dev/characters`.
3D: `src/three/{scenes,objects,materials,postfx,hooks}`; never import three from page code (use `src/three/input.ts`, `quality.ts`, `next/dynamic`).

## Design tokens
| token | hex | use |
|---|---|---|
| paper / paper-warm / paper-deep / paper-shade | #EFE3CF / #ECDCC4 / #E4D3B9 / #D6C3A5 | backgrounds, torn labels, rules |
| navy / navy-hi | #101D3A / #24396B | headlines, Blue House, secondary |
| maroon | #6E0C16 | varsity fill, prices |
| red / red-hi | #A8202B / #C22F3A | Red House, primary CTA |
| ink / ink-soft | #1B1B26 / #4A4552 | body text (never #000) |
| gold | #C9A24B | winning moments only (fails AA on paper: decoration only) |
| cream-hi | #FBF4E6 | text on dark |
| night | #0B1020 | dance + ceremony scenes only |
Fonts: Anton (condensed), Alfa Slab One (slab), Graduate (varsity/collegiate), Montserrat (body), Zilla Slab Italic (accent).
Rules: red+navy always paired (`<Divider/>`); radii 2px (paper) or 999px (pills) only; warm shadows `rgb(60 30 10 / a)`;
labels uppercase + 0.14em tracking; sentence case for >4 words; no emoji icons; all copy in `src/config/copy.ts`; brand names only in `brand.ts`.
Utilities: `<Varsity>` (triple-outline title), `.collegiate`, `.label`, `<TornCard seed>`, `.stamp`, `.patch`, `<Button variant icon>`.

## 3D realism checklist (every scene must pass all)
1. ACES/AgX tone mapping, sRGB output; colour maps sRGB, data maps linear.
2. IBL always on (HDRI or drei Environment + Lightformers). Never ambient+directional only.
3. PBR with variation (roughness noise); metals metalness 1 + env; Physical material for gold/varnish/glass; sheen for fabric.
4. Everything grounded (ContactShadows / baked AO). Nothing floats.
5. Bevel every edge (RoundedBox, bevelled extrude, chamfered lathe).
6. Hero FOV 30–40°, real-world scale.
7. Depth: fog/haze, layered planes, dust motes; DoF on hero shots only.
8. Restrained post: SMAA, high-threshold bloom, soft vignette, faint grain.
9. Imperfection: micro-scratches, asymmetry, smudges.
10. Motion has weight: springs/eased with overshoot, never linear.
Budgets: draw calls <150 desktop / <80 mobile; tris <300k / <120k; 3D chunk <500 KB gz; DPR [1,1.75] mobile.
No allocation in useFrame; dispose on unmount; instance repeats; one real-time shadow light. Poster fallback for no-WebGL/reduced-motion/low-end.

## Security gates (hard rules)
- Server is authoritative: client never submits a score as truth; quiz answers never sent before answering.
- All score writes via route handlers + service role; clients have no write grants; RLS on every table.
- Every request: Zod (reject unknown keys) → rate limit (Upstash) → session ownership check. Turnstile on run start + duel create.
- Secrets server-only; nothing sensitive in `NEXT_PUBLIC_*`; env validated at boot (exit 1 if a tier is incomplete).
- Never `dangerouslySetInnerHTML` (lint error). Nicknames through `sanitiseNickname` on client AND server.
- Errors: generic message + correlation id; no stacks/paths/SQL to clients.
- Run the 5-check preflight before each public deploy; log in `docs/SECURITY.md`. Record non-obvious choices in `docs/DECISIONS.md`.

## Phases
0 Foundations ✅ · 1 Hero corridor + TrophyViewer + enrol ✅ · 2 Quiz + Hunt + hub + finale + board + share (ship) ·
3 Football + Dance with input-log verification · 4 House War, duels, daily, streaks, locker, PWA · 5 Ceremony + AI Dean · 6 Polish & launch.
Each phase ends deployable, with screenshots (≥3 critique rounds per hero scene/screen), acceptance checklist, security delta, perf numbers.

## Working rules
Plan → build → shoot → critique → fix. Pick the defensible option and note it in one line; ask only when a wrong guess costs > a day.
