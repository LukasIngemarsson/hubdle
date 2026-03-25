-- ============================================
-- Group invites table (pending invite → accept/decline)
-- ============================================

create table public.group_invites (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  invited_by uuid not null references public.profiles(id) on delete cascade,
  invited_user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now() not null,
  unique (group_id, invited_user_id)
);

-- ============================================
-- Row Level Security
-- ============================================

alter table public.group_invites enable row level security;

-- Invited user can see their own invites
create policy "Users can view invites addressed to them"
  on public.group_invites for select
  using (auth.uid() = invited_user_id);

-- Group members can see invites for their groups
create policy "Group members can view group invites"
  on public.group_invites for select
  using (public.is_group_member(group_id));

-- Group members can invite their friends
create policy "Members can create group invites for friends"
  on public.group_invites for insert
  with check (
    public.is_group_member(group_id)
    and public.is_friend(invited_user_id)
    and auth.uid() = invited_by
  );

-- Invited user can delete (accept or decline)
create policy "Invited user can delete own invites"
  on public.group_invites for delete
  using (auth.uid() = invited_user_id);

-- Group members can cancel invites
create policy "Group members can cancel invites"
  on public.group_invites for delete
  using (public.is_group_member(group_id));

-- ============================================
-- Remove the old direct-invite policy on group_members
-- ============================================

drop policy if exists "Members can invite friends to groups" on public.group_members;
