-- ============================================
-- CORREÇÃO: Adicionar colunas faltantes na tabela viaturas
-- ============================================

-- Adicionar colunas que faltam para compatibilidade com o frontend
ALTER TABLE public.viaturas 
ADD COLUMN IF NOT EXISTS nome_viatura TEXT,
ADD COLUMN IF NOT EXISTS prefixo TEXT,
ADD COLUMN IF NOT EXISTS tipo TEXT,
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Atualizar valores baseados nos dados existentes
UPDATE public.viaturas 
SET 
  nome_viatura = COALESCE(nome_viatura, modelo || ' ' || placa),
  prefixo = COALESCE(prefixo, 'VT-' || SUBSTRING(placa, 1, 3)),
  tipo = COALESCE(tipo, 'Não especificado');

-- Comentários
COMMENT ON COLUMN public.viaturas.nome_viatura IS 'Nome identificador da viatura';
COMMENT ON COLUMN public.viaturas.prefixo IS 'Prefixo de identificação da viatura';
COMMENT ON COLUMN public.viaturas.tipo IS 'Tipo da viatura (ex: ABT, ABTS, etc)';
COMMENT ON COLUMN public.viaturas.observacoes IS 'Observações gerais sobre a viatura';