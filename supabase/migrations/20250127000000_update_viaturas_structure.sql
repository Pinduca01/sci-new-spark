-- Migração para atualizar estrutura da tabela viaturas
-- Adicionar campo nome_viatura e remover campos desnecessários

-- Adicionar coluna nome_viatura
ALTER TABLE public.viaturas ADD COLUMN nome_viatura TEXT;

-- Remover colunas que não são mais necessárias
ALTER TABLE public.viaturas DROP COLUMN IF EXISTS placa;
ALTER TABLE public.viaturas DROP COLUMN IF EXISTS ano;
ALTER TABLE public.viaturas DROP COLUMN IF EXISTS km_atual;
ALTER TABLE public.viaturas DROP COLUMN IF EXISTS data_ultima_revisao;
ALTER TABLE public.viaturas DROP COLUMN IF EXISTS proxima_revisao;

-- Atualizar tipos permitidos para o campo tipo
ALTER TABLE public.viaturas DROP CONSTRAINT IF EXISTS viaturas_tipo_check;
ALTER TABLE public.viaturas ADD CONSTRAINT viaturas_tipo_check 
  CHECK (tipo IN ('CCI', 'CRS', 'CCI RT', 'CA'));

-- Atualizar status permitidos
ALTER TABLE public.viaturas DROP CONSTRAINT IF EXISTS viaturas_status_check;
ALTER TABLE public.viaturas ADD CONSTRAINT viaturas_status_check 
  CHECK (status IN ('ativo', 'baixada'));

-- Atualizar valor padrão do tipo
ALTER TABLE public.viaturas ALTER COLUMN tipo SET DEFAULT 'CCI';

-- Limpar dados de exemplo antigos e inserir novos dados de exemplo
DELETE FROM public.viaturas;

INSERT INTO public.viaturas (nome_viatura, prefixo, modelo, tipo, status, observacoes) VALUES
('CCI 01', 'CCR 330', 'IVECO MAGIRUS X6', 'CCI', 'ativo', 'Viatura principal de combate a incêndio'),
('CRS 01', 'CCR 331', 'MERCEDES ATEGO', 'CRS', 'ativo', 'Viatura de salvamento e resgate'),
('CA 01', 'CCR 332', 'FORD F-350', 'CA', 'ativo', 'Viatura de apoio operacional'),
('CCI RT 01', 'CCR 333', 'IVECO DAILY', 'CCI RT', 'baixada', 'Reserva técnica em manutenção');