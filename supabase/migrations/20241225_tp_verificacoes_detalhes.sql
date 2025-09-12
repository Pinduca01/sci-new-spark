-- Criar tabela para armazenar detalhes das verificações por integrante e item
CREATE TABLE IF NOT EXISTS tp_verificacoes_detalhes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tp_verificacao_id UUID NOT NULL REFERENCES tp_verificacoes(id) ON DELETE CASCADE,
  integrante_id UUID NOT NULL REFERENCES bombeiros(id) ON DELETE CASCADE,
  item_checklist INTEGER NOT NULL,
  item_descricao TEXT NOT NULL,
  conforme BOOLEAN,
  descricao_nao_conformidade TEXT,
  acao_corretiva TEXT,
  responsavel_acao VARCHAR(255),
  status_acao VARCHAR(50) DEFAULT 'pendente',
  data_acao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices para melhor performance
  CONSTRAINT unique_verificacao_integrante_item UNIQUE (tp_verificacao_id, integrante_id, item_checklist)
);

-- Criar índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_tp_verificacoes_detalhes_verificacao_id ON tp_verificacoes_detalhes(tp_verificacao_id);
CREATE INDEX IF NOT EXISTS idx_tp_verificacoes_detalhes_integrante_id ON tp_verificacoes_detalhes(integrante_id);
CREATE INDEX IF NOT EXISTS idx_tp_verificacoes_detalhes_conforme ON tp_verificacoes_detalhes(conforme);
CREATE INDEX IF NOT EXISTS idx_tp_verificacoes_detalhes_status_acao ON tp_verificacoes_detalhes(status_acao);

-- Habilitar RLS (Row Level Security)
ALTER TABLE tp_verificacoes_detalhes ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Usuários autenticados podem visualizar detalhes das verificações" ON tp_verificacoes_detalhes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir detalhes das verificações" ON tp_verificacoes_detalhes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar detalhes das verificações" ON tp_verificacoes_detalhes
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar detalhes das verificações" ON tp_verificacoes_detalhes
  FOR DELETE USING (auth.role() = 'authenticated');

-- Conceder permissões aos roles
GRANT ALL PRIVILEGES ON tp_verificacoes_detalhes TO authenticated;
GRANT SELECT ON tp_verificacoes_detalhes TO anon;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_tp_verificacoes_detalhes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_update_tp_verificacoes_detalhes_updated_at
  BEFORE UPDATE ON tp_verificacoes_detalhes
  FOR EACH ROW
  EXECUTE FUNCTION update_tp_verificacoes_detalhes_updated_at();

-- Comentários para documentação
COMMENT ON TABLE tp_verificacoes_detalhes IS 'Detalhes das verificações de TP por integrante e item do checklist';
COMMENT ON COLUMN tp_verificacoes_detalhes.tp_verificacao_id IS 'Referência à verificação principal';
COMMENT ON COLUMN tp_verificacoes_detalhes.integrante_id IS 'Referência ao bombeiro/integrante';
COMMENT ON COLUMN tp_verificacoes_detalhes.item_checklist IS 'Número do item do checklist';
COMMENT ON COLUMN tp_verificacoes_detalhes.item_descricao IS 'Descrição do item do checklist';
COMMENT ON COLUMN tp_verificacoes_detalhes.conforme IS 'true = conforme, false = não conforme, null = não avaliado';
COMMENT ON COLUMN tp_verificacoes_detalhes.descricao_nao_conformidade IS 'Descrição da não conformidade encontrada';
COMMENT ON COLUMN tp_verificacoes_detalhes.acao_corretiva IS 'Ação corretiva a ser tomada';
COMMENT ON COLUMN tp_verificacoes_detalhes.responsavel_acao IS 'Responsável pela ação corretiva';
COMMENT ON COLUMN tp_verificacoes_detalhes.status_acao IS 'Status da ação: pendente, em_andamento, concluida';
COMMENT ON COLUMN tp_verificacoes_detalhes.data_acao IS 'Data prevista ou realizada da ação corretiva';