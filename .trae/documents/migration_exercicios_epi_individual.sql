-- =====================================================
-- MIGRAÇÃO: Reestruturação Exercícios EPI/EPR
-- Objetivo: Implementar armazenamento individual por bombeiro
-- Data: 2024
-- =====================================================

-- 1. CRIAR NOVA TABELA PARA BOMBEIROS INDIVIDUAIS
-- =====================================================

CREATE TABLE IF NOT EXISTS exercicios_epi_bombeiros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exercicio_id UUID NOT NULL REFERENCES exercicios_epi(id) ON DELETE CASCADE,
  bombeiro_id UUID REFERENCES bombeiros(id),
  bombeiro_nome TEXT NOT NULL,
  bombeiro_funcao TEXT NOT NULL,
  tempo_calca_bota INTEGER, -- tempo em segundos
  tempo_tp_completo INTEGER, -- tempo em segundos
  tempo_epr_tp_completo INTEGER, -- tempo em segundos
  tempo_epr_sem_tp INTEGER, -- tempo em segundos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ADICIONAR NOVOS CAMPOS À TABELA PRINCIPAL
-- =====================================================

ALTER TABLE exercicios_epi ADD COLUMN IF NOT EXISTS hora TIME;
ALTER TABLE exercicios_epi ADD COLUMN IF NOT EXISTS identificacao_local TEXT;

-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices na nova tabela de bombeiros
CREATE INDEX IF NOT EXISTS idx_exercicios_epi_bombeiros_exercicio_id 
  ON exercicios_epi_bombeiros(exercicio_id);

CREATE INDEX IF NOT EXISTS idx_exercicios_epi_bombeiros_bombeiro_id 
  ON exercicios_epi_bombeiros(bombeiro_id);

CREATE INDEX IF NOT EXISTS idx_exercicios_epi_bombeiros_nome 
  ON exercicios_epi_bombeiros(bombeiro_nome);

CREATE INDEX IF NOT EXISTS idx_exercicios_epi_bombeiros_created_at 
  ON exercicios_epi_bombeiros(created_at DESC);

-- 4. CONFIGURAR RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS na nova tabela
ALTER TABLE exercicios_epi_bombeiros ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para usuários autenticados
CREATE POLICY "Permitir leitura para usuários autenticados" 
  ON exercicios_epi_bombeiros
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados" 
  ON exercicios_epi_bombeiros
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização para usuários autenticados" 
  ON exercicios_epi_bombeiros
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão para usuários autenticados" 
  ON exercicios_epi_bombeiros
  FOR DELETE USING (auth.role() = 'authenticated');

-- 5. CONCEDER PERMISSÕES
-- =====================================================

GRANT ALL PRIVILEGES ON exercicios_epi_bombeiros TO authenticated;
GRANT SELECT ON exercicios_epi_bombeiros TO anon;

-- 6. MIGRAR DADOS EXISTENTES (OPCIONAL)
-- =====================================================
-- ATENÇÃO: Executar apenas se houver dados para migrar
-- Descomente as linhas abaixo após verificar a estrutura atual

/*
-- Migrar dados do campo bombeiros (array) para registros individuais
-- Assumindo que o campo bombeiros contém nomes dos bombeiros

INSERT INTO exercicios_epi_bombeiros (
  exercicio_id, 
  bombeiro_nome, 
  bombeiro_funcao,
  bombeiro_id
)
SELECT 
  e.id as exercicio_id,
  unnest(e.bombeiros) as bombeiro_nome,
  'Função não especificada' as bombeiro_funcao,
  b.id as bombeiro_id
FROM exercicios_epi e
LEFT JOIN bombeiros b ON b.nome = unnest(e.bombeiros)
WHERE array_length(e.bombeiros, 1) > 0;
*/

-- 7. FUNÇÃO PARA CONVERTER TEMPO MM:SS PARA SEGUNDOS
-- =====================================================

CREATE OR REPLACE FUNCTION time_string_to_seconds(time_str TEXT)
RETURNS INTEGER AS $$
DECLARE
  parts TEXT[];
  minutes INTEGER;
  seconds INTEGER;
BEGIN
  -- Se o valor for nulo ou vazio, retornar 0
  IF time_str IS NULL OR time_str = '' THEN
    RETURN 0;
  END IF;
  
  -- Dividir a string por ':'
  parts := string_to_array(time_str, ':');
  
  -- Se não tiver o formato correto, retornar 0
  IF array_length(parts, 1) != 2 THEN
    RETURN 0;
  END IF;
  
  -- Converter para inteiros
  minutes := COALESCE(parts[1]::INTEGER, 0);
  seconds := COALESCE(parts[2]::INTEGER, 0);
  
  -- Retornar total em segundos
  RETURN (minutes * 60) + seconds;
EXCEPTION
  WHEN OTHERS THEN
    RETURN 0;
END;
$$ LANGUAGE plpgsql;

-- 8. FUNÇÃO PARA CONVERTER SEGUNDOS PARA MM:SS
-- =====================================================

CREATE OR REPLACE FUNCTION seconds_to_time_string(total_seconds INTEGER)
RETURNS TEXT AS $$
DECLARE
  minutes INTEGER;
  seconds INTEGER;
BEGIN
  -- Se o valor for nulo, retornar 00:00
  IF total_seconds IS NULL THEN
    RETURN '00:00';
  END IF;
  
  -- Calcular minutos e segundos
  minutes := total_seconds / 60;
  seconds := total_seconds % 60;
  
  -- Retornar formatado
  RETURN lpad(minutes::TEXT, 2, '0') || ':' || lpad(seconds::TEXT, 2, '0');
END;
$$ LANGUAGE plpgsql;

-- 9. VIEW PARA CONSULTAS SIMPLIFICADAS
-- =====================================================

CREATE OR REPLACE VIEW vw_exercicios_epi_completo AS
SELECT 
  e.*,
  json_agg(
    json_build_object(
      'id', eb.id,
      'bombeiro_id', eb.bombeiro_id,
      'bombeiro_nome', eb.bombeiro_nome,
      'bombeiro_funcao', eb.bombeiro_funcao,
      'tempo_calca_bota', eb.tempo_calca_bota,
      'tempo_tp_completo', eb.tempo_tp_completo,
      'tempo_epr_tp_completo', eb.tempo_epr_tp_completo,
      'tempo_epr_sem_tp', eb.tempo_epr_sem_tp,
      'tempo_calca_bota_formatado', seconds_to_time_string(eb.tempo_calca_bota),
      'tempo_tp_completo_formatado', seconds_to_time_string(eb.tempo_tp_completo),
      'tempo_epr_tp_completo_formatado', seconds_to_time_string(eb.tempo_epr_tp_completo),
      'tempo_epr_sem_tp_formatado', seconds_to_time_string(eb.tempo_epr_sem_tp)
    ) ORDER BY eb.bombeiro_nome
  ) as bombeiros
FROM exercicios_epi e
LEFT JOIN exercicios_epi_bombeiros eb ON e.id = eb.exercicio_id
GROUP BY e.id, e.data, e.hora, e.identificacao_local, e.equipe, 
         e.chefe_equipe, e.tipo_epi, e.status, e.observacoes, 
         e.created_at, e.updated_at;

-- 10. TRIGGER PARA ATUALIZAR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_exercicios_epi_bombeiros_updated_at
  BEFORE UPDATE ON exercicios_epi_bombeiros
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 11. DADOS DE EXEMPLO PARA TESTE
-- =====================================================

-- Inserir exercício de exemplo
INSERT INTO exercicios_epi (
  data, 
  hora, 
  identificacao_local, 
  equipe, 
  chefe_equipe, 
  tipo_epi, 
  status, 
  observacoes
) VALUES (
  CURRENT_DATE,
  '14:30:00',
  'AEROPORTO INTERNACIONAL SANTA GENOVEVA - GYN',
  'Alfa',
  'Ronan Silva',
  'EPI',
  'Concluído',
  'Exercício de treinamento com nova estrutura'
) 
ON CONFLICT DO NOTHING;

-- Inserir bombeiros de exemplo para o exercício
-- (Assumindo que o exercício foi inserido com sucesso)
WITH exercicio_exemplo AS (
  SELECT id FROM exercicios_epi 
  WHERE identificacao_local = 'AEROPORTO INTERNACIONAL SANTA GENOVEVA - GYN'
  AND data = CURRENT_DATE
  LIMIT 1
)
INSERT INTO exercicios_epi_bombeiros (
  exercicio_id,
  bombeiro_nome,
  bombeiro_funcao,
  tempo_calca_bota,
  tempo_tp_completo,
  tempo_epr_tp_completo,
  tempo_epr_sem_tp
)
SELECT 
  e.id,
  bombeiro_data.nome,
  bombeiro_data.funcao,
  bombeiro_data.calca_bota,
  bombeiro_data.tp_completo,
  bombeiro_data.epr_tp_completo,
  bombeiro_data.epr_sem_tp
FROM exercicio_exemplo e,
(
  VALUES 
    ('ARIDELCIO ARAUJO DO NASCIMENTO', 'BA-2', 45, 120, 180, 90),
    ('BRENO AUGUSTO SILVA', 'BA-MC', 50, 125, 185, 95),
    ('CAMILA GODOY SILVA', 'BA-2', 42, 118, 175, 88),
    ('CARMEN LÍDIA SANTOS', 'BA-2', 48, 122, 182, 92)
) AS bombeiro_data(nome, funcao, calca_bota, tp_completo, epr_tp_completo, epr_sem_tp)
ON CONFLICT DO NOTHING;

-- 12. CONSULTAS DE VERIFICAÇÃO
-- =====================================================

-- Verificar estrutura da nova tabela
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'exercicios_epi_bombeiros'
-- ORDER BY ordinal_position;

-- Verificar dados migrados
-- SELECT COUNT(*) as total_exercicios FROM exercicios_epi;
-- SELECT COUNT(*) as total_bombeiros FROM exercicios_epi_bombeiros;

-- Testar view completa
-- SELECT * FROM vw_exercicios_epi_completo LIMIT 1;

-- 13. COMENTÁRIOS FINAIS
-- =====================================================

-- Esta migração implementa:
-- ✅ Nova tabela para armazenamento individual de bombeiros
-- ✅ Relacionamento foreign key entre tabelas
-- ✅ Índices para performance otimizada
-- ✅ Políticas RLS para segurança
-- ✅ Funções auxiliares para conversão de tempo
-- ✅ View para consultas simplificadas
-- ✅ Triggers para manutenção automática
-- ✅ Dados de exemplo para teste

-- PRÓXIMOS PASSOS:
-- 1. Executar esta migração em ambiente de desenvolvimento
-- 2. Testar inserção e consulta de dados
-- 3. Atualizar código frontend conforme documentação
-- 4. Migrar dados existentes (se necessário)
-- 5. Executar em produção após testes completos

-- ROLLBACK (se necessário):
-- DROP VIEW IF EXISTS vw_exercicios_epi_completo;
-- DROP TRIGGER IF EXISTS update_exercicios_epi_bombeiros_updated_at ON exercicios_epi_bombeiros;
-- DROP FUNCTION IF EXISTS update_updated_at_column();
-- DROP FUNCTION IF EXISTS seconds_to_time_string(INTEGER);
-- DROP FUNCTION IF EXISTS time_string_to_seconds(TEXT);
-- DROP TABLE IF EXISTS exercicios_epi_bombeiros;
-- ALTER TABLE exercicios_epi DROP COLUMN IF EXISTS hora;
-- ALTER TABLE exercicios_epi DROP COLUMN IF EXISTS identificacao_local;