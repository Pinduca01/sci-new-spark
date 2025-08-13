-- Criar tabela de ocorrências
CREATE TABLE public.ocorrencias (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  tipo_ocorrencia text NOT NULL,
  local_mapa_grade text,
  latitude real,
  longitude real,
  data_ocorrencia date NOT NULL,
  hora_acionamento time NOT NULL,
  hora_chegada_local time,
  hora_termino time,
  tempo_gasto_minutos integer,
  equipe text NOT NULL,
  bombeiros_envolvidos uuid[] DEFAULT '{}',
  quantidade_bombeiros integer DEFAULT 0,
  quantidade_vitimas integer DEFAULT 0,
  quantidade_obitos integer DEFAULT 0,
  viaturas text,
  equipamentos text,
  descricao_inicial text,
  descricao_detalhada text,
  status text DEFAULT 'concluido',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.ocorrencias ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS - apenas admins podem acessar
CREATE POLICY "Admin users can view all ocorrencias" 
ON public.ocorrencias 
FOR SELECT 
TO authenticated
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admin users can insert ocorrencias" 
ON public.ocorrencias 
FOR INSERT 
TO authenticated
WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admin users can update ocorrencias" 
ON public.ocorrencias 
FOR UPDATE 
TO authenticated
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admin users can delete ocorrencias" 
ON public.ocorrencias 
FOR DELETE 
TO authenticated
USING (public.get_current_user_role() = 'admin');

-- Trigger para atualizar updated_at
CREATE TRIGGER update_ocorrencias_updated_at
BEFORE UPDATE ON public.ocorrencias
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();