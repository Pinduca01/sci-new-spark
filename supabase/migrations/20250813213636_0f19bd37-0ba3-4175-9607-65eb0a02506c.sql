-- Normalizar os status existentes para os valores corretos
UPDATE bombeiros SET status = 
    CASE 
        WHEN status = 'Ativo' THEN 'ativo'
        WHEN status = 'Férias' THEN 'ferias'
        WHEN status = 'Atestado' THEN 'licenca_medica'
        ELSE 'ativo'
    END;

-- Recriar a constraint com os valores corretos
ALTER TABLE bombeiros ADD CONSTRAINT bombeiros_status_check 
CHECK (status IN ('ativo', 'ferias', 'licenca_medica', 'afastamento'));