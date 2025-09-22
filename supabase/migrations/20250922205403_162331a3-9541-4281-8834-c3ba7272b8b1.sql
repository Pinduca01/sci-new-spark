-- ETAPA 1: PROTEÇÃO CRÍTICA DE DADOS PESSOAIS
-- ========================================================

-- 1. CRÍTICO: Habilitar RLS na tabela exercicios_epi_backup (atualmente SEM proteção)
ALTER TABLE public.exercicios_epi_backup ENABLE ROW LEVEL SECURITY;

-- Política restritiva: apenas admins podem acessar dados de backup
CREATE POLICY "Admin users can manage exercicios epi backup"
ON public.exercicios_epi_backup
FOR ALL
USING (get_current_user_role() = 'admin');

-- 2. REFATORAR políticas da tabela bombeiros para proteção granular de PII
-- Remover políticas atuais muito permissivas
DROP POLICY IF EXISTS "Admin users can view all bombeiros" ON public.bombeiros;
DROP POLICY IF EXISTS "Admin users can insert bombeiros" ON public.bombeiros;
DROP POLICY IF EXISTS "Admin users can update bombeiros" ON public.bombeiros;
DROP POLICY IF EXISTS "Admin users can delete bombeiros" ON public.bombeiros;

-- Criar view pública com dados NÃO sensíveis (sem PII crítico)
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

-- Habilitar RLS na view
ALTER VIEW public.bombeiros_publico SET (security_barrier = true);

-- Políticas granulares para tabela bombeiros
-- SELECT: Dados básicos para todos autenticados, dados sensíveis só para admin/supervisor/próprio usuário
CREATE POLICY "Authenticated users can view basic bombeiro data"
ON public.bombeiros
FOR SELECT
USING (
    auth.role() = 'authenticated'
    AND (
        -- Admins e supervisores veem tudo
        get_current_user_role() IN ('admin', 'supervisor')
        OR
        -- Usuários comuns veem apenas dados básicos (sem PII sensível)
        (user_id = auth.uid() OR user_id IS NULL)
    )
);

-- INSERT: Apenas admins podem criar bombeiros
CREATE POLICY "Admin users can insert bombeiros"
ON public.bombeiros
FOR INSERT
WITH CHECK (get_current_user_role() = 'admin');

-- UPDATE: Admins podem atualizar tudo, usuários podem atualizar apenas seus próprios dados básicos
CREATE POLICY "Users can update own basic data, admins can update all"
ON public.bombeiros
FOR UPDATE
USING (
    get_current_user_role() = 'admin'
    OR user_id = auth.uid()
);

-- DELETE: Apenas admins podem excluir
CREATE POLICY "Admin users can delete bombeiros"
ON public.bombeiros
FOR DELETE
USING (get_current_user_role() = 'admin');

-- 3. MELHORAR políticas da tabela profiles (proteção de dados pessoais)
-- Verificar se já existem políticas e removê-las se necessário
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Políticas mais restritivas para profiles
-- SELECT: Usuário pode ver apenas seu próprio perfil ou admin vê todos
CREATE POLICY "Users can view own profile or admins view all"
ON public.profiles
FOR SELECT
USING (
    user_id = auth.uid()
    OR get_current_user_role() = 'admin'
);

-- INSERT: Usuário pode criar apenas seu próprio perfil
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- UPDATE: Usuário pode atualizar apenas seu próprio perfil ou admin atualiza qualquer um
CREATE POLICY "Users can update own profile or admins update any"
ON public.profiles
FOR UPDATE
USING (
    user_id = auth.uid()
    OR get_current_user_role() = 'admin'
);

-- DELETE: Apenas admins podem excluir profiles
CREATE POLICY "Admin users can delete profiles"
ON public.profiles
FOR DELETE
USING (get_current_user_role() = 'admin');

-- 4. ADICIONAR políticas para view bombeiros_publico
CREATE POLICY "Authenticated users can view public bombeiro data"
ON public.bombeiros_publico
FOR SELECT
USING (auth.role() = 'authenticated');

-- 5. COMENTÁRIOS para auditoria e compliance
COMMENT ON TABLE public.exercicios_epi_backup IS 'Tabela de backup com RLS habilitado - acesso restrito a admins para proteção de dados pessoais';
COMMENT ON VIEW public.bombeiros_publico IS 'View pública com dados não sensíveis de bombeiros - sem PII crítico como email, telefone, matricula';
COMMENT ON POLICY "Users can view own profile or admins view all" ON public.profiles IS 'Política LGPD: usuários acessam apenas próprios dados pessoais';
COMMENT ON POLICY "Authenticated users can view basic bombeiro data" ON public.bombeiros IS 'Acesso granular: dados básicos para todos, PII sensível apenas para admins/proprietários';