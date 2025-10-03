-- Remover políticas antigas de INSERT e UPDATE que permitem GS
DROP POLICY IF EXISTS "viaturas_insert_isolation" ON public.viaturas;
DROP POLICY IF EXISTS "viaturas_update_isolation" ON public.viaturas;

-- Criar novas políticas restritas apenas para ADMIN
CREATE POLICY "viaturas_insert_admin_only"
ON public.viaturas
FOR INSERT
TO authenticated
WITH CHECK (
  user_has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "viaturas_update_admin_only"
ON public.viaturas
FOR UPDATE
TO authenticated
USING (
  user_has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  user_has_role(auth.uid(), 'admin'::app_role)
);