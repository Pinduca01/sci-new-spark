-- Update existing records with sample data using a simpler approach
WITH numbered_rows AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.bombeiros
  WHERE matricula IS NULL
)
UPDATE public.bombeiros 
SET 
  matricula = LPAD(numbered_rows.rn::TEXT, 6, '0'),
  equipe = CASE 
    WHEN numbered_rows.rn % 4 = 1 THEN 'Alfa'
    WHEN numbered_rows.rn % 4 = 2 THEN 'Bravo'
    WHEN numbered_rows.rn % 4 = 3 THEN 'Charlie'
    ELSE 'Delta'
  END,
  telefone_sos = '(11) 99999-9999',
  ferista = (numbered_rows.rn % 5 = 0),
  data_curso_habilitacao = data_admissao + INTERVAL '30 days',
  data_vencimento_credenciamento = data_admissao + INTERVAL '2 years',
  proxima_atualizacao = CURRENT_DATE + INTERVAL '6 months',
  data_aso = CURRENT_DATE - INTERVAL '1 month'
FROM numbered_rows
WHERE public.bombeiros.id = numbered_rows.id;