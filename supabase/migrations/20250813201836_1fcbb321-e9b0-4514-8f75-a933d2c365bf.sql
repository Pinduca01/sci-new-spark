-- Update existing data: change BA-GS to GS
UPDATE public.bombeiros SET funcao = 'GS' WHERE funcao = 'BA-GS';

-- Add new columns to bombeiros table
ALTER TABLE public.bombeiros
ADD COLUMN telefone_sos TEXT,
ADD COLUMN matricula TEXT,
ADD COLUMN equipe TEXT NOT NULL DEFAULT 'Alfa' CHECK (equipe IN ('Alfa', 'Bravo', 'Charlie', 'Delta')),
ADD COLUMN ferista BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN data_curso_habilitacao DATE,
ADD COLUMN data_vencimento_credenciamento DATE,
ADD COLUMN proxima_atualizacao DATE,
ADD COLUMN cve TEXT,
ADD COLUMN data_aso DATE,
ADD COLUMN documentos_certificados TEXT[];

-- Update status constraint to new values
ALTER TABLE public.bombeiros DROP CONSTRAINT IF EXISTS bombeiros_status_check;
ALTER TABLE public.bombeiros ADD CONSTRAINT bombeiros_status_check CHECK (status IN ('Ativo', 'Licença', 'Atestado', 'Férias'));

-- Update existing status values
UPDATE public.bombeiros SET status = 'Ativo' WHERE status = 'ativo';
UPDATE public.bombeiros SET status = 'Férias' WHERE status = 'ferias';
UPDATE public.bombeiros SET status = 'Atestado' WHERE status = 'afastado';

-- Add unique constraint for matricula
ALTER TABLE public.bombeiros ADD CONSTRAINT bombeiros_matricula_unique UNIQUE (matricula);

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