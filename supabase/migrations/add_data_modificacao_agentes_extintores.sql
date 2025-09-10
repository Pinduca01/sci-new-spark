-- Adicionar coluna data_modificacao na tabela agentes_extintores
ALTER TABLE agentes_extintores 
ADD COLUMN data_modificacao DATE;

-- Comentário da coluna
COMMENT ON COLUMN agentes_extintores.data_modificacao IS 'Data em que a modificação foi realizada no agente extintor';

-- Atualizar registros existentes com a data atual (opcional)
-- UPDATE agentes_extintores SET data_modificacao = CURRENT_DATE WHERE data_modificacao IS NULL;