-- ETAPA 2D: CORREÇÃO DAS VIEWS DE UNIFORMES RESTANTES
-- ========================================================

-- Identificamos views relacionadas a uniformes que não têm security_invoker
-- Estas views estão causando os erros "Security Definer View"

-- 1. Recriar vw_uniformes_ranking_bombeiros com security_invoker
DROP VIEW IF EXISTS public.vw_uniformes_ranking_bombeiros CASCADE;

CREATE VIEW public.vw_uniformes_ranking_bombeiros
WITH (security_invoker = true) AS
SELECT 
    bombeiro_id,
    bombeiro_nome,
    base,
    count(*) AS total_verificacoes,
    round(avg(percentual_conformidade), 2) AS media_conformidade,
    count(
        CASE
            WHEN ((status)::text = 'APROVADO'::text) THEN 1
            ELSE NULL::integer
        END) AS total_aprovados,
    max(data_verificacao) AS ultima_verificacao
FROM uniformes
GROUP BY bombeiro_id, bombeiro_nome, base
HAVING (count(*) > 0)
ORDER BY (round(avg(percentual_conformidade), 2)) DESC, (count(
    CASE
        WHEN ((status)::text = 'APROVADO'::text) THEN 1
        ELSE NULL::integer
    END)) DESC;

-- 2. Recriar vw_uniformes_problemas_frequentes com security_invoker
DROP VIEW IF EXISTS public.vw_uniformes_problemas_frequentes CASCADE;

CREATE VIEW public.vw_uniformes_problemas_frequentes  
WITH (security_invoker = true) AS
SELECT 'Gandolas Bombeiro'::text AS item,
    count(
        CASE
            WHEN ((uniformes.gandolas_bombeiro)::text = 'NAO_CONFORME'::text) THEN 1
            ELSE NULL::integer
        END) AS nao_conformes,
    count(*) AS total,
    round((((count(
        CASE
            WHEN ((uniformes.gandolas_bombeiro)::text = 'NAO_CONFORME'::text) THEN 1
            ELSE NULL::integer
        END))::numeric / (count(*))::numeric) * (100)::numeric), 2) AS percentual_problemas
FROM uniformes
UNION ALL
SELECT 'Calças Bombeiro'::text AS item,
    count(
        CASE
            WHEN ((uniformes.calcas_bombeiro)::text = 'NAO_CONFORME'::text) THEN 1
            ELSE NULL::integer
        END) AS nao_conformes,
    count(*) AS total,
    round((((count(
        CASE
            WHEN ((uniformes.calcas_bombeiro)::text = 'NAO_CONFORME'::text) THEN 1
            ELSE NULL::integer
        END))::numeric / (count(*))::numeric) * (100)::numeric), 2) AS percentual_problemas
FROM uniformes
UNION ALL
SELECT 'Cinto Bombeiro'::text AS item,
    count(
        CASE
            WHEN ((uniformes.cinto_bombeiro)::text = 'NAO_CONFORME'::text) THEN 1
            ELSE NULL::integer
        END) AS nao_conformes,
    count(*) AS total,
    round((((count(
        CASE
            WHEN ((uniformes.cinto_bombeiro)::text = 'NAO_CONFORME'::text) THEN 1
            ELSE NULL::integer
        END))::numeric / (count(*))::numeric) * (100)::numeric), 2) AS percentual_problemas
FROM uniformes
UNION ALL
SELECT 'Bota Segurança'::text AS item,
    count(
        CASE
            WHEN ((uniformes.bota_seguranca)::text = 'NAO_CONFORME'::text) THEN 1
            ELSE NULL::integer
        END) AS nao_conformes,
    count(*) AS total,
    round((((count(
        CASE
            WHEN ((uniformes.bota_seguranca)::text = 'NAO_CONFORME'::text) THEN 1
            ELSE NULL::integer
        END))::numeric / (count(*))::numeric) * (100)::numeric), 2) AS percentual_problemas
FROM uniformes
UNION ALL
SELECT 'Camisas Bombeiro'::text AS item,
    count(
        CASE
            WHEN ((uniformes.camisas_bombeiro)::text = 'NAO_CONFORME'::text) THEN 1
            ELSE NULL::integer
        END) AS nao_conformes,
    count(*) AS total,
    round((((count(
        CASE
            WHEN ((uniformes.camisas_bombeiro)::text = 'NAO_CONFORME'::text) THEN 1
            ELSE NULL::integer
        END))::numeric / (count(*))::numeric) * (100)::numeric), 2) AS percentual_problemas
FROM uniformes
UNION ALL
SELECT 'Bermudas Bombeiro'::text AS item,
    count(
        CASE
            WHEN ((uniformes.bermudas_bombeiro)::text = 'NAO_CONFORME'::text) THEN 1
            ELSE NULL::integer
        END) AS nao_conformes,
    count(*) AS total,
    round((((count(
        CASE
            WHEN ((uniformes.bermudas_bombeiro)::text = 'NAO_CONFORME'::text) THEN 1
            ELSE NULL::integer
        END))::numeric / (count(*))::numeric) * (100)::numeric), 2) AS percentual_problemas
FROM uniformes
UNION ALL
SELECT 'Tarjeta Identificação'::text AS item,
    count(
        CASE
            WHEN ((uniformes.tarjeta_identificacao)::text = 'NAO_CONFORME'::text) THEN 1
            ELSE NULL::integer
        END) AS nao_conformes,
    count(*) AS total,
    round((((count(
        CASE
            WHEN ((uniformes.tarjeta_identificacao)::text = 'NAO_CONFORME'::text) THEN 1
            ELSE NULL::integer
        END))::numeric / (count(*))::numeric) * (100)::numeric), 2) AS percentual_problemas
FROM uniformes
UNION ALL
SELECT 'Óculos/Protetor'::text AS item,
    count(
        CASE
            WHEN ((uniformes.oculos_protetor)::text = 'NAO_CONFORME'::text) THEN 1
            ELSE NULL::integer
        END) AS nao_conformes,
    count(*) AS total,
    round((((count(
        CASE
            WHEN ((uniformes.oculos_protetor)::text = 'NAO_CONFORME'::text) THEN 1
            ELSE NULL::integer
        END))::numeric / (count(*))::numeric) * (100)::numeric), 2) AS percentual_problemas
FROM uniformes
ORDER BY percentual_problemas DESC;

-- 3. Verificar e corrigir qualquer outra view relacionada a uniformes
-- Buscar por possíveis outras views que possam estar causando problemas

DO $$
BEGIN
    -- Recriar view de estatísticas de uniformes se existir
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'vw_uniformes_estatisticas') THEN
        DROP VIEW public.vw_uniformes_estatisticas CASCADE;
        
        CREATE VIEW public.vw_uniformes_estatisticas
        WITH (security_invoker = true) AS
        SELECT 
            count(*) as total_verificacoes,
            count(CASE WHEN status = 'APROVADO' THEN 1 END) as aprovados,
            count(CASE WHEN status = 'REPROVADO' THEN 1 END) as reprovados,
            round(avg(percentual_conformidade), 2) as media_conformidade
        FROM uniformes;
    END IF;
END $$;

-- 4. Comentários de compliance
COMMENT ON VIEW public.vw_uniformes_ranking_bombeiros IS 'View de ranking com security_invoker=true - respeita RLS - Etapa 2D';
COMMENT ON VIEW public.vw_uniformes_problemas_frequentes IS 'View de problemas frequentes com security_invoker=true - respeita RLS - Etapa 2D';