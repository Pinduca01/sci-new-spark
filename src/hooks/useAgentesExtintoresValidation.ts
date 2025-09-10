import { useState } from 'react';
import { AgenteExtintor, Movimentacao } from './useAgentesExtintores';

export interface ValidacaoResult {
  valido: boolean;
  erros: string[];
  avisos: string[];
}

export interface RegrasValidacao {
  quantidadeMinima: Record<string, number>;
  quantidadeMaxima: Record<string, number>;
  diasAvisoValidade: number;
  pressaoMinimaLGE: number;
  pressaoMaximaLGE: number;
}

const REGRAS_PADRAO: RegrasValidacao = {
  quantidadeMinima: {
    'LGE': 100, // litros
    'PO_QUIMICO': 50, // kg
    'NITROGENIO': 10 // cilindros
  },
  quantidadeMaxima: {
    'LGE': 2000, // litros
    'PO_QUIMICO': 500, // kg
    'NITROGENIO': 100 // cilindros
  },
  diasAvisoValidade: 30,
  pressaoMinimaLGE: 12, // bar
  pressaoMaximaLGE: 25 // bar
};

export const useAgentesExtintoresValidation = (regrasCustomizadas?: Partial<RegrasValidacao>) => {
  const [regras] = useState<RegrasValidacao>({ ...REGRAS_PADRAO, ...regrasCustomizadas });

  // Validar dados do agente extintor
  const validarAgente = (agente: Partial<AgenteExtintor>): ValidacaoResult => {
    const erros: string[] = [];
    const avisos: string[] = [];

    // Validações obrigatórias
    if (!agente.tipo) {
      erros.push('Tipo do agente é obrigatório');
    }
    
    if (!agente.fabricante || agente.fabricante.trim().length < 2) {
      erros.push('Fabricante deve ter pelo menos 2 caracteres');
    }
    
    if (!agente.quantidade || agente.quantidade <= 0) {
      erros.push('Quantidade deve ser maior que zero');
    }
    
    if (!agente.unidade) {
      erros.push('Unidade é obrigatória');
    }
    
    if (!agente.data_validade) {
      erros.push('Data de validade é obrigatória');
    }
    
    if (!agente.data_fabricacao) {
      erros.push('Data de fabricação é obrigatória');
    }

    // Validações específicas por tipo
    if (agente.tipo && agente.quantidade) {
      const quantidadeMin = regras.quantidadeMinima[agente.tipo];
      const quantidadeMax = regras.quantidadeMaxima[agente.tipo];
      
      if (agente.quantidade < quantidadeMin) {
        avisos.push(`Quantidade abaixo do recomendado (mínimo: ${quantidadeMin} ${agente.unidade})`);
      }
      
      if (agente.quantidade > quantidadeMax) {
        avisos.push(`Quantidade acima do recomendado (máximo: ${quantidadeMax} ${agente.unidade})`);
      }
    }

    // Validação de pressão para LGE
    if (agente.tipo === 'LGE' && agente.pressao_trabalho) {
      if (agente.pressao_trabalho < regras.pressaoMinimaLGE) {
        erros.push(`Pressão de trabalho muito baixa (mínimo: ${regras.pressaoMinimaLGE} bar)`);
      }
      
      if (agente.pressao_trabalho > regras.pressaoMaximaLGE) {
        erros.push(`Pressão de trabalho muito alta (máximo: ${regras.pressaoMaximaLGE} bar)`);
      }
    }

    // Validação de datas
    if (agente.data_fabricacao && agente.data_validade) {
      const dataFabricacao = new Date(agente.data_fabricacao);
      const dataValidade = new Date(agente.data_validade);
      const hoje = new Date();
      
      if (dataFabricacao > hoje) {
        erros.push('Data de fabricação não pode ser futura');
      }
      
      if (dataValidade <= dataFabricacao) {
        erros.push('Data de validade deve ser posterior à data de fabricação');
      }
      
      // Aviso de validade próxima
      const diasParaVencer = Math.ceil((dataValidade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diasParaVencer <= 0) {
        erros.push('Agente extintor vencido');
      } else if (diasParaVencer <= regras.diasAvisoValidade) {
        avisos.push(`Agente extintor vence em ${diasParaVencer} dias`);
      }
    }

    // Validação de unidade por tipo
    if (agente.tipo && agente.unidade) {
      const unidadesValidas = {
        'LGE': ['litros'],
        'PO_QUIMICO': ['kg'],
        'NITROGENIO': ['cilindros']
      };
      
      if (!unidadesValidas[agente.tipo].includes(agente.unidade)) {
        erros.push(`Unidade inválida para ${agente.tipo}. Use: ${unidadesValidas[agente.tipo].join(', ')}`);
      }
    }

    return {
      valido: erros.length === 0,
      erros,
      avisos
    };
  };

  // Validar movimentação
  const validarMovimentacao = (movimentacao: Partial<Movimentacao>, agenteAtual?: AgenteExtintor): ValidacaoResult => {
    const erros: string[] = [];
    const avisos: string[] = [];

    // Validações obrigatórias
    if (!movimentacao.agente_extintor_id) {
      erros.push('Agente extintor é obrigatório');
    }
    
    if (!movimentacao.tipo_movimentacao) {
      erros.push('Tipo de movimentação é obrigatório');
    }
    
    if (!movimentacao.quantidade || movimentacao.quantidade <= 0) {
      erros.push('Quantidade deve ser maior que zero');
    }
    
    if (!movimentacao.equipe_responsavel) {
      erros.push('Equipe responsável é obrigatória');
    }
    
    if (!movimentacao.data_movimentacao) {
      erros.push('Data da movimentação é obrigatória');
    }

    // Validação de quantidade disponível para saída
    if (movimentacao.tipo_movimentacao === 'SAIDA' && agenteAtual && movimentacao.quantidade) {
      if (movimentacao.quantidade > agenteAtual.quantidade) {
        erros.push(`Quantidade insuficiente em estoque (disponível: ${agenteAtual.quantidade} ${agenteAtual.unidade})`);
      }
      
      const quantidadeRestante = agenteAtual.quantidade - movimentacao.quantidade;
      const quantidadeMinima = regras.quantidadeMinima[agenteAtual.tipo] || 0;
      
      if (quantidadeRestante < quantidadeMinima) {
        avisos.push(`Estoque ficará abaixo do mínimo recomendado (${quantidadeMinima} ${agenteAtual.unidade})`);
      }
    }

    // Validação de data
    if (movimentacao.data_movimentacao) {
      const dataMovimentacao = new Date(movimentacao.data_movimentacao);
      const hoje = new Date();
      
      if (dataMovimentacao > hoje) {
        erros.push('Data da movimentação não pode ser futura');
      }
    }

    return {
      valido: erros.length === 0,
      erros,
      avisos
    };
  };



  // Verificar compatibilidade de unidades
  const verificarCompatibilidadeUnidade = (tipo: string, unidade: string): boolean => {
    const compatibilidades = {
      'LGE': ['litros'],
      'PO_QUIMICO': ['kg'],
      'NITROGENIO': ['cilindros']
    };
    
    return compatibilidades[tipo]?.includes(unidade) || false;
  };

  // Calcular status de validade
  const calcularStatusValidade = (dataValidade: string): 'vencido' | 'critico' | 'atencao' | 'ok' => {
    const hoje = new Date();
    const validade = new Date(dataValidade);
    const diasRestantes = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diasRestantes <= 0) return 'vencido';
    if (diasRestantes <= 7) return 'critico';
    if (diasRestantes <= regras.diasAvisoValidade) return 'atencao';
    return 'ok';
  };

  // Sugerir quantidade ideal
  const sugerirQuantidadeIdeal = (tipo: string): { minima: number; maxima: number; recomendada: number } => {
    const minima = regras.quantidadeMinima[tipo] || 0;
    const maxima = regras.quantidadeMaxima[tipo] || 1000;
    const recomendada = Math.round((minima + maxima) / 2);
    
    return { minima, maxima, recomendada };
  };

  return {
    // Validações
    validarAgente,
    validarMovimentacao,
    
    // Utilitários
    verificarCompatibilidadeUnidade,
    calcularStatusValidade,
    sugerirQuantidadeIdeal,
    
    // Configurações
    regras,
    
    // Constantes úteis
    tiposAgente: ['LGE', 'PO_QUIMICO', 'NITROGENIO'] as const,
    situacoes: ['ESTOQUE', 'EM_LINHA', 'MANUTENCAO', 'DESCARTADO'] as const,
    equipes: ['Alfa', 'Bravo', 'Charlie', 'Delta'] as const,
    unidadesPorTipo: {
      'LGE': ['litros'],
      'PO_QUIMICO': ['kg'],
      'NITROGENIO': ['cilindros']
    }
  };
};

export default useAgentesExtintoresValidation;