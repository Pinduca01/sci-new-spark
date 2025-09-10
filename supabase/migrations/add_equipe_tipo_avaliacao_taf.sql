-- Migração para adicionar colunas de equipe e tipo de avaliação à tabela taf_avaliacoes
-- Esta migração corrige os erros PGRST204 relacionados à coluna 'equipe' ausente

-- Adicionar coluna equipe com constraint para aceitar apenas as equipes válidas
ALTER TABLE public.taf_avaliacoes 
  ADD COLUMN IF NOT EXISTS equipe VARCHAR(20),
  ADD COLUMN IF NOT EXISTS tipo_avaliacao VARCHAR(20) NOT NULL DEFAULT 'individual';

-- Adicionar constraints para validar os valores das novas colunas
ALTER TABLE public.taf_avaliacoes 
  ADD CONSTRAINT taf_avaliacoes_equipe_check 
    CHECK (equipe IS NULL OR equipe IN ('Alfa', 'Bravo', 'Charlie', 'Delta')),
  ADD CONSTRAINT taf_avaliacoes_tipo_avaliacao_check 
    CHECK (tipo_avaliacao IN ('individual', 'equipe'));

-- Criar índices para melhor performance nas consultas
CREATE INDEX IF NOT EXISTS idx_taf_avaliacoes_equipe ON public.taf_avaliacoes(equipe);
CREATE INDEX IF NOT EXISTS idx_taf_avaliacoes_tipo_avaliacao ON public.taf_avaliacoes(tipo_avaliacao);
CREATE INDEX IF NOT EXISTS idx_taf_avaliacoes_equipe_data ON public.taf_avaliacoes(equipe, data_teste);

-- Atualizar comentários das colunas
COMMENT ON COLUMN public.taf_avaliacoes.equipe IS 'Equipe do bombeiro durante a avaliação: Alfa, Bravo, Charlie ou Delta';
COMMENT ON COLUMN public.taf_avaliacoes.tipo_avaliacao IS 'Tipo de avaliação realizada: individual ou equipe';

-- Atualizar função get_taf_estatisticas para incluir estatísticas por equipe
CREATE OR REPLACE FUNCTION public.get_taf_estatisticas_por_equipe(p_equipe VARCHAR(20) DEFAULT NULL)
 RETURNS TABLE(
   total_avaliacoes integer, 
   taxa_aprovacao numeric, 
   media_flexoes numeric, 
   media_abdominais numeric, 
   media_polichinelos numeric, 
   bombeiros_pendentes integer,
   equipe_filtro VARCHAR(20)
 )
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
       AND (p_equipe IS NULL OR ta.equipe = p_equipe)
     WHERE b.status = 'ativo' 
       AND (p_equipe IS NULL OR b.equipe = p_equipe)
       AND ta.id IS NULL) as bombeiros_pendentes,
    p_equipe as equipe_filtro
  FROM public.taf_avaliacoes
  WHERE data_teste >= CURRENT_DATE - INTERVAL '12 months'
    AND (p_equipe IS NULL OR equipe = p_equipe);
$function$;

-- Conceder permissões necessárias
GRANT ALL ON public.taf_avaliacoes TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_taf_estatisticas_por_equipe(VARCHAR) TO authenticated;

-- Comentário final
COMMENT ON TABLE public.taf_avaliacoes IS 'Tabela para armazenar as avaliações do Teste de Aptidão Física (TAF) dos bombeiros - Atualizada com suporte a equipes e tipos de avaliação';