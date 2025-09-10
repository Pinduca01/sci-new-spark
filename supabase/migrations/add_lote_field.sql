-- Adicionar campo lote na tabela agentes_extintores
ALTER TABLE agentes_extintores ADD COLUMN lote VARCHAR(100);

-- Comentário explicativo
COMMENT ON COLUMN agentes_extintores.lote IS 'Número do lote do agente extintor';