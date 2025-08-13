-- Remove all existing check constraints first
ALTER TABLE public.bombeiros DROP CONSTRAINT IF EXISTS bombeiros_status_check;
ALTER TABLE public.bombeiros DROP CONSTRAINT IF EXISTS bombeiros_funcao_check;
ALTER TABLE public.bombeiros DROP CONSTRAINT IF EXISTS bombeiros_turno_check;

-- Update status values
UPDATE public.bombeiros SET status = 'Ativo' WHERE status = 'ativo';
UPDATE public.bombeiros SET status = 'Férias' WHERE status = 'ferias';  
UPDATE public.bombeiros SET status = 'Atestado' WHERE status = 'afastado';

-- Update function values
UPDATE public.bombeiros SET funcao = 'GS' WHERE funcao LIKE '%GS%';

-- Add new columns
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

-- Add the new check constraints
ALTER TABLE public.bombeiros ADD CONSTRAINT bombeiros_status_check 
  CHECK (status IN ('Ativo', 'Licença', 'Atestado', 'Férias'));

ALTER TABLE public.bombeiros ADD CONSTRAINT bombeiros_equipe_check 
  CHECK (equipe IN ('Alfa', 'Bravo', 'Charlie', 'Delta'));

ALTER TABLE public.bombeiros ADD CONSTRAINT bombeiros_funcao_check 
  CHECK (funcao IN ('GS', 'BA-CE', 'BA-LR', 'BA-MC', 'BA-2'));