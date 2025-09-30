-- ============================================
-- FASE 1: ESTRUTURA DE PERMISSÕES HIERÁRQUICA
-- ============================================

-- 1.1 Adicionar coluna access_level na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS access_level TEXT DEFAULT 'blocked';

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.profiles.access_level IS 
'Níveis de acesso: admin (acesso total), gs_base (GS vê toda base), ba_ce_equipe (BA-CE vê apenas equipe), checklist_only (BA-MC/BA-2 só checklist), blocked (sem acesso)';

-- 1.2 Atualizar access_level baseado nas funções dos bombeiros existentes
UPDATE public.profiles 
SET access_level = CASE 
  WHEN role = 'admin' THEN 'admin'
  WHEN EXISTS(
    SELECT 1 FROM public.bombeiros 
    WHERE bombeiros.user_id = profiles.user_id 
    AND bombeiros.funcao = 'GS'
  ) THEN 'gs_base'
  WHEN EXISTS(
    SELECT 1 FROM public.bombeiros 
    WHERE bombeiros.user_id = profiles.user_id 
    AND bombeiros.funcao = 'BA-CE'
  ) THEN 'ba_ce_equipe'
  WHEN EXISTS(
    SELECT 1 FROM public.bombeiros 
    WHERE bombeiros.user_id = profiles.user_id 
    AND bombeiros.funcao IN ('BA-MC', 'BA-2')
  ) THEN 'checklist_only'
  ELSE 'blocked'
END;

-- 1.3 Criar funções de segurança por contexto (security definer para evitar recursão RLS)

-- Função para obter o access_level do usuário atual
CREATE OR REPLACE FUNCTION public.get_user_access_level()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT access_level 
  FROM public.profiles 
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- Função para verificar se pode acessar SCI-Core (GS, BA-CE, Admin)
CREATE OR REPLACE FUNCTION public.can_access_sci_core()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND access_level IN ('admin', 'gs_base', 'ba_ce_equipe')
  );
$$;

-- Função para verificar se pode acessar Checklist (BA-MC, BA-2, Admin)
CREATE OR REPLACE FUNCTION public.can_access_checklist()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND access_level IN ('admin', 'checklist_only')
  );
$$;

-- Função para verificar se pode ver dados de uma base específica
CREATE OR REPLACE FUNCTION public.can_view_base_data(target_base_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND (
      p.access_level = 'admin' -- Admin vê tudo
      OR (p.access_level IN ('gs_base', 'ba_ce_equipe') AND p.base_id = target_base_id) -- GS e BA-CE veem sua base
    )
  );
$$;

-- Função para verificar se pode ver dados de uma equipe específica
CREATE OR REPLACE FUNCTION public.can_view_equipe_data(target_equipe TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND (
      p.access_level = 'admin' -- Admin vê tudo
      OR p.access_level = 'gs_base' -- GS vê todas equipes da base
      OR (p.access_level = 'ba_ce_equipe' AND p.equipe = target_equipe) -- BA-CE vê só sua equipe
    )
  );
$$;

-- 1.4 Criar trigger para manter access_level sincronizado quando bombeiro muda de função
CREATE OR REPLACE FUNCTION public.sync_access_level_on_bombeiro_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atualizar access_level quando função do bombeiro muda
  UPDATE public.profiles
  SET access_level = CASE
    WHEN role = 'admin' THEN 'admin'
    WHEN NEW.funcao = 'GS' THEN 'gs_base'
    WHEN NEW.funcao = 'BA-CE' THEN 'ba_ce_equipe'
    WHEN NEW.funcao IN ('BA-MC', 'BA-2') THEN 'checklist_only'
    ELSE access_level -- Mantém o nível atual se não for nenhuma função especial
  END
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_sync_access_level ON public.bombeiros;
CREATE TRIGGER trigger_sync_access_level
  AFTER INSERT OR UPDATE OF funcao ON public.bombeiros
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_access_level_on_bombeiro_update();

-- 1.5 Comentários de documentação
COMMENT ON FUNCTION public.get_user_access_level() IS 'Retorna o nível de acesso hierárquico do usuário atual';
COMMENT ON FUNCTION public.can_access_sci_core() IS 'Verifica se usuário pode acessar o SCI-Core (GS, BA-CE, Admin)';
COMMENT ON FUNCTION public.can_access_checklist() IS 'Verifica se usuário pode acessar o Checklist (BA-MC, BA-2, Admin)';
COMMENT ON FUNCTION public.can_view_base_data(UUID) IS 'Verifica se usuário pode ver dados de uma base específica';
COMMENT ON FUNCTION public.can_view_equipe_data(TEXT) IS 'Verifica se usuário pode ver dados de uma equipe específica';