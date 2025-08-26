
-- Criar tabela para controle de equipamentos gerais (não extintores)
CREATE TABLE IF NOT EXISTS public.equipamentos_estoque (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID NOT NULL REFERENCES public.materiais(id),
  codigo_equipamento TEXT NOT NULL UNIQUE,
  numero_serie TEXT,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'manutencao', 'inativo', 'descartado')),
  localizacao_fisica TEXT,
  data_aquisicao DATE,
  data_instalacao DATE,
  valor_aquisicao NUMERIC DEFAULT 0,
  fornecedor TEXT,
  garantia_ate DATE,
  ultima_manutencao DATE,
  proxima_manutencao DATE,
  viatura_id UUID REFERENCES public.viaturas(id),
  responsavel_id UUID,
  qr_code TEXT,
  fotos JSONB DEFAULT '[]'::jsonb,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar trigger para updated_at
CREATE TRIGGER update_equipamentos_estoque_updated_at
  BEFORE UPDATE ON public.equipamentos_estoque
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar políticas RLS para equipamentos_estoque
ALTER TABLE public.equipamentos_estoque ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view all equipamentos estoque"
  ON public.equipamentos_estoque FOR SELECT
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can insert equipamentos estoque"
  ON public.equipamentos_estoque FOR INSERT
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can update equipamentos estoque"
  ON public.equipamentos_estoque FOR UPDATE
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can delete equipamentos estoque"
  ON public.equipamentos_estoque FOR DELETE
  USING (get_current_user_role() = 'admin');

-- Criar tabela para histórico de manutenções de equipamentos
CREATE TABLE IF NOT EXISTS public.historico_manutencoes_equipamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipamento_id UUID NOT NULL REFERENCES public.equipamentos_estoque(id),
  tipo_manutencao TEXT NOT NULL CHECK (tipo_manutencao IN ('preventiva', 'corretiva', 'calibracao', 'inspecao')),
  data_manutencao DATE NOT NULL DEFAULT CURRENT_DATE,
  responsavel_id UUID,
  responsavel_nome TEXT NOT NULL,
  empresa_responsavel TEXT,
  descricao TEXT NOT NULL,
  materiais_utilizados TEXT,
  custo NUMERIC DEFAULT 0,
  proxima_manutencao DATE,
  certificado_url TEXT,
  fotos JSONB DEFAULT '[]'::jsonb,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar políticas RLS para historico_manutencoes_equipamentos
ALTER TABLE public.historico_manutencoes_equipamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view all historico manutencoes equipamentos"
  ON public.historico_manutencoes_equipamentos FOR SELECT
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can insert historico manutencoes equipamentos"
  ON public.historico_manutencoes_equipamentos FOR INSERT
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can update historico manutencoes equipamentos"
  ON public.historico_manutencoes_equipamentos FOR UPDATE
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can delete historico manutencoes equipamentos"
  ON public.historico_manutencoes_equipamentos FOR DELETE
  USING (get_current_user_role() = 'admin');

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_equipamentos_estoque_material_id ON public.equipamentos_estoque(material_id);
CREATE INDEX IF NOT EXISTS idx_equipamentos_estoque_status ON public.equipamentos_estoque(status);
CREATE INDEX IF NOT EXISTS idx_equipamentos_estoque_viatura_id ON public.equipamentos_estoque(viatura_id);
CREATE INDEX IF NOT EXISTS idx_historico_manutencoes_equipamento_id ON public.historico_manutencoes_equipamentos(equipamento_id);
