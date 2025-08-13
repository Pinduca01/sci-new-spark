-- Drop existing constraint if exists
ALTER TABLE bombeiros DROP CONSTRAINT IF EXISTS bombeiros_status_check;

-- Add correct constraint for status
ALTER TABLE bombeiros ADD CONSTRAINT bombeiros_status_check 
CHECK (status IN ('ativo', 'ferias', 'licenca_medica', 'afastamento'));