-- Adicionar coluna data_movimentacao na tabela movimentacoes
ALTER TABLE movimentacoes 
ADD COLUMN data_movimentacao TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Atualizar registros existentes para usar a data de criação
UPDATE movimentacoes 
SET data_movimentacao = created_at 
WHERE data_movimentacao IS NULL;

-- Tornar a coluna obrigatória
ALTER TABLE movimentacoes 
ALTER COLUMN data_movimentacao SET NOT NULL;

-- Adicionar comentário para documentação
COMMENT ON COLUMN movimentacoes.data_movimentacao IS 'Data e hora da movimentação do agente extintor';