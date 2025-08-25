
-- Phase 1: Secure Airport Security Tables - Replace overly permissive RLS policies
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow all operations on extintores aeroporto" ON public.extintores_aeroporto;
DROP POLICY IF EXISTS "Allow all operations on quadrantes aeroporto" ON public.quadrantes_aeroporto;
DROP POLICY IF EXISTS "Allow all operations on inspecoes extintores" ON public.inspecoes_extintores;

-- Create proper admin-only policies for extintores_aeroporto
CREATE POLICY "Admin users can view all extintores aeroporto" 
  ON public.extintores_aeroporto 
  FOR SELECT 
  USING (get_current_user_role() = 'admin'::text);

CREATE POLICY "Admin users can insert extintores aeroporto" 
  ON public.extintores_aeroporto 
  FOR INSERT 
  WITH CHECK (get_current_user_role() = 'admin'::text);

CREATE POLICY "Admin users can update extintores aeroporto" 
  ON public.extintores_aeroporto 
  FOR UPDATE 
  USING (get_current_user_role() = 'admin'::text);

CREATE POLICY "Admin users can delete extintores aeroporto" 
  ON public.extintores_aeroporto 
  FOR DELETE 
  USING (get_current_user_role() = 'admin'::text);

-- Create proper admin-only policies for quadrantes_aeroporto
CREATE POLICY "Admin users can view all quadrantes aeroporto" 
  ON public.quadrantes_aeroporto 
  FOR SELECT 
  USING (get_current_user_role() = 'admin'::text);

CREATE POLICY "Admin users can insert quadrantes aeroporto" 
  ON public.quadrantes_aeroporto 
  FOR INSERT 
  WITH CHECK (get_current_user_role() = 'admin'::text);

CREATE POLICY "Admin users can update quadrantes aeroporto" 
  ON public.quadrantes_aeroporto 
  FOR UPDATE 
  USING (get_current_user_role() = 'admin'::text);

CREATE POLICY "Admin users can delete quadrantes aeroporto" 
  ON public.quadrantes_aeroporto 
  FOR DELETE 
  USING (get_current_user_role() = 'admin'::text);

-- Create proper admin-only policies for inspecoes_extintores
CREATE POLICY "Admin users can view all inspecoes extintores" 
  ON public.inspecoes_extintores 
  FOR SELECT 
  USING (get_current_user_role() = 'admin'::text);

CREATE POLICY "Admin users can insert inspecoes extintores" 
  ON public.inspecoes_extintores 
  FOR INSERT 
  WITH CHECK (get_current_user_role() = 'admin'::text);

CREATE POLICY "Admin users can update inspecoes extintores" 
  ON public.inspecoes_extintores 
  FOR UPDATE 
  USING (get_current_user_role() = 'admin'::text);

CREATE POLICY "Admin users can delete inspecoes extintores" 
  ON public.inspecoes_extintores 
  FOR DELETE 
  USING (get_current_user_role() = 'admin'::text);

-- Phase 3: Fix Function Search Path Issues
-- Update existing functions to use secure search path and proper schema qualification

CREATE OR REPLACE FUNCTION public.get_proximo_lote_recomendado(p_tipo_agente text)
 RETURNS TABLE(lote text, data_vencimento date, quantidade_disponivel integer, dias_para_vencimento integer)
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT 
    aec.lote,
    aec.data_vencimento,
    COUNT(*)::INTEGER as quantidade_disponivel,
    (aec.data_vencimento - CURRENT_DATE)::INTEGER as dias_para_vencimento
  FROM public.agentes_extintores_controle aec
  WHERE aec.tipo_agente = p_tipo_agente 
    AND aec.status_uso = 'disponivel'
    AND aec.data_vencimento > CURRENT_DATE
  GROUP BY aec.lote, aec.data_vencimento
  ORDER BY aec.data_vencimento ASC, aec.lote ASC
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.get_alertas_vencimento_agentes()
 RETURNS TABLE(tipo_agente text, lote text, data_vencimento date, dias_para_vencimento integer, quantidade integer, nivel_alerta text)
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT 
    aec.tipo_agente,
    aec.lote,
    aec.data_vencimento,
    (aec.data_vencimento - CURRENT_DATE)::INTEGER as dias_para_vencimento,
    COUNT(*)::INTEGER as quantidade,
    CASE 
      WHEN aec.data_vencimento <= CURRENT_DATE THEN 'critico'
      WHEN aec.data_vencimento <= CURRENT_DATE + INTERVAL '30 days' THEN 'alto'
      WHEN aec.data_vencimento <= CURRENT_DATE + INTERVAL '60 days' THEN 'medio'
      ELSE 'baixo'
    END as nivel_alerta
  FROM public.agentes_extintores_controle aec
  WHERE aec.status_uso = 'disponivel'
    AND aec.data_vencimento <= CURRENT_DATE + INTERVAL '90 days'
  GROUP BY aec.tipo_agente, aec.lote, aec.data_vencimento
  ORDER BY aec.data_vencimento ASC;
$function$;

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

CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE 
 SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.nextval(sequence_name text)
 RETURNS bigint
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT nextval(sequence_name::regclass);
$function$;
