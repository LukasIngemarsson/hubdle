-- ============================================
-- Tables
-- ============================================

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_url text,
  created_at timestamptz default now() not null
);

-- Groups
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz default now() not null
);

-- Group members
create table public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz default now() not null,
  primary key (group_id, user_id)
);

-- Games registry
create table public.games (
  id text primary key,
  name text not null,
  url text not null,
  score_direction text not null check (score_direction in ('asc', 'desc'))
);

-- Submissions
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  game_id text not null references public.games(id),
  score integer not null,
  raw_text text not null,
  game_date date not null,
  created_at timestamptz default now() not null,
  unique (user_id, group_id, game_id, game_date)
);

-- ============================================
-- Helper function (security definer to bypass RLS)
-- ============================================

create or replace function public.is_group_member(gid uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid
      and user_id = auth.uid()
  );
$$;

-- ============================================
-- Row Level Security
-- ============================================

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.games enable row level security;
alter table public.submissions enable row level security;

-- Profiles policies
create policy "Anyone can view profiles"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Groups policies
create policy "Authenticated users can view groups"
  on public.groups for select
  using (auth.uid() is not null);

create policy "Authenticated users can create groups"
  on public.groups for insert
  with check (auth.uid() = created_by);

-- Group members policies
create policy "Members can view group members"
  on public.group_members for select
  using (public.is_group_member(group_id));

create policy "Authenticated users can join groups"
  on public.group_members for insert
  with check (auth.uid() = user_id);

-- Games policies
create policy "Anyone can view games"
  on public.games for select
  using (true);

-- Submissions policies
create policy "Group members can view submissions"
  on public.submissions for select
  using (public.is_group_member(group_id));

create policy "Users can insert own submissions"
  on public.submissions for insert
  with check (auth.uid() = user_id);

-- Game seed data is in 00005_add_games.sql
