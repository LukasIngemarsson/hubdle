-- Delete policy for groups: only the creator can delete
create policy "Creator can delete group"
  on public.groups for delete
  using (auth.uid() = created_by);

-- Delete policy for group_members: members can leave groups
create policy "Members can leave groups"
  on public.group_members for delete
  using (auth.uid() = user_id);
