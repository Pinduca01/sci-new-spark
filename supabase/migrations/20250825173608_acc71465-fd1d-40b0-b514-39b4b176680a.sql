
-- Temporariamente permitir acesso público para desenvolvimento
-- Remover políticas restritivas existentes
DROP POLICY IF EXISTS "Admin users can view all quadrantes aeroporto" ON public.quadrantes_aeroporto;
DROP POLICY IF EXISTS "Admin users can insert quadrantes aeroporto" ON public.quadrantes_aeroporto;
DROP POLICY IF EXISTS "Admin users can update quadrantes aeroporto" ON public.quadrantes_aeroporto;
DROP POLICY IF EXISTS "Admin users can delete quadrantes aeroporto" ON public.quadrantes_aeroporto;

DROP POLICY IF EXISTS "Admin users can view all extintores aeroporto" ON public.extintores_aeroporto;
DROP POLICY IF EXISTS "Admin users can insert extintores aeroporto" ON public.extintores_aeroporto;
DROP POLICY IF EXISTS "Admin users can update extintores aeroporto" ON public.extintores_aeroporto;
DROP POLICY IF EXISTS "Admin users can delete extintores aeroporto" ON public.extintores_aeroporto;

DROP POLICY IF EXISTS "Admin users can view all inspecoes extintores" ON public.inspecoes_extintores;
DROP POLICY IF EXISTS "Admin users can insert inspecoes extintores" ON public.inspecoes_extintores;
DROP POLICY IF EXISTS "Admin users can update inspecoes extintores" ON public.inspecoes_extintores;
DROP POLICY IF EXISTS "Admin users can delete inspecoes extintores" ON public.inspecoes_extintores;

-- Criar políticas permissivas temporárias (permitir tudo durante desenvolvimento)
CREATE POLICY "Allow all operations on quadrantes aeroporto" ON public.quadrantes_aeroporto FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on extintores aeroporto" ON public.extintores_aeroporto FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on inspecoes extintores" ON public.inspecoes_extintores FOR ALL USING (true) WITH CHECK (true);

-- Atribuir equipes aos quadrantes existentes
UPDATE public.quadrantes_aeroporto SET 
  equipe_responsavel_id = (SELECT id FROM public.equipes WHERE nome_equipe = 'Alfa' LIMIT 1)
WHERE nome_quadrante = 'Quadrante Norte';

UPDATE public.quadrantes_aeroporto SET 
  equipe_responsavel_id = (SELECT id FROM public.equipes WHERE nome_equipe = 'Bravo' LIMIT 1)
WHERE nome_quadrante = 'Quadrante Sul';

-- Inserir extintores de exemplo
INSERT INTO public.extintores_aeroporto (
  codigo_extintor, localizacao_detalhada, quadrante_id, tipo_extintor, 
  capacidade, unidade_capacidade, fabricante, data_instalacao, 
  proxima_recarga, status
) VALUES
(
  'EXT-001',
  'Terminal Principal - Portão 1',
  (SELECT id FROM public.quadrantes_aeroporto WHERE nome_quadrante = 'Quadrante Norte' LIMIT 1),
  'Pó Químico Seco',
  4,
  'kg',
  'Extinção LTDA',
  '2024-01-15',
  '2025-01-15',
  'ativo'
),
(
  'EXT-002',
  'Terminal Principal - Portão 5',
  (SELECT id FROM public.quadrantes_aeroporto WHERE nome_quadrante = 'Quadrante Norte' LIMIT 1),
  'CO2',
  6,
  'kg',
  'FireTech',
  '2024-02-10',
  '2025-02-10',
  'ativo'
),
(
  'EXT-003',
  'Hangar A - Entrada Principal',
  (SELECT id FROM public.quadrantes_aeroporto WHERE nome_quadrante = 'Quadrante Sul' LIMIT 1),
  'Espuma Mecânica',
  9,
  'l',
  'SafeFire',
  '2024-03-20',
  '2025-03-20',
  'ativo'
),
(
  'EXT-004',
  'Área de Carga - Setor 2',
  (SELECT id FROM public.quadrantes_aeroporto WHERE nome_quadrante = 'Quadrante Leste' LIMIT 1),
  'Água Pressurizada',
  10,
  'l',
  'AquaFire',
  '2023-12-01',
  '2024-12-01',
  'ativo'
),
(
  'EXT-005',
  'Prédio Administrativo - Hall',
  (SELECT id FROM public.quadrantes_aeroporto WHERE nome_quadrante = 'Quadrante Oeste' LIMIT 1),
  'Pó Químico Seco',
  4,
  'kg',
  'Extinção LTDA',
  '2024-05-15',
  '2025-05-15',
  'ativo'
);

-- Inserir algumas inspeções de exemplo
INSERT INTO public.inspecoes_extintores (
  extintor_id, bombeiro_inspetor_id, data_inspecao, hora_inspecao,
  tipo_inspecao, status_extintor, itens_verificados, observacoes
) VALUES
(
  (SELECT id FROM public.extintores_aeroporto WHERE codigo_extintor = 'EXT-001' LIMIT 1),
  (SELECT id FROM public.bombeiros WHERE status = 'ativo' LIMIT 1),
  '2024-08-20',
  '10:30:00',
  'rotina',
  'conforme',
  '[
    {"item": "Pressão do manômetro", "conforme": true},
    {"item": "Estado do lacre", "conforme": true},
    {"item": "Mangueira e esguicho", "conforme": true},
    {"item": "Sinalização e acessibilidade", "conforme": true},
    {"item": "Estado físico do extintor", "conforme": true}
  ]'::jsonb,
  'Extintor em perfeitas condições'
),
(
  (SELECT id FROM public.extintores_aeroporto WHERE codigo_extintor = 'EXT-002' LIMIT 1),
  (SELECT id FROM public.bombeiros WHERE status = 'ativo' LIMIT 1 OFFSET 1),
  '2024-08-21',
  '14:15:00',
  'rotina',
  'nao_conforme',
  '[
    {"item": "Pressão do manômetro", "conforme": false, "observacao": "Pressão baixa"},
    {"item": "Estado do lacre", "conforme": true},
    {"item": "Mangueira e esguicho", "conforme": true},
    {"item": "Sinalização e acessibilidade", "conforme": true},
    {"item": "Estado físico do extintor", "conforme": true}
  ]'::jsonb,
  'Necessita recarga - pressão abaixo do normal'
);
