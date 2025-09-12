-- Atualizar estrutura da tabela tp_verificacoes_uniformes para seguir padrão da verificação de TP
-- Remover colunas antigas e adicionar novas seguindo o padrão

-- Primeiro, remover as colunas antigas que não seguem o padrão
ALTER TABLE tp_verificacoes_uniformes 
DROP COLUMN IF EXISTS colaborador_nome,
DROP COLUMN IF EXISTS colaborador_funcao,
DROP COLUMN IF EXISTS hora_verificacao,
DROP COLUMN IF EXISTS verificador_nome,
DROP COLUMN IF EXISTS possui_2_gandolas_bombeiro,
DROP COLUMN IF EXISTS possui_2_calcas_bombeiro,
DROP COLUMN IF EXISTS possui_1_cinto_bombeiro,
DROP COLUMN IF EXISTS possui_bota_seguranca,
DROP COLUMN IF EXISTS possui_4_camisas_bombeiro,
DROP COLUMN IF EXISTS possui_2_bermudas_bombeiro,
DROP COLUMN IF EXISTS possui_tarjeta_identificacao,
DROP COLUMN IF EXISTS possui_oculos_protetor_auricular,
DROP COLUMN IF EXISTS observacoes,
DROP COLUMN IF EXISTS status_verificacao,
DROP COLUMN IF EXISTS aprovado;

-- Adicionar novas colunas seguindo o padrão da verificação de TP
ALTER TABLE tp_verificacoes_uniformes 
ADD COLUMN IF NOT EXISTS local TEXT NOT NULL DEFAULT 'Santa Genoveva - GYN',
ADD COLUMN IF NOT EXISTS responsavel TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS equipe TEXT NOT NULL DEFAULT '' CHECK (equipe IN ('Alfa', 'Bravo', 'Charlie', 'Delta')),
ADD COLUMN IF NOT EXISTS membros_equipe TEXT[] DEFAULT '{}',

-- Status da verificação
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'concluida')),
ADD COLUMN IF NOT EXISTS etapa_atual INTEGER DEFAULT 1,

-- Estatísticas
ADD COLUMN IF NOT EXISTS total_conformes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_nao_conformes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_nao_verificados INTEGER DEFAULT 8,
ADD COLUMN IF NOT EXISTS percentual_conformidade DECIMAL(5,2) DEFAULT 0.00,

-- Categoria Uniformes (8 itens obrigatórios)
-- Item 1: GANDOLAS DE BOMBEIRO DE AERODROMO
ADD COLUMN IF NOT EXISTS cat1_gandolas TEXT DEFAULT 'nao_verificado' CHECK (cat1_gandolas IN ('conforme', 'nao_conforme', 'nao_verificado')),
ADD COLUMN IF NOT EXISTS cat1_gandolas_membros TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cat1_gandolas_observacoes TEXT DEFAULT '',

-- Item 2: CALÇAS DE BOMBEIRO DE AERODROMO
ADD COLUMN IF NOT EXISTS cat1_calcas TEXT DEFAULT 'nao_verificado' CHECK (cat1_calcas IN ('conforme', 'nao_conforme', 'nao_verificado')),
ADD COLUMN IF NOT EXISTS cat1_calcas_membros TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cat1_calcas_observacoes TEXT DEFAULT '',

-- Item 3: CINTO DE BOMBEIRO DE AERODROMO
ADD COLUMN IF NOT EXISTS cat1_cinto TEXT DEFAULT 'nao_verificado' CHECK (cat1_cinto IN ('conforme', 'nao_conforme', 'nao_verificado')),
ADD COLUMN IF NOT EXISTS cat1_cinto_membros TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cat1_cinto_observacoes TEXT DEFAULT '',

-- Item 4: BOTA DE SEGURANÇA DE BOMBEIRO DE AERODROMO
ADD COLUMN IF NOT EXISTS cat1_bota TEXT DEFAULT 'nao_verificado' CHECK (cat1_bota IN ('conforme', 'nao_conforme', 'nao_verificado')),
ADD COLUMN IF NOT EXISTS cat1_bota_membros TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cat1_bota_observacoes TEXT DEFAULT '',

-- Item 5: CAMISAS DE BOMBEIRO DE AERODROMO
ADD COLUMN IF NOT EXISTS cat1_camisas TEXT DEFAULT 'nao_verificado' CHECK (cat1_camisas IN ('conforme', 'nao_conforme', 'nao_verificado')),
ADD COLUMN IF NOT EXISTS cat1_camisas_membros TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cat1_camisas_observacoes TEXT DEFAULT '',

-- Item 6: BERMUDAS DE BOMBEIRO DE AERODROMO
ADD COLUMN IF NOT EXISTS cat1_bermudas TEXT DEFAULT 'nao_verificado' CHECK (cat1_bermudas IN ('conforme', 'nao_conforme', 'nao_verificado')),
ADD COLUMN IF NOT EXISTS cat1_bermudas_membros TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cat1_bermudas_observacoes TEXT DEFAULT '',

-- Item 7: TARJETA DE NOME/FUNÇÃO/NUMERAÇÃO FRENTE E COSTAS
ADD COLUMN IF NOT EXISTS cat1_tarjeta TEXT DEFAULT 'nao_verificado' CHECK (cat1_tarjeta IN ('conforme', 'nao_conforme', 'nao_verificado')),
ADD COLUMN IF NOT EXISTS cat1_tarjeta_membros TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cat1_tarjeta_observacoes TEXT DEFAULT '',

-- Item 8: ÓCULOS DE PROTEÇÃO/PROTETOR AURICULAR
ADD COLUMN IF NOT EXISTS cat1_oculos TEXT DEFAULT 'nao_verificado' CHECK (cat1_oculos IN ('conforme', 'nao_conforme', 'nao_verificado')),
ADD COLUMN IF NOT EXISTS cat1_oculos_membros TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cat1_oculos_observacoes TEXT DEFAULT '';

-- Atualizar campos obrigatórios para permitir valores padrão temporariamente
ALTER TABLE tp_verificacoes_uniformes ALTER COLUMN local DROP NOT NULL;
ALTER TABLE tp_verificacoes_uniformes ALTER COLUMN responsavel DROP NOT NULL;
ALTER TABLE tp_verificacoes_uniformes ALTER COLUMN equipe DROP NOT NULL;

-- Garantir que RLS está habilitado
ALTER TABLE tp_verificacoes_uniformes ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Permitir todas as operações para usuários autenticados" ON tp_verificacoes_uniformes;
DROP POLICY IF EXISTS "Permitir leitura para usuários anônimos" ON tp_verificacoes_uniformes;

-- Criar políticas de segurança
CREATE POLICY "Permitir todas as operações para usuários autenticados" ON tp_verificacoes_uniformes
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir leitura para usuários anônimos" ON tp_verificacoes_uniformes
  FOR SELECT USING (true);

-- Criar índices para melhor performance (se não existirem)
CREATE INDEX IF NOT EXISTS idx_tp_verificacoes_uniformes_data ON tp_verificacoes_uniformes(data_verificacao);
CREATE INDEX IF NOT EXISTS idx_tp_verificacoes_uniformes_equipe ON tp_verificacoes_uniformes(equipe);
CREATE INDEX IF NOT EXISTS idx_tp_verificacoes_uniformes_status ON tp_verificacoes_uniformes(status);
CREATE INDEX IF NOT EXISTS idx_tp_verificacoes_uniformes_responsavel ON tp_verificacoes_uniformes(responsavel);

-- Atualizar comentário da tabela
COMMENT ON TABLE tp_verificacoes_uniformes IS 'Tabela para armazenar verificações de uniformes dos bombeiros de aeródromo seguindo padrão da verificação de TP';
COMMENT ON COLUMN tp_verificacoes_uniformes.equipe IS 'Equipe verificada: Alfa, Bravo, Charlie ou Delta';
COMMENT ON COLUMN tp_verificacoes_uniformes.total_nao_verificados IS 'Total de 8 itens obrigatórios de uniformes';