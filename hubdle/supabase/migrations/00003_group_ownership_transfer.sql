-- Allow group creator to update the group (e.g. transfer ownership).
-- USING gates which rows the owner can update; WITH CHECK (true) allows
-- the new row to have a different created_by (ownership transfer).
create policy "Creator can update group"
  on public.groups for update
  using (auth.uid() = created_by)
  with check (true);
