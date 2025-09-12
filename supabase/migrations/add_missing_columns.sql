-- Adicionar colunas ausentes na tabela ocorrencias
-- Baseado na comparação entre formSchema e estrutura atual da tabela

-- Adicionar coluna identificacao_aeroporto (campo obrigatório no formulário)
ALTER TABLE ocorrencias ADD COLUMN IF NOT EXISTS identificacao_aeroporto TEXT;

-- Verificar se outras colunas estão presentes e adicionar se necessário
-- Estas colunas já existem na tabela conforme verificado:
-- tipo_ocorrencia, local_mapa_grade, data_ocorrencia, hora_ocorrencia, 
-- hora_acionamento, hora_chegada_local, hora_termino, hora_retorno_sci,
-- equipe, numero_bombeiros_envolvidos, bombeiros_envolvidos, contador_ocorrencia,
-- quantidade_vitimas, quantidade_obitos, viaturas, equipamentos, 
-- descricao_inicial, descricao_detalhada

-- Garantir que as permissões estão corretas para as novas colunas
GRANT SELECT, INSERT, UPDATE ON ocorrencias TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ocorrencias TO authenticated;