-- Corrigir função user_can_access_base para evitar recursão RLS
CREATE OR REPLACE FUNCTION public.user_can_access_base(_base_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    LEFT JOIN public.user_roles ur ON ur.user_id = p.user_id
    WHERE p.user_id = auth.uid()
      AND (
        ur.role = 'admin'::app_role
        OR p.base_id = _base_id
      )
  )
$$;