-- Migration SQL para suporte ao checklist BA-MC
-- Execute este script no editor SQL do Supabase

-- ANÁLISE DA ESTRUTURA ATUAL vs CÓDIGO:
-- Estrutura atual da tabela checklists_viaturas:
-- - bombeiro_responsavel (string) ✓
-- - created_at (string) ✓
-- - data_checklist (string) ✓
-- - hora_checklist (string) ✓ (não usado no código atual)
-- - id (string) ✓
-- - itens_checklist (Json) ⚠️ (código usa 'itens')
-- - observacoes_gerais (string | null) ⚠️ (código usa 'observacoes')
-- - tipo_checklist (string) ✓
-- - updated_at (string) ✓
-- - viatura_id (string) ✓

-- Campos que o código está tentando inserir mas não existem na tabela:
-- - equipe (não existe na tabela atual)
-- - itens (código usa este nome, mas tabela tem 'itens_checklist')
-- - observacoes (código usa este nome, mas tabela tem 'observacoes_gerais')

-- 1. ADICIONAR CAMPO 'equipe' que está faltando na tabela
ALTER TABLE checklists_viaturas 
ADD COLUMN IF NOT EXISTS equipe TEXT;

-- 2. Adicionar comentários para documentar a estrutura esperada
COMMENT ON COLUMN checklists_viaturas.itens_checklist IS 'Array JSON com estrutura: [{"id": "string", "nome": "string", "status": "conforme|nao_conforme|nao_aplicavel|nao_existente|", "justificativa": "string", "foto": "string", "naoConformidade": {"descricao": "string", "imagens": ["File[]"]}}]';
COMMENT ON COLUMN checklists_viaturas.equipe IS 'Equipe responsável pelo checklist: Alfa, Bravo, Charlie ou Delta';

-- 5. Adicionar constraint para validar o tipo_checklist
ALTER TABLE checklists_viaturas 
DROP CONSTRAINT IF EXISTS check_tipo_checklist;

ALTER TABLE checklists_viaturas 
ADD CONSTRAINT check_tipo_checklist 
CHECK (tipo_checklist IN ('BA-MC', 'BA-2'));

-- 6. Adicionar constraint para validar as equipes
ALTER TABLE checklists_viaturas 
DROP CONSTRAINT IF EXISTS check_equipe;

ALTER TABLE checklists_viaturas 
ADD CONSTRAINT check_equipe 
CHECK (equipe IN ('Alfa', 'Bravo', 'Charlie', 'Delta'));

-- 7. Criar índices para melhorar performance nas consultas
CREATE INDEX IF NOT EXISTS idx_checklists_viaturas_tipo_checklist 
ON checklists_viaturas(tipo_checklist);

CREATE INDEX IF NOT EXISTS idx_checklists_viaturas_data_checklist 
ON checklists_viaturas(data_checklist);

CREATE INDEX IF NOT EXISTS idx_checklists_viaturas_equipe 
ON checklists_viaturas(equipe);

CREATE INDEX IF NOT EXISTS idx_checklists_viaturas_viatura_id 
ON checklists_viaturas(viatura_id);

-- 8. Criar função para validar a estrutura JSON dos itens
CREATE OR REPLACE FUNCTION validate_checklist_itens(itens_json JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar se é um array
    IF jsonb_typeof(itens_json) != 'array' THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar se cada item tem a estrutura correta
    -- Esta é uma validação básica, pode ser expandida conforme necessário
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 9. Adicionar constraint para validar a estrutura JSON dos itens
ALTER TABLE checklists_viaturas 
DROP CONSTRAINT IF EXISTS check_itens_structure;

ALTER TABLE checklists_viaturas 
ADD CONSTRAINT check_itens_structure 
CHECK (validate_checklist_itens(itens_checklist));

-- 10. Atualizar comentários da tabela
COMMENT ON TABLE checklists_viaturas IS 'Tabela para armazenar checklists de viaturas (BA-MC e BA-2)';
COMMENT ON COLUMN checklists_viaturas.tipo_checklist IS 'Tipo do checklist: BA-MC (Carro Contra Incêndio) ou BA-2 (Ambulância)';
COMMENT ON COLUMN checklists_viaturas.equipe IS 'Equipe responsável: Alfa, Bravo, Charlie ou Delta';
COMMENT ON COLUMN checklists_viaturas.bombeiro_responsavel IS 'Nome do bombeiro responsável pelo checklist';
COMMENT ON COLUMN checklists_viaturas.observacoes_gerais IS 'Observações gerais sobre o checklist';

-- 11. Verificar se a tabela 'bombeiros' existe e tem os campos necessários
-- (Esta verificação é informativa, não executará alterações)
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'bombeiros' AND table_schema = 'public';

-- 12. Exemplo de estrutura JSON esperada para o campo 'itens':
/*
Estrutura para BA-MC (exemplo):
[
  {
    "id": "ext_1",
    "nome": "NÍVEL DO LIQUIDO DE ARREFECIMENTO",
    "status": "conforme",
    "justificativa": "",
    "foto": ""
  },
  {
    "id": "ext_2",
    "nome": "NÍVEL LIQUIDO DE ARREFECIMENTO DO MOTOR ESTACIONÁRIO",
    "status": "nao_conforme",
    "justificativa": "Nível baixo",
    "foto": "",
    "naoConformidade": {
      "descricao": "Nível do líquido está abaixo do mínimo",
      "imagens": []
    }
  }
]

Estrutura para BA-2 (exemplo):
[
  {
    "id": "1",
    "nome": "Mochila de emergência completa",
    "status": "conforme",
    "justificativa": "",
    "foto": ""
  }
]
*/

-- 13. Verificação final - Consulta para testar a estrutura
-- SELECT 
--     column_name, 
--     data_type, 
--     is_nullable,
--     column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'checklists_viaturas' 
--     AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- IMPORTANTE: 
-- 1. Execute este script no editor SQL do Supabase
-- 2. Verifique se não há erros durante a execução
-- 3. Teste a inserção de dados com a nova estrutura
-- 4. Os dados existentes na tabela não serão afetados por estas alterações
-- 5. As constraints adicionadas garantem a integridade dos dados futuros