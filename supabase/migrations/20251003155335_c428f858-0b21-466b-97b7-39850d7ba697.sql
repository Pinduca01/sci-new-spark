-- =====================================================
-- FASE 1: LIMPEZA DE USER_IDS INVÁLIDOS (CORRIGIDO)
-- =====================================================

-- PASSO 1: Remover constraint NOT NULL de user_id para permitir limpeza
ALTER TABLE public.bombeiros 
ALTER COLUMN user_id DROP NOT NULL;

-- PASSO 2: Limpar user_ids inválidos (que não existem em auth.users)
UPDATE public.bombeiros
SET user_id = NULL
WHERE user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = bombeiros.user_id
  );

-- PASSO 3: Criar roles para BA-CE (user_ids válidos)
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT b.user_id, 'ba_ce'::app_role
FROM public.bombeiros b
LEFT JOIN public.user_roles ur ON ur.user_id = b.user_id
WHERE b.funcao = 'BA-CE'
  AND b.user_id IS NOT NULL
  AND ur.role IS NULL
  AND EXISTS (SELECT 1 FROM auth.users WHERE id = b.user_id)
ON CONFLICT (user_id, role) DO NOTHING;

-- PASSO 4: Criar roles para BA-LR (user_ids válidos)
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT b.user_id, 'ba_lr'::app_role
FROM public.bombeiros b
LEFT JOIN public.user_roles ur ON ur.user_id = b.user_id
WHERE b.funcao = 'BA-LR'
  AND b.user_id IS NOT NULL
  AND ur.role IS NULL
  AND EXISTS (SELECT 1 FROM auth.users WHERE id = b.user_id)
ON CONFLICT (user_id, role) DO NOTHING;

-- PASSO 5: Criar roles para BA-MC (user_ids válidos)
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT b.user_id, 'ba_mc'::app_role
FROM public.bombeiros b
LEFT JOIN public.user_roles ur ON ur.user_id = b.user_id
WHERE b.funcao = 'BA-MC'
  AND b.user_id IS NOT NULL
  AND ur.role IS NULL
  AND EXISTS (SELECT 1 FROM auth.users WHERE id = b.user_id)
ON CONFLICT (user_id, role) DO NOTHING;

-- PASSO 6: Criar roles para BA-2 (user_ids válidos)
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT b.user_id, 'ba_2'::app_role
FROM public.bombeiros b
LEFT JOIN public.user_roles ur ON ur.user_id = b.user_id
WHERE b.funcao = 'BA-2'
  AND b.user_id IS NOT NULL
  AND ur.role IS NULL
  AND EXISTS (SELECT 1 FROM auth.users WHERE id = b.user_id)
ON CONFLICT (user_id, role) DO NOTHING;

-- VERIFICAÇÃO FINAL: Mostrar resultados
SELECT 
  'User IDs limpos' as operacao,
  COUNT(*) as quantidade
FROM public.bombeiros 
WHERE user_id IS NULL

UNION ALL

SELECT 
  'Roles criados',
  COUNT(*)
FROM public.user_roles ur
INNER JOIN public.bombeiros b ON b.user_id = ur.user_id

UNION ALL

SELECT 
  'Bombeiros sem role (com user_id válido)',
  COUNT(*)
FROM public.bombeiros b
LEFT JOIN public.user_roles ur ON ur.user_id = b.user_id
WHERE b.user_id IS NOT NULL
  AND ur.role IS NULL
  AND EXISTS (SELECT 1 FROM auth.users WHERE id = b.user_id);