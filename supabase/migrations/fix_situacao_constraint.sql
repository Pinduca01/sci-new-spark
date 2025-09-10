-- Corrigir constraint de situação para permitir todos os valores usados no frontend
-- Remove a constraint antiga e adiciona uma nova com todos os valores necessários

ALTER TABLE agentes_extintores DROP CONSTRAINT IF EXISTS agentes_extintores_situacao_check;

ALTER TABLE agentes_extintores ADD CONSTRAINT agentes_extintores_situacao_check 
CHECK (situacao IN ('ESTOQUE', 'EM_USO', 'MANUTENCAO', 'DESCARTADO', 'EM_LINHA'));

-- Atualizar registros existentes que possam ter valores antigos
UPDATE agentes_extintores SET situacao = 'EM_USO' WHERE situacao = 'EM_LINHA';