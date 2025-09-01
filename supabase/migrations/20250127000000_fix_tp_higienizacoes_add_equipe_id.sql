-- Migração para adicionar equipe_id à tabela tp_higienizacoes
-- Esta correção alinha a estrutura com as outras tabelas do módulo TP e Uniformes

-- Adicionar coluna equipe_id à tabela tp_higienizacoes
ALTER TABLE tp_higienizacoes 
ADD COLUMN equipe_id UUID REFERENCES equipes(id) ON DELETE CASCADE;

-- Criar índice para melhor performance nas consultas por equipe
CREATE INDEX idx_tp_higienizacoes_equipe_id ON tp_higienizacoes(equipe_id);

-- Comentário explicativo
COMMENT ON COLUMN tp_higienizacoes.equipe_id IS 'Referência à equipe responsável pela higienização, alinhando com outras tabelas do módulo';

-- Atualizar registros existentes (se houver) com equipe_id NULL
-- Em produção, seria necessário definir uma estratégia para popular este campo
-- com base nos dados existentes ou deixar como NULL para registros antigos

-- Exemplo de como popular com base no responsável (descomentado se necessário):
-- UPDATE tp_higienizacoes 
-- SET equipe_id = (
--     SELECT b.equipe_id 
--     FROM bombeiros b 
--     WHERE b.id = tp_higienizacoes.responsavel_id
-- )
-- WHERE equipe_id IS NULL AND responsavel_id IS NOT NULL;