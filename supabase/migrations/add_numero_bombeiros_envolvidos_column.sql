-- Adicionar coluna numero_bombeiros_envolvidos à tabela ocorrencias
ALTER TABLE public.ocorrencias 
ADD COLUMN numero_bombeiros_envolvidos INTEGER DEFAULT 0;

-- Adicionar comentário à coluna
COMMENT ON COLUMN public.ocorrencias.numero_bombeiros_envolvidos IS 'Número de bombeiros envolvidos na ocorrência';

-- Conceder permissões para os roles anon e authenticated
GRANT SELECT, INSERT, UPDATE ON public.ocorrencias TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ocorrencias TO authenticated;