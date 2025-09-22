-- ETAPA 2: CORREÇÃO DE VIEWS SECURITY DEFINER (VERSÃO FINAL)
-- ========================================================

-- 1. GRUPO A: CONVERTER PARA SECURITY INVOKER (Funções TAF que não precisam privilégios especiais)
-- ========================================================

-- Recriar função de criação TAF sem SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.fn_create_taf_avaliacao(
    p_bombeiro_id uuid, 
    p_flexoes_realizadas integer, 
    p_abdominais_realizadas integer, 
    p_polichinelos_realizados integer, 
    p_tempo_total_segundos integer, 
    p_aprovado boolean, 
    p_idade_na_data integer, 
    p_faixa_etaria character varying, 
    p_tempo_limite_minutos integer DEFAULT 12, 
    p_data_teste date DEFAULT CURRENT_DATE, 
    p_avaliador_nome character varying DEFAULT NULL::character varying, 
    p_observacoes text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER  -- Removido SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    novo_id UUID;
BEGIN
    -- Verificação de permissão explícita
    IF NOT (get_current_user_role() IN ('admin', 'supervisor')) THEN
        RAISE EXCEPTION 'Acesso negado: apenas admin e supervisor podem criar avaliações TAF';
    END IF;
    
    INSERT INTO public.taf_avaliacoes_completa (
        bombeiro_id, flexoes_realizadas, abdominais_realizadas, polichinelos_realizados,
        tempo_total_segundos, aprovado, idade_na_data, faixa_etaria, tempo_limite_minutos,
        data_teste, avaliador_nome, observacoes
    ) VALUES (
        p_bombeiro_id, p_flexoes_realizadas, p_abdominais_realizadas, p_polichinelos_realizados,
        p_tempo_total_segundos, p_aprovado, p_idade_na_data, p_faixa_etaria, p_tempo_limite_minutos,
        p_data_teste, p_avaliador_nome, p_observacoes
    ) RETURNING id INTO novo_id;
    
    RETURN novo_id;
END;
$function$;

-- Recriar função de leitura TAF sem SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.fn_read_taf_avaliacoes(
    p_limit integer DEFAULT 100, 
    p_offset integer DEFAULT 0, 
    p_bombeiro_id uuid DEFAULT NULL::uuid, 
    p_data_inicio date DEFAULT NULL::date, 
    p_data_fim date DEFAULT NULL::date, 
    p_aprovado boolean DEFAULT NULL::boolean
)
RETURNS TABLE(
    id uuid, bombeiro_id uuid, flexoes_realizadas integer, abdominais_realizadas integer, 
    polichinelos_realizados integer, tempo_total_segundos integer, aprovado boolean, 
    idade_na_data integer, faixa_etaria character varying, tempo_limite_minutos integer, 
    data_teste date, avaliador_nome character varying, observacoes text, 
    created_at timestamp with time zone, updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY INVOKER  -- Removido SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    -- Verificação de permissão explícita
    IF NOT (get_current_user_role() IN ('admin', 'supervisor') OR auth.uid() IS NOT NULL) THEN
        RAISE EXCEPTION 'Acesso negado: usuário deve estar autenticado';
    END IF;
    
    RETURN QUERY
    SELECT 
        t.id, t.bombeiro_id,
        t.flexoes_realizadas, t.abdominais_realizadas, t.polichinelos_realizados,
        t.tempo_total_segundos, t.aprovado,
        t.idade_na_data, t.faixa_etaria, t.tempo_limite_minutos,
        t.data_teste, t.avaliador_nome, t.observacoes,
        t.created_at, t.updated_at
    FROM public.taf_avaliacoes_completa t
    WHERE 
        (p_bombeiro_id IS NULL OR t.bombeiro_id = p_bombeiro_id)
        AND (p_data_inicio IS NULL OR t.data_teste >= p_data_inicio)
        AND (p_data_fim IS NULL OR t.data_teste <= p_data_fim)
        AND (p_aprovado IS NULL OR t.aprovado = p_aprovado)
    ORDER BY t.data_teste DESC, t.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$function$;

-- Recriar função de atualização TAF sem SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.fn_update_taf_avaliacao(
    p_id uuid, 
    p_flexoes_realizadas integer DEFAULT NULL::integer, 
    p_abdominais_realizadas integer DEFAULT NULL::integer, 
    p_polichinelos_realizados integer DEFAULT NULL::integer, 
    p_tempo_total_segundos integer DEFAULT NULL::integer, 
    p_aprovado boolean DEFAULT NULL::boolean, 
    p_observacoes text DEFAULT NULL::text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER  -- Removido SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    registro_existe BOOLEAN;
BEGIN
    -- Verificação de permissão explícita
    IF NOT (get_current_user_role() IN ('admin', 'supervisor')) THEN
        RAISE EXCEPTION 'Acesso negado: apenas admin e supervisor podem atualizar avaliações TAF';
    END IF;
    
    -- Verificar se o registro existe
    SELECT EXISTS(SELECT 1 FROM public.taf_avaliacoes_completa WHERE id = p_id) INTO registro_existe;
    
    IF NOT registro_existe THEN
        RAISE EXCEPTION 'Registro TAF com ID % não encontrado', p_id;
    END IF;
    
    -- Atualizar apenas campos não nulos
    UPDATE public.taf_avaliacoes_completa
    SET 
        flexoes_realizadas = COALESCE(p_flexoes_realizadas, flexoes_realizadas),
        abdominais_realizadas = COALESCE(p_abdominais_realizadas, abdominais_realizadas),
        polichinelos_realizados = COALESCE(p_polichinelos_realizados, polichinelos_realizados),
        tempo_total_segundos = COALESCE(p_tempo_total_segundos, tempo_total_segundos),
        aprovado = COALESCE(p_aprovado, aprovado),
        observacoes = COALESCE(p_observacoes, observacoes)
    WHERE id = p_id;
    
    RETURN TRUE;
END;
$function$;

-- 2. GRUPO B: MANTER SECURITY DEFINER MAS COM PROTEÇÕES CRÍTICAS
-- ========================================================

-- Melhorar função de exclusão TAF com proteções reforçadas
CREATE OR REPLACE FUNCTION public.fn_delete_taf_avaliacao(
    p_id uuid, 
    p_motivo_exclusao text DEFAULT 'Exclusão solicitada pelo usuário'::text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER  -- Mantido por precisar de privilégios para histórico
SET search_path = public, pg_temp  -- Proteção contra path injection
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

-- Melhorar função get_current_user_role com proteções
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp  -- Proteção contra path injection
AS $function$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$function$;

-- Melhorar função handle_new_user com proteções
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER  -- Necessário para inserir em profiles
SET search_path = public, pg_temp  -- Proteção contra path injection
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

-- 3. AUDITORIA E VALIDAÇÃO DE OUTRAS FUNÇÕES CRÍTICAS
-- ========================================================

-- Melhorar função de histórico TAF com proteções
CREATE OR REPLACE FUNCTION public.get_taf_historico(p_bombeiro_id uuid, p_limite integer DEFAULT 50)
RETURNS TABLE(
    id uuid, data_teste date, avaliador_nome character varying, 
    faixa_etaria character varying, idade_na_data integer, 
    flexoes_realizadas integer, abdominais_realizadas integer, 
    polichinelos_realizados integer, tempo_total_segundos integer, 
    tempo_limite_minutos integer, aprovado boolean, 
    observacoes text, created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY INVOKER  -- Convertido para INVOKER
SET search_path = public
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

-- Comentários para compliance e auditoria
COMMENT ON FUNCTION public.fn_create_taf_avaliacao IS 'TAF: Função convertida para SECURITY INVOKER - Etapa 2';
COMMENT ON FUNCTION public.fn_read_taf_avaliacoes IS 'TAF: Função convertida para SECURITY INVOKER - Etapa 2';
COMMENT ON FUNCTION public.fn_update_taf_avaliacao IS 'TAF: Função convertida para SECURITY INVOKER - Etapa 2';
COMMENT ON FUNCTION public.fn_delete_taf_avaliacao IS 'TAF: Mantido SECURITY DEFINER com proteções reforçadas - Etapa 2';
COMMENT ON FUNCTION public.get_current_user_role IS 'Sistema: Mantido SECURITY DEFINER com search_path seguro - Etapa 2';