-- =====================================================
-- FASE 2: POLÍTICAS RLS PARA CONTROLE DE ACESSO
-- =====================================================

-- ========================================
-- TABELA: tp_higienizacoes
-- ========================================
ALTER TABLE public.tp_higienizacoes ENABLE ROW LEVEL SECURITY;

-- Admin vê tudo
CREATE POLICY "tp_higienizacoes_admin_all"
ON public.tp_higienizacoes
FOR ALL
TO authenticated
USING (user_has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

-- GS vê tudo da sua base
CREATE POLICY "tp_higienizacoes_gs_view"
ON public.tp_higienizacoes
FOR SELECT
TO authenticated
USING (
  user_has_role(auth.uid(), 'gs_base'::app_role)
);

-- BA-CE, BA-LR, BA-MC, BA-2 podem criar e ver
CREATE POLICY "tp_higienizacoes_ba_insert"
ON public.tp_higienizacoes
FOR INSERT
TO authenticated
WITH CHECK (
  user_has_role(auth.uid(), 'ba_ce'::app_role) OR
  user_has_role(auth.uid(), 'ba_lr'::app_role) OR
  user_has_role(auth.uid(), 'ba_mc'::app_role) OR
  user_has_role(auth.uid(), 'ba_2'::app_role)
);

CREATE POLICY "tp_higienizacoes_ba_view"
ON public.tp_higienizacoes
FOR SELECT
TO authenticated
USING (
  user_has_role(auth.uid(), 'ba_ce'::app_role) OR
  user_has_role(auth.uid(), 'ba_lr'::app_role) OR
  user_has_role(auth.uid(), 'ba_mc'::app_role) OR
  user_has_role(auth.uid(), 'ba_2'::app_role)
);

-- ========================================
-- TABELA: tp_verificacoes
-- ========================================
ALTER TABLE public.tp_verificacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tp_verificacoes_admin_all"
ON public.tp_verificacoes
FOR ALL
TO authenticated
USING (user_has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "tp_verificacoes_gs_view"
ON public.tp_verificacoes
FOR SELECT
TO authenticated
USING (user_has_role(auth.uid(), 'gs_base'::app_role));

CREATE POLICY "tp_verificacoes_ba_all"
ON public.tp_verificacoes
FOR ALL
TO authenticated
USING (
  user_has_role(auth.uid(), 'ba_ce'::app_role) OR
  user_has_role(auth.uid(), 'ba_lr'::app_role) OR
  user_has_role(auth.uid(), 'ba_mc'::app_role) OR
  user_has_role(auth.uid(), 'ba_2'::app_role)
)
WITH CHECK (
  user_has_role(auth.uid(), 'ba_ce'::app_role) OR
  user_has_role(auth.uid(), 'ba_lr'::app_role) OR
  user_has_role(auth.uid(), 'ba_mc'::app_role) OR
  user_has_role(auth.uid(), 'ba_2'::app_role)
);

-- ========================================
-- TABELA: tp_verificacoes_uniformes
-- ========================================
ALTER TABLE public.tp_verificacoes_uniformes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tp_verificacoes_uniformes_admin_all"
ON public.tp_verificacoes_uniformes
FOR ALL
TO authenticated
USING (user_has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "tp_verificacoes_uniformes_gs_view"
ON public.tp_verificacoes_uniformes
FOR SELECT
TO authenticated
USING (user_has_role(auth.uid(), 'gs_base'::app_role));

CREATE POLICY "tp_verificacoes_uniformes_ba_all"
ON public.tp_verificacoes_uniformes
FOR ALL
TO authenticated
USING (
  user_has_role(auth.uid(), 'ba_ce'::app_role) OR
  user_has_role(auth.uid(), 'ba_lr'::app_role) OR
  user_has_role(auth.uid(), 'ba_mc'::app_role) OR
  user_has_role(auth.uid(), 'ba_2'::app_role)
)
WITH CHECK (
  user_has_role(auth.uid(), 'ba_ce'::app_role) OR
  user_has_role(auth.uid(), 'ba_lr'::app_role) OR
  user_has_role(auth.uid(), 'ba_mc'::app_role) OR
  user_has_role(auth.uid(), 'ba_2'::app_role)
);

-- ========================================
-- TABELA: exercicios_epi
-- ========================================
ALTER TABLE public.exercicios_epi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exercicios_epi_admin_all"
ON public.exercicios_epi
FOR ALL
TO authenticated
USING (user_has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "exercicios_epi_gs_view"
ON public.exercicios_epi
FOR SELECT
TO authenticated
USING (user_has_role(auth.uid(), 'gs_base'::app_role));

CREATE POLICY "exercicios_epi_ba_all"
ON public.exercicios_epi
FOR ALL
TO authenticated
USING (
  user_has_role(auth.uid(), 'ba_ce'::app_role) OR
  user_has_role(auth.uid(), 'ba_lr'::app_role) OR
  user_has_role(auth.uid(), 'ba_mc'::app_role) OR
  user_has_role(auth.uid(), 'ba_2'::app_role)
)
WITH CHECK (
  user_has_role(auth.uid(), 'ba_ce'::app_role) OR
  user_has_role(auth.uid(), 'ba_lr'::app_role) OR
  user_has_role(auth.uid(), 'ba_mc'::app_role) OR
  user_has_role(auth.uid(), 'ba_2'::app_role)
);

-- ========================================
-- TABELA: ptr_instrucoes
-- ========================================
ALTER TABLE public.ptr_instrucoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ptr_instrucoes_admin_all"
ON public.ptr_instrucoes
FOR ALL
TO authenticated
USING (user_has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "ptr_instrucoes_gs_view"
ON public.ptr_instrucoes
FOR SELECT
TO authenticated
USING (user_has_role(auth.uid(), 'gs_base'::app_role));

CREATE POLICY "ptr_instrucoes_ba_all"
ON public.ptr_instrucoes
FOR ALL
TO authenticated
USING (
  user_has_role(auth.uid(), 'ba_ce'::app_role) OR
  user_has_role(auth.uid(), 'ba_lr'::app_role)
)
WITH CHECK (
  user_has_role(auth.uid(), 'ba_ce'::app_role) OR
  user_has_role(auth.uid(), 'ba_lr'::app_role)
);

-- ========================================
-- TABELA: ptr_participantes
-- ========================================
ALTER TABLE public.ptr_participantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ptr_participantes_admin_all"
ON public.ptr_participantes
FOR ALL
TO authenticated
USING (user_has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "ptr_participantes_view_all"
ON public.ptr_participantes
FOR SELECT
TO authenticated
USING (
  user_has_role(auth.uid(), 'gs_base'::app_role) OR
  user_has_role(auth.uid(), 'ba_ce'::app_role) OR
  user_has_role(auth.uid(), 'ba_lr'::app_role) OR
  user_has_role(auth.uid(), 'ba_mc'::app_role) OR
  user_has_role(auth.uid(), 'ba_2'::app_role)
);

CREATE POLICY "ptr_participantes_ba_insert_update"
ON public.ptr_participantes
FOR INSERT
TO authenticated
WITH CHECK (
  user_has_role(auth.uid(), 'ba_ce'::app_role) OR
  user_has_role(auth.uid(), 'ba_lr'::app_role)
);

CREATE POLICY "ptr_participantes_ba_update"
ON public.ptr_participantes
FOR UPDATE
TO authenticated
USING (
  user_has_role(auth.uid(), 'ba_ce'::app_role) OR
  user_has_role(auth.uid(), 'ba_lr'::app_role)
)
WITH CHECK (
  user_has_role(auth.uid(), 'ba_ce'::app_role) OR
  user_has_role(auth.uid(), 'ba_lr'::app_role)
);

-- ========================================
-- TABELA: ptr_fotos
-- ========================================
ALTER TABLE public.ptr_fotos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ptr_fotos_admin_all"
ON public.ptr_fotos
FOR ALL
TO authenticated
USING (user_has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "ptr_fotos_view_all"
ON public.ptr_fotos
FOR SELECT
TO authenticated
USING (
  user_has_role(auth.uid(), 'gs_base'::app_role) OR
  user_has_role(auth.uid(), 'ba_ce'::app_role) OR
  user_has_role(auth.uid(), 'ba_lr'::app_role) OR
  user_has_role(auth.uid(), 'ba_mc'::app_role) OR
  user_has_role(auth.uid(), 'ba_2'::app_role)
);

CREATE POLICY "ptr_fotos_ba_manage"
ON public.ptr_fotos
FOR ALL
TO authenticated
USING (
  user_has_role(auth.uid(), 'ba_ce'::app_role) OR
  user_has_role(auth.uid(), 'ba_lr'::app_role)
)
WITH CHECK (
  user_has_role(auth.uid(), 'ba_ce'::app_role) OR
  user_has_role(auth.uid(), 'ba_lr'::app_role)
);

-- ========================================
-- TABELA: escalas_geradas
-- ========================================
ALTER TABLE public.escalas_geradas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "escalas_geradas_admin_all"
ON public.escalas_geradas
FOR ALL
TO authenticated
USING (user_has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "escalas_geradas_gs_all"
ON public.escalas_geradas
FOR ALL
TO authenticated
USING (user_has_role(auth.uid(), 'gs_base'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'gs_base'::app_role));

CREATE POLICY "escalas_geradas_ba_view"
ON public.escalas_geradas
FOR SELECT
TO authenticated
USING (
  user_has_role(auth.uid(), 'ba_ce'::app_role) OR
  user_has_role(auth.uid(), 'ba_lr'::app_role) OR
  user_has_role(auth.uid(), 'ba_mc'::app_role) OR
  user_has_role(auth.uid(), 'ba_2'::app_role)
);

-- ========================================
-- TABELA: periodos_ferias
-- ========================================
ALTER TABLE public.periodos_ferias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "periodos_ferias_admin_all"
ON public.periodos_ferias
FOR ALL
TO authenticated
USING (user_has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "periodos_ferias_gs_all"
ON public.periodos_ferias
FOR ALL
TO authenticated
USING (user_has_role(auth.uid(), 'gs_base'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'gs_base'::app_role));

CREATE POLICY "periodos_ferias_ba_view"
ON public.periodos_ferias
FOR SELECT
TO authenticated
USING (
  user_has_role(auth.uid(), 'ba_ce'::app_role) OR
  user_has_role(auth.uid(), 'ba_lr'::app_role) OR
  user_has_role(auth.uid(), 'ba_mc'::app_role) OR
  user_has_role(auth.uid(), 'ba_2'::app_role)
);

-- ========================================
-- TABELA: feristas_escalas
-- ========================================
ALTER TABLE public.feristas_escalas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feristas_escalas_admin_all"
ON public.feristas_escalas
FOR ALL
TO authenticated
USING (user_has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "feristas_escalas_gs_all"
ON public.feristas_escalas
FOR ALL
TO authenticated
USING (user_has_role(auth.uid(), 'gs_base'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'gs_base'::app_role));

CREATE POLICY "feristas_escalas_ba_view"
ON public.feristas_escalas
FOR SELECT
TO authenticated
USING (
  user_has_role(auth.uid(), 'ba_ce'::app_role) OR
  user_has_role(auth.uid(), 'ba_lr'::app_role) OR
  user_has_role(auth.uid(), 'ba_mc'::app_role) OR
  user_has_role(auth.uid(), 'ba_2'::app_role)
);

-- ========================================
-- TABELA: epis_uniformes_distribuicao
-- ========================================
ALTER TABLE public.epis_uniformes_distribuicao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "epis_uniformes_distribuicao_admin_all"
ON public.epis_uniformes_distribuicao
FOR ALL
TO authenticated
USING (user_has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "epis_uniformes_distribuicao_gs_view"
ON public.epis_uniformes_distribuicao
FOR SELECT
TO authenticated
USING (user_has_role(auth.uid(), 'gs_base'::app_role));

CREATE POLICY "epis_uniformes_distribuicao_ba_all"
ON public.epis_uniformes_distribuicao
FOR ALL
TO authenticated
USING (
  user_has_role(auth.uid(), 'ba_ce'::app_role) OR
  user_has_role(auth.uid(), 'ba_lr'::app_role) OR
  user_has_role(auth.uid(), 'ba_mc'::app_role) OR
  user_has_role(auth.uid(), 'ba_2'::app_role)
)
WITH CHECK (
  user_has_role(auth.uid(), 'ba_ce'::app_role) OR
  user_has_role(auth.uid(), 'ba_lr'::app_role) OR
  user_has_role(auth.uid(), 'ba_mc'::app_role) OR
  user_has_role(auth.uid(), 'ba_2'::app_role)
);

-- ========================================
-- TABELA: ocorrencias
-- ========================================
ALTER TABLE public.ocorrencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ocorrencias_admin_all"
ON public.ocorrencias
FOR ALL
TO authenticated
USING (user_has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (user_has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "ocorrencias_gs_view"
ON public.ocorrencias
FOR SELECT
TO authenticated
USING (user_has_role(auth.uid(), 'gs_base'::app_role));

CREATE POLICY "ocorrencias_ba_all"
ON public.ocorrencias
FOR ALL
TO authenticated
USING (
  user_has_role(auth.uid(), 'ba_ce'::app_role) OR
  user_has_role(auth.uid(), 'ba_lr'::app_role) OR
  user_has_role(auth.uid(), 'ba_mc'::app_role) OR
  user_has_role(auth.uid(), 'ba_2'::app_role)
)
WITH CHECK (
  user_has_role(auth.uid(), 'ba_ce'::app_role) OR
  user_has_role(auth.uid(), 'ba_lr'::app_role) OR
  user_has_role(auth.uid(), 'ba_mc'::app_role) OR
  user_has_role(auth.uid(), 'ba_2'::app_role)
);