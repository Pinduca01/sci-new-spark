-- Criação da tabela para verificação de uniformes
-- Seguindo o mesmo padrão da tabela tp_verificacoes

CREATE TABLE IF NOT EXISTS tp_verificacoes_uniformes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Informações básicas
  data_verificacao DATE NOT NULL,
  local TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  equipe TEXT NOT NULL CHECK (equipe IN ('Alfa', 'Bravo', 'Charlie', 'Delta')),
  membros_equipe TEXT[] DEFAULT '{}',
  
  -- Status da verificação
  status TEXT DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'concluida')),
  etapa_atual INTEGER DEFAULT 1,
  
  -- Estatísticas
  total_conformes INTEGER DEFAULT 0,
  total_nao_conformes INTEGER DEFAULT 0,
  total_nao_verificados INTEGER DEFAULT 8, -- 8 itens de uniformes
  percentual_conformidade DECIMAL(5,2) DEFAULT 0.00,
  
  -- Categoria Uniformes (8 itens obrigatórios)
  -- Item 1: GANDOLAS DE BOMBEIRO DE AERODROMO
  cat1_gandolas TEXT DEFAULT 'nao_verificado' CHECK (cat1_gandolas IN ('conforme', 'nao_conforme', 'nao_verificado')),
  cat1_gandolas_membros TEXT[] DEFAULT '{}',
  cat1_gandolas_observacoes TEXT DEFAULT '',
  
  -- Item 2: CALÇAS DE BOMBEIRO DE AERODROMO
  cat1_calcas TEXT DEFAULT 'nao_verificado' CHECK (cat1_calcas IN ('conforme', 'nao_conforme', 'nao_verificado')),
  cat1_calcas_membros TEXT[] DEFAULT '{}',
  cat1_calcas_observacoes TEXT DEFAULT '',
  
  -- Item 3: CINTO DE BOMBEIRO DE AERODROMO
  cat1_cinto TEXT DEFAULT 'nao_verificado' CHECK (cat1_cinto IN ('conforme', 'nao_conforme', 'nao_verificado')),
  cat1_cinto_membros TEXT[] DEFAULT '{}',
  cat1_cinto_observacoes TEXT DEFAULT '',
  
  -- Item 4: BOTA DE SEGURANÇA DE BOMBEIRO DE AERODROMO
  cat1_bota TEXT DEFAULT 'nao_verificado' CHECK (cat1_bota IN ('conforme', 'nao_conforme', 'nao_verificado')),
  cat1_bota_membros TEXT[] DEFAULT '{}',
  cat1_bota_observacoes TEXT DEFAULT '',
  
  -- Item 5: CAMISAS DE BOMBEIRO DE AERODROMO
  cat1_camisas TEXT DEFAULT 'nao_verificado' CHECK (cat1_camisas IN ('conforme', 'nao_conforme', 'nao_verificado')),
  cat1_camisas_membros TEXT[] DEFAULT '{}',
  cat1_camisas_observacoes TEXT DEFAULT '',
  
  -- Item 6: BERMUDAS DE BOMBEIRO DE AERODROMO
  cat1_bermudas TEXT DEFAULT 'nao_verificado' CHECK (cat1_bermudas IN ('conforme', 'nao_conforme', 'nao_verificado')),
  cat1_bermudas_membros TEXT[] DEFAULT '{}',
  cat1_bermudas_observacoes TEXT DEFAULT '',
  
  -- Item 7: TARJETA DE NOME/FUNÇÃO/NUMERAÇÃO FRENTE E COSTAS
  cat1_tarjeta TEXT DEFAULT 'nao_verificado' CHECK (cat1_tarjeta IN ('conforme', 'nao_conforme', 'nao_verificado')),
  cat1_tarjeta_membros TEXT[] DEFAULT '{}',
  cat1_tarjeta_observacoes TEXT DEFAULT '',
  
  -- Item 8: ÓCULOS DE PROTEÇÃO/PROTETOR AURICULAR
  cat1_oculos TEXT DEFAULT 'nao_verificado' CHECK (cat1_oculos IN ('conforme', 'nao_conforme', 'nao_verificado')),
  cat1_oculos_membros TEXT[] DEFAULT '{}',
  cat1_oculos_observacoes TEXT DEFAULT ''
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE tp_verificacoes_uniformes ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas as operações para usuários autenticados
CREATE POLICY "Permitir todas as operações para usuários autenticados" ON tp_verificacoes_uniformes
  FOR ALL USING (auth.role() = 'authenticated');

-- Política para permitir leitura para usuários anônimos
CREATE POLICY "Permitir leitura para usuários anônimos" ON tp_verificacoes_uniformes
  FOR SELECT USING (true);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tp_verificacoes_uniformes_updated_at
    BEFORE UPDATE ON tp_verificacoes_uniformes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para melhor performance
CREATE INDEX idx_tp_verificacoes_uniformes_data ON tp_verificacoes_uniformes(data_verificacao);
CREATE INDEX idx_tp_verificacoes_uniformes_equipe ON tp_verificacoes_uniformes(equipe);
CREATE INDEX idx_tp_verificacoes_uniformes_status ON tp_verificacoes_uniformes(status);
CREATE INDEX idx_tp_verificacoes_uniformes_responsavel ON tp_verificacoes_uniformes(responsavel);

-- Comentários para documentação
COMMENT ON TABLE tp_verificacoes_uniformes IS 'Tabela para armazenar verificações de uniformes dos bombeiros de aeródromo';
COMMENT ON COLUMN tp_verificacoes_uniformes.equipe IS 'Equipe verificada: Alfa, Bravo, Charlie ou Delta';
COMMENT ON COLUMN tp_verificacoes_uniformes.total_nao_verificados IS 'Total de 8 itens obrigatórios de uniformes';