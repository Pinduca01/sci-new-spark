-- Sprint 1: Migrations para Sistema de Checklist Mobile

-- 1. Adicionar colunas em checklists_viaturas
ALTER TABLE checklists_viaturas 
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES checklist_templates(id),
ADD COLUMN IF NOT EXISTS bombeiro_responsavel_id UUID REFERENCES bombeiros(id),
ADD COLUMN IF NOT EXISTS assinatura_digital TEXT;

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_checklists_viaturas_template 
ON checklists_viaturas(template_id);

CREATE INDEX IF NOT EXISTS idx_checklists_viaturas_bombeiro 
ON checklists_viaturas(bombeiro_responsavel_id);

-- 3. Modificar nao_conformidades para suportar múltiplas imagens
ALTER TABLE nao_conformidades 
ADD COLUMN IF NOT EXISTS imagens JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN nao_conformidades.imagens IS 'Array de URLs das imagens da não conformidade (max 3)';

-- 4. RLS Policies para BA-MC e BA-2

-- Remover policies antigas se existirem
DROP POLICY IF EXISTS "ba_mc_ba2_insert_checklists" ON checklists_viaturas;
DROP POLICY IF EXISTS "ba_mc_ba2_view_base_checklists" ON checklists_viaturas;
DROP POLICY IF EXISTS "ba_mc_ba2_upload_nc_photos" ON storage.objects;
DROP POLICY IF EXISTS "ba_mc_ba2_view_nc_photos" ON storage.objects;

-- Política para inserção de checklists (BA-MC e BA-2)
CREATE POLICY "ba_mc_ba2_insert_checklists"
ON checklists_viaturas FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM bombeiros b
    WHERE b.user_id = auth.uid()
    AND b.funcao IN ('BA-MC', 'BA-2')
  )
);

-- Política para visualização de checklists da própria base
CREATE POLICY "ba_mc_ba2_view_base_checklists"
ON checklists_viaturas FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM viaturas v
    JOIN bombeiros b ON b.base_id = v.base_id
    WHERE v.id = checklists_viaturas.viatura_id
    AND b.user_id = auth.uid()
    AND b.funcao IN ('BA-MC', 'BA-2')
  )
);

-- Política para upload de fotos de não conformidades
CREATE POLICY "ba_mc_ba2_upload_nc_photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'nao-conformidades'
  AND EXISTS (
    SELECT 1 FROM bombeiros
    WHERE user_id = auth.uid()
    AND funcao IN ('BA-MC', 'BA-2')
  )
);

-- Política para visualização de fotos de NC da própria base
CREATE POLICY "ba_mc_ba2_view_nc_photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'nao-conformidades'
  AND EXISTS (
    SELECT 1 FROM bombeiros
    WHERE user_id = auth.uid()
    AND funcao IN ('BA-MC', 'BA-2')
  )
);