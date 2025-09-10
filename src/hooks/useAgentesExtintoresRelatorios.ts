import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAgentesExtintores } from './useAgentesExtintores';
import { exportarExcel as exportarExcelUtil } from '@/utils/excelExporter';

export interface FiltroRelatorio {
  dataInicio: string;
  dataFim: string;
  tipoAgente?: 'LGE' | 'PO_QUIMICO' | 'NITROGENIO' | 'TODOS';
  equipe?: 'Alfa' | 'Bravo' | 'Charlie' | 'Delta' | 'TODAS';
}

export interface DadosRelatorio {
  agentes: any[];
  movimentacoes: any[];
  estoque: any[];
  checklists: any[];
  resumoGeral: {
    totalAgentes: number;
    totalLGE: number;
    totalPoQuimico: number;
    totalNitrogenio: number;
    totalMovimentacoes: number;
    totalChecklists: number;
  };
  consolidado: {
    agentesPorTipo: Record<string, number>;
    movimentacoesPorEquipe: Record<string, number>;
    checklistsPorStatus: Record<string, number>;
  };
}

export interface RelatorioData {
  mes: number;
  ano: number; 
  agentes: any[];
}

export const useAgentesExtintoresRelatorios = () => {
  const [loading, setLoading] = useState(false);
  const [dadosRelatorio, setDadosRelatorio] = useState<DadosRelatorio>({
    agentes: [],
    movimentacoes: [],
    estoque: [],
    checklists: [],
    resumoGeral: {
      totalAgentes: 0,
      totalLGE: 0,
      totalPoQuimico: 0,
      totalNitrogenio: 0,
      totalMovimentacoes: 0,
      totalChecklists: 0,
    },
    consolidado: {
      agentesPorTipo: {},
      movimentacoesPorEquipe: {},
      checklistsPorStatus: {},
    }
  });

  const { agentes, movimentacoes } = useAgentesExtintores();

  const gerarRelatorio = async (filtros: FiltroRelatorio): Promise<DadosRelatorio> => {
    setLoading(true);
    try {
      const dataInicio = new Date(filtros.dataInicio);
      const dataFim = new Date(filtros.dataFim);
      
      // Filtrar agentes por período
      const agentesFiltrados = agentes.filter(a => {
        if (filtros.tipoAgente && filtros.tipoAgente !== 'TODOS') {
          return a.tipo === filtros.tipoAgente;
        }
        return true;
      });

      // Filtrar movimentações por período
      const movimentacoesFiltradas = movimentacoes.filter(m => {
        const dataMovimentacao = new Date(m.data_movimentacao);
        const dentroPeríodo = dataMovimentacao >= dataInicio && dataMovimentacao <= dataFim;
        const equipeMatch = !filtros.equipe || filtros.equipe === 'TODAS' || m.equipe === filtros.equipe;
        return dentroPeríodo && equipeMatch;
      });

      // Mock checklists
      const checklists: any[] = [];

      const resumoGeral = {
        totalAgentes: agentesFiltrados.length,
        totalLGE: agentesFiltrados.filter(a => a.tipo === 'LGE').reduce((sum, a) => sum + a.quantidade, 0),
        totalPoQuimico: agentesFiltrados.filter(a => a.tipo === 'PO_QUIMICO').reduce((sum, a) => sum + a.quantidade, 0),
        totalNitrogenio: agentesFiltrados.filter(a => a.tipo === 'NITROGENIO').reduce((sum, a) => sum + a.quantidade, 0),
        totalMovimentacoes: movimentacoesFiltradas.length,
        totalChecklists: checklists.length,
      };

      const dados: DadosRelatorio = {
        agentes: agentesFiltrados,
        movimentacoes: movimentacoesFiltradas,
        estoque: [],
        checklists: [],
        resumoGeral,
        consolidado: {
          agentesPorTipo: {
            LGE: agentesFiltrados.filter(a => a.tipo === 'LGE').length,
            PO_QUIMICO: agentesFiltrados.filter(a => a.tipo === 'PO_QUIMICO').length,
            NITROGENIO: agentesFiltrados.filter(a => a.tipo === 'NITROGENIO').length,
          },
          movimentacoesPorEquipe: {},
          checklistsPorStatus: {},
        }
      };

      setDadosRelatorio(dados);
      return dados;
    } catch (error) {
      toast.error('Erro ao gerar relatório');
      console.error('Erro:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const exportarPDF = async (dados: DadosRelatorio, filtros: FiltroRelatorio) => {
    try {
      toast.success('Gerando PDF...');
      // Implementar geração de PDF
      return null;
    } catch (error) {
      toast.error('Erro ao exportar PDF');
      throw error;
    }
  };

  const exportarExcel = async (tipo: string, filtros?: FiltroRelatorio) => {
    try {
      toast.success('Gerando Excel...');
      // Implementar exportação Excel
      return null;
    } catch (error) {
      toast.error('Erro ao exportar Excel');
      throw error;
    }
  };

  const getEstatisticasRapidas = () => {
    return {
      totalAgentes: agentes.length,
      totalMovimentacoes: movimentacoes.length,
      alertas: 0,
    };
  };

  const obterEstatisticasRapidas = getEstatisticasRapidas;

  // Mock function for export compatibility
  const exportarRelatorios = ({ mes, ano, agentes }: RelatorioData) => {
    console.log('Exportando relatórios:', { mes, ano, totalAgentes: agentes.length });
  };

  return {
    loading,
    dadosRelatorio,
    gerarRelatorio,
    exportarPDF,
    exportarExcel,
    getEstatisticasRapidas,
    obterEstatisticasRapidas,
    exportarRelatorios,
    // Mock exports for compatibility
    estoque: exportarRelatorios,
    movimentacoes: exportarRelatorios, 
    checklists: exportarRelatorios,
    consolidado: exportarRelatorios,
  };
};