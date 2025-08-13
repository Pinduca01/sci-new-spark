-- First, create a security definer function to get current user role
-- This prevents infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Bombeiros viewable by authenticated users" ON public.bombeiros;
DROP POLICY IF EXISTS "Bombeiros can be inserted by authenticated users" ON public.bombeiros;
DROP POLICY IF EXISTS "Bombeiros can be updated by authenticated users" ON public.bombeiros;
DROP POLICY IF EXISTS "Bombeiros can be deleted by authenticated users" ON public.bombeiros;

-- Create secure role-based policies for bombeiros table
-- Only admins can view all bombeiros data
CREATE POLICY "Admin users can view all bombeiros" 
ON public.bombeiros 
FOR SELECT 
TO authenticated
USING (public.get_current_user_role() = 'admin');

-- Only admins can insert new bombeiros
CREATE POLICY "Admin users can insert bombeiros" 
ON public.bombeiros 
FOR INSERT 
TO authenticated
WITH CHECK (public.get_current_user_role() = 'admin');

-- Only admins can update bombeiros data
CREATE POLICY "Admin users can update bombeiros" 
ON public.bombeiros 
FOR UPDATE 
TO authenticated
USING (public.get_current_user_role() = 'admin');

-- Only admins can delete bombeiros
CREATE POLICY "Admin users can delete bombeiros" 
ON public.bombeiros 
FOR DELETE 
TO authenticated
USING (public.get_current_user_role() = 'admin');

-- Update existing profiles to have admin role (so current users don't get locked out)
-- You can adjust this based on who should have admin access
UPDATE public.profiles SET role = 'admin' WHERE role = 'user';