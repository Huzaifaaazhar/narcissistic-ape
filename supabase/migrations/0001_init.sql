-- St. Alder's: Student of the Year — initial schema.
-- Principles (docs/SECURITY.md): RLS on every table; clients may READ public rows and their own rows;
-- ALL score/progress writes go through server route handlers using the service role.

create extension if not exists pgcrypto;

-- ---------- enums ----------
create type house as enum ('red', 'blue');
create type archetype as enum ('scholar', 'rebel', 'royal', 'ghost', 'canteen', 'backbencher');
create type run_mode as enum ('season', 'daily', 'duel');
create type run_status as enum ('active', 'finished', 'flagged', 'expired');
create type round_kind as enum ('football', 'quiz', 'hunt', 'dance');
create type rarity as enum ('common', 'rare', 'legendary');

-- ---------- players ----------
create table public.players (
  id uuid primary key references auth.users (id) on delete cascade,
  public_handle text not null unique default encode(gen_random_bytes(6), 'hex'),
  nickname text not null check (char_length(nickname) between 3 and 16),
  house house not null,
  archetype archetype not null,
  xp integer not null default 0 check (xp >= 0),
  grade smallint not null default 0 check (grade between 0 and 5),
  created_at timestamptz not null default now(),
  last_seen timestamptz not null default now()
);

-- ---------- runs ----------
create table public.runs (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  seed text not null,
  mode run_mode not null default 'season',
  status run_status not null default 'active',
  server_nonce text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  expires_at timestamptz not null default now() + interval '2 hours',
  total smallint check (total between 0 and 1000)
);
create index runs_player_idx on public.runs (player_id, started_at desc);

create table public.round_results (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.runs (id) on delete cascade,
  round round_kind not null,
  score integer not null check (score >= 0),
  details jsonb not null default '{}'::jsonb,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  unique (run_id, round)
);

-- ---------- streaks, collectibles, achievements ----------
create table public.streaks (
  player_id uuid primary key references public.players (id) on delete cascade,
  current integer not null default 0,
  best integer not null default 0,
  freezes smallint not null default 0 check (freezes between 0 and 3),
  last_played_date date
);

create table public.locker_items (
  id text primary key,
  kind text not null,
  name text not null,
  rarity rarity not null
);
create table public.player_items (
  player_id uuid not null references public.players (id) on delete cascade,
  item_id text not null references public.locker_items (id),
  equipped boolean not null default false,
  acquired_at timestamptz not null default now(),
  primary key (player_id, item_id)
);

create table public.achievements (
  id text primary key,
  name text not null,
  description text not null
);
create table public.player_achievements (
  player_id uuid not null references public.players (id) on delete cascade,
  achievement_id text not null references public.achievements (id),
  earned_at timestamptz not null default now(),
  primary key (player_id, achievement_id)
);

-- ---------- social ----------
create table public.duels (
  code text primary key check (code ~ '^[A-HJ-NP-Za-km-z2-9]{10}$'),
  creator_run_id uuid not null references public.runs (id) on delete cascade,
  seed text not null,
  expires_at timestamptz not null default now() + interval '7 days',
  created_at timestamptz not null default now()
);

create table public.house_scores (
  house house not null,
  week date not null, -- Monday of ISO week
  points bigint not null default 0,
  primary key (house, week)
);

create table public.abuse_flags (
  id bigint generated always as identity primary key,
  player_id uuid references public.players (id) on delete set null,
  reason text not null,
  created_at timestamptz not null default now()
);

-- ---------- public leaderboard (verified + not flagged only) ----------
create view public.leaderboard_entries
with (security_invoker = false) as
  select
    p.public_handle,
    p.nickname,
    p.house,
    r.mode,
    r.total,
    r.finished_at
  from public.runs r
  join public.players p on p.id = r.player_id
  where r.status = 'finished'
    and r.total is not null
    and not exists (
      select 1 from public.round_results rr where rr.run_id = r.id and rr.verified = false
    );
-- The view runs with its owner's rights so it can read runs/round_results, but only exposes
-- public columns (no ids, no seeds, no nonces). Grant read on the view only.
revoke all on public.leaderboard_entries from anon, authenticated;
grant select on public.leaderboard_entries to anon, authenticated;

-- ---------- RLS ----------
alter table public.players enable row level security;
alter table public.runs enable row level security;
alter table public.round_results enable row level security;
alter table public.streaks enable row level security;
alter table public.locker_items enable row level security;
alter table public.player_items enable row level security;
alter table public.achievements enable row level security;
alter table public.player_achievements enable row level security;
alter table public.duels enable row level security;
alter table public.house_scores enable row level security;
alter table public.abuse_flags enable row level security;

-- Belt and braces: clients get no write privileges at all; the service role bypasses RLS.
revoke insert, update, delete on all tables in schema public from anon, authenticated;

-- Players: read own row only (public data is exposed through the leaderboard view).
create policy players_read_own on public.players for select to authenticated using (id = auth.uid());

-- Runs and results: read own only.
create policy runs_read_own on public.runs for select to authenticated using (player_id = auth.uid());
create policy results_read_own on public.round_results for select to authenticated
  using (exists (select 1 from public.runs r where r.id = run_id and r.player_id = auth.uid()));

create policy streaks_read_own on public.streaks for select to authenticated using (player_id = auth.uid());
create policy items_read_own on public.player_items for select to authenticated using (player_id = auth.uid());
create policy ach_read_own on public.player_achievements for select to authenticated using (player_id = auth.uid());

-- Catalogues and house totals are public.
create policy locker_items_public on public.locker_items for select to anon, authenticated using (true);
create policy achievements_public on public.achievements for select to anon, authenticated using (true);
create policy house_scores_public on public.house_scores for select to anon, authenticated using (true);

-- duels: no client policy (looked up by code through the server, which returns public fields only).
-- abuse_flags: no client policy (server/moderation only).
