-- Remover completamente a constraint problemática e criar uma nova estratégia
ALTER TABLE bombeiros DROP CONSTRAINT IF EXISTS bombeiros_status_check;

-- Verificar os valores únicos atuais
SELECT DISTINCT status FROM bombeiros;