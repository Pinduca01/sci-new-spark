-- Migração para corrigir nomes das colunas da tabela taf_avaliacoes
-- Renomear colunas para corresponder aos nomes esperados pelo código TypeScript

-- Renomear colunas existentes
ALTER TABLE public.taf_avaliacoes 
  RENAME COLUMN flexoes TO flexoes_realizadas;

ALTER TABLE public.taf_avaliacoes 
  RENAME COLUMN abdominais TO abdominais_realizadas;

ALTER TABLE public.taf_avaliacoes 
  RENAME COLUMN polichinelos TO polichinelos_realizados;

-- Adicionar colunas que estão faltando baseadas no código TypeScript
ALTER TABLE public.taf_avaliacoes 
  ADD COLUMN IF NOT EXISTS avaliador_nome VARCHAR(200) NOT NULL DEFAULT 'Sistema',
  ADD COLUMN IF NOT EXISTS data_teste DATE NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS faixa_etaria VARCHAR(20) NOT NULL DEFAULT 'abaixo_40',
  ADD COLUMN IF NOT EXISTS idade_na_data INTEGER NOT NULL DEFAULT 25,
  ADD COLUMN IF NOT EXISTS tempo_limite_minutos INTEGER NOT NULL DEFAULT 12,
  ADD COLUMN IF NOT EXISTS tempo_total_segundos INTEGER NOT NULL DEFAULT 0;

-- Remover a coluna antiga data_avaliacao se existir (substituída por data_teste)
ALTER TABLE public.taf_avaliacoes 
  DROP COLUMN IF EXISTS data_avaliacao;

-- Remover a coluna antiga tempo_corrida se existir (substituída por tempo_total_segundos)
ALTER TABLE public.taf_avaliacoes 
  DROP COLUMN IF EXISTS tempo_corrida;

-- Atualizar constraints
ALTER TABLE public.taf_avaliacoes 
  DROP CONSTRAINT IF EXISTS taf_avaliacoes_flexoes_check,
  DROP CONSTRAINT IF EXISTS taf_avaliacoes_abdominais_check,
  DROP CONSTRAINT IF EXISTS taf_avaliacoes_polichinelos_check;

ALTER TABLE public.taf_avaliacoes 
  ADD CONSTRAINT taf_avaliacoes_flexoes_realizadas_check CHECK (flexoes_realizadas >= 0),
  ADD CONSTRAINT taf_avaliacoes_abdominais_realizadas_check CHECK (abdominais_realizadas >= 0),
  ADD CONSTRAINT taf_avaliacoes_polichinelos_realizados_check CHECK (polichinelos_realizados >= 0),
  ADD CONSTRAINT taf_avaliacoes_tempo_total_segundos_check CHECK (tempo_total_segundos >= 0),
  ADD CONSTRAINT taf_avaliacoes_faixa_etaria_check CHECK (faixa_etaria IN ('abaixo_40', 'acima_40'));

-- Atualizar índices
DROP INDEX IF EXISTS idx_taf_avaliacoes_data;
CREATE INDEX IF NOT EXISTS idx_taf_avaliacoes_data_teste ON public.taf_avaliacoes(data_teste);

-- Atualizar comentários
COMMENT ON COLUMN public.taf_avaliacoes.flexoes_realizadas IS 'Número de flexões realizadas';
COMMENT ON COLUMN public.taf_avaliacoes.abdominais_realizadas IS 'Número de abdominais realizadas';
COMMENT ON COLUMN public.taf_avaliacoes.polichinelos_realizados IS 'Número de polichinelos realizados';
COMMENT ON COLUMN public.taf_avaliacoes.data_teste IS 'Data em que o teste foi realizado';
COMMENT ON COLUMN public.taf_avaliacoes.faixa_etaria IS 'Faixa etária do bombeiro (abaixo_40 ou acima_40)';
COMMENT ON COLUMN public.taf_avaliacoes.tempo_total_segundos IS 'Tempo total da corrida em segundos';
COMMENT ON COLUMN public.taf_avaliacoes.avaliador_nome IS 'Nome do avaliador responsável pelo teste';

-- Atualizar função get_taf_estatisticas para usar os novos nomes de colunas
CREATE OR REPLACE FUNCTION public.get_taf_estatisticas()
 RETURNS TABLE(total_avaliacoes integer, taxa_aprovacao numeric, media_flexoes numeric, media_abdominais numeric, media_polichinelos numeric, bombeiros_pendentes integer)
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT 
    COUNT(*)::INTEGER as total_avaliacoes,
    (COUNT(*) FILTER (WHERE aprovado = true)::NUMERIC / NULLIF(COUNT(*), 0) * 100)::NUMERIC(5,2) as taxa_aprovacao,
    AVG(flexoes_realizadas)::NUMERIC(5,2) as media_flexoes,
    AVG(abdominais_realizadas)::NUMERIC(5,2) as media_abdominais,
    AVG(polichinelos_realizados)::NUMERIC(5,2) as media_polichinelos,
    (SELECT COUNT(DISTINCT b.id)::INTEGER
     FROM public.bombeiros b 
     LEFT JOIN public.taf_avaliacoes ta ON b.id = ta.bombeiro_id 
       AND ta.data_teste >= CURRENT_DATE - INTERVAL '6 months'
       AND ta.aprovado = true
     WHERE b.status = 'ativo' AND ta.id IS NULL) as bombeiros_pendentes
  FROM public.taf_avaliacoes
  WHERE data_teste >= CURRENT_DATE - INTERVAL '12 months';
$function$;

-- Remover função existente antes de recriar com nova estrutura
DROP FUNCTION IF EXISTS public.get_taf_historico(UUID);

-- Atualizar função get_taf_historico para usar os novos nomes de colunas
CREATE OR REPLACE FUNCTION public.get_taf_historico(p_bombeiro_id UUID)
RETURNS TABLE (
    id UUID,
    data_teste DATE,
    flexoes_realizadas INTEGER,
    abdominais_realizadas INTEGER,
    polichinelos_realizados INTEGER,
    tempo_total_segundos INTEGER,
    aprovado BOOLEAN,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.data_teste,
        t.flexoes_realizadas,
        t.abdominais_realizadas,
        t.polichinelos_realizados,
        t.tempo_total_segundos,
        t.aprovado,
        t.observacoes,
        t.created_at
    FROM public.taf_avaliacoes t
    WHERE t.bombeiro_id = p_bombeiro_id
    ORDER BY t.data_teste DESC, t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permissões
GRANT ALL ON public.taf_avaliacoes TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_taf_estatisticas() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_taf_historico(UUID) TO authenticated;

-- Comentário final
COMMENT ON TABLE public.taf_avaliacoes IS 'Tabela para armazenar as avaliações do Teste de Aptidão Física (TAF) dos bombeiros - Estrutura atualizada para compatibilidade com TypeScript';