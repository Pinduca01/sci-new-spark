-- Adicionar coluna hora_fim na tabela ptr_instrucoes
ALTER TABLE public.ptr_instrucoes 
ADD COLUMN hora_fim time without time zone;