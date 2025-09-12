-- Teste para verificar dados da tabela bombeiros
SELECT 
  id,
  nome,
  email,
  funcao,
  funcao_completa,
  status,
  equipe,
  turno,
  created_at
FROM bombeiros 
ORDER BY nome 
LIMIT 10;

-- Verificar se há nomes vazios ou nulos
SELECT 
  COUNT(*) as total_registros,
  COUNT(CASE WHEN nome IS NULL THEN 1 END) as nomes_nulos,
  COUNT(CASE WHEN nome = '' THEN 1 END) as nomes_vazios,
  COUNT(CASE WHEN TRIM(nome) = '' THEN 1 END) as nomes_apenas_espacos
FROM bombeiros;

-- Verificar registros com problemas no nome
SELECT 
  id,
  nome,
  LENGTH(nome) as tamanho_nome,
  email,
  status
FROM bombeiros 
WHERE nome IS NULL OR nome = '' OR TRIM(nome) = ''
ORDER BY created_at DESC;