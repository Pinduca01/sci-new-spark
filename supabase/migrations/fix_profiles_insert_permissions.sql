-- Corrigir permissões da tabela profiles para permitir INSERT
-- Conceder permissões completas para usuários autenticados e anônimos

-- Conceder permissões básicas para o role anon (usuários não autenticados)
GRANT SELECT, INSERT ON profiles TO anon;

-- Conceder permissões completas para o role authenticated (usuários autenticados)
GRANT ALL PRIVILEGES ON profiles TO authenticated;

-- Remover políticas RLS existentes que podem estar bloqueando
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- Criar políticas RLS mais permissivas

-- Política para SELECT: permitir leitura para todos
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT
    USING (true);

-- Política para INSERT: permitir inserção para todos
CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT
    WITH CHECK (true);

-- Política para UPDATE: permitir atualização apenas do próprio perfil ou para usuários autenticados
CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE
    USING (
        auth.uid() = user_id OR 
        auth.role() = 'authenticated'
    )
    WITH CHECK (
        auth.uid() = user_id OR 
        auth.role() = 'authenticated'
    );

-- Política para DELETE: permitir exclusão apenas do próprio perfil ou para usuários autenticados
CREATE POLICY "profiles_delete_policy" ON profiles
    FOR DELETE
    USING (
        auth.uid() = user_id OR 
        auth.role() = 'authenticated'
    );

-- Verificar se RLS está habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Verificar permissões atuais
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'profiles'
    AND grantee IN ('anon', 'authenticated') 
ORDER BY grantee, privilege_type;