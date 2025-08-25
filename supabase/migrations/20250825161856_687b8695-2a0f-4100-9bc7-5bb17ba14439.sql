
-- Criar tabela para controle específico de agentes extintores
CREATE TABLE public.agentes_extintores_controle (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID NOT NULL REFERENCES public.materiais(id),
  lote TEXT NOT NULL,
  data_fabricacao DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  tipo_agente TEXT NOT NULL CHECK (tipo_agente IN ('LGE', 'PQS')),
  capacidade NUMERIC NOT NULL,
  unidade_capacidade TEXT NOT NULL DEFAULT 'kg',
  localizacao_fisica TEXT,
  status_uso TEXT NOT NULL DEFAULT 'disponivel' CHECK (status_uso IN ('disponivel', 'em_uso', 'vencido', 'descartado')),
  viatura_id UUID REFERENCES public.viaturas(id),
  data_ultima_recarga DATE,
  proxima_recarga DATE,
  numero_recargas INTEGER DEFAULT 0,
  custo_unitario NUMERIC DEFAULT 0,
  fornecedor TEXT,
  numero_serie TEXT,
  qr_code TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para otimização
CREATE INDEX idx_agentes_extintores_tipo ON public.agentes_extintores_controle(tipo_agente);
CREATE INDEX idx_agentes_extintores_vencimento ON public.agentes_extintores_controle(data_vencimento);
CREATE INDEX idx_agentes_extintores_status ON public.agentes_extintores_controle(status_uso);
CREATE INDEX idx_agentes_extintores_viatura ON public.agentes_extintores_controle(viatura_id);
CREATE INDEX idx_agentes_extintores_lote ON public.agentes_extintores_controle(lote);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_agentes_extintores_updated_at
  BEFORE UPDATE ON public.agentes_extintores_controle
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Criar tabela para histórico de recargas
CREATE TABLE public.historico_recargas_agentes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agente_extintor_id UUID NOT NULL REFERENCES public.agentes_extintores_controle(id),
  viatura_id UUID REFERENCES public.viaturas(id),
  data_recarga DATE NOT NULL,
  tipo_manutencao TEXT NOT NULL CHECK (tipo_manutencao IN ('recarga', 'teste_hidrostatico', 'manutencao_preventiva', 'troca_completa')),
  responsavel_id UUID REFERENCES public.bombeiros(id),
  responsavel_nome TEXT NOT NULL,
  custo NUMERIC DEFAULT 0,
  observacoes TEXT,
  proxima_manutencao DATE,
  empresa_responsavel TEXT,
  certificado_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para histórico
CREATE INDEX idx_historico_recargas_agente ON public.historico_recargas_agentes(agente_extintor_id);
CREATE INDEX idx_historico_recargas_viatura ON public.historico_recargas_agentes(viatura_id);
CREATE INDEX idx_historico_recargas_data ON public.historico_recargas_agentes(data_recarga);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.agentes_extintores_controle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_recargas_agentes ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para agentes_extintores_controle
CREATE POLICY "Admin users can view all agentes extintores controle" 
  ON public.agentes_extintores_controle 
  FOR SELECT 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can insert agentes extintores controle" 
  ON public.agentes_extintores_controle 
  FOR INSERT 
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can update agentes extintores controle" 
  ON public.agentes_extintores_controle 
  FOR UPDATE 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can delete agentes extintores controle" 
  ON public.agentes_extintores_controle 
  FOR DELETE 
  USING (get_current_user_role() = 'admin');

-- Criar políticas RLS para historico_recargas_agentes
CREATE POLICY "Admin users can view all historico recargas agentes" 
  ON public.historico_recargas_agentes 
  FOR SELECT 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can insert historico recargas agentes" 
  ON public.historico_recargas_agentes 
  FOR INSERT 
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can update historico recargas agentes" 
  ON public.historico_recargas_agentes 
  FOR UPDATE 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can delete historico recargas agentes" 
  ON public.historico_recargas_agentes 
  FOR DELETE 
  USING (get_current_user_role() = 'admin');

-- Criar função para recomendação de lotes (FIFO)
CREATE OR REPLACE FUNCTION public.get_proximo_lote_recomendado(p_tipo_agente TEXT)
RETURNS TABLE (
  lote TEXT,
  data_vencimento DATE,
  quantidade_disponivel INTEGER,
  dias_para_vencimento INTEGER
)
LANGUAGE sql
STABLE
AS $$
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
$$;

-- Criar função para alertas de vencimento
CREATE OR REPLACE FUNCTION public.get_alertas_vencimento_agentes()
RETURNS TABLE (
  tipo_agente TEXT,
  lote TEXT,
  data_vencimento DATE,
  dias_para_vencimento INTEGER,
  quantidade INTEGER,
  nivel_alerta TEXT
)
LANGUAGE sql
STABLE
AS $$
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
$$;
