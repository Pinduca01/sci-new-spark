import { useState, useCallback } from 'react';
import { useAgentesExtintores } from './useAgentesExtintores';
import { exportarExcel as exportarExcelUtil } from '@/utils/excelExporter';
import { useToast } from './use-toast';

export interface FiltroRelatorio {
  dataInicio: string;
  dataFim: string;
  tipoAgente?: 'LGE' | 'PO_QUIMICO' | 'NITROGENIO' | 'TODOS';
  equipe?: 'Alfa' | 'Bravo' | 'Charlie' | 'Delta' | 'TODAS';
  situacao?: 'ESTOQUE' | 'EM_LINHA' | 'MANUTENCAO' | 'DESCARTADO' | 'TODAS';
}

export interface DadosRelatorio {
  resumoGeral: {
    totalAgentes: number;
    totalLGE: number;
    totalPoQuimico: number;
    totalNitrogenio: number;
    valorTotalEstoque: number;
  };
  movimentacoesPeriodo: {
    totalEntradas: number;
    totalSaidas: number;
    movimentacoesPorEquipe: Record<string, number>;
  };
  checklistsRealizados: {
    totalChecklists: number;
    conformidades: number;
    naoConformidades: number;
  };
  alertasValidade: {
    vencidosHoje: number;
    vencemEm7Dias: number;
    vencemEm30Dias: number;
  };
}

export const useAgentesExtintoresRelatorios = () => {
  const { agentes, movimentacoes } = useAgentesExtintores();
  const [loading, setLoading] = useState(false);
  const [dadosRelatorio, setDadosRelatorio] = useState<DadosRelatorio | null>(null);

  // Gerar dados do relatório baseado nos filtros
  const gerarRelatorio = async (filtros: FiltroRelatorio): Promise<DadosRelatorio> => {
    setLoading(true);
    
    try {
      const dataInicio = new Date(filtros.dataInicio);
      const dataFim = new Date(filtros.dataFim);
      const hoje = new Date();
      
      // Filtrar agentes
      let agentesFiltrados = agentes;
      if (filtros.tipoAgente && filtros.tipoAgente !== 'TODOS') {
        agentesFiltrados = agentesFiltrados.filter(a => a.tipo === filtros.tipoAgente);
      }
      if (filtros.situacao && filtros.situacao !== 'TODAS') {
        agentesFiltrados = agentesFiltrados.filter(a => a.situacao === filtros.situacao);
      }

      // Filtrar movimentações por período
      const movimentacoesFiltradas = movimentacoes.filter(m => {
        const dataMovimentacao = new Date(m.data_movimentacao);
        const dentroPeríodo = dataMovimentacao >= dataInicio && dataMovimentacao <= dataFim;
        const equipeMatch = !filtros.equipe || filtros.equipe === 'TODAS' || m.equipe_responsavel === filtros.equipe;
        return dentroPeríodo && equipeMatch;
      });

      // Filtrar checklists por período
      const checklistsFiltrados = checklists.filter(c => {
        const dataChecklist = new Date(c.data_checklist);
        return dataChecklist >= dataInicio && dataChecklist <= dataFim;
      });

      // Calcular resumo geral
      const resumoGeral = {
        totalAgentes: agentesFiltrados.length,
        totalLGE: agentesFiltrados.filter(a => a.tipo === 'LGE').reduce((sum, a) => sum + a.quantidade, 0),
        totalPoQuimico: agentesFiltrados.filter(a => a.tipo === 'PO_QUIMICO').reduce((sum, a) => sum + a.quantidade, 0),
        totalNitrogenio: agentesFiltrados.filter(a => a.tipo === 'NITROGENIO').reduce((sum, a) => sum + a.quantidade, 0),
        valorTotalEstoque: agentesFiltrados.length * 150 // Valor estimado por agente
      };

      // Calcular movimentações do período
      const entradas = movimentacoesFiltradas.filter(m => m.tipo_movimentacao === 'ENTRADA');
      const saidas = movimentacoesFiltradas.filter(m => m.tipo_movimentacao === 'SAIDA');
      
      const movimentacoesPorEquipe: Record<string, number> = {};
      ['Alfa', 'Bravo', 'Charlie', 'Delta'].forEach(equipe => {
        movimentacoesPorEquipe[equipe] = movimentacoesFiltradas.filter(m => m.equipe_responsavel === equipe).length;
      });

      const movimentacoesPeriodo = {
        totalEntradas: entradas.reduce((sum, e) => sum + e.quantidade, 0),
        totalSaidas: saidas.reduce((sum, s) => sum + s.quantidade, 0),
        movimentacoesPorEquipe
      };

      // Calcular checklists realizados
      const checklistsConformes = checklistsFiltrados.filter(c => 
        c.integridade_embalagem && c.validade_verificada && c.quantidade_conferida
      );
      
      const checklistsRealizados = {
        totalChecklists: checklistsFiltrados.length,
        conformidades: checklistsConformes.length,
        naoConformidades: checklistsFiltrados.length - checklistsConformes.length
      };

      // Calcular alertas de validade
      const em7Dias = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);
      const em30Dias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const alertasValidade = {
        vencidosHoje: agentesFiltrados.filter(a => new Date(a.data_validade) <= hoje).length,
        vencemEm7Dias: agentesFiltrados.filter(a => {
          const validade = new Date(a.data_validade);
          return validade > hoje && validade <= em7Dias;
        }).length,
        vencemEm30Dias: agentesFiltrados.filter(a => {
          const validade = new Date(a.data_validade);
          return validade > em7Dias && validade <= em30Dias;
        }).length
      };

      const dados: DadosRelatorio = {
        resumoGeral,
        movimentacoesPeriodo,
        checklistsRealizados,
        alertasValidade
      };

      setDadosRelatorio(dados);
      toast.success('Relatório gerado com sucesso!');
      return dados;
      
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Exportar relatório para PDF (simulado)
  const exportarPDF = async (dados: DadosRelatorio, filtros: FiltroRelatorio) => {
    try {
      setLoading(true);
      
      // Simular geração de PDF
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aqui seria implementada a lógica real de geração de PDF
      // Por exemplo, usando jsPDF ou uma API de geração de relatórios
      
      const nomeArquivo = `relatorio-agentes-extintores-${new Date().toISOString().split('T')[0]}.pdf`;
      
      toast.success(`Relatório ${nomeArquivo} gerado com sucesso!`);
      
      // Simular download
      console.log('PDF gerado:', { dados, filtros, nomeArquivo });
      
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar relatório em PDF');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Exportar para Excel
  const exportarExcel = useCallback(async (tipo: string, filtros?: FiltroRelatorio): Promise<string> => {
    try {
      let nomeArquivo: string;
      
      switch (tipo) {
        case 'estoque':
          nomeArquivo = await exportarExcelUtil.estoque(agentes, filtros);
          break;
        case 'movimentacoes':
          nomeArquivo = await exportarExcelUtil.movimentacoes(movimentacoes, filtros);
          break;
        case 'checklists':
          nomeArquivo = await exportarExcelUtil.checklists(checklists, filtros);
          break;
        case 'consolidado':
          nomeArquivo = await exportarExcelUtil.consolidado(agentes, movimentacoes, checklists, filtros);
          break;
        case 'validades':
          // Filtrar apenas agentes próximos ao vencimento
          const agentesVencimento = agentes.filter(a => {
            const diasRestantes = Math.ceil((new Date(a.data_validade).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return diasRestantes <= 90;
          });
          nomeArquivo = await exportarExcelUtil.estoque(agentesVencimento, filtros);
          break;
        case 'personalizado':
          nomeArquivo = await exportarExcelUtil.consolidado(agentes, movimentacoes, checklists, filtros);
          break;
        default:
          throw new Error(`Tipo de exportação não suportado: ${tipo}`);
      }
      
      toast({
        title: "Planilha exportada com sucesso!",
        description: `Arquivo ${nomeArquivo} foi gerado.`,
      });
      
      return nomeArquivo;
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar a planilha.",
        variant: "destructive",
      });
      throw error;
    }
  }, [agentes, movimentacoes, checklists, toast]);

  // Obter estatísticas rápidas
  const getEstatisticasRapidas = () => {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    const movimentacoesMes = movimentacoes.filter(m => {
      const data = new Date(m.data_movimentacao);
      return data >= inicioMes && data <= fimMes;
    });
    
    const checklistsMes = checklists.filter(c => {
      const data = new Date(c.data_checklist);
      return data >= inicioMes && data <= fimMes;
    });
    
    return {
      movimentacoesMes: movimentacoesMes.length,
      checklistsMes: checklistsMes.length,
      agentesAtivos: agentes.filter(a => a.situacao === 'ESTOQUE' || a.situacao === 'EM_LINHA').length,
      alertasUrgentes: agentes.filter(a => new Date(a.data_validade) <= hoje).length
    };
  };

  return {
    // Estados
    loading,
    dadosRelatorio,
    
    // Funções
    gerarRelatorio,
    exportarPDF,
    exportarExcel,
    getEstatisticasRapidas,
    
    // Utilitários
    limparDados: () => setDadosRelatorio(null)
  };
};

export default useAgentesExtintoresRelatorios;