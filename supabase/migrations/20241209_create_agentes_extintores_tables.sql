-- Criar tabela de agentes extintores
CREATE TABLE agentes_extintores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('LGE', 'PO_QUIMICO', 'NITROGENIO')),
    fabricante VARCHAR(255) NOT NULL,
    data_fabricacao DATE NOT NULL,
    situacao VARCHAR(20) NOT NULL CHECK (situacao IN ('EM_LINHA', 'ESTOQUE')),
    quantidade DECIMAL(10,2) NOT NULL DEFAULT 0,
    unidade VARCHAR(20) NOT NULL,
    data_validade DATE,
    data_teste_hidrostatico DATE,
    validade_ensaio DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para agentes_extintores
CREATE INDEX idx_agentes_extintores_tipo ON agentes_extintores(tipo);
CREATE INDEX idx_agentes_extintores_situacao ON agentes_extintores(situacao);
CREATE INDEX idx_agentes_extintores_data_validade ON agentes_extintores(data_validade);

-- Criar tabela de movimentações
CREATE TABLE movimentacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agente_id UUID NOT NULL REFERENCES agentes_extintores(id),
    usuario_id UUID NOT NULL REFERENCES auth.users(id),
    tipo_movimentacao VARCHAR(10) NOT NULL CHECK (tipo_movimentacao IN ('ENTRADA', 'SAIDA')),
    quantidade DECIMAL(10,2) NOT NULL,
    equipe VARCHAR(20) CHECK (equipe IN ('Alfa', 'Bravo', 'Charlie', 'Delta')),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para movimentacoes
CREATE INDEX idx_movimentacoes_agente_id ON movimentacoes(agente_id);
CREATE INDEX idx_movimentacoes_usuario_id ON movimentacoes(usuario_id);
CREATE INDEX idx_movimentacoes_created_at ON movimentacoes(created_at DESC);

-- Criar tabela de checklist de agentes
CREATE TABLE checklist_agentes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agente_id UUID NOT NULL REFERENCES agentes_extintores(id),
    usuario_id UUID NOT NULL REFERENCES auth.users(id),
    data_checklist DATE NOT NULL,
    conforme BOOLEAN NOT NULL DEFAULT true,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para checklist_agentes
CREATE INDEX idx_checklist_agentes_agente_id ON checklist_agentes(agente_id);
CREATE INDEX idx_checklist_agentes_data_checklist ON checklist_agentes(data_checklist DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE agentes_extintores ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_agentes ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para agentes_extintores
CREATE POLICY "Permitir leitura para usuários autenticados" ON agentes_extintores
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados" ON agentes_extintores
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização para usuários autenticados" ON agentes_extintores
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas de segurança para movimentacoes
CREATE POLICY "Permitir leitura para usuários autenticados" ON movimentacoes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados" ON movimentacoes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Políticas de segurança para checklist_agentes
CREATE POLICY "Permitir leitura para usuários autenticados" ON checklist_agentes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados" ON checklist_agentes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização para usuários autenticados" ON checklist_agentes
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Conceder permissões às roles
GRANT SELECT ON agentes_extintores TO anon;
GRANT ALL PRIVILEGES ON agentes_extintores TO authenticated;

GRANT SELECT ON movimentacoes TO anon;
GRANT ALL PRIVILEGES ON movimentacoes TO authenticated;

GRANT SELECT ON checklist_agentes TO anon;
GRANT ALL PRIVILEGES ON checklist_agentes TO authenticated;

-- Inserir dados de exemplo
INSERT INTO agentes_extintores (tipo, fabricante, data_fabricacao, situacao, quantidade, unidade, data_validade) VALUES
('LGE', 'Fabricante A', '2024-01-15', 'ESTOQUE', 1000.00, 'litros', '2025-01-15'),
('PO_QUIMICO', 'Fabricante B', '2024-02-10', 'EM_LINHA', 50.00, 'kg', '2026-02-10'),
('NITROGENIO', 'Fabricante C', '2024-03-05', 'ESTOQUE', 20.00, 'cilindros', NULL);