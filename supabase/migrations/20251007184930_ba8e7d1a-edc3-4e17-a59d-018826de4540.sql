-- =====================================================
-- ORGANIZAÇÃO COMPLETA DOS CHECKLISTS - CORRIGIDO
-- Baseado nos documentos oficiais MMS.BR.BA.FOR
-- =====================================================

-- FASE 1: Garantir tipos_checklist corretos
-- =====================================================

INSERT INTO tipos_checklist (id, nome, descricao, created_at, updated_at)
VALUES 
  ('8c55f9b8-eedb-4628-a90b-230790b456ab', 'CCI Viatura', 'Checklist de Viatura CCI (BA-MC)', NOW(), NOW()),
  ('36ad513d-ad89-45df-b8b1-5657a4d8bbec', 'CCI Equipamentos', 'Checklist de Equipamentos CCI (BA-2)', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  updated_at = NOW();

-- Criar tipo CRS se não existir
INSERT INTO tipos_checklist (nome, descricao, created_at, updated_at)
SELECT 'CRS Viatura', 'Checklist de Viatura CRS', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM tipos_checklist WHERE nome = 'CRS Viatura'
);

-- Deletar itens antigos para repopular
DELETE FROM template_checklist WHERE tipo_checklist_id IN (
  SELECT id FROM tipos_checklist 
  WHERE nome IN ('CCI Viatura', 'CCI Equipamentos', 'CRS Viatura')
);

-- FASE 2: Popular CCI - VIATURA (105 itens)
-- =====================================================

INSERT INTO template_checklist (tipo_checklist_id, categoria, item, obrigatorio, permite_foto, ordem, created_at, updated_at)
SELECT 
  (SELECT id FROM tipos_checklist WHERE nome = 'CCI Viatura' LIMIT 1),
  categoria, item, true, true, ordem, NOW(), NOW()
FROM (VALUES
  ('CHECK EXTERNO', 'NÍVEL DO LÍQUIDO DE ARREFECIMENTO', 1),
  ('CHECK EXTERNO', 'NÍVEL LÍQUIDO DE ARREFECIMENTO DO MOTOR ESTACIONÁRIO', 2),
  ('CHECK EXTERNO', 'ÓLEO DA DIREÇÃO HIDRÁULICA', 3),
  ('CHECK EXTERNO', 'NÍVEL ÓLEO DE MOTOR', 4),
  ('CHECK EXTERNO', 'NÍVEL ÓLEO DO MOTOR ESTACIONÁRIO', 5),
  ('CHECK EXTERNO', 'VAZAMENTOS EM GERAL', 6),
  ('CHECK EXTERNO', 'NÍVEL ÓLEO BOMBA INCÊNDIO', 7),
  ('CHECK EXTERNO', 'NÍVEL DA BOMBA DE ESCORVA', 8),
  ('CHECK EXTERNO', 'NÍVEL DA ÁGUA LIMPADOR PARABRISA', 9),
  ('CHECK EXTERNO', 'FILTRO DE AR DO MOTOR', 10),
  ('CHECK EXTERNO', 'FREIO ESTACIONÁRIO', 11),
  ('CHECK EXTERNO', 'SISTEMA DE FRENAGEM', 12),
  ('CHECK EXTERNO', 'SISTEMA SUSPENSÃO', 13),
  ('CHECK EXTERNO', 'CHAVE DE EMERGENCIA', 14),
  ('CHECK EXTERNO', 'SILENCIOSO/ESCAPAMENTO', 15),
  ('CHECK EXTERNO', 'DRENOS E REGISTROS', 16),
  ('CHECK EXTERNO', 'FILTRO DE AR', 17),
  ('CHECK EXTERNO', 'BATERIA /POLOS E TERMINAIS', 18),
  ('CHECK EXTERNO', 'CONDIÇÃO GERAL DOS PNEUS', 19),
  ('CHECK EXTERNO', 'LATARIA E PINTURA', 20),
  ('CABINE', 'IGNIÇÃO/PARTIDA', 21),
  ('CABINE', 'COMBUSTIVÉL', 22),
  ('CABINE', 'BANCOS', 23),
  ('CABINE', 'NÍVEL DO ADITIVO ARLA 32 (PAINEL)', 24),
  ('CABINE', 'COMANDOS DO PAINEL', 25),
  ('CABINE', 'RÁDIO', 26),
  ('CABINE', 'CARTÃO DE ABASTECIMENTO', 27),
  ('CABINE', 'TEMPERATURA DO MOTOR', 28),
  ('CABINE', 'PRESSÃO SISTEMA DE AR', 29),
  ('CABINE', 'PRESSÃO DO ÓLEO DO MOTOR', 30),
  ('CABINE', 'GPS', 31),
  ('CABINE', 'INCLINÔMETRO', 32),
  ('CABINE', 'CONTROLE REMOTO DOS FARÓIS DE BUSCA DIANTEIRO', 33),
  ('CABINE', 'SUSPÉNSÃO', 34),
  ('CABINE', 'EXTINTOR', 35),
  ('CABINE', 'MACACO E ACESSÓRIOS', 36),
  ('CABINE', 'BOLSA DE FERRAMENTAS', 37),
  ('ELÉTRICA', 'FAROL ALTO/BAIXO', 38),
  ('ELÉTRICA', 'LUZ DE NEBlINA DIANTEIRA E TRASEIRA', 39),
  ('ELÉTRICA', 'LUZ DE POSIÇÃO DIREITA E ESQUERDA', 40),
  ('ELÉTRICA', 'PISCA ALERTA', 41),
  ('ELÉTRICA', 'LUZES DE PERÍMETRO', 42),
  ('ELÉTRICA', 'LUZ DE ADVERTÊNCIA PARA TRÁFEGO AÉREO', 43),
  ('ELÉTRICA', 'FAROL DE BUSCA DIANTERIA E TRASEIRA', 44),
  ('ELÉTRICA', 'LUZ DE MARCHA A RÉ', 45),
  ('ELÉTRICA', 'GIROFLEX', 46),
  ('ELÉTRICA', 'SIRENE', 47),
  ('ELÉTRICA', 'VENTILADOR/VENTOINHA', 48),
  ('ELÉTRICA', 'LIMPADOR DE PARA-BRISA', 49),
  ('ELÉTRICA', 'AR CONDICIONADO', 50),
  ('ELÉTRICA', 'ILUMINAÇÃO DO CANHÃO DE TETO', 51),
  ('ELÉTRICA', 'ILUMINAÇÃO DOS COMPARTIMENTOS', 52),
  ('ELÉTRICA', 'LUZES DE TRABALHO DO TETO', 53),
  ('ELÉTRICA', 'RETROVISORES', 54),
  ('ELÉTRICA', 'RETROVISORES ELÉTRICOS', 55),
  ('ELÉTRICA', 'VIDROS ELÉTRICOS', 56),
  ('SISTEMA CONTRA INCÊNDIO', 'NÍVEL DE LGE', 57),
  ('SISTEMA CONTRA INCÊNDIO', 'NÍVEL DE ÁGUA', 58),
  ('SISTEMA CONTRA INCÊNDIO', 'NÍVEL DO PQS', 59),
  ('SISTEMA CONTRA INCÊNDIO', 'BOMBA CONTRA INCENDIO', 60),
  ('SISTEMA CONTRA INCÊNDIO', 'BOMBA DE ESCORVA', 61),
  ('SISTEMA CONTRA INCÊNDIO', 'BOMBA MANUAL PNEUMÁTICA', 62),
  ('SISTEMA CONTRA INCÊNDIO', 'VÁLVULAS PNEUMÁTICAS', 63),
  ('SISTEMA CONTRA INCÊNDIO', 'CANHÃO MONITOR (TETO)', 64),
  ('SISTEMA CONTRA INCÊNDIO', 'CANHÃO DE PARA CHOQUE', 65),
  ('SISTEMA CONTRA INCÊNDIO', 'ASPERSORES', 66),
  ('SISTEMA CONTRA INCÊNDIO', 'SISTEMA PÓ QUIMÍCO', 67),
  ('SISTEMA CONTRA INCÊNDIO', 'NITROGÊNIO', 68),
  ('SISTEMA CONTRA INCÊNDIO', 'PAINEL DA BOMBA', 69),
  ('SISTEMA CONTRA INCÊNDIO', 'PAINEL DOS INSTRUMENTOS', 70),
  ('SISTEMA CONTRA INCÊNDIO', 'BOTÃO DE EMERGÊNCIA DO CANHÃO DE TETO', 71),
  ('SISTEMA CONTRA INCÊNDIO', 'BOTÃO DE EMERGÊNCIA DO CANHÃO DE PARA CHOQUE', 72),
  ('SISTEMA CONTRA INCÊNDIO', 'BOTÃO DE EMERGÊNCIA DA BOMBA MANUAL PNEUMÁTICA', 73),
  ('SISTEMA CONTRA INCÊNDIO', 'MANGOTINHO E PISTOLA PQ', 74),
  ('SISTEMA CONTRA INCÊNDIO', 'ESTRUTURA TANQUE DE ÁGUA', 75),
  ('SISTEMA CONTRA INCÊNDIO', 'ESTRUTURA TANQUE DE LGE', 76),
  ('PARTE INFERIOR', 'ESTRUTURA RESERVATÓRIO DE PÓ QUIMÍCO', 77),
  ('PARTE INFERIOR', 'BOCAL PARA SUCÇÃO', 78),
  ('PARTE INFERIOR', 'CONEXÃO DO HIDRANTE', 79),
  ('PARTE INFERIOR', 'VAZAMENTOS DIVERSOS', 80),
  ('PARTE INFERIOR', 'CONECTOR DE ALIMENTAÇÃO', 81),
  ('PARTE INFERIOR', 'GUINCHO', 82),
  ('PARTE INFERIOR', 'RETROVISORES', 83),
  ('PARTE INFERIOR', 'MAÇANETA DAS PORTAS', 84),
  ('PARTE INFERIOR', 'PORTAS DOS COMPARTIMENTOS', 85),
  ('PARTE INFERIOR', 'ESCADA TRASEIRA', 86),
  ('PARTE INFERIOR', 'UNIDADE DE PARTIDA RÁPIDA', 87),
  ('PARTE INFERIOR', 'RALO P/SUCÇÃO', 88),
  ('PARTE INFERIOR', 'LINHA DE MANGUEIRA 1½"', 89),
  ('PARTE INFERIOR', 'MANGUEIRA 2½"', 90),
  ('PARTE INFERIOR', 'MANGUEIRAS RESERVA 1½"', 91),
  ('PARTE INFERIOR', 'CHAVE STORZ', 92),
  ('PARTE INFERIOR', 'TAMPÃO STORZ', 93),
  ('PARTE SUPERIOR', 'REDUÇÃO STORZ', 94),
  ('PARTE SUPERIOR', 'CHAVE P/ABERTURA VALVULAS PNEUMÁTICAS', 95),
  ('PARTE SUPERIOR', 'MANIVELA RECOLHER A LINHA PQ', 96),
  ('PARTE SUPERIOR', 'CHAVE DA VÁLVULA DE SUCÇÃO DE LGE', 97),
  ('PARTE SUPERIOR', 'CHAVE DA VÁLVULA DE SUCÇÃO DE ÁGUA', 98),
  ('PARTE SUPERIOR', 'CHAVE DA VÁLVULA DE DISTRIBUIÇÃO DO CANHÃO FRONTAL', 99),
  ('PARTE SUPERIOR', 'ESGUICHO', 100),
  ('PARTE SUPERIOR', 'MANGUEIRA ABASTECIMENTO LGE', 101),
  ('PARTE SUPERIOR', 'CABEÇA DO CILINDRO PQ', 102),
  ('PARTE SUPERIOR', 'DIVISOR (DERIVANTE)', 103),
  ('PARTE SUPERIOR', 'GANCHO DIANTEIRO PARA REBOQUE', 104),
  ('PARTE SUPERIOR', 'GANCHO TRASEIRO PARA REBOQUE', 105)
) AS t(categoria, item, ordem);

-- FASE 3: Popular CCI - EQUIPAMENTOS (66 itens)
-- =====================================================

INSERT INTO template_checklist (tipo_checklist_id, categoria, item, obrigatorio, permite_foto, ordem, created_at, updated_at)
SELECT 
  (SELECT id FROM tipos_checklist WHERE nome = 'CCI Equipamentos' LIMIT 1),
  'EQUIPAMENTOS', item, true, true, ordem, NOW(), NOW()
FROM (VALUES
  ('MOTOSSERRA STIHL', 1), ('PAR DE LUVA LARANJA', 2), ('MOTO REBOLO + 1 DISCO', 3),
  ('CALÇA PROTEÇÃO PARA MOTOSERRA', 4), ('OCULOS DE PROTEÇÃO', 5), ('CONTROLES (ALMOFADAS PNEUMÁTICAS)', 6),
  ('MANÔMETRO (ALMOFPNEUMÁTICAS)', 7), ('CHAVE "T" PARA HIDRANTE', 8), ('FERRAMENTA COMBINADA HIDRÁULICA', 9),
  ('DESENCARCERADOR HIDRÁULICO', 10), ('MANGUEIRA HIDRÁULICA', 11), ('MARTELETE', 12),
  ('FACÃO', 13), ('SERRA SABRE', 14), ('ALICATE CORTA FRIO', 15),
  ('CANHÃO MONITOR MÓVEL', 16), ('CAIXA DE FERRAMENTAS (LACRE N° 1906)', 17), ('GERADOR DE ENERGIA', 18),
  ('TORRE DE ILUMINAÇÃO', 19), ('CHAVE STORZ', 21), ('MANGUEIRA 2 ½" DE 15 M (Tipo 2)', 22),
  ('MANGUEIRA DE 1 ½" DE 15 M (Tipo 2)', 23), ('ADAPTADOR DE ROSCA PARA STORZ', 25), ('CHAVE STORZ COMBINADA', 26),
  ('ESGUICHO 1 ½', 27), ('REDUÇÃO STORZ 2 ½ / 1 ½', 28), ('PRANCHA RIGIDA', 29),
  ('MACA TIPO CESTO', 30), ('ESTABILIZADOR DE CABEÇA', 31), ('TALA RÍGIDA', 32),
  ('EPR COMPLETO', 33), ('CILINDRO DE AR (ALMOFADAS PNEUMÁTICAS)', 34), ('SUPORTE DE CILINDRO (ALMOFADAS PNEUMÁTICAS)', 35),
  ('TURBO VENTILADOR A COMBUSTÃO', 36), ('CALÇO', 37), ('EXTENSÃO LARANJA', 38),
  ('RALLO DE SUCÇÃO COM ADAPTADOR', 39), ('DESENCARCERADOR ELÉTRICO', 40), ('BOLSA VERDE COM FACA CORTA CINTA (LACRE Nº 1927)', 41),
  ('MANGOTE 4" COM ADAPTADOR', 42), ('ESCADA PROLONGAVEL 10M', 43), ('ESCADA FIXA DE 5M', 44),
  ('BASTÃO TIPO CROQUE', 45), ('ENXADA', 46), ('RASTELO', 47),
  ('PÉ DE CABRA 1,65M', 48), ('PÉ DE CABRA 1M', 49), ('PÁ METÁLICA', 50),
  ('PÁ DE BORRACHA', 51), ('MARRETA 5KG', 52), ('ABAFADOR', 53),
  ('MACHADO', 54), ('ALMOFADAS PNEUMATICAS', 55), ('DERIVANTE DE 2 SAÍDAS', 56),
  ('ALAVANCA HOOLIGAN', 57), ('EXTINTOR PQ 12KG', 58), ('EXTINTOR CO² 6KG', 59),
  ('CAPACETES COM PARES LUVAS', 60), ('ÓCULOS AMPLA VISÃO', 61), ('TALABARTES', 62),
  ('CINTOS PARAQUEDISTA (BOLSA AZUL)', 63), ('FREIO OITO (BOLSA AZUL)', 64), ('MOSQUETÃO (BOLSA AZUL)', 65),
  ('MANGUEIRAS (ALMOFADAS PNEUMÁTICAS)', 66)
) AS t(item, ordem);

-- FASE 4: Popular CRS - VIATURA (127 itens)
-- =====================================================

INSERT INTO template_checklist (tipo_checklist_id, categoria, item, obrigatorio, permite_foto, ordem, created_at, updated_at)
SELECT 
  (SELECT id FROM tipos_checklist WHERE nome = 'CRS Viatura' LIMIT 1),
  'CHECK LIST GERAL', item, true, true, ordem, NOW(), NOW()
FROM (VALUES
  ('Nível do combustível', 1), ('Nível do óleo do motor', 2), ('Nível do líquido de arrefecimento', 3),
  ('Nível do óleo da direção hidráulica', 4), ('Nível do óleo da transmissão', 5), ('Ignição / Bateria / Voltímetro', 6),
  ('Funcionamento do motor (Compart. L3 / R3)', 7), ('Correia do alternador', 8), ('Limpador de para-brisa / Nível do reservatório', 9),
  ('Cabine', 10), ('Iluminação geral', 11), ('Sirene', 12), ('Buzina', 13), ('Dreno do sistema pneumático', 14),
  ('Freio / freio de estacionamento (Terreno inclinado)', 15), ('Lataria e pintura', 16), ('Pressão de ar dos eixos primário e secundários', 17),
  ('Pressão de ar dos pneus', 18), ('Suspensão', 19), ('Vazamentos de ar ou fluído', 20), ('Parte Superior / Convés', 21),
  ('EPR''s', 22), ('Máscaras de EPR', 23), ('Abiquim', 24), ('Chave SUL 2 C', 25), ('Capacetes de resgate', 26),
  ('Joystick do guincho', 27), ('Chave de elevador', 28), ('Mapa de grade interno/externo/pátio', 29), ('Lanternas', 30),
  ('Binoculo', 31), ('Pares de luva de borracha', 32), ('Óculos de acrílico', 33), ('Capas de chuva', 34),
  ('Elástico standard amarelo', 35), ('Macaco hidráulico com alavanca', 36), ('Triângulo sinalizador', 37), ('Extintor ABC', 38),
  ('Protetores de nuca e capacetes', 39), ('Trena de fita', 40), ('Rolos de fita zebrada', 41), ('Protetor solar', 42),
  ('Papa turfa', 43), ('Sacos mortuário', 44), ('Kit lonas método START', 45), ('Serrasabre completas', 46),
  ('Machadinhas', 47), ('Marretas', 48), ('Pé-de-cabra', 49), ('Alavanca Hooligan', 50), ('Alicate corta frio', 51),
  ('Caixa com ferramentas para motosserra', 52), ('Parafusadeira Bosch', 53), ('Caixa Vonder com ferramentas diversas', 54),
  ('Vassouras', 55), ('Motosserra STHIL', 56), ('Moto rebolo STHIL', 57), ('Serra circular', 58), ('Bolsa com corta cinto', 59),
  ('Bolsa com ataduras', 60), ('Bolsa com oxigênio', 61), ('KED', 62), ('Maleta primeiros socorros', 63), ('BVM', 64),
  ('Caixa com calço', 65), ('Ferramentas hidráulicas', 66), ('Garateia', 67), ('Carretel de mangueira hidráulica', 68),
  ('Kit corrente extensora do desencarcerador', 69), ('Motobomba hidraúlica Holmatro 35PSPU', 70), ('Extintor de CO2', 71),
  ('Extintor de PQ', 72), ('Bolsa (Pranchetas/canetas/fichas de id./lanterna)', 73), ('Refletores', 74), ('Tripés', 75),
  ('Vergalhões para banderolas', 76), ('Cordas', 77), ('Tripé', 78), ('Ascensor de punho', 79), ('Ascensor de peito', 80),
  ('Descensor autoblocante', 81), ('Polia dupla', 82), ('Polia simples', 83), ('Freio ATC', 84), ('Freios 8 com orelhas', 85),
  ('Mosquetões', 86), ('Fita', 87), ('Cordeletes', 88), ('Carretel de linha', 89),
  ('Triângulo Tipo Fraldão para Resgate e Evacuação em Altura', 90), ('Talabarte', 91), ('Cintos paraquedista 5 pontos', 92),
  ('Macas envelope', 93), ('Pares de luva', 94), ('Cones', 95), ('Suporte para cilindro', 96), ('Kits para almofada pneumática', 97),
  ('Almofadas grandes', 98), ('Almofadas pequenas', 99), ('Cilindros de ar', 100), ('Motobomba hidraúlica Holmatro 60DPU', 101),
  ('Headblocks', 102), ('Mantas ingnifugantes', 103), ('Conjuntos de talas', 104), ('Talas grandes', 105),
  ('Colares cervicais G', 106), ('Colares cervicais M', 107), ('Colares cervicais P', 108), ('Colares cervicais infantil', 109),
  ('Talas de dedo', 110), ('Tala de mão', 111), ('Conjuntos de tirantes', 112), ('Borracha de isolamento', 113),
  ('Suportes para estabilização de cabeça', 114), ('Moto gerador', 115), ('Caixa contendo equipamento para motosserra', 116),
  ('Macacões G', 117), ('Macacão EG', 118), ('Pranchas', 119), ('Kits de talas moldavéis', 120), ('Bastão de fibra de vidro', 121),
  ('Mangueiras de 30m 2 1/2"', 122), ('Escadas', 123), ('Calços', 124), ('Croque', 125), ('Machado', 126), ('Peneira de retenção', 127)
) AS t(item, ordem);

-- FASE 5: Desativar checklist_templates antigos
UPDATE checklist_templates SET ativo = false WHERE ativo = true;

-- FASE 6: Índices de performance
CREATE INDEX IF NOT EXISTS idx_template_checklist_tipo ON template_checklist(tipo_checklist_id);
CREATE INDEX IF NOT EXISTS idx_template_checklist_ordem ON template_checklist(tipo_checklist_id, ordem);
CREATE INDEX IF NOT EXISTS idx_template_checklist_categoria ON template_checklist(categoria);