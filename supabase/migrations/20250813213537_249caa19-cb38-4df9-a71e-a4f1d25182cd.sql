-- Primeiro, normalizar os status existentes para lowercase
UPDATE bombeiros SET status = LOWER(status);

-- Depois, adicionar a constraint correta
ALTER TABLE bombeiros DROP CONSTRAINT IF EXISTS bombeiros_status_check;
ALTER TABLE bombeiros ADD CONSTRAINT bombeiros_status_check 
CHECK (status IN ('ativo', 'ferias', 'licenca_medica', 'afastamento'));