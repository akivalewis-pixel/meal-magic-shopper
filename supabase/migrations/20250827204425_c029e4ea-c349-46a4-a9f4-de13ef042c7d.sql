-- Add DELETE policy for profiles table to allow users to delete their own profile
-- This addresses the security finding about missing DELETE policy
CREATE POLICY "Users can delete own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = id);