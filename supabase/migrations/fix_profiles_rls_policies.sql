-- Corrigir políticas RLS da tabela profiles

-- 1. Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;

-- 2. Garantir que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS corretas

-- Política para permitir que usuários vejam seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários atualizem seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para permitir que usuários criem seu próprio perfil
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Garantir permissões básicas para roles anon e authenticated
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- 5. Verificar se há perfis órfãos (sem user_id válido)
SELECT 
    p.id,
    p.user_id,
    p.email,
    CASE 
        WHEN au.id IS NULL THEN 'ÓRFÃO - usuário não existe'
        ELSE 'OK'
    END as status
FROM public.profiles p
LEFT JOIN auth.users au ON p.user_id = au.id
ORDER BY p.created_at DESC;

-- 6. Verificar políticas criadas
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 7. Verificar permissões da tabela
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'profiles'
    AND grantee IN ('anon', 'authenticated') 
ORDER BY grantee, privilege_type;