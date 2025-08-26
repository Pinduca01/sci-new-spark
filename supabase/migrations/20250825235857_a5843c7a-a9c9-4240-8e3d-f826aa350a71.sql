
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

-- 10. Recriar RLS policies para bombeiros com hierarquia
DROP POLICY IF EXISTS "Admin users can view all bombeiros" ON public.bombeiros;
DROP POLICY IF EXISTS "Admin users can insert bombeiros" ON public.bombeiros;
DROP POLICY IF EXISTS "Admin users can update bombeiros" ON public.bombeiros;
DROP POLICY IF EXISTS "Admin users can delete bombeiros" ON public.bombeiros;

CREATE POLICY "Hierarchical access to bombeiros" ON public.bombeiros
  FOR SELECT 
  USING (
    -- Diretoria vê todos
    get_current_user_role() = 'diretoria' OR
    -- GS vê sua seção
    (get_current_user_role() = 'gerente_secao' AND equipe_id IN (
      SELECT id FROM equipes WHERE nome_equipe IN (
        SELECT nome FROM contextos_organizacionais 
        WHERE parent_id = get_user_context()
      )
    )) OR
    -- Outros veem apenas sua equipe/contexto
    (equipe_id IN (
      SELECT id FROM equipes WHERE nome_equipe = (
        SELECT nome FROM contextos_organizacionais WHERE id = get_user_context()
      )
    ))
  );

CREATE POLICY "Hierarchical insert bombeiros" ON public.bombeiros
  FOR INSERT 
  WITH CHECK (
    get_current_user_role() IN ('diretoria', 'gerente_secao', 'chefe_equipe')
  );

CREATE POLICY "Hierarchical update bombeiros" ON public.bombeiros
  FOR UPDATE 
  USING (
    get_current_user_role() IN ('diretoria', 'gerente_secao', 'chefe_equipe')
  );

CREATE POLICY "Hierarchical delete bombeiros" ON public.bombeiros
  FOR DELETE 
  USING (
    get_current_user_role() IN ('diretoria', 'gerente_secao')
  );

-- 11. Aplicar RLS hierárquico para viaturas
DROP POLICY IF EXISTS "Admin users can view all viaturas" ON public.viaturas;
DROP POLICY IF EXISTS "Admin users can insert viaturas" ON public.viaturas;
DROP POLICY IF EXISTS "Admin users can update viaturas" ON public.viaturas;
DROP POLICY IF EXISTS "Admin users can delete viaturas" ON public.viaturas;

CREATE POLICY "Hierarchical access to viaturas" ON public.viaturas
  FOR SELECT 
  USING (
    get_current_user_role() IN ('diretoria', 'gerente_secao') OR
    (get_current_user_role() IN ('motorista_condutor', 'chefe_equipe', 'lider_resgate'))
  );

CREATE POLICY "Hierarchical manage viaturas" ON public.viaturas
  FOR ALL
  USING (
    get_current_user_role() IN ('diretoria', 'gerente_secao', 'motorista_condutor')
  )
  WITH CHECK (
    get_current_user_role() IN ('diretoria', 'gerente_secao', 'motorista_condutor')
  );

-- 12. Aplicar RLS hierárquico para ocorrencias
DROP POLICY IF EXISTS "Admin users can view all ocorrencias" ON public.ocorrencias;
DROP POLICY IF EXISTS "Admin users can insert ocorrencias" ON public.ocorrencias;
DROP POLICY IF EXISTS "Admin users can update ocorrencias" ON public.ocorrencias;
DROP POLICY IF EXISTS "Admin users can delete ocorrencias" ON public.ocorrencias;

CREATE POLICY "Hierarchical access to ocorrencias" ON public.ocorrencias
  FOR SELECT 
  USING (
    get_current_user_role() IN ('diretoria', 'gerente_secao') OR
    (get_current_user_role() IN ('chefe_equipe', 'lider_resgate') AND 
     equipe IN (SELECT nome FROM contextos_organizacionais WHERE id = get_user_context()))
  );

CREATE POLICY "Hierarchical manage ocorrencias" ON public.ocorrencias
  FOR ALL
  USING (
    get_current_user_role() IN ('diretoria', 'gerente_secao', 'chefe_equipe', 'lider_resgate')
  )
  WITH CHECK (
    get_current_user_role() IN ('diretoria', 'gerente_secao', 'chefe_equipe', 'lider_resgate')
  );

-- 13. Enable RLS nas novas tabelas
ALTER TABLE public.contextos_organizacionais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view organizational contexts" ON public.contextos_organizacionais
  FOR SELECT 
  USING (true); -- Todos podem ver a estrutura organizacional

CREATE POLICY "Only directors can manage contexts" ON public.contextos_organizacionais
  FOR ALL
  USING (get_current_user_role() = 'diretoria')
  WITH CHECK (get_current_user_role() = 'diretoria');

-- 14. Criar trigger para atualizar updated_at
CREATE TRIGGER update_contextos_organizacionais_updated_at
  BEFORE UPDATE ON public.contextos_organizacionais
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at  
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
