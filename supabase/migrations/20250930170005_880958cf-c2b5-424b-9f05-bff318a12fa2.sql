-- ============================================
-- CORREÇÃO DE SEGURANÇA: Habilitar RLS em tabelas faltantes
-- ============================================

-- Habilitar RLS nas tabelas que têm políticas mas estão desprotegidas
ALTER TABLE public.template_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_checklist ENABLE ROW LEVEL SECURITY;

-- Comentários de auditoria
COMMENT ON TABLE public.template_checklist IS 'Tabela de templates de checklist - RLS habilitado';
COMMENT ON TABLE public.tipos_checklist IS 'Tabela de tipos de checklist - RLS habilitado';