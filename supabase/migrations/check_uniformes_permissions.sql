-- Verificar permissões atuais da tabela uniformes
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'uniformes' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Conceder permissões necessárias para a tabela uniformes
-- Permissão de leitura para anon (usuários não autenticados)
GRANT SELECT ON uniformes TO anon;

-- Permissões completas para authenticated (usuários autenticados)
GRANT ALL PRIVILEGES ON uniformes TO authenticated;

-- Verificar novamente as permissões após concessão
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'uniformes' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;