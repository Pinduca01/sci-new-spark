-- ==========================================
-- ORDEM CORRETA: REMOVER TUDO PRIMEIRO
-- ==========================================

-- PASSO 1: REMOVER TODAS AS POLICIES ANTIGAS
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname 
              FROM pg_policies 
              WHERE schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- PASSO 2: APAGAR TODOS OS USUÁRIOS EXISTENTES
DELETE FROM public.profiles;

-- PASSO 3: DROPAR FUNÇÃO ANTIGA COM CASCADE
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.get_current_user_base_id() CASCADE;
DROP FUNCTION IF EXISTS public.user_can_access_base(UUID) CASCADE;

-- PASSO 4: REMOVER COLUNAS ANTIGAS DE ROLE
ALTER TABLE public.profiles 
  DROP COLUMN IF EXISTS role CASCADE,
  DROP COLUMN IF EXISTS access_level CASCADE,
  DROP COLUMN IF EXISTS system_access CASCADE,
  DROP COLUMN IF EXISTS cargo CASCADE,
  DROP COLUMN IF EXISTS equipe CASCADE;

-- ==========================================
-- FASE 1: CRIAR SISTEMA DE ROLES SEGURO
-- ==========================================

-- 1.1 Criar ENUM com as 6 roles definidas
CREATE TYPE public.app_role AS ENUM ('admin', 'gs_base', 'ba_ce', 'ba_lr', 'ba_mc', 'ba_2');

-- 1.2 Criar tabela segura de roles
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(user_id, role)
);

-- Índices para performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

-- 1.3 Funções SECURITY DEFINER (anti-privilege escalation)
CREATE OR REPLACE FUNCTION public.user_has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_primary_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY CASE role
    WHEN 'admin' THEN 1
    WHEN 'gs_base' THEN 2
    WHEN 'ba_ce' THEN 3
    WHEN 'ba_lr' THEN 4
    WHEN 'ba_mc' THEN 5
    WHEN 'ba_2' THEN 6
  END
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_user_primary_role(auth.uid())
$$;

-- 1.4 RLS Policies para user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_manage_roles" ON public.user_roles
FOR ALL TO authenticated
USING (public.user_has_role(auth.uid(), 'admin'))
WITH CHECK (public.user_has_role(auth.uid(), 'admin'));

CREATE POLICY "users_view_own_roles" ON public.user_roles
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- ==========================================
-- FASE 2: REESTRUTURAR PROFILES
-- ==========================================

-- 2.1 Garantir que base_id seja obrigatório
ALTER TABLE public.profiles
  ALTER COLUMN base_id SET NOT NULL;

-- 2.2 Trigger para auto-popular base_id de bombeiros
CREATE OR REPLACE FUNCTION public.sync_profile_base_from_bombeiro()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Tentar obter base_id do bombeiro se existir
  SELECT b.base_id INTO NEW.base_id
  FROM public.bombeiros b
  WHERE b.user_id = NEW.user_id
  LIMIT 1;
  
  -- Se não encontrou bombeiro, usar base padrão (Goiânia)
  IF NEW.base_id IS NULL THEN
    SELECT id INTO NEW.base_id
    FROM public.bases
    WHERE nome = 'GOIÂNIA'
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS before_insert_profile_base ON public.profiles;
CREATE TRIGGER before_insert_profile_base
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION sync_profile_base_from_bombeiro();

-- ==========================================
-- FASE 3: FUNÇÕES AUXILIARES PARA RLS
-- ==========================================

CREATE OR REPLACE FUNCTION public.get_current_user_base_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT base_id FROM public.profiles
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.user_can_access_base(_base_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
      AND (
        public.user_has_role(auth.uid(), 'admin')
        OR base_id = _base_id
      )
  )
$$;

-- ==========================================
-- FASE 4: RECRIAR POLICIES COM ISOLAMENTO POR BASE
-- ==========================================

-- === BOMBEIROS ===
ALTER TABLE public.bombeiros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bombeiros_view_isolation" ON public.bombeiros
FOR SELECT TO authenticated
USING (public.user_can_access_base(base_id));

CREATE POLICY "bombeiros_insert_isolation" ON public.bombeiros
FOR INSERT TO authenticated
WITH CHECK (
  public.user_can_access_base(base_id)
  AND (
    public.user_has_role(auth.uid(), 'admin')
    OR public.user_has_role(auth.uid(), 'gs_base')
  )
);

CREATE POLICY "bombeiros_update_isolation" ON public.bombeiros
FOR UPDATE TO authenticated
USING (public.user_can_access_base(base_id))
WITH CHECK (
  public.user_can_access_base(base_id)
  AND (
    public.user_has_role(auth.uid(), 'admin')
    OR public.user_has_role(auth.uid(), 'gs_base')
  )
);

CREATE POLICY "bombeiros_delete_admin_only" ON public.bombeiros
FOR DELETE TO authenticated
USING (
  public.user_can_access_base(base_id)
  AND public.user_has_role(auth.uid(), 'admin')
);

-- === VIATURAS ===
ALTER TABLE public.viaturas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "viaturas_view_isolation" ON public.viaturas
FOR SELECT TO authenticated
USING (public.user_can_access_base(base_id));

CREATE POLICY "viaturas_insert_isolation" ON public.viaturas
FOR INSERT TO authenticated
WITH CHECK (
  public.user_can_access_base(base_id)
  AND (
    public.user_has_role(auth.uid(), 'admin')
    OR public.user_has_role(auth.uid(), 'gs_base')
  )
);

CREATE POLICY "viaturas_update_isolation" ON public.viaturas
FOR UPDATE TO authenticated
USING (public.user_can_access_base(base_id))
WITH CHECK (
  public.user_can_access_base(base_id)
  AND (
    public.user_has_role(auth.uid(), 'admin')
    OR public.user_has_role(auth.uid(), 'gs_base')
  )
);

CREATE POLICY "viaturas_delete_admin_only" ON public.viaturas
FOR DELETE TO authenticated
USING (
  public.user_can_access_base(base_id)
  AND public.user_has_role(auth.uid(), 'admin')
);

-- === CHECKLISTS VIATURAS ===
ALTER TABLE public.checklists_viaturas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checklists_viaturas_view_isolation" ON public.checklists_viaturas
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.viaturas v
    WHERE v.id = checklists_viaturas.viatura_id
    AND public.user_can_access_base(v.base_id)
  )
);

CREATE POLICY "checklists_viaturas_insert_isolation" ON public.checklists_viaturas
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.viaturas v
    WHERE v.id = checklists_viaturas.viatura_id
    AND public.user_can_access_base(v.base_id)
  )
  AND (
    public.user_has_role(auth.uid(), 'admin')
    OR public.user_has_role(auth.uid(), 'ba_mc')
    OR public.user_has_role(auth.uid(), 'ba_2')
  )
);

CREATE POLICY "checklists_viaturas_update_isolation" ON public.checklists_viaturas
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.viaturas v
    WHERE v.id = checklists_viaturas.viatura_id
    AND public.user_can_access_base(v.base_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.viaturas v
    WHERE v.id = checklists_viaturas.viatura_id
    AND public.user_can_access_base(v.base_id)
  )
  AND (
    public.user_has_role(auth.uid(), 'admin')
    OR public.user_has_role(auth.uid(), 'ba_mc')
    OR public.user_has_role(auth.uid(), 'ba_2')
  )
);

CREATE POLICY "checklists_viaturas_delete_isolation" ON public.checklists_viaturas
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.viaturas v
    WHERE v.id = checklists_viaturas.viatura_id
    AND public.user_can_access_base(v.base_id)
  )
  AND (
    public.user_has_role(auth.uid(), 'admin')
    OR public.user_has_role(auth.uid(), 'gs_base')
    OR public.user_has_role(auth.uid(), 'ba_ce')
    OR public.user_has_role(auth.uid(), 'ba_lr')
  )
);

-- === CHECKLIST TEMPLATES (apenas admin pode criar/editar) ===
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checklist_templates_view_all" ON public.checklist_templates
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "checklist_templates_admin_only" ON public.checklist_templates
FOR ALL TO authenticated
USING (public.user_has_role(auth.uid(), 'admin'))
WITH CHECK (public.user_has_role(auth.uid(), 'admin'));

-- === BASES ===
ALTER TABLE public.bases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bases_view_all" ON public.bases
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "bases_admin_manage" ON public.bases
FOR ALL TO authenticated
USING (public.user_has_role(auth.uid(), 'admin'))
WITH CHECK (public.user_has_role(auth.uid(), 'admin'));

-- === PROFILES ===
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_view_own" ON public.profiles
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.user_has_role(auth.uid(), 'admin')
);

CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_admin_manage" ON public.profiles
FOR ALL TO authenticated
USING (public.user_has_role(auth.uid(), 'admin'))
WITH CHECK (public.user_has_role(auth.uid(), 'admin'));

-- === EQUIPES ===
ALTER TABLE public.equipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "equipes_view_all" ON public.equipes
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "equipes_admin_manage" ON public.equipes
FOR ALL TO authenticated
USING (public.user_has_role(auth.uid(), 'admin'))
WITH CHECK (public.user_has_role(auth.uid(), 'admin'));

-- === CHECKLISTS ALMOXARIFADO ===
ALTER TABLE public.checklists_almoxarifado ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checklists_almoxarifado_view_all" ON public.checklists_almoxarifado
FOR SELECT TO authenticated
USING (public.user_has_role(auth.uid(), 'admin'));

CREATE POLICY "checklists_almoxarifado_admin_manage" ON public.checklists_almoxarifado
FOR ALL TO authenticated
USING (public.user_has_role(auth.uid(), 'admin'))
WITH CHECK (public.user_has_role(auth.uid(), 'admin'));

-- === MATERIAIS ===
ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "materiais_view_all" ON public.materiais
FOR SELECT TO authenticated
USING (public.user_has_role(auth.uid(), 'admin'));

CREATE POLICY "materiais_admin_manage" ON public.materiais
FOR ALL TO authenticated
USING (public.user_has_role(auth.uid(), 'admin'))
WITH CHECK (public.user_has_role(auth.uid(), 'admin'));

-- === ESTOQUE ALMOXARIFADO ===
ALTER TABLE public.estoque_almoxarifado ENABLE ROW LEVEL SECURITY;

CREATE POLICY "estoque_almoxarifado_admin_view" ON public.estoque_almoxarifado
FOR SELECT TO authenticated
USING (public.user_has_role(auth.uid(), 'admin'));

CREATE POLICY "estoque_almoxarifado_admin_manage" ON public.estoque_almoxarifado
FOR ALL TO authenticated
USING (public.user_has_role(auth.uid(), 'admin'))
WITH CHECK (public.user_has_role(auth.uid(), 'admin'));

-- === TAF AVALIACOES ===
ALTER TABLE public.taf_avaliacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "taf_avaliacoes_view_all" ON public.taf_avaliacoes
FOR SELECT TO authenticated
USING (public.user_has_role(auth.uid(), 'admin') OR public.user_has_role(auth.uid(), 'gs_base'));

CREATE POLICY "taf_avaliacoes_admin_gs_manage" ON public.taf_avaliacoes
FOR ALL TO authenticated
USING (public.user_has_role(auth.uid(), 'admin') OR public.user_has_role(auth.uid(), 'gs_base'))
WITH CHECK (public.user_has_role(auth.uid(), 'admin') OR public.user_has_role(auth.uid(), 'gs_base'));

-- === AGENTES EXTINTORES ===
ALTER TABLE public.agentes_extintores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agentes_extintores_view_auth" ON public.agentes_extintores
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "agentes_extintores_admin_manage" ON public.agentes_extintores
FOR ALL TO authenticated
USING (public.user_has_role(auth.uid(), 'admin'))
WITH CHECK (public.user_has_role(auth.uid(), 'admin'));