-- Fix Security Definer Views and Database Issues
-- This migration addresses security vulnerabilities and missing database objects

-- 1. Drop and recreate views without SECURITY DEFINER to fix security issues
DROP VIEW IF EXISTS vw_uniformes_estatisticas_mensais CASCADE;
DROP VIEW IF EXISTS vw_uniformes_problemas_itens CASCADE;  
DROP VIEW IF EXISTS vw_uniformes_resumo CASCADE;

-- 2. Create views without SECURITY DEFINER (using default SECURITY INVOKER)
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

-- 3. Add RLS to the views
ALTER VIEW vw_uniformes_estatisticas_mensais ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policy for the view
CREATE POLICY "Admin users can view uniformes statistics" 
ON vw_uniformes_estatisticas_mensais 
FOR SELECT 
USING (get_current_user_role() = 'admin');

-- 5. Add missing tables that are causing build errors
-- Create uniformes table if it doesn't exist
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

-- 6. Enable RLS on uniformes table
ALTER TABLE public.uniformes ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for uniformes table
CREATE POLICY "Admin users can manage uniformes" 
ON public.uniformes FOR ALL 
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- 8. Add missing columns to existing tables if they don't exist
-- Add equipe_id to tp_higienizacoes if not exists (from previous script)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tp_higienizacoes' AND column_name = 'equipe_id'
    ) THEN
        ALTER TABLE tp_higienizacoes ADD COLUMN equipe_id UUID REFERENCES equipes(id);
        CREATE INDEX IF NOT EXISTS idx_tp_higienizacoes_equipe_id ON tp_higienizacoes(equipe_id);
    END IF;
END $$;

-- 9. Create trigger for uniformes to update counters
CREATE OR REPLACE FUNCTION update_uniformes_contadores()
RETURNS TRIGGER AS $$
BEGIN
    -- Count conforme items
    NEW.itens_conformes := (
        CASE WHEN NEW.gandolas_bombeiro = 'CONFORME' THEN 1 ELSE 0 END +
        CASE WHEN NEW.calcas_bombeiro = 'CONFORME' THEN 1 ELSE 0 END +
        CASE WHEN NEW.cinto_bombeiro = 'CONFORME' THEN 1 ELSE 0 END +
        CASE WHEN NEW.bota_seguranca = 'CONFORME' THEN 1 ELSE 0 END +
        CASE WHEN NEW.camisas_bombeiro = 'CONFORME' THEN 1 ELSE 0 END +
        CASE WHEN NEW.bermudas_bombeiro = 'CONFORME' THEN 1 ELSE 0 END +
        CASE WHEN NEW.tarjeta_identificacao = 'CONFORME' THEN 1 ELSE 0 END +
        CASE WHEN NEW.oculos_protetor = 'CONFORME' THEN 1 ELSE 0 END
    );
    
    -- Count non-conforme items
    NEW.itens_nao_conformes := NEW.total_itens_verificados - NEW.itens_conformes;
    
    -- Calculate percentage
    NEW.percentual_conformidade := (NEW.itens_conformes::NUMERIC / NEW.total_itens_verificados * 100);
    
    -- Set status based on conformity
    IF NEW.itens_nao_conformes = 0 THEN
        NEW.status := 'APROVADO';
    ELSIF NEW.itens_conformes = 0 THEN
        NEW.status := 'REPROVADO';
    ELSE
        NEW.status := 'PENDENTE';
    END IF;
    
    -- Update timestamp
    NEW.updated_at := now();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create trigger
DROP TRIGGER IF EXISTS update_uniformes_contadores_trigger ON uniformes;
CREATE TRIGGER update_uniformes_contadores_trigger
    BEFORE INSERT OR UPDATE ON uniformes
    FOR EACH ROW
    EXECUTE FUNCTION update_uniformes_contadores();

-- 11. Update functions to ensure proper search_path (fix security warnings)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;