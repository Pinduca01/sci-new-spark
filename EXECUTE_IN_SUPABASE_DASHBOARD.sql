-- Script para ser executado no Dashboard do Supabase
-- Este script adiciona a coluna equipe_id à tabela tp_higienizacoes

-- 1. Adicionar a coluna equipe_id
ALTER TABLE tp_higienizacoes 
ADD COLUMN equipe_id UUID REFERENCES equipes(id);

-- 2. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_tp_higienizacoes_equipe_id 
ON tp_higienizacoes(equipe_id);

-- 3. Adicionar comentário explicativo
COMMENT ON COLUMN tp_higienizacoes.equipe_id IS 'Referência à equipe responsável pela higienização';

-- 4. Verificar se a coluna foi adicionada corretamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tp_higienizacoes' 
AND column_name = 'equipe_id';

-- INSTRUÇÕES:
-- 1. Acesse o Dashboard do Supabase
-- 2. Vá para SQL Editor
-- 3. Cole e execute este script
-- 4. Verifique se a coluna foi adicionada com sucesso