
-- Criar tabela para checklists do almoxarifado
CREATE TABLE public.checklists_almoxarifado (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data_checklist DATE NOT NULL DEFAULT CURRENT_DATE,
  hora_checklist TIME NOT NULL DEFAULT CURRENT_TIME,
  bombeiro_responsavel_id UUID NOT NULL,
  bombeiro_responsavel_nome TEXT NOT NULL,
  status_geral TEXT NOT NULL DEFAULT 'em_andamento' CHECK (status_geral IN ('em_andamento', 'concluido', 'pendente')),
  itens_checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  assinatura_digital TEXT,
  observacoes_gerais TEXT,
  total_itens INTEGER DEFAULT 0,
  itens_conformes INTEGER DEFAULT 0,
  itens_divergentes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela
ALTER TABLE public.checklists_almoxarifado ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para a tabela checklists_almoxarifado
CREATE POLICY "Admin users can view all checklists almoxarifado" 
  ON public.checklists_almoxarifado 
  FOR SELECT 
  USING (get_current_user_role() = 'admin'::text);

CREATE POLICY "Admin users can insert checklists almoxarifado" 
  ON public.checklists_almoxarifado 
  FOR INSERT 
  WITH CHECK (get_current_user_role() = 'admin'::text);

CREATE POLICY "Admin users can update checklists almoxarifado" 
  ON public.checklists_almoxarifado 
  FOR UPDATE 
  USING (get_current_user_role() = 'admin'::text);

CREATE POLICY "Admin users can delete checklists almoxarifado" 
  ON public.checklists_almoxarifado 
  FOR DELETE 
  USING (get_current_user_role() = 'admin'::text);

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE TRIGGER update_checklists_almoxarifado_updated_at
  BEFORE UPDATE ON public.checklists_almoxarifado
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para melhor performance
CREATE INDEX idx_checklists_almoxarifado_data ON public.checklists_almoxarifado(data_checklist);
CREATE INDEX idx_checklists_almoxarifado_responsavel ON public.checklists_almoxarifado(bombeiro_responsavel_id);
CREATE INDEX idx_checklists_almoxarifado_status ON public.checklists_almoxarifado(status_geral);
