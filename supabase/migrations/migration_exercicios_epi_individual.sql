-- Migração para reestruturar tabela exercicios_epi para dados individuais por bombeiro
-- Data: $(date)
-- Descrição: Modifica a estrutura atual para armazenar registros individuais de cada bombeiro

-- 1. Criar backup da tabela atual
CREATE TABLE exercicios_epi_backup AS 
SELECT * FROM exercicios_epi;

-- 2. Verificar dados existentes
SELECT COUNT(*) as total_exercicios FROM exercicios_epi;

-- 3. Remover constraint NOT NULL do campo tempo_vestimento temporariamente
ALTER TABLE exercicios_epi ALTER COLUMN tempo_vestimento DROP NOT NULL;

-- 4. Adicionar novos campos
ALTER TABLE exercicios_epi ADD COLUMN IF NOT EXISTS exercicio_grupo_id UUID;
ALTER TABLE exercicios_epi ADD COLUMN IF NOT EXISTS hora TIME;
ALTER TABLE exercicios_epi ADD COLUMN IF NOT EXISTS identificacao_local TEXT;
ALTER TABLE exercicios_epi ADD COLUMN IF NOT EXISTS bombeiro_id UUID;
ALTER TABLE exercicios_epi ADD COLUMN IF NOT EXISTS bombeiro_nome TEXT;
ALTER TABLE exercicios_epi ADD COLUMN IF NOT EXISTS bombeiro_funcao TEXT;
ALTER TABLE exercicios_epi ADD COLUMN IF NOT EXISTS tempo_calca_bota INTEGER;
ALTER TABLE exercicios_epi ADD COLUMN IF NOT EXISTS tempo_tp_completo INTEGER;
ALTER TABLE exercicios_epi ADD COLUMN IF NOT EXISTS tempo_epr_tp_completo INTEGER;
ALTER TABLE exercicios_epi ADD COLUMN IF NOT EXISTS tempo_epr_sem_tp INTEGER;

-- 5. Migrar dados existentes
-- Criar registros individuais para cada bombeiro
INSERT INTO exercicios_epi (
  exercicio_grupo_id,
  data,
  equipe,
  chefe_equipe,
  tipo_epi,
  status,
  observacoes,
  bombeiro_nome,
  bombeiro_funcao,
  created_at,
  updated_at
)
SELECT 
  e.id as exercicio_grupo_id, -- Usar ID original como grupo
  e.data,
  e.equipe,
  e.chefe_equipe,
  e.tipo_epi,
  e.status,
  e.observacoes,
  unnest(e.bombeiros) as bombeiro_nome,
  'Função não especificada' as bombeiro_funcao,
  e.created_at,
  e.updated_at
FROM exercicios_epi_backup e
WHERE array_length(e.bombeiros, 1) > 0;

-- 6. Remover registros antigos (manter apenas os novos individuais)
DELETE FROM exercicios_epi 
WHERE exercicio_grupo_id IS NULL;

-- 7. Remover campos obsoletos
ALTER TABLE exercicios_epi DROP COLUMN IF EXISTS bombeiros;
ALTER TABLE exercicios_epi DROP COLUMN IF EXISTS tempo_vestimento;

-- 8. Tornar campos obrigatórios
ALTER TABLE exercicios_epi ALTER COLUMN bombeiro_nome SET NOT NULL;
ALTER TABLE exercicios_epi ALTER COLUMN bombeiro_funcao SET NOT NULL;

-- 9. Criar índices para consultas eficientes
CREATE INDEX IF NOT EXISTS idx_exercicios_epi_grupo_id ON exercicios_epi(exercicio_grupo_id);
CREATE INDEX IF NOT EXISTS idx_exercicios_epi_data ON exercicios_epi(data);
CREATE INDEX IF NOT EXISTS idx_exercicios_epi_equipe ON exercicios_epi(equipe);
CREATE INDEX IF NOT EXISTS idx_exercicios_epi_bombeiro_nome ON exercicios_epi(bombeiro_nome);
CREATE INDEX IF NOT EXISTS idx_exercicios_epi_bombeiro_id ON exercicios_epi(bombeiro_id);

-- 10. Verificar migração
SELECT 
  COUNT(*) as total_registros_individuais,
  COUNT(DISTINCT exercicio_grupo_id) as total_exercicios_agrupados
FROM exercicios_epi;

-- 11. Verificar estrutura final
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'exercicios_epi' 
ORDER BY ordinal_position;