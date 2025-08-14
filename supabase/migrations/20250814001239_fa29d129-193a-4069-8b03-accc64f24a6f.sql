-- Criar função para gerar próximo número de sequência
CREATE OR REPLACE FUNCTION public.nextval(sequence_name text)
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT nextval(sequence_name::regclass);
$$;