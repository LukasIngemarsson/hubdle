-- Make submissions global (not per-group).
-- Users submit a score once per game per day; groups are just a view over shared scores.

-- 1. Deduplicate: keep the earliest submission per (user_id, game_id, game_date)
delete from public.submissions
where id not in (
  select distinct on (user_id, game_id, game_date) id
  from public.submissions
  order by user_id, game_id, game_date, created_at asc
);

-- 2. Drop the old unique constraint and group_id foreign key
alter table public.submissions
  drop constraint submissions_user_id_group_id_game_id_game_date_key;

alter table public.submissions
  drop column group_id;

-- 3. Add new unique constraint: one score per user per game per day
alter table public.submissions
  add constraint submissions_user_id_game_id_game_date_key
  unique (user_id, game_id, game_date);

-- 4. Update RLS: any authenticated user can view submissions (profiles are already public)
drop policy "Group members can view submissions" on public.submissions;

create policy "Authenticated users can view submissions"
  on public.submissions for select
  using (auth.uid() is not null);
