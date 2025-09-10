-- Verificar e corrigir políticas RLS da tabela profiles
-- Garantir que apenas usuários autenticados possam acessar seus próprios dados

-- 1. Remover todas as políticas existentes da tabela profiles
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own_only" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own_only" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own_only" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own_only" ON profiles;

-- 2. Garantir que RLS está habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Revogar todas as permissões existentes
REVOKE ALL ON profiles FROM anon;
REVOKE ALL ON profiles FROM authenticated;
REVOKE ALL ON profiles FROM public;

-- 4. Criar políticas restritivas - apenas usuários autenticados podem acessar seus próprios dados

-- Política de SELECT: usuários autenticados podem ver apenas seu próprio perfil
CREATE POLICY "profiles_select_own_only" ON profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Política de INSERT: usuários autenticados podem criar apenas seu próprio perfil
CREATE POLICY "profiles_insert_own_only" ON profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Política de UPDATE: usuários autenticados podem atualizar apenas seu próprio perfil
CREATE POLICY "profiles_update_own_only" ON profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política de DELETE: usuários autenticados podem deletar apenas seu próprio perfil
CREATE POLICY "profiles_delete_own_only" ON profiles
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 5. Conceder permissões mínimas necessárias apenas para authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;

-- 6. Verificar se as políticas foram criadas corretamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
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
    AND grantee IN ('anon', 'authenticated', 'public')
ORDER BY grantee, privilege_type;

-- 8. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';