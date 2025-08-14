-- Criar tabela de equipes
CREATE TABLE public.equipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_equipe TEXT NOT NULL UNIQUE,
  cor_identificacao TEXT NOT NULL,
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir equipes padrão
INSERT INTO public.equipes (nome_equipe, cor_identificacao) VALUES
('Alfa', '#ef4444'),
('Bravo', '#3b82f6'), 
('Charlie', '#22c55e'),
('Delta', '#f59e0b');

-- Criar tabela de escalas geradas
CREATE TABLE public.escalas_geradas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL,
  equipe_id UUID NOT NULL REFERENCES public.equipes(id),
  mes_referencia INTEGER NOT NULL,
  ano_referencia INTEGER NOT NULL,
  regime_plantao TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(data, mes_referencia, ano_referencia)
);

-- Adicionar coluna equipe para bombeiros (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bombeiros' AND column_name = 'equipe_id') THEN
    ALTER TABLE public.bombeiros ADD COLUMN equipe_id UUID REFERENCES public.equipes(id);
    
    -- Atualizar bombeiros existentes com equipes baseado na coluna 'equipe'
    UPDATE public.bombeiros SET equipe_id = (
      SELECT id FROM public.equipes WHERE nome_equipe = bombeiros.equipe
    ) WHERE equipe IS NOT NULL;
  END IF;
END $$;

-- Habilitar RLS
ALTER TABLE public.equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalas_geradas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para equipes
CREATE POLICY "Admin users can view all equipes" 
ON public.equipes FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can insert equipes" 
ON public.equipes FOR INSERT 
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can update equipes" 
ON public.equipes FOR UPDATE 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can delete equipes" 
ON public.equipes FOR DELETE 
USING (get_current_user_role() = 'admin');

-- Políticas RLS para escalas geradas
CREATE POLICY "Admin users can view all escalas geradas" 
ON public.escalas_geradas FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can insert escalas geradas" 
ON public.escalas_geradas FOR INSERT 
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can update escalas geradas" 
ON public.escalas_geradas FOR UPDATE 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can delete escalas geradas" 
ON public.escalas_geradas FOR DELETE 
USING (get_current_user_role() = 'admin');

-- Triggers para updated_at
CREATE TRIGGER update_equipes_updated_at
BEFORE UPDATE ON public.equipes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_escalas_geradas_updated_at
BEFORE UPDATE ON public.escalas_geradas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();