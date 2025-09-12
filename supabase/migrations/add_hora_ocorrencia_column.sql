-- Adicionar coluna hora_ocorrencia à tabela ocorrencias
ALTER TABLE public.ocorrencias 
ADD COLUMN hora_ocorrencia TIME;

-- Adicionar comentário à coluna
COMMENT ON COLUMN public.ocorrencias.hora_ocorrencia IS 'Horário da ocorrência';