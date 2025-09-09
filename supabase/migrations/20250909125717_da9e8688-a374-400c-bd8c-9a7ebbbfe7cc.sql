-- Fix Security Definer Views (without RLS on views)
-- This migration addresses security vulnerabilities

-- 1. Drop and recreate views without SECURITY DEFINER to fix security issues
DROP VIEW IF EXISTS vw_uniformes_estatisticas_mensais CASCADE;
DROP VIEW IF EXISTS vw_uniformes_problemas_itens CASCADE;  
DROP VIEW IF EXISTS vw_uniformes_resumo CASCADE;

-- 2. Create views without SECURITY DEFINER (using default SECURITY INVOKER)
-- This ensures views use the permissions of the querying user, not the creator
CREATE VIEW vw_uniformes_estatisticas_mensais AS
SELECT 
    base,
    mes_referencia,
    ano_referencia,
    count(*) AS total_verificacoes,
    sum(itens_conformes) AS total_conformes,
    sum(itens_nao_conformes) AS total_nao_conformes,
    round(avg(percentual_conformidade), 2) AS media_conformidade,
    count(CASE WHEN status::text = 'APROVADO'::text THEN 1 ELSE NULL END) AS aprovados,
    count(CASE WHEN status::text = 'REPROVADO'::text THEN 1 ELSE NULL END) AS reprovados,
    count(CASE WHEN status::text = 'PENDENTE'::text THEN 1 ELSE NULL END) AS pendentes
FROM uniformes
GROUP BY base, mes_referencia, ano_referencia
ORDER BY ano_referencia DESC, mes_referencia DESC, base;

-- 3. Create the uniformes table if it doesn't exist (needed for the view)
CREATE TABLE IF NOT EXISTS public.uniformes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bombeiro_id UUID REFERENCES bombeiros(id),
    equipe_id UUID REFERENCES equipes(id),
    base TEXT DEFAULT 'Santa Genoveva - GYN',
    mes_referencia INTEGER NOT NULL,
    ano_referencia INTEGER NOT NULL,
    gandolas_bombeiro TEXT DEFAULT 'CONFORME',
    calcas_bombeiro TEXT DEFAULT 'CONFORME', 
    cinto_bombeiro TEXT DEFAULT 'CONFORME',
    bota_seguranca TEXT DEFAULT 'CONFORME',
    camisas_bombeiro TEXT DEFAULT 'CONFORME',
    bermudas_bombeiro TEXT DEFAULT 'CONFORME',
    tarjeta_identificacao TEXT DEFAULT 'CONFORME',
    oculos_protetor TEXT DEFAULT 'CONFORME',
    total_itens_verificados INTEGER DEFAULT 8,
    itens_conformes INTEGER DEFAULT 0,
    itens_nao_conformes INTEGER DEFAULT 0,
    percentual_conformidade NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'PENDENTE',
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Enable RLS on uniformes table
ALTER TABLE public.uniformes ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for uniformes table
CREATE POLICY "Admin users can manage uniformes" 
ON public.uniformes FOR ALL 
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');