export interface ChecklistItemStatic {
  id: string;
  nome: string;
  categoria: string;
}

export const buildStaticTemplateForViatura = (tipoViatura: string) => {
  const normalize = (s: string | null) => (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();

  const tipoNorm = normalize(tipoViatura);

  // Template BA-2 (Ambulância)
  const ba2Items = [
    { id: 'ba2_1', nome: 'Mochila de emergência completa', categoria: 'EQUIPAMENTOS' },
    { id: 'ba2_2', nome: 'Oxímetro funcionando', categoria: 'EQUIPAMENTOS' },
    { id: 'ba2_3', nome: 'Glicosímetro e fitas', categoria: 'EQUIPAMENTOS' },
    { id: 'ba2_4', nome: 'Medicações básicas', categoria: 'EQUIPAMENTOS' },
    { id: 'ba2_5', nome: 'Material para curativos', categoria: 'EQUIPAMENTOS' },
    { id: 'ba2_6', nome: 'Equipamentos de proteção individual', categoria: 'EQUIPAMENTOS' },
    { id: 'ba2_7', nome: 'Prancha rígida', categoria: 'EQUIPAMENTOS' },
    { id: 'ba2_8', nome: 'Colar cervical (vários tamanhos)', categoria: 'EQUIPAMENTOS' },
    { id: 'ba2_9', nome: 'Maca dobrável', categoria: 'EQUIPAMENTOS' },
    { id: 'ba2_10', nome: 'Cilindro de oxigênio (carga completa)', categoria: 'EQUIPAMENTOS' },
  ];

  // Template BA-MC / CCI (Caminhão/Carro de Combate a Incêndio)
  const bamcSections: { title: string; items: { id: string; nome: string }[] }[] = [
    {
      title: 'CHECK EXTERNO',
      items: [
        { id: 'ext_1', nome: 'NÍVEL DO LIQUIDO DE ARREFECIMENTO' },
        { id: 'ext_2', nome: 'NÍVEL LIQUIDO DE ARREFECIMENTO DO MOTOR ESTACIONÁRIO' },
        { id: 'ext_3', nome: 'ÓLEO DA DIREÇÃO HIDRÁULICA' },
        { id: 'ext_4', nome: 'NÍVEL ÓLEO DE MOTOR' },
        { id: 'ext_5', nome: 'NÍVEL ÓLEO DO MOTOR ESTACIONÁRIO' },
        { id: 'ext_6', nome: 'VAZAMENTOS EM GERAL' },
        { id: 'ext_7', nome: 'NÍVEL ÓLEO BOMBA INCÊNDIO' },
        { id: 'ext_8', nome: 'NÍVEL DA BOMBA DE ESCORVA' },
        { id: 'ext_9', nome: 'NÍVEL DA ÁGUA LIMPADOR PARABRISA' },
        { id: 'ext_10', nome: 'FILTRO DE AR DO MOTOR' },
        { id: 'ext_11', nome: 'FREIO ESTACIONÁRIO' },
        { id: 'ext_12', nome: 'SISTEMA DE FRENAGEM' },
        { id: 'ext_13', nome: 'SISTEMA SUSPENSÃO' },
        { id: 'ext_14', nome: 'CHAVE DE EMERGENCIA' },
        { id: 'ext_15', nome: 'SILENCIOSO/ESCAPAMENTO' },
        { id: 'ext_16', nome: 'DRENOS E REGISTROS' },
        { id: 'ext_17', nome: 'FILTRO DE AR' },
        { id: 'ext_18', nome: 'BATERIA /POLOS E TERMINAIS' },
        { id: 'ext_19', nome: 'CONDIÇÃO GERAL DOS PNEUS' },
        { id: 'ext_20', nome: 'LATARIA E PINTURA' },
      ],
    },
    {
      title: 'CABINE',
      items: [
        { id: 'cab_1', nome: 'IGNIÇÃO/PARTIDA' },
        { id: 'cab_2', nome: 'COMBUSTIVÉL' },
        { id: 'cab_3', nome: 'BANCOS' },
        { id: 'cab_4', nome: 'NÍVEL DO ADITIVO ARLA 32 (PAINEL)' },
        { id: 'cab_5', nome: 'COMANDOS DO PAINEL' },
        { id: 'cab_6', nome: 'RÁDIO' },
        { id: 'cab_7', nome: 'CARTÃO DE ABASTECIMENTO' },
        { id: 'cab_8', nome: 'TEMPERATURA DO MOTOR' },
        { id: 'cab_9', nome: 'PRESSÃO SISTEMA DE AR' },
        { id: 'cab_10', nome: 'PRESSÃO DO ÓLEO DO MOTOR' },
        { id: 'cab_11', nome: 'GPS' },
        { id: 'cab_12', nome: 'INCLINÔMETRO' },
        { id: 'cab_13', nome: 'CONTROLE REMOTO DOS FARÓIS DE BUSCA DIANTEIRO' },
        { id: 'cab_14', nome: 'SUSPÉNSÃO' },
        { id: 'cab_15', nome: 'EXTINTOR' },
        { id: 'cab_16', nome: 'MACACO E ACESSÓRIOS' },
        { id: 'cab_17', nome: 'BOLSA DE FERRAMENTAS' },
      ],
    },
    {
      title: 'ELÉTRICA',
      items: [
        { id: 'ele_1', nome: 'FAROL ALTO/BAIXO' },
        { id: 'ele_2', nome: 'LUZ DE NEBLINA DIANTEIRA E TRASEIRA' },
        { id: 'ele_3', nome: 'LUZ DE POSIÇÃO DIREITA E ESQUERDA' },
        { id: 'ele_4', nome: 'PISCA ALERTA' },
        { id: 'ele_5', nome: 'LUZES DE PERÍMETRO' },
        { id: 'ele_6', nome: 'LUZ DE ADVERTÊNCIA PARA TRÁFEGO AÉREO' },
        { id: 'ele_7', nome: 'FAROL DE BUSCA DIANTERIA E TRASEIRA' },
        { id: 'ele_8', nome: 'LUZ DE MARCHA A RÉ' },
        { id: 'ele_9', nome: 'GIROFLEX' },
        { id: 'ele_10', nome: 'SIRENE' },
        { id: 'ele_11', nome: 'VENTILADOR/VENTOINHA' },
        { id: 'ele_12', nome: 'LIMPADOR DE PARA-BRISA' },
        { id: 'ele_13', nome: 'AR CONDICIONADO' },
        { id: 'ele_14', nome: 'ILUMINAÇÃO DO CANHÃO DE TETO' },
        { id: 'ele_15', nome: 'ILUMINAÇÃO DOS COMPARTIMENTOS' },
        { id: 'ele_16', nome: 'LUZES DE TRABALHO DO TETO' },
        { id: 'ele_17', nome: 'RETROVISORES' },
        { id: 'ele_18', nome: 'RETROVISORES ELÉTRICOS' },
        { id: 'ele_19', nome: 'VIDROS ELÉTRICOS' },
      ],
    },
    {
      title: 'SISTEMA CONTRA INCÊNDIO',
      items: [
        { id: 'inc_1', nome: 'NÍVEL DE LGE' },
        { id: 'inc_2', nome: 'NÍVEL DE ÁGUA' },
        { id: 'inc_3', nome: 'NÍVEL DO PQS' },
        { id: 'inc_4', nome: 'BOMBA CONTRA INCENDIO' },
        { id: 'inc_5', nome: 'BOMBA DE ESCORVA' },
        { id: 'inc_6', nome: 'BOMBA MANUAL PNEUMATICA' },
        { id: 'inc_7', nome: 'VALVULAS PNEUMATICAS' },
        { id: 'inc_8', nome: 'CANHAO MONITOR (TETO)' },
        { id: 'inc_9', nome: 'CANHAO DE PARA CHOQUE' },
        { id: 'inc_10', nome: 'ASPERSORES' },
        { id: 'inc_11', nome: 'SISTEMA PO QUIMICO' },
        { id: 'inc_12', nome: 'NITROGENIO' },
        { id: 'inc_13', nome: 'PAINEL DA BOMBA' },
        { id: 'inc_14', nome: 'PAINEL DOS INSTRUMENTOS' },
        { id: 'inc_15', nome: 'BOTAO DE EMERGENCIA DO CANHAO DE TETO' },
        { id: 'inc_16', nome: 'BOTAO DE EMERGENCIA DO CANHAO DE PARA CHOQUE' },
        { id: 'inc_17', nome: 'BOTAO DE EMERGENCIA DA BOMBA MANUAL PNEUMATICA' },
        { id: 'inc_18', nome: 'MANGOTINHO E PISTOLA PQ' },
        { id: 'inc_19', nome: 'ESTRUTURA TANQUE DE AGUA' },
        { id: 'inc_20', nome: 'ESTRUTURA TANQUE DE LGE' },
        { id: 'inc_21', nome: 'ESTRUTURA RESERVATORIO DE PO QUIMICO' },
        { id: 'inc_22', nome: 'BOCAL PARA SUCCAO' },
        { id: 'inc_23', nome: 'CONEXAO DO HIDRANTE' },
        { id: 'inc_24', nome: 'VAZAMENTOS DIVERSOS' },
        { id: 'inc_25', nome: 'CONECTOR DE ALIMENTACAO' },
        { id: 'inc_26', nome: 'GUINCHO' },
        { id: 'inc_27', nome: 'RETROVISORES' },
        { id: 'inc_28', nome: 'MAÇANETA DAS PORTAS' },
        { id: 'inc_29', nome: 'PORTAS DOS COMPARTIMENTOS' },
        { id: 'inc_30', nome: 'ESCADA TRASEIRA' },
        { id: 'inc_31', nome: 'UNIDADE DE PARTIDA RAPIDA' },
        { id: 'inc_32', nome: 'RALO P/SUCCAO' },
        { id: 'inc_33', nome: 'GANCHO DIANTEIRO PARA REBOQUE' },
        { id: 'inc_34', nome: 'GANCHO TRASEIRO PARA REBOQUE' },
      ],
    },
    {
      title: 'PARTE SUPERIOR',
      items: [
        { id: 'sup_1', nome: 'TANQUE DE AGUA' },
        { id: 'sup_2', nome: 'TANQUE DE LGE' },
        { id: 'sup_3', nome: 'ANTENA DO RADIO' },
        { id: 'sup_4', nome: 'TAMPA DO ABASTECIMENTO DE AGUA' },
        { id: 'sup_5', nome: 'TAMPA DO ABASTECIMENTO DE LGE' },
        { id: 'sup_6', nome: 'TRAVA DE SEGURANCA DE SOBRE PRESSAO DO TANQUE DE AGUA' },
        { id: 'sup_7', nome: 'ANTENA (DEVS) SISTEMA DE VISAO OLHO DE AGUIA' },
        { id: 'sup_8', nome: 'SISTEMA DE ARMAZENAMENTO DE AQUISICAO E MONITORAMENTO DE DADOS (MADASS)' },
        { id: 'sup_9', nome: 'ESCOTILHA DA CABINE' },
      ],
    },
  ];

  const bamcItems: ChecklistItemStatic[] = bamcSections.flatMap(sec => sec.items.map(it => ({
    id: it.id,
    nome: it.nome,
    categoria: sec.title,
  })));

  if (tipoNorm === 'ba2') {
    return {
      nome: 'Template BA-2 (Estático)',
      itens: ba2Items,
    };
  }

  // Tratar CCI como BA-MC por padrão
  if (tipoNorm === 'bamc' || tipoNorm === 'cci' || tipoNorm === 'viaturas') {
    return {
      nome: 'Template BA-MC/CCI (Estático)',
      itens: bamcItems,
    };
  }

  // Outras viaturas caem no template BA-MC por padrão
  return {
    nome: 'Template VIATURAS (Estático)',
    itens: bamcItems,
  };
};