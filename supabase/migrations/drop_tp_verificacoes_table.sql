-- Remover tabela tp_verificacoes e todos os dados relacionados
-- Esta migração apaga completamente a estrutura antiga do checklist de traje de proteção

-- Primeiro, remover as políticas RLS se existirem
DROP POLICY IF EXISTS "tp_verificacoes_select_policy" ON tp_verificacoes;
DROP POLICY IF EXISTS "tp_verificacoes_insert_policy" ON tp_verificacoes;
DROP POLICY IF EXISTS "tp_verificacoes_update_policy" ON tp_verificacoes;
DROP POLICY IF EXISTS "tp_verificacoes_delete_policy" ON tp_verificacoes;

-- Remover tabelas relacionadas se existirem
DROP TABLE IF EXISTS tp_verificacoes_detalhes CASCADE;
DROP TABLE IF EXISTS tp_verificacoes CASCADE;

-- Remover tipos personalizados se existirem
DROP TYPE IF EXISTS tp_status_enum CASCADE;
DROP TYPE IF EXISTS tp_conformidade_enum CASCADE;

-- Remover funções relacionadas se existirem
DROP FUNCTION IF EXISTS handle_tp_verificacoes_updated_at() CASCADE;
DROP FUNCTION IF EXISTS get_tp_verificacoes_stats() CASCADE;

-- Comentário de confirmação
-- Tabela tp_verificacoes e estruturas relacionadas foram completamente removidas