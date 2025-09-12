-- Migração para adicionar colunas faltantes na tabela tp_verificacoes
-- Esta migração garante que todas as colunas necessárias existam

-- Adicionar colunas da categoria 1 se não existirem
ALTER TABLE tp_verificacoes 
ADD COLUMN IF NOT EXISTS cat1_etiquetas_membros TEXT[],
ADD COLUMN IF NOT EXISTS cat1_etiquetas_observacoes TEXT,
ADD COLUMN IF NOT EXISTS cat1_ca_membros TEXT[],
ADD COLUMN IF NOT EXISTS cat1_ca_observacoes TEXT;

-- Adicionar colunas da categoria 2 se não existirem
ALTER TABLE tp_verificacoes 
ADD COLUMN IF NOT EXISTS cat2_capacetes_membros TEXT[],
ADD COLUMN IF NOT EXISTS cat2_capacetes_observacoes TEXT;

-- Adicionar colunas da categoria 3 se não existirem
ALTER TABLE tp_verificacoes 
ADD COLUMN IF NOT EXISTS cat3_vestimentas_membros TEXT[],
ADD COLUMN IF NOT EXISTS cat3_vestimentas_observacoes TEXT,
ADD COLUMN IF NOT EXISTS cat3_bom_estado_membros TEXT[],
ADD COLUMN IF NOT EXISTS cat3_bom_estado_observacoes TEXT,
ADD COLUMN IF NOT EXISTS cat3_fechos_membros TEXT[],
ADD COLUMN IF NOT EXISTS cat3_fechos_observacoes TEXT,
ADD COLUMN IF NOT EXISTS cat3_costuras_membros TEXT[],
ADD COLUMN IF NOT EXISTS cat3_costuras_observacoes TEXT,
ADD COLUMN IF NOT EXISTS cat3_refletivos_membros TEXT[],
ADD COLUMN IF NOT EXISTS cat3_refletivos_observacoes TEXT,
ADD COLUMN IF NOT EXISTS cat3_limpeza_membros TEXT[],
ADD COLUMN IF NOT EXISTS cat3_limpeza_observacoes TEXT,
ADD COLUMN IF NOT EXISTS cat3_tamanho_membros TEXT[],
ADD COLUMN IF NOT EXISTS cat3_tamanho_observacoes TEXT,
ADD COLUMN IF NOT EXISTS cat3_modificacoes_membros TEXT[],
ADD COLUMN IF NOT EXISTS cat3_modificacoes_observacoes TEXT;

-- Adicionar colunas da categoria 4 se não existirem
ALTER TABLE tp_verificacoes 
ADD COLUMN IF NOT EXISTS cat4_botas_membros TEXT[],
ADD COLUMN IF NOT EXISTS cat4_botas_observacoes TEXT,
ADD COLUMN IF NOT EXISTS cat4_solas_membros TEXT[],
ADD COLUMN IF NOT EXISTS cat4_solas_observacoes TEXT;

-- Adicionar colunas da categoria 5 se não existirem
ALTER TABLE tp_verificacoes 
ADD COLUMN IF NOT EXISTS cat5_luvas_membros TEXT[],
ADD COLUMN IF NOT EXISTS cat5_luvas_observacoes TEXT,
ADD COLUMN IF NOT EXISTS cat5_costuras_membros TEXT[],
ADD COLUMN IF NOT EXISTS cat5_costuras_observacoes TEXT;

-- Adicionar colunas da categoria 6 se não existirem
ALTER TABLE tp_verificacoes 
ADD COLUMN IF NOT EXISTS cat6_capuzes_membros TEXT[],
ADD COLUMN IF NOT EXISTS cat6_capuzes_observacoes TEXT;

-- Comentários para documentar as colunas
COMMENT ON COLUMN tp_verificacoes.cat1_etiquetas_membros IS 'Membros afetados - Etiquetas visíveis';
COMMENT ON COLUMN tp_verificacoes.cat1_ca_membros IS 'Membros afetados - CA válido';
COMMENT ON COLUMN tp_verificacoes.cat2_capacetes_membros IS 'Membros afetados - Capacetes íntegros';
COMMENT ON COLUMN tp_verificacoes.cat3_vestimentas_membros IS 'Membros afetados - Vestimentas íntegras';
COMMENT ON COLUMN tp_verificacoes.cat4_botas_membros IS 'Membros afetados - Botas em bom estado';
COMMENT ON COLUMN tp_verificacoes.cat5_luvas_membros IS 'Membros afetados - Luvas em bom estado';
COMMENT ON COLUMN tp_verificacoes.cat6_capuzes_membros IS 'Membros afetados - Capuzes em bom estado';