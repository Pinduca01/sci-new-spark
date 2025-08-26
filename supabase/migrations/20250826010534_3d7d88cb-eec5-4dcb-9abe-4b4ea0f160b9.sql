
-- Adicionar coluna qr_code à tabela viaturas
ALTER TABLE viaturas ADD COLUMN qr_code TEXT UNIQUE;

-- Criar tabela para templates de checklist
CREATE TABLE checklist_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo_viatura TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'geral',
  itens JSONB NOT NULL DEFAULT '[]'::jsonb,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para checklists realizados via QR
CREATE TABLE qr_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_code TEXT NOT NULL,
  viatura_id UUID NOT NULL REFERENCES viaturas(id),
  template_id UUID NOT NULL REFERENCES checklist_templates(id),
  bombeiro_id UUID NOT NULL,
  bombeiro_nome TEXT NOT NULL,
  data_checklist DATE NOT NULL DEFAULT CURRENT_DATE,
  hora_inicio TIME NOT NULL DEFAULT CURRENT_TIME,
  hora_conclusao TIME,
  status TEXT NOT NULL DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'concluido', 'cancelado')),
  itens_checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  observacoes_gerais TEXT,
  localizacao JSONB,
  assinatura_digital TEXT,
  fotos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_checklists ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para checklist_templates
CREATE POLICY "Admin users can manage checklist templates" 
  ON checklist_templates 
  FOR ALL 
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

-- Políticas RLS para qr_checklists
CREATE POLICY "Admin users can manage qr checklists" 
  ON qr_checklists 
  FOR ALL 
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

-- Trigger para updated_at nas novas tabelas
CREATE TRIGGER update_checklist_templates_updated_at
  BEFORE UPDATE ON checklist_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qr_checklists_updated_at
  BEFORE UPDATE ON qr_checklists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir templates padrão para diferentes tipos de viatura
INSERT INTO checklist_templates (nome, tipo_viatura, categoria, itens) VALUES
('Checklist BA-MC (Materiais Médicos)', 'BA-MC', 'medico', '[
  {"id": "1", "item": "Kit de Primeiros Socorros", "tipo": "verificacao", "obrigatorio": true},
  {"id": "2", "item": "Desfibrilador", "tipo": "verificacao", "obrigatorio": true},
  {"id": "3", "item": "Oxímetro", "tipo": "verificacao", "obrigatorio": false},
  {"id": "4", "item": "Medicamentos de Emergência", "tipo": "contagem", "obrigatorio": true},
  {"id": "5", "item": "Equipamentos de Via Aérea", "tipo": "verificacao", "obrigatorio": true}
]'::jsonb),
('Checklist BA-2 (Viatura)', 'BA-2', 'viatura', '[
  {"id": "1", "item": "Nível de Combustível", "tipo": "medida", "obrigatorio": true, "unidade": "litros"},
  {"id": "2", "item": "Pneus", "tipo": "verificacao", "obrigatorio": true},
  {"id": "3", "item": "Equipamentos de Resgate", "tipo": "contagem", "obrigatorio": true},
  {"id": "4", "item": "Mangueiras", "tipo": "contagem", "obrigatorio": true},
  {"id": "5", "item": "Extintores", "tipo": "verificacao", "obrigatorio": true}
]'::jsonb);
