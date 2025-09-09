-- Fix Function Search Path Mutable warnings
-- Add proper search_path to functions that don't have it set

-- Update functions to have proper search_path for security
CREATE OR REPLACE FUNCTION public.validate_checklist_itens(itens_json jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verificar se é um array
    IF jsonb_typeof(itens_json) != 'array' THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar se cada item tem a estrutura correta
    -- Esta é uma validação básica, pode ser expandida conforme necessário
    RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_taf_historico(p_bombeiro_id uuid, p_limite integer DEFAULT 50)
RETURNS TABLE(id uuid, data_teste date, avaliador_nome character varying, faixa_etaria character varying, idade_na_data integer, flexoes_realizadas integer, abdominais_realizadas integer, polichinelos_realizados integer, tempo_total_segundos integer, tempo_limite_minutos integer, aprovado boolean, observacoes text, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.data_teste,
        t.avaliador_nome,
        t.faixa_etaria,
        t.idade_na_data,
        t.flexoes_realizadas,
        t.abdominais_realizadas,
        t.polichinelos_realizados,
        t.tempo_total_segundos,
        t.tempo_limite_minutos,
        t.aprovado,
        t.observacoes,
        t.created_at
    FROM public.taf_avaliacoes t
    WHERE t.bombeiro_id = p_bombeiro_id
    ORDER BY t.data_teste DESC, t.created_at DESC
    LIMIT p_limite;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_taf_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.registrar_historico_taf()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    
    -- Buscar informações do usuário
    SELECT p.full_name, p.role INTO usuario_info
    FROM public.profiles p
    WHERE p.user_id = auth.uid();
    
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
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;