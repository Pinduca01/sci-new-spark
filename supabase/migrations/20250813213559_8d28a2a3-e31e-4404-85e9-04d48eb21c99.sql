-- Mapear os status existentes para os valores corretos
UPDATE bombeiros SET status = 
    CASE 
        WHEN LOWER(status) = 'ativo' THEN 'ativo'
        WHEN LOWER(status) = 'férias' THEN 'ferias'
        WHEN LOWER(status) = 'atestado' THEN 'licenca_medica'
        ELSE 'ativo'
    END;

-- Adicionar a constraint
ALTER TABLE bombeiros DROP CONSTRAINT IF EXISTS bombeiros_status_check;
ALTER TABLE bombeiros ADD CONSTRAINT bombeiros_status_check 
CHECK (status IN ('ativo', 'ferias', 'licenca_medica', 'afastamento'));