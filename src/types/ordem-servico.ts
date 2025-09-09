// Tipos para o sistema de Ordem de Serviço

export type StatusOS = 'Aberta' | 'Pendente' | 'Em Andamento' | 'Concluída' | 'Concluído' | 'Cancelado';

export type TipoOS = 'Estrutural' | 'Viatura' | 'Equipamento' | 'Combustível' | 'Materiais';

export type ItemOperacional = 'SIM' | 'NÃO' | 'PARCIAL';

// Interface base para todas as OS
export interface OrdemServicoBase {
  cod_id: number;
  numero_chamado: string; // Numeração automática
  data_solicitacao: string;
  tipo_chamado: TipoOS;
  nome_solicitante: string;
  descricao: string;
  status: StatusOS;
  item_operacional: ItemOperacional;
  observacoes_manutencao?: string;
  data_conclusao?: string;
  responsavel_conclusao?: string;
  created_at: string;
  updated_at: string;
}

// OS para Estrutural
export interface OSEstrutural extends OrdemServicoBase {
  tipo_chamado: 'Estrutural';
  local_instalacao: string;
  tipo_estrutura?: string;
  urgencia?: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
}

// OS para Viatura
export interface OSViatura extends OrdemServicoBase {
  tipo_chamado: 'Viatura';
  veiculo_identificacao: string;
  tipo_veiculo?: 'CCI' | 'CRS' | 'CCI RT' | 'CA';
  quilometragem_atual?: number;
  tipo_manutencao?: 'Preventiva' | 'Corretiva' | 'Emergencial';
}

// OS para Equipamento
export interface OSEquipamento extends OrdemServicoBase {
  tipo_chamado: 'Equipamento';
  equipamento_identificacao: string;
  numero_serie?: string;
  modelo?: string;
  fabricante?: string;
  localizacao_equipamento?: string;
  tipo_manutencao?: 'Preventiva' | 'Corretiva' | 'Calibração';
}

// OS para Combustível
export interface OSCombustivel extends OrdemServicoBase {
  tipo_chamado: 'Combustível';
  veiculo_identificacao: string;
  tipo_combustivel: 'Gasolina' | 'Diesel' | 'Etanol';
  quantidade_solicitada: number; // Valor em porcentagem (%)
  quantidade_atual?: number; // Valor em porcentagem (%)
  urgencia: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
}

// OS para Materiais
export interface OSMateriais extends OrdemServicoBase {
  tipo_chamado: 'Materiais';
  lista_materiais: MaterialSolicitado[];
  justificativa: string;
}

export interface MaterialSolicitado {
  id: string;
  nome_material: string;
  quantidade: number;
  unidade: string;
  especificacao?: string;
}

// Union type para todas as OS
export type OrdemServico = OSEstrutural | OSViatura | OSEquipamento | OSCombustivel | OSMateriais;

// Filtros para listagem
export interface FiltrosOS {
  status?: StatusOS[];
  tipo?: TipoOS[];
  data_inicio?: string;
  data_fim?: string;
  solicitante?: string;
  busca_geral?: string;
}

// Estatísticas do dashboard
export interface EstatisticasOS {
  total_os: number;
  abertas: number;
  concluidas: number;
  por_tipo: Record<TipoOS, number>;
  tempo_medio_conclusao: number; // em dias
}