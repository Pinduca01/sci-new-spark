-- Adicionar coluna observacoes na tabela escalas_geradas
ALTER TABLE public.escalas_geradas 
ADD COLUMN IF NOT EXISTS observacoes TEXT;