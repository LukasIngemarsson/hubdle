-- Allow users to update their own submissions
create policy "Users can update own submissions"
  on public.submissions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Allow users to delete their own submissions
create policy "Users can delete own submissions"
  on public.submissions for delete
  using (auth.uid() = user_id);
