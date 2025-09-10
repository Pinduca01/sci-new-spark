-- Adicionar campo proximo_teste_hidrostatico para Nitrogênio com cilindros
-- As outras colunas (validade_ensaio e data_teste_hidrostatico) já existem

ALTER TABLE agentes_extintores 
ADD COLUMN IF NOT EXISTS proximo_teste_hidrostatico DATE;

-- Comentário para documentação
COMMENT ON COLUMN agentes_extintores.proximo_teste_hidrostatico IS 'Data do próximo teste hidrostático para Nitrogênio com cilindros';