-- Script para atualizar registros existentes com o valor padrão "Santa Genoveva - GYN"
-- Execute este script no Editor SQL do Supabase Dashboard
-- URL: https://supabase.com/dashboard/project/rfgmqogwhlnfrhifsbbg/sql

-- IMPORTANTE: Este script atualiza apenas registros que possuem campos de local/contrato vazios ou nulos
-- Não afeta registros que já possuem valores definidos

-- 1. Verificar registros existentes antes da atualização
SELECT 'tp_verificacoes' as tabela, COUNT(*) as total_registros, 
       COUNT(CASE WHEN base IS NULL OR base = '' THEN 1 END) as registros_vazios
FROM tp_verificacoes
UNION ALL
SELECT 'tp_configuracoes' as tabela, COUNT(*) as total_registros,
       COUNT(CASE WHEN base IS NULL OR base = '' THEN 1 END) as registros_vazios
FROM tp_configuracoes
UNION ALL
SELECT 'tp_higienizacoes' as tabela, COUNT(*) as total_registros,
       COUNT(CASE WHEN base IS NULL OR base = '' THEN 1 END) as registros_vazios
FROM tp_higienizacoes
UNION ALL
SELECT 'ocorrencias' as tabela, COUNT(*) as total_registros,
       COUNT(CASE WHEN local_mapa_grade IS NULL OR local_mapa_grade = '' THEN 1 END) as registros_vazios
FROM ocorrencias
UNION ALL
SELECT 'equipamentos_estoque' as tabela, COUNT(*) as total_registros,
       COUNT(CASE WHEN localizacao_fisica IS NULL OR localizacao_fisica = '' THEN 1 END) as registros_vazios
FROM equipamentos_estoque
UNION ALL
SELECT 'estoque_almoxarifado' as tabela, COUNT(*) as total_registros,
       COUNT(CASE WHEN localizacao_fisica IS NULL OR localizacao_fisica = '' THEN 1 END) as registros_vazios
FROM estoque_almoxarifado;

-- 2. Atualizar tabela tp_verificacoes
-- Atualiza apenas registros com campo 'base' vazio ou nulo
UPDATE tp_verificacoes 
SET base = 'Santa Genoveva - GYN',
    updated_at = now()
WHERE base IS NULL OR base = '';

-- 3. Atualizar tabela tp_configuracoes
-- Atualiza apenas registros com campo 'base' vazio ou nulo
UPDATE tp_configuracoes 
SET base = 'Santa Genoveva - GYN',
    updated_at = now()
WHERE base IS NULL OR base = '';

-- 4. Atualizar tabela tp_higienizacoes
-- Atualiza apenas registros com campo 'base' vazio ou nulo
UPDATE tp_higienizacoes 
SET base = 'Santa Genoveva - GYN',
    updated_at = now()
WHERE base IS NULL OR base = '';

-- 5. Atualizar tabela ocorrencias
-- Atualiza apenas registros com campo 'local_mapa_grade' vazio ou nulo
UPDATE ocorrencias 
SET local_mapa_grade = 'Santa Genoveva - GYN',
    updated_at = now()
WHERE local_mapa_grade IS NULL OR local_mapa_grade = '';

-- 6. Atualizar tabela equipamentos_estoque
-- Atualiza apenas registros com campo 'localizacao_fisica' vazio ou nulo
UPDATE equipamentos_estoque 
SET localizacao_fisica = 'Santa Genoveva - GYN',
    updated_at = now()
WHERE localizacao_fisica IS NULL OR localizacao_fisica = '';

-- 7. Atualizar tabela estoque_almoxarifado
-- Atualiza apenas registros com campo 'localizacao_fisica' vazio ou nulo
UPDATE estoque_almoxarifado 
SET localizacao_fisica = 'Santa Genoveva - GYN',
    updated_at = now()
WHERE localizacao_fisica IS NULL OR localizacao_fisica = '';

-- 8. Verificar registros após a atualização
SELECT 'tp_verificacoes' as tabela, COUNT(*) as total_registros, 
       COUNT(CASE WHEN base = 'Santa Genoveva - GYN' THEN 1 END) as registros_atualizados
FROM tp_verificacoes
UNION ALL
SELECT 'tp_configuracoes' as tabela, COUNT(*) as total_registros,
       COUNT(CASE WHEN base = 'Santa Genoveva - GYN' THEN 1 END) as registros_atualizados
FROM tp_configuracoes
UNION ALL
SELECT 'tp_higienizacoes' as tabela, COUNT(*) as total_registros,
       COUNT(CASE WHEN base = 'Santa Genoveva - GYN' THEN 1 END) as registros_atualizados
FROM tp_higienizacoes
UNION ALL
SELECT 'ocorrencias' as tabela, COUNT(*) as total_registros,
       COUNT(CASE WHEN local_mapa_grade = 'Santa Genoveva - GYN' THEN 1 END) as registros_atualizados
FROM ocorrencias
UNION ALL
SELECT 'equipamentos_estoque' as tabela, COUNT(*) as total_registros,
       COUNT(CASE WHEN localizacao_fisica = 'Santa Genoveva - GYN' THEN 1 END) as registros_atualizados
FROM equipamentos_estoque
UNION ALL
SELECT 'estoque_almoxarifado' as tabela, COUNT(*) as total_registros,
       COUNT(CASE WHEN localizacao_fisica = 'Santa Genoveva - GYN' THEN 1 END) as registros_atualizados
FROM estoque_almoxarifado;

-- INSTRUÇÕES DE EXECUÇÃO:
-- 1. Acesse o Dashboard do Supabase: https://supabase.com/dashboard/project/rfgmqogwhlnfrhifsbbg/sql
-- 2. Cole este script no Editor SQL
-- 3. Execute o script completo
-- 4. Verifique os resultados das consultas de verificação
-- 5. Confirme que apenas registros com campos vazios/nulos foram atualizados

-- SEGURANÇA:
-- - Este script usa condições WHERE para atualizar apenas registros vazios/nulos
-- - Não afeta registros que já possuem valores definidos
-- - Atualiza o campo updated_at para rastreabilidade
-- - Inclui consultas de verificação antes e depois da atualização