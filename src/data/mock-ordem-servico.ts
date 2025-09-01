import { OrdemServico, OSEstrutural, OSViatura, OSEquipamento, OSCombustivel, OSMateriais, EstatisticasOS } from '../types/ordem-servico';

// Dados mockados baseados nas imagens de referência
export const mockOrdemServico: OrdemServico[] = [
  // OS Estrutural - baseada na primeira imagem
  {
    cod_id: 3,
    numero_chamado: 'OS-2024-001724',
    data_solicitacao: '12/04/25',
    tipo_chamado: 'Estrutural',
    nome_solicitante: 'Marcos Santos',
    local_instalacao: 'Sala de Briefing',
    descricao: 'Infiltração de água na parede lado direito',
    status: 'Concluída',
    item_operacional: 'SIM',
    observacoes_manutencao: 'Desumidificador ativo do ar condicionado',
    data_conclusao: '15/04/25',
    responsavel_conclusao: 'Equipe Alfa',
    tipo_estrutura: 'Parede',
    urgencia: 'Média',
    created_at: '2024-04-12T08:00:00Z',
    updated_at: '2024-04-15T16:30:00Z'
  } as OSEstrutural,
  
  {
    cod_id: 4,
    numero_chamado: 'OS-2024-001725',
    data_solicitacao: '24/04/25',
    tipo_chamado: 'Estrutural',
    nome_solicitante: 'Marcos Santos',
    local_instalacao: 'Pátio Viaturas',
    descricao: 'Lâmpadas queimadas na garagem',
    status: 'Aberta',
    item_operacional: 'NÃO',
    tipo_estrutura: 'Iluminação',
    urgencia: 'Baixa',
    created_at: '2024-04-24T10:15:00Z',
    updated_at: '2024-04-24T10:15:00Z'
  } as OSEstrutural,

  // OS Viatura - baseada na segunda imagem
  {
    cod_id: 2,
    numero_chamado: 'OS-2024-001726',
    data_solicitacao: '16/04/25',
    tipo_chamado: 'Viatura',
    nome_solicitante: 'JOSÉ ALVES DA SILVA',
    veiculo_identificacao: 'PANTHER 01 – CCI 01',
    descricao: 'Vazamento de óleo motor no carter',
    status: 'Pendente',
    item_operacional: 'SIM',
    tipo_veiculo: 'CCI',
    quilometragem_atual: 45230,
    tipo_manutencao: 'Corretiva',
    created_at: '2024-04-16T14:20:00Z',
    updated_at: '2024-04-16T14:20:00Z'
  } as OSViatura,

  // OS Equipamento - baseada na terceira imagem
  {
    cod_id: 1,
    numero_chamado: 'OS-2024-001727',
    data_solicitacao: '16/04/25',
    tipo_chamado: 'Equipamento',
    nome_solicitante: 'JOSÉ ALVES DA SILVA',
    equipamento_identificacao: 'Desencarcerador',
    descricao: 'Minutos de carga. Necessário troca',
    status: 'Pendente',
    item_operacional: 'SIM',
    numero_serie: 'DESC-2023-001',
    modelo: 'HD-2000',
    fabricante: 'Holmatro',
    localizacao_equipamento: 'CRS - Compartimento 3',
    tipo_manutencao: 'Corretiva',
    created_at: '2024-04-16T09:30:00Z',
    updated_at: '2024-04-16T09:30:00Z'
  } as OSEquipamento,

  // OS Combustível
  {
    cod_id: 5,
    numero_chamado: 'OS-2024-001728',
    data_solicitacao: '25/04/25',
    tipo_chamado: 'Combustível',
    nome_solicitante: 'Carlos Mendes',
    veiculo_identificacao: 'CCI RT 02',
    descricao: 'Solicitação de reabastecimento - tanque em reserva',
    status: 'Aberta',
    item_operacional: 'PARCIAL',
    tipo_combustivel: 'Diesel',
    quantidade_solicitada: 80, // Valor em porcentagem (%)
    quantidade_atual: 18, // Valor em porcentagem (%)
    urgencia: 'Alta',
    created_at: '2024-04-25T07:45:00Z',
    updated_at: '2024-04-25T08:15:00Z'
  } as OSCombustivel,

  // OS Materiais
  {
    cod_id: 6,
    numero_chamado: 'OS-2024-001729',
    data_solicitacao: '26/04/25',
    tipo_chamado: 'Materiais',
    nome_solicitante: 'Ana Paula Silva',
    descricao: 'Solicitação de materiais para manutenção preventiva das viaturas',
    status: 'Pendente',
    item_operacional: 'NÃO',
    lista_materiais: [
      {
        id: '1',
        nome_material: 'Óleo Motor 15W40',
        quantidade: 20,
        unidade: 'Litros',
        especificacao: 'Mineral para motores diesel'
      },
      {
        id: '2',
        nome_material: 'Filtro de Óleo',
        quantidade: 5,
        unidade: 'Unidades',
        especificacao: 'Compatível com motores MWM'
      },
      {
        id: '3',
        nome_material: 'Pastilha de Freio',
        quantidade: 8,
        unidade: 'Jogos',
        especificacao: 'Dianteira para veículos pesados'
      }
    ],
    justificativa: 'Manutenção preventiva programada para o trimestre',
    created_at: '2024-04-26T11:00:00Z',
    updated_at: '2024-04-26T11:00:00Z'
  } as OSMateriais,

  // Mais algumas OS para demonstrar variedade
  {
    cod_id: 7,
    numero_chamado: 'OS-2024-001730',
    data_solicitacao: '27/04/25',
    tipo_chamado: 'Viatura',
    nome_solicitante: 'Roberto Lima',
    veiculo_identificacao: 'CA 01',
    descricao: 'Revisão dos 50.000 km',
    status: 'Em Andamento',
    item_operacional: 'SIM',
    tipo_veiculo: 'CA',
    quilometragem_atual: 50120,
    tipo_manutencao: 'Preventiva',
    created_at: '2024-04-27T13:30:00Z',
    updated_at: '2024-04-27T14:00:00Z'
  } as OSViatura,

  {
    cod_id: 8,
    numero_chamado: 'OS-2024-001731',
    data_solicitacao: '28/04/25',
    tipo_chamado: 'Equipamento',
    nome_solicitante: 'Fernando Costa',
    equipamento_identificacao: 'Mangueira 2.5"',
    descricao: 'Substituição de mangueira danificada',
    status: 'Concluído',
    item_operacional: 'SIM',
    numero_serie: 'MNG-2024-015',
    localizacao_equipamento: 'CCI 01 - Compartimento lateral',
    tipo_manutencao: 'Corretiva',
    data_conclusao: '29/04/25',
    responsavel_conclusao: 'Equipe Bravo',
    created_at: '2024-04-28T16:45:00Z',
    updated_at: '2024-04-29T10:20:00Z'
  } as OSEquipamento
];

// Estatísticas mockadas
export const mockEstatisticasOS: EstatisticasOS = {
  total_os: 8,
  pendentes: 4,
  em_andamento: 2,
  concluidas: 2,
  canceladas: 0,
  por_tipo: {
    'Estrutural': 2,
    'Viatura': 2,
    'Equipamento': 2,
    'Combustível': 1,
    'Materiais': 1
  },
  tempo_medio_conclusao: 3.5
};

// Sistema de numeração automática
let contadorOS = Math.max(...mockOrdemServico.map(os => os.cod_id)) + 1;

// Função para gerar próximo número de OS
export const gerarProximoNumeroOS = (): string => {
  const ano = new Date().getFullYear();
  const numeroFormatado = contadorOS.toString().padStart(6, '0');
  const numeroOS = `OS-${ano}-${numeroFormatado}`;
  contadorOS++;
  return numeroOS;
};

// Função para resetar contador (útil para testes)
export const resetarContadorOS = (novoValor: number = 1): void => {
  contadorOS = novoValor;
};

// Função para obter próximo número sem incrementar
export const visualizarProximoNumero = (): string => {
  const ano = new Date().getFullYear();
  const numeroFormatado = contadorOS.toString().padStart(6, '0');
  return `OS-${ano}-${numeroFormatado}`;
};

// Função para buscar OS por filtros
export const filtrarOS = (filtros: any, osLista: OrdemServico[] = mockOrdemServico) => {
  return osLista.filter(os => {
    if (filtros.status && !filtros.status.includes(os.status)) return false;
    if (filtros.tipo && !filtros.tipo.includes(os.tipo_chamado)) return false;
    if (filtros.solicitante && !os.nome_solicitante.toLowerCase().includes(filtros.solicitante.toLowerCase())) return false;
    if (filtros.busca_geral) {
      const busca = filtros.busca_geral.toLowerCase();
      return (
        os.numero_chamado.toLowerCase().includes(busca) ||
        os.nome_solicitante.toLowerCase().includes(busca) ||
        os.descricao.toLowerCase().includes(busca)
      );
    }
    return true;
  });
};

// Função para atualizar status de uma OS com controle rigoroso
export const atualizarStatusOS = (numeroOS: string, novoStatus: 'Aberta' | 'Concluída', setorResponsavel: string, observacoes?: string): { sucesso: boolean; erro?: string } => {
  const index = mockOrdemServico.findIndex(os => os.numero_chamado === numeroOS);
  if (index === -1) return { sucesso: false, erro: 'OS não encontrada' };
  
  const osAtual = mockOrdemServico[index];
  
  // Controle rigoroso: apenas permitir mudança de 'Aberta' para 'Concluída'
  if (osAtual.status === 'Concluída') {
    return { sucesso: false, erro: 'OS já está concluída e não pode ser alterada' };
  }
  
  if (osAtual.status === 'Aberta' && novoStatus === 'Concluída') {
    // Apenas o setor responsável pode concluir a OS
    if (!setorResponsavel) {
      return { sucesso: false, erro: 'Setor responsável deve ser informado para conclusão' };
    }
    
    mockOrdemServico[index].status = novoStatus;
    mockOrdemServico[index].data_conclusao = new Date().toLocaleDateString('pt-BR');
    mockOrdemServico[index].responsavel_conclusao = setorResponsavel;
    mockOrdemServico[index].updated_at = new Date().toISOString();
    
    if (observacoes) {
      mockOrdemServico[index].observacoes_manutencao = observacoes;
    }
    
    return { sucesso: true };
  }
  
  if (novoStatus === 'Aberta') {
    return { sucesso: false, erro: 'Não é possível alterar status para Aberta. OSs iniciam automaticamente como Aberta.' };
  }
  
  return { sucesso: false, erro: 'Transição de status não permitida' };
};

// Função para buscar OS por número
export const buscarOSPorNumero = (numeroOS: string): OrdemServico | undefined => {
  return mockOrdemServico.find(os => os.numero_chamado === numeroOS);
};

// Função para obter estatísticas atualizadas
export const obterEstatisticasAtualizadas = (osLista: OrdemServico[] = mockOrdemServico): EstatisticasOS => {
  return {
    total_os: osLista.length,
    abertas: osLista.filter(os => os.status === 'Aberta').length,
    concluidas: osLista.filter(os => os.status === 'Concluída').length,
    por_tipo: {
      'Estrutural': osLista.filter(os => os.tipo_chamado === 'Estrutural').length,
      'Viatura': osLista.filter(os => os.tipo_chamado === 'Viatura').length,
      'Equipamento': osLista.filter(os => os.tipo_chamado === 'Equipamento').length,
      'Combustível': osLista.filter(os => os.tipo_chamado === 'Combustível').length,
      'Materiais': osLista.filter(os => os.tipo_chamado === 'Materiais').length
    },
    tempo_medio_conclusao: 3.5
  };
};

// Função para validar dados de OS antes de salvar
export const validarDadosOS = (os: Partial<OrdemServico>): { valido: boolean; erros: string[] } => {
  const erros: string[] = [];
  
  if (!os.tipo_chamado) erros.push('Tipo de chamado é obrigatório');
  if (!os.nome_solicitante) erros.push('Nome do solicitante é obrigatório');
  if (!os.descricao) erros.push('Descrição é obrigatória');
  if (!os.data_solicitacao) erros.push('Data de solicitação é obrigatória');
  
  return {
    valido: erros.length === 0,
    erros
  };
};