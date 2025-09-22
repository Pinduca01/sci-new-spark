-- ETAPA 2B: CORREÇÃO DOS 4 ERROS RESTANTES DE SECURITY DEFINER
-- ========================================================

-- Corrigir função update_taf_updated_at que ainda tem SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.update_taf_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER  -- Removido SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- Corrigir função registrar_historico_taf que ainda tem SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.registrar_historico_taf()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER  -- Removido SECURITY DEFINER
SET search_path = public
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

-- Corrigir função validate_checklist_itens
CREATE OR REPLACE FUNCTION public.validate_checklist_itens(itens_json jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER  -- Removido SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    -- Verificar se é um array
    IF jsonb_typeof(itens_json) != 'array' THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar se cada item tem a estrutura correta
    -- Esta é uma validação básica, pode ser expandida conforme necessário
    RETURN TRUE;
END;
$function$;

-- Corrigir função nextval que ainda tem SECURITY DEFINER desnecessário
CREATE OR REPLACE FUNCTION public.nextval(sequence_name text)
RETURNS bigint
LANGUAGE sql
SECURITY INVOKER  -- Removido SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT nextval(sequence_name::regclass);
$function$;

-- Comentários de auditoria
COMMENT ON FUNCTION public.update_taf_updated_at IS 'Trigger: Convertido para SECURITY INVOKER - Etapa 2B';
COMMENT ON FUNCTION public.registrar_historico_taf IS 'Trigger: Convertido para SECURITY INVOKER com verificações - Etapa 2B';
COMMENT ON FUNCTION public.validate_checklist_itens IS 'Validação: Convertido para SECURITY INVOKER - Etapa 2B';
COMMENT ON FUNCTION public.nextval IS 'Utilitário: Convertido para SECURITY INVOKER - Etapa 2B';