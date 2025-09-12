-- Migração para corrigir a estrutura da tabela exercicios_epi
-- Resolve o erro de constraint NOT NULL no campo 'status' e outros ajustes

-- 1. Primeiro, vamos alterar o campo 'status' para ter um valor padrão apropriado
-- O modal não envia o campo 'status', então ele deve ter um valor padrão
ALTER TABLE exercicios_epi 
ALTER COLUMN status SET DEFAULT 'Pendente';

-- 2. Verificar se há registros com status NULL e corrigi-los
UPDATE exercicios_epi 
SET status = 'Pendente' 
WHERE status IS NULL;

-- 3. Garantir que o campo 'status' continue sendo NOT NULL mas com valor padrão
-- (já está configurado corretamente na estrutura atual)

-- 4. Verificar outros campos que podem causar problemas:
-- O campo 'data' é NOT NULL mas o modal sempre envia
-- O campo 'equipe' é NOT NULL mas o modal sempre envia
-- O campo 'tipo_epi' é NOT NULL mas o modal sempre envia
-- O campo 'bombeiro_nome' é NOT NULL mas o modal sempre envia
-- O campo 'bombeiro_funcao' é NOT NULL mas o modal sempre envia

-- 5. Comentários para documentar a estrutura esperada:
COMMENT ON COLUMN exercicios_epi.status IS 'Status do exercício. Valor padrão: Pendente. Valores permitidos: Pendente, Em Andamento, Concluído, Cancelado';
COMMENT ON COLUMN exercicios_epi.hora IS 'Hora do exercício no formato HH:MM';
COMMENT ON COLUMN exercicios_epi.identificacao_local IS 'Identificação do local onde o exercício foi realizado';
COMMENT ON COLUMN exercicios_epi.observacoes IS 'Observações sobre o exercício (campo opcional)';

-- 6. Verificar se a tabela tem os índices necessários para performance
CREATE INDEX IF NOT EXISTS idx_exercicios_epi_data ON exercicios_epi(data);
CREATE INDEX IF NOT EXISTS idx_exercicios_epi_equipe ON exercicios_epi(equipe);
CREATE INDEX IF NOT EXISTS idx_exercicios_epi_exercicio_grupo_id ON exercicios_epi(exercicio_grupo_id);
CREATE INDEX IF NOT EXISTS idx_exercicios_epi_status ON exercicios_epi(status);

-- 7. Garantir que as permissões estão corretas
GRANT SELECT, INSERT, UPDATE, DELETE ON exercicios_epi TO authenticated;
GRANT SELECT ON exercicios_epi TO anon;

-- Verificação final: mostrar a estrutura atualizada
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'exercicios_epi' 
-- ORDER BY ordinal_position;