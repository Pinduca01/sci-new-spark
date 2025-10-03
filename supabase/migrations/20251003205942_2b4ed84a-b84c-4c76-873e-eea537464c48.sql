-- =====================================================
-- MIGRAÇÃO 1: RLS para Tabelas Críticas do Dashboard
-- =====================================================

-- 1. AGENTES_EXTINTORES_CONTROLE
-- Admin e GS: Gerenciar todos
CREATE POLICY "agentes_controle_admin_gs_all" 
ON agentes_extintores_controle
FOR ALL 
TO authenticated
USING (
  user_has_role(auth.uid(), 'admin') OR 
  user_has_role(auth.uid(), 'gs_base')
)
WITH CHECK (
  user_has_role(auth.uid(), 'admin') OR 
  user_has_role(auth.uid(), 'gs_base')
);

-- Todos autenticados: Visualizar
CREATE POLICY "agentes_controle_view_all" 
ON agentes_extintores_controle
FOR SELECT 
TO authenticated
USING (true);

-- 2. ORDENS_SERVICO
-- Admin e GS: Gerenciar todas
CREATE POLICY "ordens_servico_admin_gs_all" 
ON ordens_servico
FOR ALL 
TO authenticated
USING (
  user_has_role(auth.uid(), 'admin') OR 
  user_has_role(auth.uid(), 'gs_base')
)
WITH CHECK (
  user_has_role(auth.uid(), 'admin') OR 
  user_has_role(auth.uid(), 'gs_base')
);

-- BA roles: Ver e criar ordens
CREATE POLICY "ordens_servico_ba_view_create" 
ON ordens_servico
FOR SELECT 
TO authenticated
USING (
  user_has_role(auth.uid(), 'ba_ce') OR
  user_has_role(auth.uid(), 'ba_lr') OR
  user_has_role(auth.uid(), 'ba_mc') OR
  user_has_role(auth.uid(), 'ba_2')
);

CREATE POLICY "ordens_servico_ba_insert" 
ON ordens_servico
FOR INSERT 
TO authenticated
WITH CHECK (
  user_has_role(auth.uid(), 'ba_ce') OR
  user_has_role(auth.uid(), 'ba_lr') OR
  user_has_role(auth.uid(), 'ba_mc') OR
  user_has_role(auth.uid(), 'ba_2')
);