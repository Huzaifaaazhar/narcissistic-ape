# Architecture

```
Browser (Next.js App Router, React 19)
  ├─ HTML routes ── proxy.ts (nonce CSP, /dev guard) ── RSC render
  ├─ UI: src/components (ui/, icons/), tokens in globals.css @theme
  ├─ 3D (Phase 1+): src/three, client-only, lazy per route
  └─ calls /api/* only (never Supabase directly)
Server (Node runtime route handlers, Phase 2+)
  ├─ Zod validation → Upstash rate limit → Turnstile (run start, duel create)
  ├─ sessionClient(): anon auth, httpOnly cookies, RLS reads
  └─ serviceClient(): validated score writes, totals, ranks
Supabase Postgres: RLS on every table, leaderboard view (public columns, verified runs only)
```

- `src/game/` is pure TS (scoring, seeded RNG). Shared by client and server; server's result is the truth.
- Feature tiers: `FEATURE_BACKEND`, `FEATURE_DEAN` gate env requirements and routes.
