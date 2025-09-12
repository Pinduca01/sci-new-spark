-- Criar tabela para exercícios EPI/EPR
CREATE TABLE IF NOT EXISTS exercicios_epi (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL,
  equipe TEXT NOT NULL CHECK (equipe IN ('Alfa', 'Bravo', 'Charlie', 'Delta')),
  chefe_equipe TEXT NOT NULL,
  tipo_epi TEXT NOT NULL CHECK (tipo_epi IN ('EPI', 'EPR')),
  tempo_vestimento INTEGER NOT NULL, -- tempo em segundos
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Em Andamento', 'Concluído', 'Cancelado')),
  bombeiros TEXT[] NOT NULL DEFAULT '{}', -- array de IDs dos bombeiros
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE exercicios_epi ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Permitir leitura para usuários autenticados" ON exercicios_epi
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados" ON exercicios_epi
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização para usuários autenticados" ON exercicios_epi
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão para usuários autenticados" ON exercicios_epi
  FOR DELETE USING (auth.role() = 'authenticated');

-- Conceder permissões para as roles
GRANT ALL PRIVILEGES ON exercicios_epi TO authenticated;
GRANT SELECT ON exercicios_epi TO anon;

-- Criar índices para melhor performance
CREATE INDEX idx_exercicios_epi_data ON exercicios_epi(data);
CREATE INDEX idx_exercicios_epi_equipe ON exercicios_epi(equipe);
CREATE INDEX idx_exercicios_epi_status ON exercicios_epi(status);
CREATE INDEX idx_exercicios_epi_tipo_epi ON exercicios_epi(tipo_epi);

-- Inserir alguns dados de exemplo
INSERT INTO exercicios_epi (data, equipe, chefe_equipe, tipo_epi, tempo_vestimento, status, bombeiros, observacoes) VALUES
('2024-01-13', 'Alfa', 'Ronan', 'EPI', 180, 'Concluído', '{"bombeiro1", "bombeiro2", "bombeiro3"}', 'Exercício realizado com sucesso'),
('2024-01-09', 'Bravo', 'Gediael', 'EPR', 240, 'Concluído', '{"bombeiro4", "bombeiro5", "bombeiro6"}', 'Tempo dentro do esperado'),
('2024-01-07', 'Charlie', 'Leonardo', 'EPI', 165, 'Concluído', '{"bombeiro7", "bombeiro8", "bombeiro9"}', 'Excelente desempenho da equipe'),
('2024-01-11', 'Delta', 'Diego', 'EPR', 210, 'Concluído', '{"bombeiro10", "bombeiro11", "bombeiro12"}', 'Necessário revisar procedimentos'),
('2024-01-14', 'Alfa', 'Ronan', 'EPI', 195, 'Concluído', '{"bombeiro1", "bombeiro13", "bombeiro14"}', 'Treinamento de rotina');