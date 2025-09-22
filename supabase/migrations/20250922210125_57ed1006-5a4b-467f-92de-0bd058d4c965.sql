-- ETAPA 1: PROTEÇÃO CRÍTICA DE DADOS PESSOAIS (VERSÃO FINAL)
-- ========================================================

-- 1. CRÍTICO: Habilitar RLS na tabela exercicios_epi_backup
ALTER TABLE public.exercicios_epi_backup ENABLE ROW LEVEL SECURITY;

-- Remover política existente se houver
DROP POLICY IF EXISTS "Admin users can manage exercicios epi backup" ON public.exercicios_epi_backup;

CREATE POLICY "Admin users can manage exercicios epi backup"
ON public.exercicios_epi_backup
FOR ALL
USING (get_current_user_role() = 'admin');

-- 2. REFATORAR políticas da tabela bombeiros
DROP POLICY IF EXISTS "Admin users can view all bombeiros" ON public.bombeiros;
DROP POLICY IF EXISTS "Admin users can insert bombeiros" ON public.bombeiros;
DROP POLICY IF EXISTS "Admin users can update bombeiros" ON public.bombeiros;
DROP POLICY IF EXISTS "Admin users can delete bombeiros" ON public.bombeiros;
DROP POLICY IF EXISTS "Authenticated users can view basic bombeiro data" ON public.bombeiros;
DROP POLICY IF EXISTS "Users can update own basic data, admins can update all" ON public.bombeiros;

-- Criar view pública com dados NÃO sensíveis
CREATE OR REPLACE VIEW public.bombeiros_publico AS
SELECT 
    id,
    nome,
    funcao,
    funcao_completa,
    equipe,
    turno,
    status,
    data_admissao,
    avatar,
    created_at,
    updated_at
FROM public.bombeiros
WHERE status = 'ativo';

-- Novas políticas granulares para bombeiros
CREATE POLICY "Authenticated users can view basic bombeiro data"
ON public.bombeiros
FOR SELECT
USING (
    auth.role() = 'authenticated'
    AND (
        get_current_user_role() IN ('admin', 'supervisor')
        OR user_id = auth.uid()
        OR user_id IS NULL
    )
);

CREATE POLICY "Admin users can insert bombeiros"
ON public.bombeiros
FOR INSERT
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Users can update own basic data, admins can update all"
ON public.bombeiros
FOR UPDATE
USING (
    get_current_user_role() = 'admin'
    OR user_id = auth.uid()
);

CREATE POLICY "Admin users can delete bombeiros"
ON public.bombeiros
FOR DELETE
USING (get_current_user_role() = 'admin');

-- 3. MELHORAR políticas da tabela profiles
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON public.profiles;
DROP POLICY IF EXISTS "Permitir inserção para usuários autenticados" ON public.profiles;
DROP POLICY IF EXISTS "Permitir atualização para criador" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile or admins update any" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can delete profiles" ON public.profiles;

-- Novas políticas restritivas para profiles
CREATE POLICY "Users can view own profile or admins view all"
ON public.profiles
FOR SELECT
USING (
    user_id = auth.uid()
    OR get_current_user_role() = 'admin'
);

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile or admins update any"
ON public.profiles
FOR UPDATE
USING (
    user_id = auth.uid()
    OR get_current_user_role() = 'admin'
);

CREATE POLICY "Admin users can delete profiles"
ON public.profiles
FOR DELETE
USING (get_current_user_role() = 'admin');

-- Comentários para compliance
COMMENT ON TABLE public.exercicios_epi_backup IS 'Backup protegido - acesso restrito admins para compliance LGPD';
COMMENT ON VIEW public.bombeiros_publico IS 'View pública sem PII sensível (remove email, telefone, matricula)';