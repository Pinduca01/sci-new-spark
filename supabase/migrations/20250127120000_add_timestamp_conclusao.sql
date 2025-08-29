-- Migration para adicionar campo timestamp_conclusao na tabela checklists_viaturas
-- Este campo registrará automaticamente a data e hora exata de conclusão do checklist

-- Adicionar campo timestamp_conclusao
ALTER TABLE public.checklists_viaturas 
ADD COLUMN IF NOT EXISTS timestamp_conclusao TIMESTAMP WITH TIME ZONE;

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN public.checklists_viaturas.timestamp_conclusao IS 'Data e hora exata de conclusão do checklist (registrada automaticamente no momento do salvamento)';

-- Criar índice para melhorar performance nas consultas por data de conclusão
CREATE INDEX IF NOT EXISTS idx_checklists_viaturas_timestamp_conclusao 
ON public.checklists_viaturas(timestamp_conclusao);

-- Atualizar registros existentes com timestamp baseado no created_at (opcional)
-- UPDATE public.checklists_viaturas 
-- SET timestamp_conclusao = created_at 
-- WHERE timestamp_conclusao IS NULL;

-- Verificar a estrutura atualizada da tabela
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'checklists_viaturas' 
--   AND table_schema = 'public'
-- ORDER BY ordinal_position;