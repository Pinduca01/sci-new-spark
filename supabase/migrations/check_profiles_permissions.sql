-- Verificar permissões atuais da tabela profiles
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Verificar políticas RLS da tabela profiles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'profiles';

-- Conceder permissões básicas se necessário
GRANT SELECT ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Criar política RLS para permitir que usuários vejam seus próprios perfis
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Criar política RLS para permitir que usuários atualizem seus próprios perfis
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Criar política RLS para permitir inserção de novos perfis
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);