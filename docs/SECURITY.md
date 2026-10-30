# Security log

Five-check preflight (spec §11), run before every public deploy. This does not replace a professional security test if the app grows or handles real money or personal data.

## Threat model (v0)

| Actor | Goal | Primary controls |
|---|---|---|
| Leaderboard cheater | Fake/replayed scores, bots | Server-authoritative scoring, signed run nonce, input-log recomputation (Phase 2–3), RLS: no client writes |
| Spammer | Mass runs, abusive nicknames | Turnstile, Upstash rate limits, nickname sanitiser + blocklist |
| Scraper | Bulk data | Leaderboard view exposes public columns only; cached reads |
| XSS / injection | Script in nickname/duel code | No `dangerouslySetInnerHTML` (lint error), Zod everywhere, parameterised queries, nonce CSP |
| Bill-runner | Burn AI/OG budget | Dean 3/hr/session + max tokens + canned fallback; OG cached per run |
| DDoS-lite | Exhaust functions | Global per-IP burst limit, platform IP only, cached GETs |

## Phase 0 preflight — 2026-10-30

### Check 1 · Secrets
| Finding | File:line | Severity | Status |
|---|---|---|---|
| No secrets in source; `.env*` ignored, `.env.example` has names only | `.gitignore` | — | Pass |
| Server-only vars never prefixed `NEXT_PUBLIC_` | `src/lib/env.ts` | — | Pass |
| Boot refuses with missing tier vars; message lists names only (unit-tested) | `src/instrumentation.ts`, `src/lib/env.test.ts` | — | Pass (verified: exit=1) |
| Client bundle scanned for key shapes, env names, source maps | `scripts/scan-build.mjs` | — | Pass (clean, 0 maps) |
| gitleaks in CI + optional pre-commit hook | `.github/workflows/ci.yml`, `.githooks/pre-commit` | — | Pass (CI); local hook skips if gitleaks absent |

### Check 2 · Personal data
| Finding | File:line | Severity | Status |
|---|---|---|---|
| Only nickname + house + archetype collected; no email/phone/name | `supabase/migrations/0001_init.sql` | — | Pass |
| Players expose `public_handle`, never auth uid, in the leaderboard view | `0001_init.sql` | — | Pass |
| IP hashing salt reserved (`IP_HASH_SALT`); rate limiting not built yet | `.env.example` | Info | Open → Phase 2 |
| `/api/me/delete` + `/privacy` not built yet | — | Info | Open → Phase 2 |

### Check 3 · Production hardening
| Finding | File:line | Severity | Status |
|---|---|---|---|
| CSP (nonce, strict-dynamic, frame-ancestors none, object-src none) on HTML routes | `src/proxy.ts`, `src/lib/security-headers.ts` | — | Pass (curl + Playwright, 0 violations in prod) |
| HSTS 1y, nosniff, XFO DENY, Referrer-Policy, Permissions-Policy, COOP on all responses | `next.config.ts` | — | Pass |
| `X-Powered-By` removed; prod source maps off | `next.config.ts` | — | Pass |
| `/dev/*` absent from prod build and 404 via proxy | `next.config.ts`, `src/proxy.ts` | — | Pass (verified 404) |
| `style-src-attr 'unsafe-inline'` | `src/lib/security-headers.ts` | Low | Accepted (attribute styles only; documented in DECISIONS) |
| API routes excluded from proxy matcher, so they get static headers but no CSP | `src/proxy.ts` | Low | Accepted (JSON responses); revisit when API lands |

### Check 4 · Logic, auth, anti-cheat
| Finding | File:line | Severity | Status |
|---|---|---|---|
| RLS enabled on all 11 tables; clients have no INSERT/UPDATE/DELETE grants | `0001_init.sql` | — | Pass (migration written; not yet applied to a live project) |
| `unique (run_id, round)` blocks double submission | `0001_init.sql` | — | Pass |
| Duel codes constrained to 10-char unambiguous alphabet | `0001_init.sql` | — | Pass |
| Score endpoints, nonce signing, input-log verification not built | — | Info | Open → Phase 2/3 |

### Check 5 · Attacker's view (Phase 0 surface)
- Tried `/dev/gallery`, `/dev/type`, `/dev` on prod → 404.
- Tried nickname payloads (`<script>`, `x' OR 1=1`, zero-width "ad​min", fullwidth "ａｄｍｉｎ", leet abuse) → rejected (unit tests).
- `.env`, `.git` not served (Next only serves `public/`); no source maps shipped.
- No API surface exists yet, so nothing else to attack. Re-run in full at the end of Phase 2.

### Summary
No High or Medium findings open. Two Low items accepted with rationale. Phase 2 opens: rate limiting, IP hashing, delete-my-data, API CSP/CORS review.
