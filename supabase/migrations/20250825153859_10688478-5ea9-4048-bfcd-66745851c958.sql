
-- Criar tabela de materiais (catálogo)
CREATE TABLE public.materiais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_material TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  tipo_unidade TEXT NOT NULL,
  unidade_medida TEXT NOT NULL,
  descricao TEXT,
  fabricante TEXT,
  especificacoes_tecnicas JSONB,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de estoque do almoxarifado
CREATE TABLE public.estoque_almoxarifado (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID NOT NULL REFERENCES public.materiais(id) ON DELETE CASCADE,
  quantidade_disponivel DECIMAL(10,3) NOT NULL DEFAULT 0,
  quantidade_minima DECIMAL(10,3) NOT NULL DEFAULT 0,
  lote TEXT,
  data_fabricacao DATE,
  data_validade DATE,
  localizacao_fisica TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(material_id, lote)
);

-- Criar tabela de materiais alocados em viaturas
CREATE TABLE public.materiais_viaturas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  viatura_id UUID NOT NULL REFERENCES public.viaturas(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materiais(id) ON DELETE CASCADE,
  quantidade_alocada DECIMAL(10,3) NOT NULL DEFAULT 0,
  data_alocacao DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'ativo',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(viatura_id, material_id)
);

-- Criar tabela de movimentações do estoque
CREATE TABLE public.movimentacoes_estoque (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID NOT NULL REFERENCES public.materiais(id) ON DELETE CASCADE,
  tipo_movimentacao TEXT NOT NULL,
  quantidade DECIMAL(10,3) NOT NULL,
  motivo TEXT NOT NULL,
  responsavel_id UUID NOT NULL REFERENCES public.bombeiros(id),
  data_movimentacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  origem TEXT,
  destino TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de materiais guardados/reservados
CREATE TABLE public.materiais_guardados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID NOT NULL REFERENCES public.materiais(id) ON DELETE CASCADE,
  quantidade DECIMAL(10,3) NOT NULL,
  motivo_guarda TEXT NOT NULL,
  responsavel_id UUID NOT NULL REFERENCES public.bombeiros(id),
  data_guarda DATE NOT NULL DEFAULT CURRENT_DATE,
  previsao_liberacao DATE,
  status TEXT NOT NULL DEFAULT 'guardado',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_almoxarifado ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais_viaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais_guardados ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para materiais
CREATE POLICY "Admin users can view all materiais" 
  ON public.materiais FOR SELECT 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can insert materiais" 
  ON public.materiais FOR INSERT 
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can update materiais" 
  ON public.materiais FOR UPDATE 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can delete materiais" 
  ON public.materiais FOR DELETE 
  USING (get_current_user_role() = 'admin');

-- Políticas RLS para estoque_almoxarifado
CREATE POLICY "Admin users can view all estoque almoxarifado" 
  ON public.estoque_almoxarifado FOR SELECT 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can insert estoque almoxarifado" 
  ON public.estoque_almoxarifado FOR INSERT 
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can update estoque almoxarifado" 
  ON public.estoque_almoxarifado FOR UPDATE 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can delete estoque almoxarifado" 
  ON public.estoque_almoxarifado FOR DELETE 
  USING (get_current_user_role() = 'admin');

-- Políticas RLS para materiais_viaturas
CREATE POLICY "Admin users can view all materiais viaturas" 
  ON public.materiais_viaturas FOR SELECT 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can insert materiais viaturas" 
  ON public.materiais_viaturas FOR INSERT 
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can update materiais viaturas" 
  ON public.materiais_viaturas FOR UPDATE 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can delete materiais viaturas" 
  ON public.materiais_viaturas FOR DELETE 
  USING (get_current_user_role() = 'admin');

-- Políticas RLS para movimentacoes_estoque
CREATE POLICY "Admin users can view all movimentacoes estoque" 
  ON public.movimentacoes_estoque FOR SELECT 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can insert movimentacoes estoque" 
  ON public.movimentacoes_estoque FOR INSERT 
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can update movimentacoes estoque" 
  ON public.movimentacoes_estoque FOR UPDATE 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can delete movimentacoes estoque" 
  ON public.movimentacoes_estoque FOR DELETE 
  USING (get_current_user_role() = 'admin');

-- Políticas RLS para materiais_guardados
CREATE POLICY "Admin users can view all materiais guardados" 
  ON public.materiais_guardados FOR SELECT 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can insert materiais guardados" 
  ON public.materiais_guardados FOR INSERT 
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can update materiais guardados" 
  ON public.materiais_guardados FOR UPDATE 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can delete materiais guardados" 
  ON public.materiais_guardados FOR DELETE 
  USING (get_current_user_role() = 'admin');

-- Criar índices para melhor performance
CREATE INDEX idx_materiais_categoria ON public.materiais(categoria);
CREATE INDEX idx_materiais_codigo ON public.materiais(codigo_material);
CREATE INDEX idx_estoque_material ON public.estoque_almoxarifado(material_id);
CREATE INDEX idx_estoque_validade ON public.estoque_almoxarifado(data_validade);
CREATE INDEX idx_materiais_viaturas_viatura ON public.materiais_viaturas(viatura_id);
CREATE INDEX idx_materiais_viaturas_material ON public.materiais_viaturas(material_id);
CREATE INDEX idx_movimentacoes_material ON public.movimentacoes_estoque(material_id);
CREATE INDEX idx_movimentacoes_data ON public.movimentacoes_estoque(data_movimentacao);
CREATE INDEX idx_materiais_guardados_material ON public.materiais_guardados(material_id);
CREATE INDEX idx_materiais_guardados_status ON public.materiais_guardados(status);

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_materiais_updated_at 
  BEFORE UPDATE ON public.materiais 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_estoque_almoxarifado_updated_at 
  BEFORE UPDATE ON public.estoque_almoxarifado 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_materiais_viaturas_updated_at 
  BEFORE UPDATE ON public.materiais_viaturas 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_materiais_guardados_updated_at 
  BEFORE UPDATE ON public.materiais_guardados 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir algumas categorias e materiais de exemplo
INSERT INTO public.materiais (codigo_material, nome, categoria, tipo_unidade, unidade_medida, descricao) VALUES
('LGE001', 'Líquido Gerador de Espuma', 'Agentes Extintores', 'volume', 'litros', 'LGE para combate a incêndios em líquidos inflamáveis'),
('PQS001', 'Pó Químico Seco 4kg', 'Agentes Extintores', 'peso', 'unidades', 'Extintor de PQS de 4kg para incêndios classe ABC'),
('PQS002', 'Pó Químico Seco 6kg', 'Agentes Extintores', 'peso', 'unidades', 'Extintor de PQS de 6kg para incêndios classe ABC'),
('PQS003', 'Pó Químico Seco 12kg', 'Agentes Extintores', 'peso', 'unidades', 'Extintor de PQS de 12kg para incêndios classe ABC'),
('EPI001', 'Capacete F1', 'EPI', 'unidade', 'unidades', 'Capacete de segurança para bombeiros'),
('EPI002', 'Luvas de Procedimento', 'EPI', 'unidade', 'pares', 'Luvas descartáveis para procedimentos'),
('MED001', 'Soro Fisiológico 500ml', 'Medicamentos', 'volume', 'unidades', 'Soro fisiológico para procedimentos médicos'),
('FERR001', 'Alicate Universal', 'Ferramentas', 'unidade', 'unidades', 'Alicate para uso geral em emergências');
