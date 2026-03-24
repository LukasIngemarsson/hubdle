# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project — Hubdle

A social competition app where you and your friends compete at daily games or create/track custom challenges.
Portfolio project now, with intent to ship for real users later.

## MVP Scope

1. **Auth** — sign up / log in via Supabase Auth
2. **Leaderboards** — create/join groups with friends
3. **Daily games** — users play external games (Wordle, Bandle, etc.) and paste/submit their share-text scores; app parses and tracks them on the leaderboard

## Tech Stack

- **Frontend**: SvelteKit (Svelte 5 with runes) + TypeScript
- **UI**: DaisyUI 5 + Tailwind CSS 4
- **Backend/DB**: Supabase (Postgres + Auth + RLS)
- **Hosting**: Vercel (via adapter-auto)

## Commands

All commands run from the `hubdle/` subdirectory (the SvelteKit project root):

```bash
cd hubdle
npm run dev          # start dev server
npm run build        # production build
npm run preview      # preview production build
npm run check        # svelte-check type checking
npm run check:watch  # type checking in watch mode
npm run db:types     # regenerate database types from Supabase schema
```

There are no test or lint scripts configured.

## Architecture

### Directory Layout

The SvelteKit app lives in `hubdle/` (not the repo root). The repo root contains only `CLAUDE.md` and the `hubdle/` directory.

### Supabase Integration

- **Server hook** (`src/hooks.server.ts`): Creates a per-request Supabase client and exposes `supabase` + `safeGetSession()` on `event.locals`.
- **Layout data flow**: `+layout.server.ts` calls `safeGetSession()` and passes `user` + `cookies` to the client. `+layout.ts` creates a browser-side Supabase client from that data. All pages receive `supabase` and `user` via layout data.
- **Auth callback**: `/auth/callback` handles OAuth redirect.
- **Profile auto-creation**: `ensureProfile()` in `$lib/auth.ts` upserts a profile row on first sign-in.
- **Database types**: Auto-generated from the Supabase schema via `npm run db:types`. Run this after any migration to keep types in sync.
- **Realtime**: `group_members` is added to the `supabase_realtime` publication. The group detail page subscribes via `onMount`/`onDestroy` and calls `invalidateAll()` on changes. **Important**: always call `unsubscribeRealtime()` before submitting forms that navigate away (leave, delete, transfer) to avoid a race condition where `invalidateAll()` re-runs the load function on a deleted/left resource and hits a 404.

### Score Parsing & Validation

- `$lib/parsers.ts` contains share-text parsers for supported games (Wordle, Bandle, Connections, Contexto, Scrandle). `parseShareText()` chains them with nullish coalescing. Each parser extracts `gameId`, `score`, and `gameDate` from the puzzle number using a hardcoded epoch date.
- `$lib/game-rules.ts` defines per-game score bounds (`minScore`, `maxScore`), labels, and hints as a `Record<string, GameRules>`. The `validateScore()` function is used server-side on both paste and manual submit actions. Future dates are also rejected server-side.

### Database Schema

Defined in `supabase/migrations/`. Key tables: `profiles`, `groups`, `group_members`, `games`, `submissions`. All tables have RLS enabled. The `is_group_member()` helper function (security definer) is used in multiple RLS policies.

- `games.score_direction` is `'asc'` (lower is better) or `'desc'` (higher is better)
- `submissions` has a unique constraint on `(user_id, group_id, game_id, game_date)` — one score per user per game per day per group
- Group ownership is tracked via `groups.created_by`; the owner must transfer ownership before leaving if other members exist

## Conventions

### Svelte 5

This project uses Svelte 5 with runes mode enforced in `svelte.config.js`. Use `$props()`, `$state()`, `$derived()` — not the legacy Svelte 4 reactive syntax. **Avoid `$effect` for side effects** — use `onMount`/`onDestroy` lifecycle callbacks instead, as effects lose control and locality (you can't easily know when they trigger as the program grows).

### Const Enum Pattern

Svelte doesn't support TS `enum` in `.svelte` files. Use `as const` objects with a derived type instead:

```ts
const TimeFilter = { All: 'all', Weekly: 'weekly' } as const;
type TimeFilter = (typeof TimeFilter)[keyof typeof TimeFilter];
```

Use these in conditionals (`TimeFilter.All`) instead of raw string literals.

### UI Patterns

- **Cards**: Use `bg-base-200` for input/action cards (e.g. Submit Score), `border border-base-300` for display cards (e.g. Leaderboard, Recent Submissions).
- **Navbar**: Text links with animated centered underline on hover/active. Hamburger menu on mobile. Main nav items (Groups, etc.) on the left; Profile and Log Out on the right.
- **Destructive actions**: Use `ConfirmModal` component. Separate Leave and Delete with `justify-between`. Delete button uses `btn-error btn-outline btn-sm`.
- **Copy badge**: Uses inline SVG clipboard/checkmark icons, not text labels.
