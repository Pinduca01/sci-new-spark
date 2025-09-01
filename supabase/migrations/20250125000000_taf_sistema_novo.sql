-- Remove tabela antiga se existir
DROP TABLE IF EXISTS public.taf_avaliacoes_completa CASCADE;
DROP TABLE IF EXISTS public.taf_avaliacoes CASCADE;

-- Criação da tabela TAF (Teste de Aptidão Física)
CREATE TABLE IF NOT EXISTS public.taf_avaliacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bombeiro_id UUID NOT NULL REFERENCES public.bombeiros(id) ON DELETE CASCADE,
    data_avaliacao DATE NOT NULL DEFAULT CURRENT_DATE,
    flexoes INTEGER NOT NULL CHECK (flexoes >= 0),
    abdominais INTEGER NOT NULL CHECK (abdominais >= 0),
    polichinelos INTEGER NOT NULL CHECK (polichinelos >= 0),
    tempo_corrida INTERVAL NOT NULL,
    aprovado BOOLEAN NOT NULL DEFAULT false,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_taf_avaliacoes_bombeiro_id ON public.taf_avaliacoes(bombeiro_id);
CREATE INDEX IF NOT EXISTS idx_taf_avaliacoes_data ON public.taf_avaliacoes(data_avaliacao);
CREATE INDEX IF NOT EXISTS idx_taf_avaliacoes_aprovado ON public.taf_avaliacoes(aprovado);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_taf_avaliacoes_updated_at
    BEFORE UPDATE ON public.taf_avaliacoes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Remove função existente se houver conflito de tipo
DROP FUNCTION IF EXISTS public.get_taf_estatisticas();

-- Função para buscar estatísticas TAF
CREATE OR REPLACE FUNCTION public.get_taf_estatisticas(
    data_inicio DATE DEFAULT NULL,
    data_fim DATE DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    resultado JSON;
    total_avaliacoes INTEGER;
    aprovados INTEGER;
    taxa_aprovacao NUMERIC;
    media_flexoes NUMERIC;
    media_abdominais NUMERIC;
    media_polichinelos NUMERIC;
    media_tempo INTERVAL;  -- Esta linha estava faltando!
    bombeiros_pendentes INTEGER;
BEGIN
    -- Aplicar filtros de data se fornecidos
    IF data_inicio IS NULL THEN
        data_inicio := CURRENT_DATE - INTERVAL '1 year';
    END IF;
    
    IF data_fim IS NULL THEN
        data_fim := CURRENT_DATE;
    END IF;

    -- Total de avaliações no período
    SELECT COUNT(*) INTO total_avaliacoes
    FROM public.taf_avaliacoes
    WHERE data_avaliacao BETWEEN data_inicio AND data_fim;

    -- Aprovados no período
    SELECT COUNT(*) INTO aprovados
    FROM public.taf_avaliacoes
    WHERE data_avaliacao BETWEEN data_inicio AND data_fim
    AND aprovado = true;

    -- Taxa de aprovação
    IF total_avaliacoes > 0 THEN
        taxa_aprovacao := (aprovados::NUMERIC / total_avaliacoes::NUMERIC) * 100;
    ELSE
        taxa_aprovacao := 0;
    END IF;

    -- Médias dos exercícios
    SELECT 
        AVG(flexoes),
        AVG(abdominais),
        AVG(polichinelos),
        AVG(tempo_corrida)  -- Esta linha também estava incompleta
    INTO 
        media_flexoes,
        media_abdominais,
        media_polichinelos,
        media_tempo
    FROM public.taf_avaliacoes
    WHERE data_avaliacao BETWEEN data_inicio AND data_fim;

    -- Bombeiros pendentes (sem avaliação no período)
    SELECT COUNT(*) INTO bombeiros_pendentes
    FROM public.bombeiros b
    WHERE NOT EXISTS (
        SELECT 1 FROM public.taf_avaliacoes t
        WHERE t.bombeiro_id = b.id
        AND t.data_avaliacao BETWEEN data_inicio AND data_fim
    )
    AND b.ativo = true;

    -- Montar resultado JSON
    resultado := json_build_object(
        'total_avaliacoes', COALESCE(total_avaliacoes, 0),
        'aprovados', COALESCE(aprovados, 0),
        'taxa_aprovacao', COALESCE(taxa_aprovacao, 0),
        'media_flexoes', COALESCE(media_flexoes, 0),
        'media_abdominais', COALESCE(media_abdominais, 0),
        'media_polichinelos', COALESCE(media_polichinelos, 0),
        'media_tempo_segundos', COALESCE(EXTRACT(EPOCH FROM media_tempo), 0),
        'bombeiros_pendentes', COALESCE(bombeiros_pendentes, 0)
    );

    RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove função existente se houver conflito de tipo
DROP FUNCTION IF EXISTS public.get_taf_historico(UUID);

-- Função para buscar histórico de um bombeiro específico
CREATE OR REPLACE FUNCTION public.get_taf_historico(
    p_bombeiro_id UUID
)
RETURNS TABLE (
    id UUID,
    data_avaliacao DATE,
    flexoes INTEGER,
    abdominais INTEGER,
    polichinelos INTEGER,
    aprovado BOOLEAN,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.data_avaliacao,
        t.flexoes,
        t.abdominais,
        t.polichinelos,
        t.aprovado,
        t.observacoes,
        t.created_at
    FROM public.taf_avaliacoes t
    WHERE t.bombeiro_id = p_bombeiro_id
    ORDER BY t.data_avaliacao DESC, t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.taf_avaliacoes ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas as operações para usuários autenticados
CREATE POLICY "Permitir todas as operações para usuários autenticados" ON public.taf_avaliacoes
    FOR ALL USING (auth.role() = 'authenticated');

-- Comentários para documentação
COMMENT ON TABLE public.taf_avaliacoes IS 'Tabela para armazenar as avaliações do Teste de Aptidão Física (TAF) dos bombeiros';
COMMENT ON COLUMN public.taf_avaliacoes.bombeiro_id IS 'Referência ao bombeiro que realizou a avaliação';
COMMENT ON COLUMN public.taf_avaliacoes.data_avaliacao IS 'Data em que a avaliação foi realizada';
COMMENT ON COLUMN public.taf_avaliacoes.flexoes IS 'Número de flexões realizadas';
COMMENT ON COLUMN public.taf_avaliacoes.abdominais IS 'Número de abdominais realizadas';
COMMENT ON COLUMN public.taf_avaliacoes.polichinelos IS 'Número de polichinelos realizados';
COMMENT ON COLUMN public.taf_avaliacoes.aprovado IS 'Indica se o bombeiro foi aprovado no TAF';
COMMENT ON COLUMN public.taf_avaliacoes.observacoes IS 'Observações adicionais sobre a avaliação';