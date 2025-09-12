-- Criar tabela para verificação de uniformes
CREATE TABLE tp_verificacoes_uniformes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    colaborador_nome VARCHAR(255) NOT NULL,
    colaborador_funcao VARCHAR(255),
    data_verificacao DATE NOT NULL DEFAULT CURRENT_DATE,
    hora_verificacao TIME NOT NULL DEFAULT CURRENT_TIME,
    verificador_nome VARCHAR(255) NOT NULL,
    
    -- 8 itens obrigatórios de verificação
    possui_2_gandolas_bombeiro BOOLEAN NOT NULL DEFAULT false,
    possui_2_calcas_bombeiro BOOLEAN NOT NULL DEFAULT false,
    possui_1_cinto_bombeiro BOOLEAN NOT NULL DEFAULT false,
    possui_bota_seguranca BOOLEAN NOT NULL DEFAULT false,
    possui_4_camisas_bombeiro BOOLEAN NOT NULL DEFAULT false,
    possui_2_bermudas_bombeiro BOOLEAN NOT NULL DEFAULT false,
    possui_tarjeta_identificacao BOOLEAN NOT NULL DEFAULT false,
    possui_oculos_protetor_auricular BOOLEAN NOT NULL DEFAULT false,
    
    -- Campos adicionais
    observacoes TEXT,
    status_verificacao VARCHAR(50) DEFAULT 'pendente',
    aprovado BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE tp_verificacoes_uniformes ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para usuários autenticados
CREATE POLICY "Permitir leitura para usuários autenticados" ON tp_verificacoes_uniformes
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir inserção para usuários autenticados
CREATE POLICY "Permitir inserção para usuários autenticados" ON tp_verificacoes_uniformes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir atualização para usuários autenticados
CREATE POLICY "Permitir atualização para usuários autenticados" ON tp_verificacoes_uniformes
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para permitir exclusão para usuários autenticados
CREATE POLICY "Permitir exclusão para usuários autenticados" ON tp_verificacoes_uniformes
    FOR DELETE USING (auth.role() = 'authenticated');

-- Conceder permissões para as roles anon e authenticated
GRANT ALL PRIVILEGES ON tp_verificacoes_uniformes TO authenticated;
GRANT SELECT ON tp_verificacoes_uniformes TO anon;

-- Criar índices para melhor performance
CREATE INDEX idx_tp_verificacoes_uniformes_data ON tp_verificacoes_uniformes(data_verificacao);
CREATE INDEX idx_tp_verificacoes_uniformes_colaborador ON tp_verificacoes_uniformes(colaborador_nome);
CREATE INDEX idx_tp_verificacoes_uniformes_status ON tp_verificacoes_uniformes(status_verificacao);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tp_verificacoes_uniformes_updated_at
    BEFORE UPDATE ON tp_verificacoes_uniformes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();