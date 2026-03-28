# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Stack-level conventions (Svelte 5, Supabase, DaisyUI patterns) are in `.claude/rules/sveltekit-supabase.md`. This file covers Hubdle-specific context only.

## Project — Hubdle

A social competition app where you and your friends compete at daily games or create/track custom challenges.

## MVP Scope

1. **Auth** — sign up / log in via Supabase Auth (Google + Microsoft OAuth)
2. **Games** — browse supported daily games, play them externally, submit scores (paste share text or manual entry). Scores are global — submit once, compete in all groups.
3. **Groups** — create/join groups with friends. View score heatmaps and leaderboards to compare performance. Groups are a competitive lens over shared scores, not a container for them.
4. **Friends** — search users, send/accept friend requests, discover friends-of-friends via profiles.

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
npm run format       # prettier format all source files
npm run db:types     # regenerate database types from Supabase schema
```

There are no test or lint scripts configured.

## Architecture

### Directory Layout

The SvelteKit app lives in `hubdle/` (not the repo root). The repo root contains only `CLAUDE.md` and the `hubdle/` directory.

### Key Modules

- **`$lib/auth.ts`** — `ensureProfile()` upserts a profile on first sign-in. `generateUsername()` falls back to `user_metadata.email` for Microsoft users.
- **`$lib/parsers.ts`** — share-text parsers for Wordle, Bandle, Connections, Contexto, Scrandle. `parseShareText()` chains them with nullish coalescing. Each parser extracts `gameId`, `score`, and `gameDate` from the puzzle number using a hardcoded epoch date.
- **`$lib/game-rules.ts`** — per-game score bounds, labels, and hints. `validateScore()` is used server-side.
- **`$lib/game-icons.ts`** — maps game IDs to imported favicon PNGs stored in `$lib/assets/game-icons/`.
- **`$lib/constants.ts`** — `MAX_GROUP_MEMBERS` (20).

### Database Schema

Defined in `supabase/migrations/`. Key tables: `profiles`, `groups`, `group_members`, `games`, `submissions`, `friendships`, `group_invites`. All tables have RLS enabled.

- `games.score_direction` is `'asc'` (lower is better) or `'desc'` (higher is better)
- `submissions` are global (no `group_id`) with a unique constraint on `(user_id, game_id, game_date)` — one score per user per game per day. Groups query submissions by filtering on member user_ids.
- Group membership is capped at 20 members, enforced server-side on join, accept invite, and invite friend actions.
- Group ownership is tracked via `groups.created_by`; the owner must transfer ownership before leaving if other members exist.
- The `is_group_member()` helper function (security definer) is used in multiple RLS policies.

### Realtime

`group_members` is added to the `supabase_realtime` publication. The group detail page subscribes via `onMount`/`onDestroy` and calls `invalidateAll()` on changes. **Important**: always call `unsubscribeRealtime()` before submitting forms that navigate away (leave, delete, transfer) to avoid a race condition.

### Invite Links

Groups use invite codes stored in `groups.invite_code`. The `/invite/[code]` route auto-joins the user and redirects to the group. Unauthenticated users are redirected to login with a `?redirect=` param that threads through OAuth.

## UI Details

- **Navbar**: Games, Groups, Friends on the left. Logo links to `/games` for logged-in users.
- **Group detail page**: Two tabs — Scores (heatmap + leaderboard) and Members.
- **Games page**: Game cards with favicons, submit form (paste or manual), and submission history with edit/delete.
- **Profile**: Stat cards (streak, friends count, favorite game), 7-day heatmap, submission history. Friends sub-page at `/users/[username]/friends`.
