-- Enable realtime for group_members so the UI updates when members join/leave
alter publication supabase_realtime add table public.group_members;
