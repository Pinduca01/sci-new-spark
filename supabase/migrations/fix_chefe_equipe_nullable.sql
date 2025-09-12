-- Alterar a coluna chefe_equipe para permitir valores NULL
ALTER TABLE exercicios_epi 
ALTER COLUMN chefe_equipe DROP NOT NULL;

-- Comentário explicativo
COMMENT ON COLUMN exercicios_epi.chefe_equipe IS 'Nome do chefe de equipe responsável pelo exercício. Campo opcional.';