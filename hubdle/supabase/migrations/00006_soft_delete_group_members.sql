-- Add soft-delete column to group_members
ALTER TABLE public.group_members ADD COLUMN left_at timestamptz DEFAULT NULL;

-- Update is_group_member() to only consider active members
CREATE OR REPLACE FUNCTION public.is_group_member(gid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = gid
      AND user_id = auth.uid()
      AND left_at IS NULL
  );
$$;

-- Replace the DELETE policy with an UPDATE policy for soft-delete
DROP POLICY "Members can leave groups" ON public.group_members;

CREATE POLICY "Members can update own membership"
  ON public.group_members FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to see their own membership rows (including soft-deleted)
-- so the rejoin UPDATE can find the row to clear left_at
CREATE POLICY "Users can view own memberships"
  ON public.group_members FOR SELECT
  USING (auth.uid() = user_id);
