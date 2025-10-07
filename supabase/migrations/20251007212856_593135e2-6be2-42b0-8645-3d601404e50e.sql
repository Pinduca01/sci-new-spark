-- Remove a foreign key incorreta que referencia checklist_templates (vazia)
ALTER TABLE checklists_viaturas 
DROP CONSTRAINT IF EXISTS checklists_viaturas_template_id_fkey;

-- Adiciona nova foreign key correta que referencia tipos_checklist
ALTER TABLE checklists_viaturas 
ADD CONSTRAINT checklists_viaturas_template_id_fkey 
FOREIGN KEY (template_id) REFERENCES tipos_checklist(id) ON DELETE SET NULL;