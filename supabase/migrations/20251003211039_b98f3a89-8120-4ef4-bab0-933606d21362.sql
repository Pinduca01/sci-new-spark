-- =====================================================
-- MIGRAÇÃO 3: RLS para Tabelas Restantes (Corrigida)
-- =====================================================

-- HISTORICO_MANUTENCOES_EQUIPAMENTOS
CREATE POLICY "historico_manutencoes_admin_gs_all" ON historico_manutencoes_equipamentos
FOR ALL TO authenticated
USING (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'))
WITH CHECK (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'));

CREATE POLICY "historico_manutencoes_ba_view" ON historico_manutencoes_equipamentos
FOR SELECT TO authenticated
USING (user_has_role(auth.uid(), 'ba_ce') OR user_has_role(auth.uid(), 'ba_lr') OR user_has_role(auth.uid(), 'ba_mc') OR user_has_role(auth.uid(), 'ba_2'));

-- HISTORICO_RECARGAS_AGENTES
CREATE POLICY "historico_recargas_admin_gs_all" ON historico_recargas_agentes
FOR ALL TO authenticated
USING (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'))
WITH CHECK (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'));

CREATE POLICY "historico_recargas_ba_view" ON historico_recargas_agentes
FOR SELECT TO authenticated
USING (user_has_role(auth.uid(), 'ba_ce') OR user_has_role(auth.uid(), 'ba_lr') OR user_has_role(auth.uid(), 'ba_mc') OR user_has_role(auth.uid(), 'ba_2'));

-- INSPECOES_EXTINTORES
CREATE POLICY "inspecoes_extintores_admin_gs_all" ON inspecoes_extintores
FOR ALL TO authenticated
USING (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'))
WITH CHECK (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'));

CREATE POLICY "inspecoes_extintores_ba_all" ON inspecoes_extintores
FOR ALL TO authenticated
USING (user_has_role(auth.uid(), 'ba_ce') OR user_has_role(auth.uid(), 'ba_lr') OR user_has_role(auth.uid(), 'ba_mc') OR user_has_role(auth.uid(), 'ba_2'))
WITH CHECK (user_has_role(auth.uid(), 'ba_ce') OR user_has_role(auth.uid(), 'ba_lr') OR user_has_role(auth.uid(), 'ba_mc') OR user_has_role(auth.uid(), 'ba_2'));

-- MATERIAIS_GUARDADOS
CREATE POLICY "materiais_guardados_admin_gs_all" ON materiais_guardados
FOR ALL TO authenticated
USING (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'))
WITH CHECK (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'));

CREATE POLICY "materiais_guardados_ba_view" ON materiais_guardados
FOR SELECT TO authenticated
USING (user_has_role(auth.uid(), 'ba_ce') OR user_has_role(auth.uid(), 'ba_lr') OR user_has_role(auth.uid(), 'ba_mc') OR user_has_role(auth.uid(), 'ba_2'));

-- MATERIAIS_VIATURAS
CREATE POLICY "materiais_viaturas_admin_gs_all" ON materiais_viaturas
FOR ALL TO authenticated
USING (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'))
WITH CHECK (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'));

CREATE POLICY "materiais_viaturas_ba_view" ON materiais_viaturas
FOR SELECT TO authenticated
USING (user_has_role(auth.uid(), 'ba_ce') OR user_has_role(auth.uid(), 'ba_lr') OR user_has_role(auth.uid(), 'ba_mc') OR user_has_role(auth.uid(), 'ba_2'));

-- MOVIMENTACOES
CREATE POLICY "movimentacoes_admin_gs_all" ON movimentacoes
FOR ALL TO authenticated
USING (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'))
WITH CHECK (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'));

CREATE POLICY "movimentacoes_ba_view" ON movimentacoes
FOR SELECT TO authenticated
USING (user_has_role(auth.uid(), 'ba_ce') OR user_has_role(auth.uid(), 'ba_lr') OR user_has_role(auth.uid(), 'ba_mc') OR user_has_role(auth.uid(), 'ba_2'));

-- MOVIMENTACOES_ESTOQUE
CREATE POLICY "movimentacoes_estoque_admin_gs_all" ON movimentacoes_estoque
FOR ALL TO authenticated
USING (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'))
WITH CHECK (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'));

CREATE POLICY "movimentacoes_estoque_ba_view" ON movimentacoes_estoque
FOR SELECT TO authenticated
USING (user_has_role(auth.uid(), 'ba_ce') OR user_has_role(auth.uid(), 'ba_lr') OR user_has_role(auth.uid(), 'ba_mc') OR user_has_role(auth.uid(), 'ba_2'));

-- NAO_CONFORMIDADES
CREATE POLICY "nao_conformidades_admin_gs_all" ON nao_conformidades
FOR ALL TO authenticated
USING (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'))
WITH CHECK (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'));

CREATE POLICY "nao_conformidades_ba_all" ON nao_conformidades
FOR ALL TO authenticated
USING (user_has_role(auth.uid(), 'ba_ce') OR user_has_role(auth.uid(), 'ba_lr') OR user_has_role(auth.uid(), 'ba_mc') OR user_has_role(auth.uid(), 'ba_2'))
WITH CHECK (user_has_role(auth.uid(), 'ba_ce') OR user_has_role(auth.uid(), 'ba_lr') OR user_has_role(auth.uid(), 'ba_mc') OR user_has_role(auth.uid(), 'ba_2'));