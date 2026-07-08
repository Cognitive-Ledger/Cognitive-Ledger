-- Allow admins to read all profiles.
--
-- Why: the 20260708 migration tightened profiles SELECT to `auth.uid() = id`
-- (a user can only read their own row). That broke Team Management, where an
-- admin looks up another registered user's profile by email before assigning
-- them a role in user_roles. RLS hid the teammate's row, so the lookup
-- returned null and the UI reported "No user found ... They must sign up
-- first" even though the user had registered.
--
-- SELECT policies are OR-combined, so this keeps every user's self-read
-- while additionally letting admins read any profile for team management.

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
