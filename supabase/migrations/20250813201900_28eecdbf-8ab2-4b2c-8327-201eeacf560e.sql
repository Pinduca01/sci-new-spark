-- First, fix existing status values before applying constraint
UPDATE public.bombeiros SET status = 'Ativo' WHERE status IN ('ativo', 'active');
UPDATE public.bombeiros SET status = 'Férias' WHERE status IN ('ferias', 'vacation');
UPDATE public.bombeiros SET status = 'Atestado' WHERE status IN ('afastado', 'away');
UPDATE public.bombeiros SET status = 'Licença' WHERE status = 'inativo';

-- Update existing data: change BA-GS to GS
UPDATE public.bombeiros SET funcao = 'GS' WHERE funcao LIKE '%GS%';

-- Add new columns to bombeiros table
ALTER TABLE public.bombeiros
ADD COLUMN IF NOT EXISTS telefone_sos TEXT,
ADD COLUMN IF NOT EXISTS matricula TEXT,
ADD COLUMN IF NOT EXISTS equipe TEXT NOT NULL DEFAULT 'Alfa',
ADD COLUMN IF NOT EXISTS ferista BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS data_curso_habilitacao DATE,
ADD COLUMN IF NOT EXISTS data_vencimento_credenciamento DATE,
ADD COLUMN IF NOT EXISTS proxima_atualizacao DATE,
ADD COLUMN IF NOT EXISTS cve TEXT,
ADD COLUMN IF NOT EXISTS data_aso DATE,
ADD COLUMN IF NOT EXISTS documentos_certificados TEXT[];

-- Drop existing constraints
ALTER TABLE public.bombeiros DROP CONSTRAINT IF EXISTS bombeiros_status_check;
ALTER TABLE public.bombeiros DROP CONSTRAINT IF EXISTS bombeiros_equipe_check;

-- Add new constraints
ALTER TABLE public.bombeiros ADD CONSTRAINT bombeiros_status_check CHECK (status IN ('Ativo', 'Licença', 'Atestado', 'Férias'));
ALTER TABLE public.bombeiros ADD CONSTRAINT bombeiros_equipe_check CHECK (equipe IN ('Alfa', 'Bravo', 'Charlie', 'Delta'));