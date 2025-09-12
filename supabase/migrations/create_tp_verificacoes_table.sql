-- Criar tabela para verificações de traje de proteção
CREATE TABLE IF NOT EXISTS tp_verificacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Informações básicas
  data_verificacao DATE NOT NULL,
  local TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  equipe TEXT NOT NULL,
  membros_equipe TEXT[] DEFAULT '{}',
  
  -- Status da verificação
  status TEXT DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'concluida')),
  etapa_atual INTEGER DEFAULT 1,
  
  -- Estatísticas
  total_conformes INTEGER DEFAULT 0,
  total_nao_conformes INTEGER DEFAULT 0,
  total_nao_verificados INTEGER DEFAULT 0,
  percentual_conformidade DECIMAL(5,2) DEFAULT 0,
  
  -- Categoria 1: IDENTIFICAÇÃO E VALIDADE
  cat1_etiquetas_visiveis TEXT DEFAULT 'nao_verificado' CHECK (cat1_etiquetas_visiveis IN ('conforme', 'nao_conforme', 'nao_verificado')),
  cat1_etiquetas_visiveis_membros TEXT[] DEFAULT '{}',
  cat1_etiquetas_visiveis_observacoes TEXT DEFAULT '',
  
  cat1_ca_valido TEXT DEFAULT 'nao_verificado' CHECK (cat1_ca_valido IN ('conforme', 'nao_conforme', 'nao_verificado')),
  cat1_ca_valido_membros TEXT[] DEFAULT '{}',
  cat1_ca_valido_observacoes TEXT DEFAULT '',
  
  -- Categoria 2: CAPACETES
  cat2_capacetes_integros TEXT DEFAULT 'nao_verificado' CHECK (cat2_capacetes_integros IN ('conforme', 'nao_conforme', 'nao_verificado')),
  cat2_capacetes_integros_membros TEXT[] DEFAULT '{}',
  cat2_capacetes_integros_observacoes TEXT DEFAULT '',
  
  -- Categoria 3: VESTIMENTAS
  cat3_vestimentas_integras TEXT DEFAULT 'nao_verificado' CHECK (cat3_vestimentas_integras IN ('conforme', 'nao_conforme', 'nao_verificado')),
  cat3_vestimentas_integras_membros TEXT[] DEFAULT '{}',
  cat3_vestimentas_integras_observacoes TEXT DEFAULT '',
  
  cat3_bom_estado TEXT DEFAULT 'nao_verificado' CHECK (cat3_bom_estado IN ('conforme', 'nao_conforme', 'nao_verificado')),
  cat3_bom_estado_membros TEXT[] DEFAULT '{}',
  cat3_bom_estado_observacoes TEXT DEFAULT '',
  
  cat3_faixas_reflexivas TEXT DEFAULT 'nao_verificado' CHECK (cat3_faixas_reflexivas IN ('conforme', 'nao_conforme', 'nao_verificado')),
  cat3_faixas_reflexivas_membros TEXT[] DEFAULT '{}',
  cat3_faixas_reflexivas_observacoes TEXT DEFAULT '',
  
  cat3_bolsos_dispositivos TEXT DEFAULT 'nao_verificado' CHECK (cat3_bolsos_dispositivos IN ('conforme', 'nao_conforme', 'nao_verificado')),
  cat3_bolsos_dispositivos_membros TEXT[] DEFAULT '{}',
  cat3_bolsos_dispositivos_observacoes TEXT DEFAULT '',
  
  cat3_costuras_integras TEXT DEFAULT 'nao_verificado' CHECK (cat3_costuras_integras IN ('conforme', 'nao_conforme', 'nao_verificado')),
  cat3_costuras_integras_membros TEXT[] DEFAULT '{}',
  cat3_costuras_integras_observacoes TEXT DEFAULT '',
  
  cat3_barreira_umidade TEXT DEFAULT 'nao_verificado' CHECK (cat3_barreira_umidade IN ('conforme', 'nao_conforme', 'nao_verificado')),
  cat3_barreira_umidade_membros TEXT[] DEFAULT '{}',
  cat3_barreira_umidade_observacoes TEXT DEFAULT '',
  
  cat3_punhos_elasticidade TEXT DEFAULT 'nao_verificado' CHECK (cat3_punhos_elasticidade IN ('conforme', 'nao_conforme', 'nao_verificado')),
  cat3_punhos_elasticidade_membros TEXT[] DEFAULT '{}',
  cat3_punhos_elasticidade_observacoes TEXT DEFAULT '',
  
  cat3_costuras_seladas TEXT DEFAULT 'nao_verificado' CHECK (cat3_costuras_seladas IN ('conforme', 'nao_conforme', 'nao_verificado')),
  cat3_costuras_seladas_membros TEXT[] DEFAULT '{}',
  cat3_costuras_seladas_observacoes TEXT DEFAULT '',
  
  -- Categoria 4: CALÇADOS
  cat4_botas_bom_estado TEXT DEFAULT 'nao_verificado' CHECK (cat4_botas_bom_estado IN ('conforme', 'nao_conforme', 'nao_verificado')),
  cat4_botas_bom_estado_membros TEXT[] DEFAULT '{}',
  cat4_botas_bom_estado_observacoes TEXT DEFAULT '',
  
  cat4_solas_integras TEXT DEFAULT 'nao_verificado' CHECK (cat4_solas_integras IN ('conforme', 'nao_conforme', 'nao_verificado')),
  cat4_solas_integras_membros TEXT[] DEFAULT '{}',
  cat4_solas_integras_observacoes TEXT DEFAULT '',
  
  -- Categoria 5: LUVAS
  cat5_luvas_bom_estado TEXT DEFAULT 'nao_verificado' CHECK (cat5_luvas_bom_estado IN ('conforme', 'nao_conforme', 'nao_verificado')),
  cat5_luvas_bom_estado_membros TEXT[] DEFAULT '{}',
  cat5_luvas_bom_estado_observacoes TEXT DEFAULT '',
  
  cat5_costuras_luvas TEXT DEFAULT 'nao_verificado' CHECK (cat5_costuras_luvas IN ('conforme', 'nao_conforme', 'nao_verificado')),
  cat5_costuras_luvas_membros TEXT[] DEFAULT '{}',
  cat5_costuras_luvas_observacoes TEXT DEFAULT '',
  
  -- Categoria 6: CAPUZES/BALACLAVAS
  cat6_capuzes_bom_estado TEXT DEFAULT 'nao_verificado' CHECK (cat6_capuzes_bom_estado IN ('conforme', 'nao_conforme', 'nao_verificado')),
  cat6_capuzes_bom_estado_membros TEXT[] DEFAULT '{}',
  cat6_capuzes_bom_estado_observacoes TEXT DEFAULT ''
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE tp_verificacoes ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para usuários autenticados
CREATE POLICY "Permitir leitura para usuários autenticados" ON tp_verificacoes
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir inserção para usuários autenticados
CREATE POLICY "Permitir inserção para usuários autenticados" ON tp_verificacoes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir atualização para usuários autenticados
CREATE POLICY "Permitir atualização para usuários autenticados" ON tp_verificacoes
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para permitir exclusão para usuários autenticados
CREATE POLICY "Permitir exclusão para usuários autenticados" ON tp_verificacoes
  FOR DELETE USING (auth.role() = 'authenticated');

-- Conceder permissões para os roles anon e authenticated
GRANT ALL PRIVILEGES ON tp_verificacoes TO authenticated;
GRANT SELECT ON tp_verificacoes TO anon;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_tp_verificacoes_data ON tp_verificacoes(data_verificacao);
CREATE INDEX IF NOT EXISTS idx_tp_verificacoes_equipe ON tp_verificacoes(equipe);
CREATE INDEX IF NOT EXISTS idx_tp_verificacoes_status ON tp_verificacoes(status);
CREATE INDEX IF NOT EXISTS idx_tp_verificacoes_created_at ON tp_verificacoes(created_at);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tp_verificacoes_updated_at
    BEFORE UPDATE ON tp_verificacoes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();