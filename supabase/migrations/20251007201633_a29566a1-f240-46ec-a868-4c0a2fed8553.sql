
-- Adicionar RLS policies para template_checklist e tipos_checklist
-- Permitir que BA-MC, BA-2 e outros roles possam ler os templates de checklist

-- Policy para tipos_checklist (leitura para usuários autenticados)
CREATE POLICY "tipos_checklist_view_all" 
ON public.tipos_checklist 
FOR SELECT 
USING (true);

-- Policy para template_checklist (leitura para usuários autenticados)
CREATE POLICY "template_checklist_view_all" 
ON public.template_checklist 
FOR SELECT 
USING (true);

-- Policies de gerenciamento (apenas admin e gs_base podem modificar)
CREATE POLICY "tipos_checklist_admin_manage" 
ON public.tipos_checklist 
FOR ALL 
USING (user_has_role(auth.uid(), 'admin'::app_role) OR user_has_role(auth.uid(), 'gs_base'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role) OR user_has_role(auth.uid(), 'gs_base'::app_role));

CREATE POLICY "template_checklist_admin_manage" 
ON public.template_checklist 
FOR ALL 
USING (user_has_role(auth.uid(), 'admin'::app_role) OR user_has_role(auth.uid(), 'gs_base'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role) OR user_has_role(auth.uid(), 'gs_base'::app_role));
