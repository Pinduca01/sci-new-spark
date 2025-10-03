-- Criar tabela de timeline para rastrear ações em checklists
CREATE TABLE IF NOT EXISTS public.checklist_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL,
  checklist_tipo TEXT NOT NULL CHECK (checklist_tipo IN ('viatura', 'almoxarifado')),
  operacao TEXT NOT NULL CHECK (operacao IN ('criacao', 'edicao', 'conclusao', 'exclusao', 'exportacao_pdf')),
  usuario_id UUID,
  usuario_nome TEXT NOT NULL,
  usuario_role TEXT,
  descricao TEXT,
  dados_alterados JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_checklist_timeline_checklist ON public.checklist_timeline(checklist_id, checklist_tipo);
CREATE INDEX IF NOT EXISTS idx_checklist_timeline_created ON public.checklist_timeline(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_checklist_timeline_usuario ON public.checklist_timeline(usuario_id);

-- Habilitar RLS
ALTER TABLE public.checklist_timeline ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Admin e GS podem ver tudo
CREATE POLICY "Admin users can view all timeline"
  ON public.checklist_timeline
  FOR SELECT
  USING (get_current_user_role() IN ('admin', 'supervisor'));

-- Admin pode inserir
CREATE POLICY "Admin users can insert timeline"
  ON public.checklist_timeline
  FOR INSERT
  WITH CHECK (get_current_user_role() = 'admin');

-- Authenticated users podem inserir suas próprias ações
CREATE POLICY "Authenticated users can insert their timeline"
  ON public.checklist_timeline
  FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

-- Função para registrar timeline automaticamente
CREATE OR REPLACE FUNCTION public.registrar_timeline_checklist(
  p_checklist_id UUID,
  p_checklist_tipo TEXT,
  p_operacao TEXT,
  p_descricao TEXT DEFAULT NULL,
  p_dados_alterados JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_usuario_id UUID;
  v_usuario_nome TEXT;
  v_usuario_role TEXT;
  v_timeline_id UUID;
BEGIN
  -- Buscar informações do usuário atual
  v_usuario_id := auth.uid();
  
  IF v_usuario_id IS NOT NULL THEN
    SELECT full_name, role INTO v_usuario_nome, v_usuario_role
    FROM public.profiles
    WHERE user_id = v_usuario_id;
  ELSE
    v_usuario_nome := 'Sistema';
    v_usuario_role := 'system';
  END IF;
  
  -- Inserir no timeline
  INSERT INTO public.checklist_timeline (
    checklist_id,
    checklist_tipo,
    operacao,
    usuario_id,
    usuario_nome,
    usuario_role,
    descricao,
    dados_alterados
  ) VALUES (
    p_checklist_id,
    p_checklist_tipo,
    p_operacao,
    v_usuario_id,
    v_usuario_nome,
    v_usuario_role,
    p_descricao,
    p_dados_alterados
  ) RETURNING id INTO v_timeline_id;
  
  RETURN v_timeline_id;
END;
$$;

-- Comentários
COMMENT ON TABLE public.checklist_timeline IS 'Timeline de ações realizadas em checklists';
COMMENT ON FUNCTION public.registrar_timeline_checklist IS 'Registra uma ação no timeline do checklist';