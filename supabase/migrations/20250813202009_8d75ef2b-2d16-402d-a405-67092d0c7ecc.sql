-- Update existing records with sample matriculas and equipes
UPDATE public.bombeiros SET 
  matricula = LPAD((ROW_NUMBER() OVER (ORDER BY created_at))::TEXT, 6, '0'),
  equipe = CASE 
    WHEN (ROW_NUMBER() OVER (ORDER BY created_at)) % 4 = 1 THEN 'Alfa'
    WHEN (ROW_NUMBER() OVER (ORDER BY created_at)) % 4 = 2 THEN 'Bravo'
    WHEN (ROW_NUMBER() OVER (ORDER BY created_at)) % 4 = 3 THEN 'Charlie'
    ELSE 'Delta'
  END,
  telefone_sos = '(11) 99999-9999',
  ferista = CASE WHEN RANDOM() < 0.2 THEN true ELSE false END,
  data_curso_habilitacao = data_admissao + INTERVAL '30 days',
  data_vencimento_credenciamento = data_admissao + INTERVAL '2 years',
  proxima_atualizacao = CURRENT_DATE + INTERVAL '6 months',
  data_aso = CURRENT_DATE - INTERVAL '1 month'
WHERE matricula IS NULL;

-- Make matricula required and unique
ALTER TABLE public.bombeiros ALTER COLUMN matricula SET NOT NULL;
ALTER TABLE public.bombeiros ADD CONSTRAINT bombeiros_matricula_unique UNIQUE (matricula);

-- Make equipe required  
ALTER TABLE public.bombeiros ALTER COLUMN equipe SET NOT NULL;

-- Make ferista required
ALTER TABLE public.bombeiros ALTER COLUMN ferista SET NOT NULL;