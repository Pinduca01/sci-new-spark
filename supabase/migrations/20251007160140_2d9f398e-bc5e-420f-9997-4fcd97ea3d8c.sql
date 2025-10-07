-- Criar template CCI baseado nos itens de VIATURA
INSERT INTO checklist_templates (nome, tipo_viatura, categoria, ativo, itens)
SELECT 
  'Checklist CCI - Carro Contra Incêndio',
  'CCI',
  'viatura',
  true,
  jsonb_agg(
    jsonb_build_object(
      'id', tc.ordem,
      'item', tc.item,
      'tipo', 'verificacao',
      'obrigatorio', COALESCE(tc.obrigatorio, true),
      'ordem', tc.ordem,
      'categoria', tc.categoria
    ) ORDER BY tc.ordem
  )
FROM template_checklist tc
WHERE tc.tipo_checklist_id = '8c55f9b8-eedb-4628-a90b-230790b456ab';