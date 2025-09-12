-- Adicionar coluna hora_retorno_sci na tabela ocorrencias
ALTER TABLE public.ocorrencias 
ADD COLUMN hora_retorno_sci time without time zone;

-- Comentário explicativo
COMMENT ON COLUMN public.ocorrencias.hora_retorno_sci IS 'Horário de retorno à SCI (Sala de Controle de Incêndio)';