-- Adicionar coluna situacao_ba na tabela ptr_participantes
ALTER TABLE public.ptr_participantes 
ADD COLUMN situacao_ba TEXT DEFAULT 'P' CHECK (situacao_ba IN ('P', 'A', 'EO'));