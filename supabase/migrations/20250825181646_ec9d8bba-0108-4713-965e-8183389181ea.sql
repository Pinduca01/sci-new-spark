
-- Tabela para configurações de quantidades por equipe/base
CREATE TABLE tp_configuracoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipe_id UUID REFERENCES equipes(id) ON DELETE CASCADE,
    base VARCHAR(100) NOT NULL,
    quantidade_tp_prevista INTEGER NOT NULL DEFAULT 0,
    quantidade_uniforme_prevista INTEGER NOT NULL DEFAULT 0,
    mes_referencia INTEGER NOT NULL,
    ano_referencia INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(equipe_id, base, mes_referencia, ano_referencia)
);

-- Tabela para verificações de TPs
CREATE TABLE tp_verificacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipe_id UUID REFERENCES equipes(id) ON DELETE CASCADE,
    base VARCHAR(100) NOT NULL,
    mes_referencia INTEGER NOT NULL,
    ano_referencia INTEGER NOT NULL,
    data_verificacao DATE NOT NULL DEFAULT CURRENT_DATE,
    tp_conformes INTEGER NOT NULL DEFAULT 0,
    tp_nao_conformes INTEGER NOT NULL DEFAULT 0,
    total_verificados INTEGER NOT NULL DEFAULT 0,
    observacoes TEXT,
    responsavel_id UUID REFERENCES bombeiros(id),
    responsavel_nome VARCHAR(200) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para controle de higienização
CREATE TABLE tp_higienizacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base VARCHAR(100) NOT NULL,
    mes_referencia INTEGER NOT NULL,
    ano_referencia INTEGER NOT NULL,
    data_higienizacao DATE NOT NULL DEFAULT CURRENT_DATE,
    quantidade_higienizada INTEGER NOT NULL DEFAULT 0,
    quantidade_total INTEGER NOT NULL DEFAULT 0,
    tipo_higienizacao VARCHAR(50) NOT NULL DEFAULT 'mensal',
    observacoes TEXT,
    responsavel_id UUID REFERENCES bombeiros(id),
    responsavel_nome VARCHAR(200) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para distribuição de EPIs e uniformes
CREATE TABLE epis_uniformes_distribuicao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bombeiro_id UUID REFERENCES bombeiros(id) ON DELETE CASCADE,
    bombeiro_nome VARCHAR(200) NOT NULL,
    equipe_id UUID REFERENCES equipes(id),
    tipo_item VARCHAR(50) NOT NULL, -- 'epi' ou 'uniforme'
    item_descricao VARCHAR(200) NOT NULL,
    quantidade_prevista INTEGER NOT NULL DEFAULT 0,
    quantidade_entregue INTEGER NOT NULL DEFAULT 0,
    data_entrega DATE,
    mes_referencia INTEGER NOT NULL,
    ano_referencia INTEGER NOT NULL,
    observacoes TEXT,
    responsavel_entrega_id UUID REFERENCES bombeiros(id),
    responsavel_entrega_nome VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE tp_configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tp_verificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tp_higienizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE epis_uniformes_distribuicao ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para tp_configuracoes
CREATE POLICY "Admin users can manage tp configuracoes" ON tp_configuracoes
    FOR ALL TO authenticated
    USING (get_current_user_role() = 'admin')
    WITH CHECK (get_current_user_role() = 'admin');

-- Políticas RLS para tp_verificacoes
CREATE POLICY "Admin users can manage tp verificacoes" ON tp_verificacoes
    FOR ALL TO authenticated
    USING (get_current_user_role() = 'admin')
    WITH CHECK (get_current_user_role() = 'admin');

-- Políticas RLS para tp_higienizacoes
CREATE POLICY "Admin users can manage tp higienizacoes" ON tp_higienizacoes
    FOR ALL TO authenticated
    USING (get_current_user_role() = 'admin')
    WITH CHECK (get_current_user_role() = 'admin');

-- Políticas RLS para epis_uniformes_distribuicao
CREATE POLICY "Admin users can manage epis uniformes distribuicao" ON epis_uniformes_distribuicao
    FOR ALL TO authenticated
    USING (get_current_user_role() = 'admin')
    WITH CHECK (get_current_user_role() = 'admin');

-- Triggers para updated_at
CREATE TRIGGER update_tp_configuracoes_updated_at
    BEFORE UPDATE ON tp_configuracoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tp_verificacoes_updated_at
    BEFORE UPDATE ON tp_verificacoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tp_higienizacoes_updated_at
    BEFORE UPDATE ON tp_higienizacoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_epis_uniformes_distribuicao_updated_at
    BEFORE UPDATE ON epis_uniformes_distribuicao
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
