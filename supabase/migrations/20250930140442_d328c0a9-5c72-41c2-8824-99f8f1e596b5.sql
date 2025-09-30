-- MIGRAÇÃO: Controle de Acesso por Sistema
-- Adiciona campo para controlar qual sistema o usuário pode acessar

-- 1. Adicionar coluna system_access na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS system_access TEXT DEFAULT 'full'
CHECK (system_access IN ('full', 'checklist_only', 'blocked'));

-- 2. Comentário explicativo
COMMENT ON COLUMN public.profiles.system_access IS 
'Controla o acesso aos sistemas: 
- full: Acesso completo ao sistema principal e checklist
- checklist_only: Acesso apenas ao app de checklist
- blocked: Usuário bloqueado';

-- 3. Criar função helper para verificar acesso ao sistema principal
CREATE OR REPLACE FUNCTION public.can_access_main_system()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    user_access TEXT;
BEGIN
    -- Buscar o tipo de acesso do usuário
    SELECT system_access INTO user_access
    FROM public.profiles
    WHERE user_id = auth.uid();
    
    -- Retornar true se o usuário tem acesso completo
    RETURN user_access = 'full';
END;
$$;

-- 4. Criar função helper para verificar acesso ao checklist
CREATE OR REPLACE FUNCTION public.can_access_checklist()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    user_access TEXT;
BEGIN
    -- Buscar o tipo de acesso do usuário
    SELECT system_access INTO user_access
    FROM public.profiles
    WHERE user_id = auth.uid();
    
    -- Retornar true se o usuário tem acesso ao checklist ou acesso completo
    RETURN user_access IN ('full', 'checklist_only');
END;
$$;

-- 5. Criar view para administradores gerenciarem acessos
CREATE OR REPLACE VIEW public.user_access_management AS
SELECT 
    p.user_id,
    p.email,
    p.full_name,
    p.role,
    p.cargo,
    p.equipe,
    p.system_access,
    b.nome as bombeiro_nome,
    b.funcao_completa as bombeiro_funcao,
    p.created_at,
    p.updated_at
FROM public.profiles p
LEFT JOIN public.bombeiros b ON b.user_id = p.user_id
ORDER BY p.created_at DESC;

-- 6. Comentário na view
COMMENT ON VIEW public.user_access_management IS 
'View para administradores visualizarem e gerenciarem os acessos dos usuários aos sistemas';

-- 7. Atualizar usuários existentes: definir acesso baseado no cargo/função
-- Admins e supervisores mantêm acesso completo
UPDATE public.profiles 
SET system_access = 'full'
WHERE role IN ('admin', 'supervisor') OR cargo IN ('gerente', 'coordenador');

-- Bombeiros operacionais que não são admins/supervisores: acesso apenas checklist
UPDATE public.profiles p
SET system_access = 'checklist_only'
FROM public.bombeiros b
WHERE p.user_id = b.user_id 
  AND p.role NOT IN ('admin', 'supervisor')
  AND p.cargo NOT IN ('gerente', 'coordenador')
  AND b.funcao_completa IN ('Bombeiro', 'Bombeiro Civil', 'Bombeiro Operacional');

-- 8. Criar política RLS para a view (somente admins podem ver)
ALTER VIEW public.user_access_management SET (security_invoker = on);

CREATE POLICY "Admins podem gerenciar acessos de usuários"
ON public.profiles
FOR SELECT
USING (
    get_current_user_role() = 'admin' 
    OR auth.uid() = user_id
);

-- 9. Log de auditoria
COMMENT ON FUNCTION public.can_access_main_system() IS 
'Verifica se o usuário autenticado tem permissão para acessar o sistema principal';

COMMENT ON FUNCTION public.can_access_checklist() IS 
'Verifica se o usuário autenticado tem permissão para acessar o app de checklist';