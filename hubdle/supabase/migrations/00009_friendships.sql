-- ============================================
-- Friendships table
-- ============================================

create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  check (requester_id != addressee_id)
);

-- Prevent duplicate friendship pairs regardless of direction
create unique index friendships_unique_pair
  on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));

-- ============================================
-- Helper function
-- ============================================

create or replace function public.is_friend(other_user_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.friendships
    where status = 'accepted'
      and (
        (requester_id = auth.uid() and addressee_id = other_user_id)
        or (requester_id = other_user_id and addressee_id = auth.uid())
      )
  );
$$;

-- ============================================
-- Row Level Security
-- ============================================

alter table public.friendships enable row level security;

-- Users can see friendships they are part of
create policy "Users can view own friendships"
  on public.friendships for select
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- Users can send friend requests (they must be the requester, status must be pending)
create policy "Users can send friend requests"
  on public.friendships for insert
  with check (auth.uid() = requester_id and status = 'pending');

-- Addressee can accept a pending request (update status to accepted)
create policy "Addressee can accept friend request"
  on public.friendships for update
  using (auth.uid() = addressee_id and status = 'pending')
  with check (status = 'accepted');

-- Either party can delete (unfriend or decline)
create policy "Either party can delete friendship"
  on public.friendships for delete
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- ============================================
-- Allow group members to invite friends
-- ============================================

create policy "Members can invite friends to groups"
  on public.group_members for insert
  with check (
    public.is_group_member(group_id)
    and public.is_friend(user_id)
  );
