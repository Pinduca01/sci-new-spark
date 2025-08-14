-- Criar tabela para controle de períodos de férias
CREATE TABLE public.periodos_ferias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bombeiro_id UUID NOT NULL REFERENCES public.bombeiros(id) ON DELETE CASCADE,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  mes_referencia INTEGER NOT NULL,
  ano_referencia INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para controle de feristas (substitutos)
CREATE TABLE public.feristas_escalas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bombeiro_ferista_id UUID NOT NULL REFERENCES public.bombeiros(id) ON DELETE CASCADE,
  bombeiro_substituido_id UUID NOT NULL REFERENCES public.bombeiros(id) ON DELETE CASCADE,
  mes_referencia INTEGER NOT NULL,
  ano_referencia INTEGER NOT NULL,
  equipe_anterior_id UUID REFERENCES public.equipes(id),
  equipe_atual_id UUID NOT NULL REFERENCES public.equipes(id),
  periodo_descanso_ate DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(bombeiro_ferista_id, mes_referencia, ano_referencia)
);

-- Adicionar campos na tabela bombeiros para controle de feristas
ALTER TABLE public.bombeiros 
ADD COLUMN IF NOT EXISTS eh_ferista BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS disponivel_para_substituicao BOOLEAN DEFAULT true;

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.periodos_ferias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feristas_escalas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para períodos de férias
CREATE POLICY "Admin users can view all periodos ferias" 
ON public.periodos_ferias FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can insert periodos ferias" 
ON public.periodos_ferias FOR INSERT 
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can update periodos ferias" 
ON public.periodos_ferias FOR UPDATE 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can delete periodos ferias" 
ON public.periodos_ferias FOR DELETE 
USING (get_current_user_role() = 'admin');

-- Políticas RLS para feristas escalas
CREATE POLICY "Admin users can view all feristas escalas" 
ON public.feristas_escalas FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can insert feristas escalas" 
ON public.feristas_escalas FOR INSERT 
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can update feristas escalas" 
ON public.feristas_escalas FOR UPDATE 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can delete feristas escalas" 
ON public.feristas_escalas FOR DELETE 
USING (get_current_user_role() = 'admin');

-- Triggers para updated_at
CREATE TRIGGER update_periodos_ferias_updated_at
BEFORE UPDATE ON public.periodos_ferias
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feristas_escalas_updated_at
BEFORE UPDATE ON public.feristas_escalas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();