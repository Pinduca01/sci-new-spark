
-- Criar tabela para armazenar as instruções PTR-BA
CREATE TABLE public.ptr_instrucoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL,
  hora TIME NOT NULL,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  instrutor_id UUID REFERENCES public.bombeiros(id),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para controlar participantes de cada instrução
CREATE TABLE public.ptr_participantes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ptr_instrucao_id UUID NOT NULL REFERENCES public.ptr_instrucoes(id) ON DELETE CASCADE,
  bombeiro_id UUID NOT NULL REFERENCES public.bombeiros(id),
  presente BOOLEAN DEFAULT false,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ptr_instrucao_id, bombeiro_id)
);

-- Criar tabela para armazenar fotos das instruções
CREATE TABLE public.ptr_fotos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ptr_instrucao_id UUID NOT NULL REFERENCES public.ptr_instrucoes(id) ON DELETE CASCADE,
  foto_url TEXT NOT NULL,
  descricao TEXT,
  ordem INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para controlar relatórios gerados
CREATE TABLE public.ptr_relatorios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'gerado',
  pdf_url TEXT,
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar bucket para armazenar fotos das instruções PTR
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ptr-fotos', 'ptr-fotos', true);

-- Habilitar RLS nas tabelas
ALTER TABLE public.ptr_instrucoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ptr_participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ptr_fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ptr_relatorios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para ptr_instrucoes
CREATE POLICY "Admin users can view all ptr instrucoes" 
  ON public.ptr_instrucoes FOR SELECT 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can insert ptr instrucoes" 
  ON public.ptr_instrucoes FOR INSERT 
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can update ptr instrucoes" 
  ON public.ptr_instrucoes FOR UPDATE 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can delete ptr instrucoes" 
  ON public.ptr_instrucoes FOR DELETE 
  USING (get_current_user_role() = 'admin');

-- Políticas RLS para ptr_participantes
CREATE POLICY "Admin users can view all ptr participantes" 
  ON public.ptr_participantes FOR SELECT 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can insert ptr participantes" 
  ON public.ptr_participantes FOR INSERT 
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can update ptr participantes" 
  ON public.ptr_participantes FOR UPDATE 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can delete ptr participantes" 
  ON public.ptr_participantes FOR DELETE 
  USING (get_current_user_role() = 'admin');

-- Políticas RLS para ptr_fotos
CREATE POLICY "Admin users can view all ptr fotos" 
  ON public.ptr_fotos FOR SELECT 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can insert ptr fotos" 
  ON public.ptr_fotos FOR INSERT 
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can update ptr fotos" 
  ON public.ptr_fotos FOR UPDATE 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can delete ptr fotos" 
  ON public.ptr_fotos FOR DELETE 
  USING (get_current_user_role() = 'admin');

-- Políticas RLS para ptr_relatorios
CREATE POLICY "Admin users can view all ptr relatorios" 
  ON public.ptr_relatorios FOR SELECT 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can insert ptr relatorios" 
  ON public.ptr_relatorios FOR INSERT 
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can update ptr relatorios" 
  ON public.ptr_relatorios FOR UPDATE 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can delete ptr relatorios" 
  ON public.ptr_relatorios FOR DELETE 
  USING (get_current_user_role() = 'admin');

-- Políticas RLS para o bucket ptr-fotos
CREATE POLICY "Admin users can upload ptr fotos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'ptr-fotos' AND 
    get_current_user_role() = 'admin'
  );

CREATE POLICY "Admin users can view ptr fotos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'ptr-fotos' AND 
    get_current_user_role() = 'admin'
  );

CREATE POLICY "Admin users can delete ptr fotos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'ptr-fotos' AND 
    get_current_user_role() = 'admin'
  );

-- Criar índices para melhor performance
CREATE INDEX idx_ptr_instrucoes_data ON public.ptr_instrucoes(data);
CREATE INDEX idx_ptr_instrucoes_instrutor ON public.ptr_instrucoes(instrutor_id);
CREATE INDEX idx_ptr_participantes_instrucao ON public.ptr_participantes(ptr_instrucao_id);
CREATE INDEX idx_ptr_participantes_bombeiro ON public.ptr_participantes(bombeiro_id);
CREATE INDEX idx_ptr_fotos_instrucao ON public.ptr_fotos(ptr_instrucao_id);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_ptr_instrucoes_updated_at 
  BEFORE UPDATE ON public.ptr_instrucoes 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ptr_participantes_updated_at 
  BEFORE UPDATE ON public.ptr_participantes 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ptr_relatorios_updated_at 
  BEFORE UPDATE ON public.ptr_relatorios 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
