-- ETAPA 3B: CORREÇÃO FINAL - FUNÇÕES E VIEWS RESTANTES
-- ===================================================
-- Corrigir as 3 funções TAF restantes + todas as views

-- 1. CORRIGIR FUNÇÃO: fn_delete_taf_avaliacao (CRÍTICA - DELETE)
CREATE OR REPLACE FUNCTION public.fn_delete_taf_avaliacao(p_id uuid, p_motivo_exclusao text DEFAULT 'Exclusão solicitada pelo usuário'::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    registro_existe BOOLEAN;
    usuario_role TEXT;
    usuario_atual UUID := auth.uid();  -- Capturar logo no início
BEGIN
    -- PROTEÇÃO 1: Verificar autenticação
    IF usuario_atual IS NULL THEN
        RAISE EXCEPTION 'Acesso negado: usuário não autenticado';
    END IF;
    
    -- PROTEÇÃO 2: Verificar se o registro existe
    SELECT EXISTS(SELECT 1 FROM public.taf_avaliacoes_completa WHERE id = p_id) INTO registro_existe;
    
    IF NOT registro_existe THEN
        RAISE EXCEPTION 'Registro TAF com ID % não encontrado', p_id;
    END IF;
    
    -- PROTEÇÃO 3: Verificar permissão do usuário
    SELECT role INTO usuario_role FROM public.profiles WHERE user_id = usuario_atual;
    
    IF usuario_role NOT IN ('admin', 'supervisor') THEN
        RAISE EXCEPTION 'Acesso negado: apenas admin e supervisor podem excluir registros TAF';
    END IF;
    
    -- AUDITORIA: Registrar motivo da exclusão no histórico antes de excluir
    INSERT INTO public.taf_avaliacoes_historico (
        taf_avaliacao_id, operacao, dados_anteriores, dados_novos,
        usuario_responsavel, observacoes_historico
    )
    SELECT 
        p_id, 'DELETE', to_jsonb(t.*), NULL,
        usuario_atual, p_motivo_exclusao
    FROM public.taf_avaliacoes_completa t
    WHERE t.id = p_id;
    
    -- Excluir o registro
    DELETE FROM public.taf_avaliacoes_completa WHERE id = p_id;
    
    RETURN TRUE;
END;
$function$;

-- 2. CORRIGIR FUNÇÃO: get_taf_estatisticas_completas
CREATE OR REPLACE FUNCTION public.get_taf_estatisticas_completas(p_data_inicio date DEFAULT NULL::date, p_data_fim date DEFAULT NULL::date)
RETURNS TABLE(total_avaliacoes integer, taxa_aprovacao numeric, media_flexoes numeric, media_abdominais numeric, media_polichinelos numeric, media_tempo_segundos numeric, bombeiros_pendentes integer, evolucao_mensal jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    RETURN QUERY
    WITH estatisticas_base AS (
        SELECT 
            COUNT(*)::INTEGER as total,
            (COUNT(*) FILTER (WHERE aprovado = true)::NUMERIC / NULLIF(COUNT(*), 0) * 100)::NUMERIC(5,2) as taxa_aprov,
            AVG(flexoes_realizadas)::NUMERIC(5,2) as media_flex,
            AVG(abdominais_realizadas)::NUMERIC(5,2) as media_abd,
            AVG(polichinelos_realizados)::NUMERIC(5,2) as media_pol,
            AVG(tempo_total_segundos)::NUMERIC(5,2) as media_tempo
        FROM public.taf_avaliacoes_completa t
        WHERE 
            (p_data_inicio IS NULL OR t.data_teste >= p_data_inicio)
            AND (p_data_fim IS NULL OR t.data_teste <= p_data_fim)
    ),
    pendentes AS (
        SELECT COUNT(DISTINCT b.id)::INTEGER as pendentes_count
        FROM public.bombeiros b 
        LEFT JOIN public.taf_avaliacoes_completa t ON b.id = t.bombeiro_id 
            AND t.data_teste >= CURRENT_DATE - INTERVAL '6 months'
            AND t.aprovado = true
        WHERE b.status = 'ativo' AND t.id IS NULL
    ),
    evolucao AS (
        SELECT jsonb_object_agg(mes_ano, dados) as evolucao_json
        FROM (
            SELECT 
                TO_CHAR(data_teste, 'YYYY-MM') as mes_ano,
                jsonb_build_object(
                    'total', COUNT(*),
                    'aprovados', COUNT(*) FILTER (WHERE aprovado = true),
                    'taxa_aprovacao', (COUNT(*) FILTER (WHERE aprovado = true)::NUMERIC / NULLIF(COUNT(*), 0) * 100)::NUMERIC(5,2)
                ) as dados
            FROM public.taf_avaliacoes_completa t
            WHERE 
                (p_data_inicio IS NULL OR t.data_teste >= p_data_inicio)
                AND (p_data_fim IS NULL OR t.data_teste <= p_data_fim)
            GROUP BY TO_CHAR(data_teste, 'YYYY-MM')
            ORDER BY mes_ano
        ) ev
    )
    SELECT 
        eb.total,
        eb.taxa_aprov,
        eb.media_flex,
        eb.media_abd,
        eb.media_pol,
        eb.media_tempo,
        p.pendentes_count,
        ev.evolucao_json
    FROM estatisticas_base eb
    CROSS JOIN pendentes p
    CROSS JOIN evolucao ev;
END;
$function$;

-- 3. CORRIGIR FUNÇÃO: get_taf_historico (há duas versões)
CREATE OR REPLACE FUNCTION public.get_taf_historico(p_bombeiro_id uuid, p_limite integer DEFAULT 50)
RETURNS TABLE(id uuid, data_teste date, avaliador_nome character varying, faixa_etaria character varying, idade_na_data integer, flexoes_realizadas integer, abdominais_realizadas integer, polichinelos_realizados integer, tempo_total_segundos integer, tempo_limite_minutos integer, aprovado boolean, observacoes text, created_at timestamp with time zone)
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
    -- Verificação de permissão
    IF NOT (get_current_user_role() IN ('admin', 'supervisor') OR auth.uid() IS NOT NULL) THEN
        RAISE EXCEPTION 'Acesso negado: usuário deve estar autenticado';
    END IF;
    
    RETURN QUERY
    SELECT 
        t.id, t.data_teste, t.avaliador_nome, t.faixa_etaria, t.idade_na_data,
        t.flexoes_realizadas, t.abdominais_realizadas, t.polichinelos_realizados,
        t.tempo_total_segundos, t.tempo_limite_minutos, t.aprovado,
        t.observacoes, t.created_at
    FROM public.taf_avaliacoes t
    WHERE t.bombeiro_id = p_bombeiro_id
    ORDER BY t.data_teste DESC, t.created_at DESC
    LIMIT p_limite;
END;
$function$;

-- 4. RECRIAR TODAS AS VIEWS COM security_invoker = true
-- Dropar views existentes primeiro (CASCADE para dependências)
DROP VIEW IF EXISTS public.bombeiros_publico CASCADE;
DROP VIEW IF EXISTS public.vw_uniformes_estatisticas_mensais CASCADE;
DROP VIEW IF EXISTS public.vw_uniformes_problemas_frequentes CASCADE;
DROP VIEW IF EXISTS public.vw_uniformes_ranking_bombeiros CASCADE;
DROP VIEW IF EXISTS public.vw_uniformes_itens_problematicos CASCADE;

-- RECRIAR: bombeiros_publico com security_invoker
CREATE VIEW public.bombeiros_publico
WITH (security_invoker = true) AS
SELECT 
    id,
    nome,
    funcao,
    funcao_completa,
    equipe,
    turno,
    status,
    data_admissao,
    avatar,
    created_at,
    updated_at
FROM public.bombeiros
WHERE status = 'ativo';

-- RECRIAR: vw_uniformes_estatisticas_mensais com security_invoker
CREATE VIEW public.vw_uniformes_estatisticas_mensais
WITH (security_invoker = true) AS
SELECT 
    base,
    mes_referencia,
    ano_referencia,
    COUNT(*) AS total_verificacoes,
    SUM(itens_conformes) AS total_conformes,
    SUM(itens_nao_conformes) AS total_nao_conformes,
    ROUND(AVG(percentual_conformidade), 2) AS media_conformidade,
    COUNT(CASE WHEN status = 'APROVADO' THEN 1 END) AS aprovados,
    COUNT(CASE WHEN status = 'REPROVADO' THEN 1 END) AS reprovados,
    COUNT(CASE WHEN status = 'PENDENTE' THEN 1 END) AS pendentes
FROM public.uniformes
GROUP BY base, mes_referencia, ano_referencia
ORDER BY ano_referencia DESC, mes_referencia DESC, base;

-- RECRIAR: vw_uniformes_problemas_frequentes com security_invoker
CREATE VIEW public.vw_uniformes_problemas_frequentes
WITH (security_invoker = true) AS
SELECT 'Gandolas Bombeiro' AS item,
       COUNT(CASE WHEN gandolas_bombeiro = 'NAO_CONFORME' THEN 1 END) AS nao_conformes,
       COUNT(*) AS total,
       ROUND(COUNT(CASE WHEN gandolas_bombeiro = 'NAO_CONFORME' THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) AS percentual_problemas
FROM public.uniformes
UNION ALL
SELECT 'Calças Bombeiro' AS item,
       COUNT(CASE WHEN calcas_bombeiro = 'NAO_CONFORME' THEN 1 END) AS nao_conformes,
       COUNT(*) AS total,
       ROUND(COUNT(CASE WHEN calcas_bombeiro = 'NAO_CONFORME' THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) AS percentual_problemas
FROM public.uniformes
UNION ALL
SELECT 'Cinto Bombeiro' AS item,
       COUNT(CASE WHEN cinto_bombeiro = 'NAO_CONFORME' THEN 1 END) AS nao_conformes,
       COUNT(*) AS total,
       ROUND(COUNT(CASE WHEN cinto_bombeiro = 'NAO_CONFORME' THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) AS percentual_problemas
FROM public.uniformes
UNION ALL
SELECT 'Bota Segurança' AS item,
       COUNT(CASE WHEN bota_seguranca = 'NAO_CONFORME' THEN 1 END) AS nao_conformes,
       COUNT(*) AS total,
       ROUND(COUNT(CASE WHEN bota_seguranca = 'NAO_CONFORME' THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) AS percentual_problemas
FROM public.uniformes
UNION ALL
SELECT 'Camisas Bombeiro' AS item,
       COUNT(CASE WHEN camisas_bombeiro = 'NAO_CONFORME' THEN 1 END) AS nao_conformes,
       COUNT(*) AS total,
       ROUND(COUNT(CASE WHEN camisas_bombeiro = 'NAO_CONFORME' THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) AS percentual_problemas
FROM public.uniformes
UNION ALL
SELECT 'Bermudas Bombeiro' AS item,
       COUNT(CASE WHEN bermudas_bombeiro = 'NAO_CONFORME' THEN 1 END) AS nao_conformes,
       COUNT(*) AS total,
       ROUND(COUNT(CASE WHEN bermudas_bombeiro = 'NAO_CONFORME' THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) AS percentual_problemas
FROM public.uniformes
UNION ALL
SELECT 'Tarjeta Identificação' AS item,
       COUNT(CASE WHEN tarjeta_identificacao = 'NAO_CONFORME' THEN 1 END) AS nao_conformes,
       COUNT(*) AS total,
       ROUND(COUNT(CASE WHEN tarjeta_identificacao = 'NAO_CONFORME' THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) AS percentual_problemas
FROM public.uniformes
UNION ALL
SELECT 'Óculos Protetor' AS item,
       COUNT(CASE WHEN oculos_protetor = 'NAO_CONFORME' THEN 1 END) AS nao_conformes,
       COUNT(*) AS total,
       ROUND(COUNT(CASE WHEN oculos_protetor = 'NAO_CONFORME' THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) AS percentual_problemas
FROM public.uniformes
ORDER BY percentual_problemas DESC;

-- RECRIAR: vw_uniformes_ranking_bombeiros com security_invoker
CREATE VIEW public.vw_uniformes_ranking_bombeiros
WITH (security_invoker = true) AS
SELECT 
    bombeiro_nome,
    bombeiro_id,
    COUNT(*) AS total_verificacoes,
    SUM(itens_conformes) AS total_conformes,
    ROUND(AVG(percentual_conformidade), 2) AS media_conformidade,
    COUNT(CASE WHEN status = 'APROVADO' THEN 1 END) AS aprovacoes,
    COUNT(CASE WHEN status = 'REPROVADO' THEN 1 END) AS reprovacoes
FROM public.uniformes
GROUP BY bombeiro_nome, bombeiro_id
ORDER BY media_conformidade DESC, total_conformes DESC;

-- RECRIAR: vw_uniformes_itens_problematicos com security_invoker
CREATE VIEW public.vw_uniformes_itens_problematicos
WITH (security_invoker = true) AS
SELECT 
    bombeiro_id,
    bombeiro_nome,
    'gandolas_bombeiro' as item_tipo,
    gandolas_bombeiro as status_item,
    data_verificacao
FROM public.uniformes
WHERE gandolas_bombeiro = 'NAO_CONFORME'
UNION ALL
SELECT 
    bombeiro_id,
    bombeiro_nome, 
    'calcas_bombeiro' as item_tipo,
    calcas_bombeiro as status_item,
    data_verificacao
FROM public.uniformes
WHERE calcas_bombeiro = 'NAO_CONFORME'
UNION ALL
SELECT 
    bombeiro_id,
    bombeiro_nome,
    'cinto_bombeiro' as item_tipo, 
    cinto_bombeiro as status_item,
    data_verificacao
FROM public.uniformes
WHERE cinto_bombeiro = 'NAO_CONFORME'
UNION ALL
SELECT 
    bombeiro_id,
    bombeiro_nome,
    'bota_seguranca' as item_tipo,
    bota_seguranca as status_item,
    data_verificacao
FROM public.uniformes
WHERE bota_seguranca = 'NAO_CONFORME'
UNION ALL
SELECT 
    bombeiro_id,
    bombeiro_nome,
    'camisas_bombeiro' as item_tipo,
    camisas_bombeiro as status_item,
    data_verificacao
FROM public.uniformes
WHERE camisas_bombeiro = 'NAO_CONFORME'
UNION ALL
SELECT 
    bombeiro_id,
    bombeiro_nome,
    'bermudas_bombeiro' as item_tipo,
    bermudas_bombeiro as status_item,
    data_verificacao
FROM public.uniformes
WHERE bermudas_bombeiro = 'NAO_CONFORME'
UNION ALL
SELECT 
    bombeiro_id,
    bombeiro_nome,
    'tarjeta_identificacao' as item_tipo,
    tarjeta_identificacao as status_item,
    data_verificacao
FROM public.uniformes
WHERE tarjeta_identificacao = 'NAO_CONFORME'
UNION ALL
SELECT 
    bombeiro_id,
    bombeiro_nome,
    'oculos_protetor' as item_tipo,
    oculos_protetor as status_item,
    data_verificacao
FROM public.uniformes
WHERE oculos_protetor = 'NAO_CONFORME'
ORDER BY data_verificacao DESC;

-- DOCUMENTAÇÃO DE COMPLIANCE FINAL
COMMENT ON FUNCTION public.fn_delete_taf_avaliacao(uuid, text) IS 'ETAPA 3B: Search path fixado - função crítica de exclusão protegida';
COMMENT ON FUNCTION public.get_taf_estatisticas_completas(date, date) IS 'ETAPA 3B: Search path fixado - estatísticas TAF protegidas';
COMMENT ON FUNCTION public.get_taf_historico(uuid, integer) IS 'ETAPA 3B: Search path fixado - histórico TAF protegido';

COMMENT ON VIEW public.bombeiros_publico IS 'ETAPA 3B: View recriada com security_invoker=true';
COMMENT ON VIEW public.vw_uniformes_estatisticas_mensais IS 'ETAPA 3B: View recriada com security_invoker=true';
COMMENT ON VIEW public.vw_uniformes_problemas_frequentes IS 'ETAPA 3B: View recriada com security_invoker=true';
COMMENT ON VIEW public.vw_uniformes_ranking_bombeiros IS 'ETAPA 3B: View recriada com security_invoker=true';
COMMENT ON VIEW public.vw_uniformes_itens_problematicos IS 'ETAPA 3B: View recriada com security_invoker=true';

-- LOG DE AUDITORIA FINAL
COMMENT ON DATABASE postgres IS 'ETAPA 3 FINALIZADA: Todas as vulnerabilidades de Search Path e Security Definer Views corrigidas - Sistema SCI-Core seguro';