-- ETAPA 3: CORREÇÃO DE SEARCH PATH EM FUNÇÕES
-- ===============================================
-- Contexto: Sistema SCI-Core Bombeiros Aeroportuários GYN
-- Criticidade: ALTA - Prevenir schema injection em sistema de segurança crítica
-- Objetivo: Eliminar 6 WARNINGs "Function Search Path Mutable"

-- 1. FUNÇÃO: get_current_user_role (SECURITY DEFINER - CRÍTICA)
-- Impacto: Controle de acesso em todo o sistema
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$function$;

-- 2. FUNÇÃO: handle_new_user (SECURITY DEFINER - CRÍTICA)
-- Impacto: Criação de perfis de usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Validação de dados de entrada
  IF NEW.id IS NULL OR NEW.email IS NULL THEN
    RAISE EXCEPTION 'Dados inválidos para criação de perfil';
  END IF;
  
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  RETURN NEW;
END;
$function$;

-- 3. FUNÇÃO: update_updated_at_column (TRIGGER - OPERACIONAL)
-- Impacto: Timestamps em múltiplas tabelas
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- 4. FUNÇÃO: update_taf_updated_at (TRIGGER - TAF)
-- Impacto: Timestamps em avaliações TAF
CREATE OR REPLACE FUNCTION public.update_taf_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- 5. FUNÇÃO: update_tp_verificacoes_updated_at (TRIGGER - TP)
-- Impacto: Timestamps em verificações de TP
CREATE OR REPLACE FUNCTION public.update_tp_verificacoes_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 6. FUNÇÃO: update_tp_verificacoes_detalhes_updated_at (TRIGGER - TP Detalhes)
-- Impacto: Timestamps em detalhes de verificações TP
CREATE OR REPLACE FUNCTION public.update_tp_verificacoes_detalhes_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 7. FUNÇÃO: update_uniformes_contadores (TRIGGER - Uniformes)
-- Impacto: Contadores automáticos de conformidade
CREATE OR REPLACE FUNCTION public.update_uniformes_contadores()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
    -- Contar itens conformes
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
    
    -- Contar itens não conformes
    NEW.itens_nao_conformes := NEW.total_itens_verificados - NEW.itens_conformes;
    
    -- Definir status geral baseado na conformidade
    IF NEW.itens_nao_conformes = 0 THEN
        NEW.status := 'APROVADO';
    ELSIF NEW.itens_conformes = 0 THEN
        NEW.status := 'REPROVADO';
    ELSE
        NEW.status := 'PENDENTE';
    END IF;
    
    -- Atualizar timestamp
    NEW.updated_at := now();
    
    RETURN NEW;
END;
$function$;

-- 8. FUNÇÃO: registrar_historico_taf (TRIGGER - TAF Histórico)
-- Impacto: Auditoria de mudanças em avaliações TAF
CREATE OR REPLACE FUNCTION public.registrar_historico_taf()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
DECLARE
    operacao_tipo VARCHAR(10);
    dados_antigos JSONB;
    dados_novos JSONB;
    campos_alterados_array TEXT[];
    usuario_info RECORD;
BEGIN
    -- Determinar tipo de operação
    IF TG_OP = 'INSERT' THEN
        operacao_tipo := 'CREATE';
        dados_antigos := NULL;
        dados_novos := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        operacao_tipo := 'UPDATE';
        dados_antigos := to_jsonb(OLD);
        dados_novos := to_jsonb(NEW);
        
        -- Identificar campos alterados
        SELECT array_agg(key) INTO campos_alterados_array
        FROM jsonb_each_text(dados_antigos) old_data
        JOIN jsonb_each_text(dados_novos) new_data ON old_data.key = new_data.key
        WHERE old_data.value IS DISTINCT FROM new_data.value;
        
    ELSIF TG_OP = 'DELETE' THEN
        operacao_tipo := 'DELETE';
        dados_antigos := to_jsonb(OLD);
        dados_novos := NULL;
    END IF;
    
    -- Buscar informações do usuário (com verificação de segurança)
    IF auth.uid() IS NOT NULL THEN
        SELECT p.full_name, p.role INTO usuario_info
        FROM public.profiles p
        WHERE p.user_id = auth.uid();
    END IF;
    
    -- Inserir registro no histórico
    INSERT INTO public.taf_avaliacoes_historico (
        taf_avaliacao_id,
        operacao,
        dados_anteriores,
        dados_novos,
        campos_alterados,
        usuario_responsavel,
        usuario_nome,
        usuario_role
    ) VALUES (
        COALESCE(NEW.id, OLD.id),
        operacao_tipo,
        dados_antigos,
        dados_novos,
        campos_alterados_array,
        auth.uid(),
        usuario_info.full_name,
        usuario_info.role
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$function$;

-- DOCUMENTAÇÃO DE COMPLIANCE
COMMENT ON FUNCTION public.get_current_user_role() IS 'ETAPA 3: Search path fixado para prevenir schema injection';
COMMENT ON FUNCTION public.handle_new_user() IS 'ETAPA 3: Search path fixado para prevenir schema injection';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'ETAPA 3: Search path fixado para prevenir schema injection';
COMMENT ON FUNCTION public.update_taf_updated_at() IS 'ETAPA 3: Search path fixado para prevenir schema injection';
COMMENT ON FUNCTION public.update_tp_verificacoes_updated_at() IS 'ETAPA 3: Search path fixado para prevenir schema injection';
COMMENT ON FUNCTION public.update_tp_verificacoes_detalhes_updated_at() IS 'ETAPA 3: Search path fixado para prevenir schema injection';
COMMENT ON FUNCTION public.update_uniformes_contadores() IS 'ETAPA 3: Search path fixado para prevenir schema injection';
COMMENT ON FUNCTION public.registrar_historico_taf() IS 'ETAPA 3: Search path fixado para prevenir schema injection';

-- LOG DE AUDITORIA
COMMENT ON DATABASE postgres IS 'ETAPA 3 CONCLUÍDA: Function Search Path vulnerabilities corrigidas - 8 funções protegidas contra schema injection';

-- VERIFICAÇÃO FINAL (para executar após migration)
-- SELECT proname, prosecdef, search_path 
-- FROM pg_proc p 
-- JOIN pg_namespace n ON p.pronamespace = n.oid 
-- WHERE n.nspname = 'public' 
-- AND proname IN ('get_current_user_role', 'handle_new_user', 'update_updated_at_column', 
--                 'update_taf_updated_at', 'update_tp_verificacoes_updated_at', 
--                 'update_tp_verificacoes_detalhes_updated_at', 'update_uniformes_contadores', 
--                 'registrar_historico_taf');