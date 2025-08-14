-- Criar tabela de viaturas
CREATE TABLE public.viaturas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prefixo TEXT NOT NULL UNIQUE,
  placa TEXT NOT NULL,
  modelo TEXT NOT NULL,
  ano INTEGER NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'Ambulância',
  status TEXT NOT NULL DEFAULT 'ativo',
  km_atual INTEGER DEFAULT 0,
  data_ultima_revisao DATE,
  proxima_revisao DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de checklists de viaturas
CREATE TABLE public.checklists_viaturas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  viatura_id UUID NOT NULL REFERENCES public.viaturas(id) ON DELETE CASCADE,
  tipo_checklist TEXT NOT NULL, -- 'BA-MC' ou 'BA-2'
  bombeiro_responsavel TEXT NOT NULL,
  data_checklist DATE NOT NULL DEFAULT CURRENT_DATE,
  hora_checklist TIME NOT NULL DEFAULT CURRENT_TIME,
  status_geral TEXT NOT NULL DEFAULT 'em_andamento', -- 'conforme', 'nao_conforme', 'em_andamento'
  itens_checklist JSONB NOT NULL DEFAULT '[]',
  observacoes_gerais TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de ordens de serviço
CREATE TABLE public.ordens_servico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  viatura_id UUID NOT NULL REFERENCES public.viaturas(id) ON DELETE CASCADE,
  numero_os TEXT NOT NULL UNIQUE,
  tipo_servico TEXT NOT NULL, -- 'viatura', 'material'
  descricao_problema TEXT NOT NULL,
  prioridade TEXT NOT NULL DEFAULT 'media', -- 'alta', 'media', 'baixa'
  status TEXT NOT NULL DEFAULT 'aberta', -- 'aberta', 'em_andamento', 'concluida', 'cancelada'
  data_abertura DATE NOT NULL DEFAULT CURRENT_DATE,
  data_conclusao DATE,
  bombeiro_solicitante TEXT NOT NULL,
  responsavel_manutencao TEXT,
  materiais_utilizados TEXT,
  observacoes TEXT,
  custo_total DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.viaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists_viaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para viaturas
CREATE POLICY "Admin users can view all viaturas" 
ON public.viaturas 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can insert viaturas" 
ON public.viaturas 
FOR INSERT 
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can update viaturas" 
ON public.viaturas 
FOR UPDATE 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can delete viaturas" 
ON public.viaturas 
FOR DELETE 
USING (get_current_user_role() = 'admin');

-- Políticas RLS para checklists de viaturas
CREATE POLICY "Admin users can view all checklists viaturas" 
ON public.checklists_viaturas 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can insert checklists viaturas" 
ON public.checklists_viaturas 
FOR INSERT 
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can update checklists viaturas" 
ON public.checklists_viaturas 
FOR UPDATE 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can delete checklists viaturas" 
ON public.checklists_viaturas 
FOR DELETE 
USING (get_current_user_role() = 'admin');

-- Políticas RLS para ordens de serviço
CREATE POLICY "Admin users can view all ordens servico" 
ON public.ordens_servico 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can insert ordens servico" 
ON public.ordens_servico 
FOR INSERT 
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can update ordens servico" 
ON public.ordens_servico 
FOR UPDATE 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can delete ordens servico" 
ON public.ordens_servico 
FOR DELETE 
USING (get_current_user_role() = 'admin');

-- Trigger para updated_at nas viaturas
CREATE TRIGGER update_viaturas_updated_at
BEFORE UPDATE ON public.viaturas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para updated_at nos checklists
CREATE TRIGGER update_checklists_viaturas_updated_at
BEFORE UPDATE ON public.checklists_viaturas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para updated_at nas ordens de serviço
CREATE TRIGGER update_ordens_servico_updated_at
BEFORE UPDATE ON public.ordens_servico
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados de exemplo
INSERT INTO public.viaturas (prefixo, placa, modelo, ano, tipo, km_atual, data_ultima_revisao, proxima_revisao) VALUES
('BA-01', 'ABC-1234', 'Mercedes Sprinter', 2020, 'Ambulância', 45000, '2024-06-15', '2024-12-15'),
('BA-02', 'DEF-5678', 'Fiat Ducato', 2019, 'Ambulância', 52000, '2024-05-20', '2024-11-20'),
('BA-03', 'GHI-9012', 'Volkswagen Crafter', 2021, 'Ambulância', 38000, '2024-07-10', '2025-01-10'),
('AB-01', 'JKL-3456', 'Mercedes Atego', 2018, 'Autobomba', 62000, '2024-04-30', '2024-10-30'),
('AB-02', 'MNO-7890', 'Volvo VM', 2022, 'Autobomba', 25000, '2024-08-05', '2025-02-05');

-- Gerar sequência para números de OS
CREATE SEQUENCE public.os_sequence START 1;