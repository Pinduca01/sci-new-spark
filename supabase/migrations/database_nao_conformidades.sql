-- Criação da tabela para armazenar não conformidades dos checklists
-- Esta tabela armazena as informações detalhadas sobre itens não conformes
-- incluindo imagens e descrições

CREATE TABLE IF NOT EXISTS nao_conformidades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID NOT NULL REFERENCES checklists_viaturas(id) ON DELETE CASCADE,
  item_id VARCHAR(50) NOT NULL, -- ID do item do checklist (ex: 'ext_1', 'cab_5')
  item_nome TEXT NOT NULL, -- Nome do item do checklist
  secao VARCHAR(50) NOT NULL, -- Seção do checklist (ex: 'check_externo', 'cabine')
  descricao TEXT NOT NULL, -- Descrição da não conformidade
  imagem_url TEXT, -- URL da imagem no Supabase Storage
  imagem_nome TEXT, -- Nome original do arquivo de imagem
  bombeiro_responsavel VARCHAR(255) NOT NULL, -- Nome do bombeiro que reportou
  data_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_nao_conformidades_checklist_id ON nao_conformidades(checklist_id);
CREATE INDEX IF NOT EXISTS idx_nao_conformidades_item_id ON nao_conformidades(item_id);
CREATE INDEX IF NOT EXISTS idx_nao_conformidades_secao ON nao_conformidades(secao);
CREATE INDEX IF NOT EXISTS idx_nao_conformidades_data_registro ON nao_conformidades(data_registro);

-- Comentários para documentação
COMMENT ON TABLE nao_conformidades IS 'Tabela para armazenar não conformidades encontradas durante checklists de viaturas';
COMMENT ON COLUMN nao_conformidades.checklist_id IS 'Referência ao checklist onde a não conformidade foi encontrada';
COMMENT ON COLUMN nao_conformidades.item_id IS 'ID único do item do checklist que apresentou não conformidade';
COMMENT ON COLUMN nao_conformidades.item_nome IS 'Nome descritivo do item que apresentou não conformidade';
COMMENT ON COLUMN nao_conformidades.secao IS 'Seção do checklist onde o item está localizado';
COMMENT ON COLUMN nao_conformidades.descricao IS 'Descrição detalhada da não conformidade encontrada';
COMMENT ON COLUMN nao_conformidades.imagem_url IS 'URL da imagem da não conformidade armazenada no Supabase Storage';
COMMENT ON COLUMN nao_conformidades.imagem_nome IS 'Nome original do arquivo de imagem enviado';
COMMENT ON COLUMN nao_conformidades.bombeiro_responsavel IS 'Nome do bombeiro que identificou e reportou a não conformidade';

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_nao_conformidades_updated_at
    BEFORE UPDATE ON nao_conformidades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Configuração do bucket de storage para imagens de não conformidades
-- Este comando deve ser executado no Supabase Dashboard ou via SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('nao-conformidades', 'nao-conformidades', true)
ON CONFLICT (id) DO NOTHING;

-- Política de acesso para o bucket de não conformidades
-- Permite que usuários autenticados façam upload e visualizem imagens
CREATE POLICY "Usuários autenticados podem fazer upload de imagens" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'nao-conformidades' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Usuários autenticados podem visualizar imagens" ON storage.objects
FOR SELECT USING (
  bucket_id = 'nao-conformidades' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Usuários autenticados podem deletar suas imagens" ON storage.objects
FOR DELETE USING (
  bucket_id = 'nao-conformidades' AND
  auth.role() = 'authenticated'
);

-- RLS (Row Level Security) para a tabela nao_conformidades
ALTER TABLE nao_conformidades ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários autenticados vejam todas as não conformidades
CREATE POLICY "Usuários autenticados podem ver não conformidades" ON nao_conformidades
FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir que usuários autenticados criem não conformidades
CREATE POLICY "Usuários autenticados podem criar não conformidades" ON nao_conformidades
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir que usuários autenticados atualizem não conformidades
CREATE POLICY "Usuários autenticados podem atualizar não conformidades" ON nao_conformidades
FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para permitir que usuários autenticados deletem não conformidades
CREATE POLICY "Usuários autenticados podem deletar não conformidades" ON nao_conformidades
FOR DELETE USING (auth.role() = 'authenticated');