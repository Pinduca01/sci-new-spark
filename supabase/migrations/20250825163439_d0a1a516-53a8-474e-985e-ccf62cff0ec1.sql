
-- Criar tabela para metas do TAF por faixa etária
CREATE TABLE public.taf_metas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faixa_etaria TEXT NOT NULL, -- 'abaixo_40' ou 'acima_40'
  tempo_limite_minutos INTEGER NOT NULL, -- 3 ou 4 minutos
  meta_flexoes INTEGER NOT NULL, -- 30
  meta_abdominais INTEGER NOT NULL, -- 45
  meta_polichinelos INTEGER NOT NULL, -- 45
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para registrar as avaliações TAF
CREATE TABLE public.taf_avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bombeiro_id UUID NOT NULL REFERENCES public.bombeiros(id),
  data_teste DATE NOT NULL DEFAULT CURRENT_DATE,
  idade_na_data INTEGER NOT NULL,
  faixa_etaria TEXT NOT NULL, -- calculado automaticamente
  tempo_limite_minutos INTEGER NOT NULL,
  flexoes_realizadas INTEGER NOT NULL DEFAULT 0,
  abdominais_realizadas INTEGER NOT NULL DEFAULT 0,
  polichinelos_realizados INTEGER NOT NULL DEFAULT 0,
  tempo_total_segundos INTEGER NOT NULL, -- tempo real gasto
  aprovado BOOLEAN NOT NULL DEFAULT false,
  observacoes TEXT,
  avaliador_nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir as metas padrão
INSERT INTO public.taf_metas (faixa_etaria, tempo_limite_minutos, meta_flexoes, meta_abdominais, meta_polichinelos) VALUES
('abaixo_40', 3, 30, 45, 45),
('acima_40', 4, 30, 45, 45);

-- Habilitar RLS nas tabelas
ALTER TABLE public.taf_metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taf_avaliacoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para taf_metas (visualização pública para todos usuários admin)
CREATE POLICY "Admin users can view all taf metas" 
  ON public.taf_metas 
  FOR SELECT 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can insert taf metas" 
  ON public.taf_metas 
  FOR INSERT 
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can update taf metas" 
  ON public.taf_metas 
  FOR UPDATE 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can delete taf metas" 
  ON public.taf_metas 
  FOR DELETE 
  USING (get_current_user_role() = 'admin');

-- Políticas RLS para taf_avaliacoes
CREATE POLICY "Admin users can view all taf avaliacoes" 
  ON public.taf_avaliacoes 
  FOR SELECT 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can insert taf avaliacoes" 
  ON public.taf_avaliacoes 
  FOR INSERT 
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can update taf avaliacoes" 
  ON public.taf_avaliacoes 
  FOR UPDATE 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admin users can delete taf avaliacoes" 
  ON public.taf_avaliacoes 
  FOR DELETE 
  USING (get_current_user_role() = 'admin');

-- Trigger para atualizar updated_at
CREATE TRIGGER update_taf_metas_updated_at
  BEFORE UPDATE ON public.taf_metas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_taf_avaliacoes_updated_at
  BEFORE UPDATE ON public.taf_avaliacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para calcular estatísticas TAF
CREATE OR REPLACE FUNCTION public.get_taf_estatisticas()
RETURNS TABLE(
  total_avaliacoes INTEGER,
  taxa_aprovacao NUMERIC,
  media_flexoes NUMERIC,
  media_abdominais NUMERIC,
  media_polichinelos NUMERIC,
  bombeiros_pendentes INTEGER
) 
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    COUNT(*)::INTEGER as total_avaliacoes,
    (COUNT(*) FILTER (WHERE aprovado = true)::NUMERIC / NULLIF(COUNT(*), 0) * 100)::NUMERIC(5,2) as taxa_aprovacao,
    AVG(flexoes_realizadas)::NUMERIC(5,2) as media_flexoes,
    AVG(abdominais_realizadas)::NUMERIC(5,2) as media_abdominais,
    AVG(polichinelos_realizados)::NUMERIC(5,2) as media_polichinelos,
    (SELECT COUNT(DISTINCT b.id)::INTEGER
     FROM public.bombeiros b 
     LEFT JOIN public.taf_avaliacoes ta ON b.id = ta.bombeiro_id 
       AND ta.data_teste >= CURRENT_DATE - INTERVAL '6 months'
       AND ta.aprovado = true
     WHERE b.status = 'ativo' AND ta.id IS NULL) as bombeiros_pendentes
  FROM public.taf_avaliacoes
  WHERE data_teste >= CURRENT_DATE - INTERVAL '12 months';
$$;
