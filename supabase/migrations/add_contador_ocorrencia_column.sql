-- Adicionar coluna contador_ocorrencia na tabela ocorrencias
ALTER TABLE public.ocorrencias 
ADD COLUMN contador_ocorrencia INTEGER DEFAULT 1;

-- Criar comentário para a coluna
COMMENT ON COLUMN public.ocorrencias.contador_ocorrencia IS 'Contador sequencial de ocorrências';

-- Atualizar registros existentes com valores sequenciais
WITH numbered_rows AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM public.ocorrencias
)
UPDATE public.ocorrencias 
SET contador_ocorrencia = numbered_rows.row_num
FROM numbered_rows 
WHERE public.ocorrencias.id = numbered_rows.id;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_ocorrencias_contador ON public.ocorrencias(contador_ocorrencia);