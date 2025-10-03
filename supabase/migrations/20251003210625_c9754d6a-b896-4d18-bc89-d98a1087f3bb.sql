-- =====================================================
-- MIGRAÇÃO 2: RLS para Tabelas Secundárias
-- =====================================================

-- CHECKLIST_AGENTES
CREATE POLICY "checklist_agentes_admin_gs_all" ON checklist_agentes
FOR ALL TO authenticated
USING (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'))
WITH CHECK (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'));

CREATE POLICY "checklist_agentes_ba_view" ON checklist_agentes
FOR SELECT TO authenticated
USING (user_has_role(auth.uid(), 'ba_ce') OR user_has_role(auth.uid(), 'ba_lr') OR user_has_role(auth.uid(), 'ba_mc') OR user_has_role(auth.uid(), 'ba_2'));

-- CHECKLIST_ITEMS
CREATE POLICY "checklist_items_admin_gs_all" ON checklist_items
FOR ALL TO authenticated
USING (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'))
WITH CHECK (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'));

CREATE POLICY "checklist_items_ba_all" ON checklist_items
FOR ALL TO authenticated
USING (user_has_role(auth.uid(), 'ba_ce') OR user_has_role(auth.uid(), 'ba_lr') OR user_has_role(auth.uid(), 'ba_mc') OR user_has_role(auth.uid(), 'ba_2'))
WITH CHECK (user_has_role(auth.uid(), 'ba_ce') OR user_has_role(auth.uid(), 'ba_lr') OR user_has_role(auth.uid(), 'ba_mc') OR user_has_role(auth.uid(), 'ba_2'));

-- CHECKLIST_TIMELINE
CREATE POLICY "checklist_timeline_view_all" ON checklist_timeline
FOR SELECT TO authenticated
USING (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base') OR user_has_role(auth.uid(), 'ba_ce') OR user_has_role(auth.uid(), 'ba_lr'));

CREATE POLICY "checklist_timeline_admin_gs_manage" ON checklist_timeline
FOR ALL TO authenticated
USING (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'))
WITH CHECK (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'));

-- CHECKLISTS
CREATE POLICY "checklists_admin_gs_all" ON checklists
FOR ALL TO authenticated
USING (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'))
WITH CHECK (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'));

CREATE POLICY "checklists_ba_all" ON checklists
FOR ALL TO authenticated
USING (user_has_role(auth.uid(), 'ba_ce') OR user_has_role(auth.uid(), 'ba_lr') OR user_has_role(auth.uid(), 'ba_mc') OR user_has_role(auth.uid(), 'ba_2'))
WITH CHECK (user_has_role(auth.uid(), 'ba_ce') OR user_has_role(auth.uid(), 'ba_lr') OR user_has_role(auth.uid(), 'ba_mc') OR user_has_role(auth.uid(), 'ba_2'));

-- DOCUMENT_TEMPLATES
CREATE POLICY "document_templates_admin_all" ON document_templates
FOR ALL TO authenticated
USING (user_has_role(auth.uid(), 'admin'))
WITH CHECK (user_has_role(auth.uid(), 'admin'));

CREATE POLICY "document_templates_view_all" ON document_templates
FOR SELECT TO authenticated
USING (true);

-- EQUIPAMENTOS_ESTOQUE
CREATE POLICY "equipamentos_estoque_admin_gs_all" ON equipamentos_estoque
FOR ALL TO authenticated
USING (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'))
WITH CHECK (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'));

CREATE POLICY "equipamentos_estoque_ba_view" ON equipamentos_estoque
FOR SELECT TO authenticated
USING (user_has_role(auth.uid(), 'ba_ce') OR user_has_role(auth.uid(), 'ba_lr') OR user_has_role(auth.uid(), 'ba_mc') OR user_has_role(auth.uid(), 'ba_2'));

-- EXTINTORES_AEROPORTO
CREATE POLICY "extintores_aeroporto_admin_gs_all" ON extintores_aeroporto
FOR ALL TO authenticated
USING (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'))
WITH CHECK (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'));

CREATE POLICY "extintores_aeroporto_ba_view" ON extintores_aeroporto
FOR SELECT TO authenticated
USING (user_has_role(auth.uid(), 'ba_ce') OR user_has_role(auth.uid(), 'ba_lr') OR user_has_role(auth.uid(), 'ba_mc') OR user_has_role(auth.uid(), 'ba_2'));

-- FUNCIONARIOS
CREATE POLICY "funcionarios_admin_gs_all" ON funcionarios
FOR ALL TO authenticated
USING (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'))
WITH CHECK (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'gs_base'));

CREATE POLICY "funcionarios_ba_view" ON funcionarios
FOR SELECT TO authenticated
USING (user_has_role(auth.uid(), 'ba_ce') OR user_has_role(auth.uid(), 'ba_lr') OR user_has_role(auth.uid(), 'ba_mc') OR user_has_role(auth.uid(), 'ba_2'));