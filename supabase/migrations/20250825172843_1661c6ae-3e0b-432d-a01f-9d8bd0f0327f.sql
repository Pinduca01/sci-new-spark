
-- Criar tabela para os quadrantes do aeroporto
CREATE TABLE public.quadrantes_aeroporto (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_quadrante TEXT NOT NULL,
  descricao TEXT,
  equipe_responsavel_id UUID REFERENCES public.equipes(id),
  cor_identificacao TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para extintores fixos do aeroporto
CREATE TABLE public.extintores_aeroporto (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_extintor TEXT NOT NULL UNIQUE,
  localizacao_detalhada TEXT NOT NULL,
  quadrante_id UUID NOT NULL REFERENCES public.quadrantes_aeroporto(id),
  tipo_extintor TEXT NOT NULL,
  capacidade NUMERIC NOT NULL,
  unidade_capacidade TEXT NOT NULL DEFAULT 'kg',
  fabricante TEXT,
  data_fabricacao DATE,
  data_instalacao DATE NOT NULL,
  ultima_recarga DATE,
  proxima_recarga DATE,
  ultimo_teste_hidrostatico DATE,
  proximo_teste_hidrostatico DATE,
  status TEXT NOT NULL DEFAULT 'ativo',
  qr_code TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para registrar inspeções de extintores
CREATE TABLE public.inspecoes_extintores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  extintor_id UUID NOT NULL REFERENCES public.extintores_aeroporto(id),
  bombeiro_inspetor_id UUID NOT NULL REFERENCES public.bombeiros(id),
  data_inspecao DATE NOT NULL DEFAULT CURRENT_DATE,
  hora_inspecao TIME WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIME,
  tipo_inspecao TEXT NOT NULL DEFAULT 'rotina',
  status_extintor TEXT NOT NULL DEFAULT 'conforme',
  itens_verificados JSONB NOT NULL DEFAULT '[]'::jsonb,
  observacoes TEXT,
  proxima_inspecao DATE,
  assinatura_digital TEXT,
  fotos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS às novas tabelas
ALTER TABLE public.quadrantes_aeroporto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extintores_aeroporto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspecoes_extintores ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para quadrantes_aeroporto
CREATE POLICY "Admin users can view all quadrantes aeroporto" 
  ON public.quadrantes_aeroporto FOR SELECT 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can insert quadrantes aeroporto" 
  ON public.quadrantes_aeroporto FOR INSERT 
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can update quadrantes aeroporto" 
  ON public.quadrantes_aeroporto FOR UPDATE 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can delete quadrantes aeroporto" 
  ON public.quadrantes_aeroporto FOR DELETE 
  USING (get_current_user_role() = 'admin');

-- Políticas RLS para extintores_aeroporto
CREATE POLICY "Admin users can view all extintores aeroporto" 
  ON public.extintores_aeroporto FOR SELECT 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can insert extintores aeroporto" 
  ON public.extintores_aeroporto FOR INSERT 
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can update extintores aeroporto" 
  ON public.extintores_aeroporto FOR UPDATE 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can delete extintores aeroporto" 
  ON public.extintores_aeroporto FOR DELETE 
  USING (get_current_user_role() = 'admin');

-- Políticas RLS para inspecoes_extintores
CREATE POLICY "Admin users can view all inspecoes extintores" 
  ON public.inspecoes_extintores FOR SELECT 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can insert inspecoes extintores" 
  ON public.inspecoes_extintores FOR INSERT 
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can update inspecoes extintores" 
  ON public.inspecoes_extintores FOR UPDATE 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can delete inspecoes extintores" 
  ON public.inspecoes_extintores FOR DELETE 
  USING (get_current_user_role() = 'admin');

-- Inserir quadrantes padrão do aeroporto
INSERT INTO public.quadrantes_aeroporto (nome_quadrante, descricao, cor_identificacao) VALUES
('Quadrante Norte', 'Área norte do aeroporto - Terminal de passageiros', '#3B82F6'),
('Quadrante Sul', 'Área sul do aeroporto - Pistas e hangares', '#EF4444'),
('Quadrante Leste', 'Área leste do aeroporto - Área de carga', '#10B981'),
('Quadrante Oeste', 'Área oeste do aeroporto - Área administrativa', '#F59E0B');

-- Trigger para atualizar updated_at
CREATE TRIGGER update_quadrantes_aeroporto_updated_at
  BEFORE UPDATE ON public.quadrantes_aeroporto
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_extintores_aeroporto_updated_at
  BEFORE UPDATE ON public.extintores_aeroporto
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inspecoes_extintores_updated_at
  BEFORE UPDATE ON public.inspecoes_extintores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
