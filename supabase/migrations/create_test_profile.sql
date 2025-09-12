-- Verificar usuários existentes na tabela auth.users
SELECT id, email, created_at FROM auth.users LIMIT 5;

-- Inserir um perfil de teste se não existir
INSERT INTO profiles (user_id, email, full_name, role)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', 'Usuário Teste'),
    'admin'
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM profiles)
LIMIT 1;

-- Verificar se o perfil foi criado
SELECT * FROM profiles;