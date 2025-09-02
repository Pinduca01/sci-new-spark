-- Adicionar colunas para assinatura digital na tabela tp_verificacoes
ALTER TABLE tp_verificacoes 
ADD COLUMN assinatura_digital JSONB,
ADD COLUMN status_assinatura VARCHAR(50) DEFAULT 'rascunho',
ADD COLUMN documento_enviado BOOLEAN DEFAULT false;

-- Comentários para documentar as novas colunas
COMMENT ON COLUMN tp_verificacoes.assinatura_digital IS 'Dados da assinatura digital em formato JSON';
COMMENT ON COLUMN tp_verificacoes.status_assinatura IS 'Status da assinatura: rascunho, enviado, assinado';
COMMENT ON COLUMN tp_verificacoes.documento_enviado IS 'Indica se o documento foi enviado para assinatura';

-- Índice para melhorar performance nas consultas por status
CREATE INDEX idx_tp_verificacoes_status_assinatura ON tp_verificacoes(status_assinatura);