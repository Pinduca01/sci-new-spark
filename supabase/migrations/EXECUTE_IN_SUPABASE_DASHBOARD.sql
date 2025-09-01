-- Execute este script no Editor SQL do Supabase Dashboard
-- URL: https://supabase.com/dashboard/project/rfgmqogwhlnfrhifsbbg/sql

-- Adicionar coluna equipe_id à tabela tp_higienizacoes
ALTER TABLE tp_higienizacoes 
ADD COLUMN equipe_id UUID REFERENCES equipes(id);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_tp_higienizacoes_equipe_id 
ON tp_higienizacoes(equipe_id);

-- Adicionar comentário explicativo
COMMENT ON COLUMN tp_higienizacoes.equipe_id IS 'Referência à equipe responsável pela higienização';

-- Verificar se a migração foi aplicada corretamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tp_higienizacoes' 
AND column_name = 'equipe_id';