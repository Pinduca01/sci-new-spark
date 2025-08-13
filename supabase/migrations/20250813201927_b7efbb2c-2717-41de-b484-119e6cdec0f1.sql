-- Step 1: Update status values to match the new constraint
UPDATE public.bombeiros SET status = 'Ativo' WHERE status = 'ativo';
UPDATE public.bombeiros SET status = 'Férias' WHERE status = 'ferias';  
UPDATE public.bombeiros SET status = 'Atestado' WHERE status = 'afastado';

-- Step 2: Add new columns without constraints first
ALTER TABLE public.bombeiros
ADD COLUMN IF NOT EXISTS telefone_sos TEXT,
ADD COLUMN IF NOT EXISTS matricula TEXT,
ADD COLUMN IF NOT EXISTS equipe TEXT DEFAULT 'Alfa',
ADD COLUMN IF NOT EXISTS ferista BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS data_curso_habilitacao DATE,
ADD COLUMN IF NOT EXISTS data_vencimento_credenciamento DATE,
ADD COLUMN IF NOT EXISTS proxima_atualizacao DATE,
ADD COLUMN IF NOT EXISTS cve TEXT,
ADD COLUMN IF NOT EXISTS data_aso DATE,
ADD COLUMN IF NOT EXISTS documentos_certificados TEXT[];

-- Step 3: Update existing records with sample data
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
WHERE matricula IS NULL OR equipe IS NULL;