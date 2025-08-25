
-- Criar tabela para controle de trocas de plantão
CREATE TABLE public.trocas_plantao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data_servico_trocado DATE NOT NULL,
  bombeiro_substituido_id UUID NOT NULL REFERENCES public.bombeiros(id),
  bombeiro_substituto_id UUID NOT NULL REFERENCES public.bombeiros(id),
  data_servico_pagamento DATE NOT NULL,
  equipe_id UUID NOT NULL REFERENCES public.equipes(id),
  base TEXT NOT NULL DEFAULT 'Principal',
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'rejeitada', 'concluida')),
  mes_referencia INTEGER NOT NULL,
  ano_referencia INTEGER NOT NULL,
  observacoes TEXT,
  solicitante_id UUID NOT NULL REFERENCES public.bombeiros(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS (Row Level Security)
ALTER TABLE public.trocas_plantao ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para admins
CREATE POLICY "Admin users can view all trocas plantao" 
  ON public.trocas_plantao 
  FOR SELECT 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can insert trocas plantao" 
  ON public.trocas_plantao 
  FOR INSERT 
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can update trocas plantao" 
  ON public.trocas_plantao 
  FOR UPDATE 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can delete trocas plantao" 
  ON public.trocas_plantao 
  FOR DELETE 
  USING (get_current_user_role() = 'admin');

-- Trigger para atualizar updated_at
CREATE TRIGGER update_trocas_plantao_updated_at
  BEFORE UPDATE ON public.trocas_plantao
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para melhor performance
CREATE INDEX idx_trocas_plantao_mes_ano ON public.trocas_plantao(mes_referencia, ano_referencia);
CREATE INDEX idx_trocas_plantao_equipe ON public.trocas_plantao(equipe_id);
CREATE INDEX idx_trocas_plantao_status ON public.trocas_plantao(status);
CREATE INDEX idx_trocas_plantao_data_servico ON public.trocas_plantao(data_servico_trocado);
