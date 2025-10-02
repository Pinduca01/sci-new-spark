-- ============================================
-- IMPLEMENTAÇÃO: Sistema de Verificação de Usuário Ativo
-- ============================================

-- 1. Adicionar coluna ativo na tabela bombeiros
ALTER TABLE public.bombeiros 
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- 2. Sincronizar dados existentes: marcar como ativo onde status = 'ativo'
UPDATE public.bombeiros 
SET ativo = (status = 'ativo');

-- 3. Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_bombeiros_ativo ON public.bombeiros(ativo);
CREATE INDEX IF NOT EXISTS idx_bombeiros_user_id_ativo ON public.bombeiros(user_id, ativo);

-- 4. Criar função para verificar se usuário está ativo
CREATE OR REPLACE FUNCTION public.is_user_active(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_active BOOLEAN;
BEGIN
  -- Verificar se o bombeiro associado ao user_id está ativo
  SELECT b.ativo INTO user_active
  FROM public.bombeiros b
  WHERE b.user_id = user_uuid
  LIMIT 1;
  
  -- Se não encontrar bombeiro, verificar se é admin na tabela profiles
  IF user_active IS NULL THEN
    SELECT (p.role = 'admin') INTO user_active
    FROM public.profiles p
    WHERE p.user_id = user_uuid
    LIMIT 1;
  END IF;
  
  -- Retornar true se ativo, false caso contrário
  RETURN COALESCE(user_active, false);
END;
$$;

-- 5. Adicionar coluna ativo na tabela profiles (para controle adicional)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- 6. Criar índice para profiles.ativo
CREATE INDEX IF NOT EXISTS idx_profiles_ativo ON public.profiles(ativo);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_ativo ON public.profiles(user_id, ativo);

-- 7. Atualizar função de verificação para considerar profiles também
CREATE OR REPLACE FUNCTION public.is_user_active(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_active BOOLEAN;
  bombeiro_active BOOLEAN;
BEGIN
  -- Verificar se o perfil está ativo
  SELECT p.ativo INTO profile_active
  FROM public.profiles p
  WHERE p.user_id = user_uuid
  LIMIT 1;
  
  -- Se perfil inativo, retornar false imediatamente
  IF profile_active = false THEN
    RETURN false;
  END IF;
  
  -- Verificar se o bombeiro está ativo
  SELECT b.ativo INTO bombeiro_active
  FROM public.bombeiros b
  WHERE b.user_id = user_uuid
  LIMIT 1;
  
  -- Se for admin (não tem bombeiro), apenas verificar profile
  IF bombeiro_active IS NULL THEN
    RETURN COALESCE(profile_active, false);
  END IF;
  
  -- Retornar true apenas se ambos estiverem ativos
  RETURN COALESCE(profile_active, true) AND COALESCE(bombeiro_active, true);
END;
$$;

-- 8. Criar trigger para sincronizar ativo entre bombeiros e profiles
CREATE OR REPLACE FUNCTION public.sync_bombeiro_ativo_to_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Quando bombeiro é desativado, desativar profile também
  IF NEW.ativo = false AND OLD.ativo = true THEN
    UPDATE public.profiles
    SET ativo = false
    WHERE user_id = NEW.user_id;
  END IF;
  
  -- Quando bombeiro é ativado, ativar profile também (se estava inativo)
  IF NEW.ativo = true AND OLD.ativo = false THEN
    UPDATE public.profiles
    SET ativo = true
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_sync_bombeiro_ativo ON public.bombeiros;
CREATE TRIGGER trigger_sync_bombeiro_ativo
  AFTER UPDATE OF ativo ON public.bombeiros
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_bombeiro_ativo_to_profile();

-- 9. Comentários
COMMENT ON COLUMN public.bombeiros.ativo IS 'Indica se o bombeiro pode fazer login no sistema';
COMMENT ON COLUMN public.profiles.ativo IS 'Indica se o usuário pode fazer login no sistema';
COMMENT ON FUNCTION public.is_user_active(UUID) IS 'Verifica se um usuário está ativo e pode acessar o sistema';