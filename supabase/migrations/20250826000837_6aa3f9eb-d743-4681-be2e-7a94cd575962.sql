
-- 1. Criar ENUM para os tipos de usuário
CREATE TYPE public.user_role_type AS ENUM (
  'diretoria',
  'gerente_secao', 
  'chefe_equipe',
  'lider_resgate',
  'motorista_condutor',
  'bombeiro_aerodromo'
);

-- 2. Criar tabela de contextos organizacionais
CREATE TABLE public.contextos_organizacionais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'diretoria', 'secao', 'equipe', 'quadrante'
  parent_id UUID REFERENCES public.contextos_organizacionais(id),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Adicionar campos à tabela profiles para suportar roles e contextos
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role_type public.user_role_type DEFAULT 'bombeiro_aerodromo',
ADD COLUMN IF NOT EXISTS contexto_id UUID REFERENCES public.contextos_organizacionais(id),
ADD COLUMN IF NOT EXISTS nivel_hierarquico INTEGER DEFAULT 6; -- 1=Diretoria, 6=BA-2

-- 4. Criar função para verificar hierarquia
CREATE OR REPLACE FUNCTION public.get_user_hierarchy_level(user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(nivel_hierarquico, 6)
  FROM public.profiles 
  WHERE profiles.user_id = get_user_hierarchy_level.user_id;
$$;

-- 5. Criar função para verificar se usuário pode acessar dados de outro usuário
CREATE OR REPLACE FUNCTION public.can_access_user_data(accessor_id UUID, target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    CASE 
      -- Mesmo usuário sempre pode acessar seus dados
      WHEN accessor_id = target_user_id THEN true
      -- Verificar hierarquia - superior pode ver subordinados
      WHEN (SELECT nivel_hierarquico FROM profiles WHERE user_id = accessor_id) < 
           (SELECT nivel_hierarquico FROM profiles WHERE user_id = target_user_id) THEN true
      ELSE false
    END;
$$;

-- 6. Atualizar função get_current_user_role para usar novo sistema
DROP FUNCTION IF EXISTS public.get_current_user_role();
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role_type::TEXT FROM public.profiles WHERE user_id = auth.uid();
$$;

-- 7. Criar função para obter contexto do usuário
CREATE OR REPLACE FUNCTION public.get_user_context()
RETURNS UUID
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT contexto_id FROM public.profiles WHERE user_id = auth.uid();
$$;

-- 8. Inserir contextos organizacionais básicos
INSERT INTO public.contextos_organizacionais (nome, tipo, parent_id) VALUES
('Diretoria Geral', 'diretoria', NULL),
('Seção de Operações', 'secao', (SELECT id FROM contextos_organizacionais WHERE nome = 'Diretoria Geral')),
('Seção de Manutenção', 'secao', (SELECT id FROM contextos_organizacionais WHERE nome = 'Diretoria Geral')),
('Equipe Alpha', 'equipe', (SELECT id FROM contextos_organizacionais WHERE nome = 'Seção de Operações')),
('Equipe Bravo', 'equipe', (SELECT id FROM contextos_organizacionais WHERE nome = 'Seção de Operações')),
('Quadrante Norte', 'quadrante', (SELECT id FROM contextos_organizacionais WHERE nome = 'Equipe Alpha')),
('Quadrante Sul', 'quadrante', (SELECT id FROM contextos_organizacionais WHERE nome = 'Equipe Bravo'));

-- 9. Atualizar níveis hierárquicos baseado no role_type
UPDATE public.profiles SET 
  nivel_hierarquico = CASE 
    WHEN role_type = 'diretoria' THEN 1
    WHEN role_type = 'gerente_secao' THEN 2
    WHEN role_type = 'chefe_equipe' THEN 3
    WHEN role_type = 'lider_resgate' THEN 4
    WHEN role_type = 'motorista_condutor' THEN 5
    WHEN role_type = 'bombeiro_aerodromo' THEN 6
    ELSE 6
  END;

-- 10. Enable RLS nas novas tabelas
ALTER TABLE public.contextos_organizacionais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view organizational contexts" ON public.contextos_organizacionais
  FOR SELECT 
  USING (true); -- Todos podem ver a estrutura organizacional

CREATE POLICY "Only directors can manage contexts" ON public.contextos_organizacionais
  FOR ALL
  USING (get_current_user_role() = 'diretoria')
  WITH CHECK (get_current_user_role() = 'diretoria');

-- 11. Criar trigger para atualizar updated_at
CREATE TRIGGER update_contextos_organizacionais_updated_at
  BEFORE UPDATE ON public.contextos_organizacionais
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at  
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
