# Student of the Year · St. Alder's

A mobile-first browser game: enrol at a fictional college, pick Red or Blue House, and play four
short rounds for the trophy.

**Play:** https://student-of-the-year.vercel.app

## The game

| Round | What you do |
|---|---|
| 1 · The Match | Five penalties. Swipe toward the spot; curve the swipe to bend it. |
| 2 · The Quiz | Ten questions, fifteen seconds each. Speed and streaks score more. |
| 3 · The Hunt | Cryptic clues on a campus map, then a quick puzzle at each place. |
| 4 · The Battle | A one-minute, four-lane rhythm game on an original beat. |

Finish all four for a total out of 1000, the Dean's verdict and a trophy engraved with your name.
Also: a daily challenge, friend duels by link, streaks, achievements, a locker of collectibles, a
share card, and install-to-home-screen with offline support.

Scores are stored on the device for now. The shared leaderboard and house war need the backend
(Supabase, Upstash, Turnstile), which isn't set up yet.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests (game logic)
npm run lint && npm run typecheck
npm run a11y       # axe + security headers (Playwright)
npm run shots      # screenshots to shots/
```

See `CLAUDE.md` for conventions and `docs/` for decisions and the security log.

## Deploy

The Vercel project `student-of-the-year` is linked to this repo. Every push to the production
branch (`ccr-6b893e98-38fcuz`) deploys to the live URL.
