import { AgenteExtintor, Movimentacao } from '@/hooks/useAgentesExtintores';
import type { ChecklistAgente } from '@/types/checklist';
import { FiltroRelatorio } from '@/hooks/useAgentesExtintoresRelatorios';

// Interface para configuração do Excel
export interface ConfiguracaoExcel {
  nomeArquivo: string;
  incluirCabecalho: boolean;
  incluirResumo: boolean;
  formatarDatas: boolean;
}

// Interface para dados de planilha
export interface DadosPlanilha {
  nome: string;
  dados: any[];
  colunas: string[];
}

// Configuração padrão
const CONFIG_PADRAO: ConfiguracaoExcel = {
  nomeArquivo: 'relatorio-agentes-extintores',
  incluirCabecalho: true,
  incluirResumo: true,
  formatarDatas: true
};

export class ExcelExporter {
  private config: ConfiguracaoExcel;

  constructor(config?: Partial<ConfiguracaoExcel>) {
    this.config = { ...CONFIG_PADRAO, ...config };
  }

  // Exportar dados de estoque
  async exportarEstoque(agentes: AgenteExtintor[], filtros?: FiltroRelatorio): Promise<string> {
    try {
      const dadosProcessados = this.processarDadosEstoque(agentes, filtros);
      const planilhas: DadosPlanilha[] = [
        {
          nome: 'Resumo por Tipo',
          dados: this.criarResumoTipos(dadosProcessados.resumoPorTipo),
          colunas: ['Tipo de Agente', 'Quantidade Total', 'Nº de Agentes', 'Vencidos', 'Unidade']
        },
        {
          nome: 'Detalhamento',
          dados: dadosProcessados.agentes.map(agente => ({
            'Tipo': this.formatarTipoAgente(agente.tipo),
            'Fabricante': agente.fabricante,
            'Quantidade': agente.quantidade,
            'Unidade': agente.unidade,
            'Situação': agente.situacao,
            'Data de Validade': this.formatarData(agente.data_validade),
            'Status': this.obterStatusValidade(agente.data_validade),
            'Observações': agente.observacoes || '-'
          })),
          colunas: ['Tipo', 'Fabricante', 'Quantidade', 'Unidade', 'Situação', 'Data de Validade', 'Status', 'Observações']
        }
      ];

      const nomeArquivo = await this.gerarArquivoExcel(planilhas, 'estoque');
      return nomeArquivo;
    } catch (error) {
      console.error('Erro ao exportar estoque:', error);
      throw new Error('Falha na exportação dos dados de estoque');
    }
  }

  // Exportar dados de movimentações
  async exportarMovimentacoes(movimentacoes: Movimentacao[], filtros?: FiltroRelatorio): Promise<string> {
    try {
      const dadosProcessados = this.processarDadosMovimentacoes(movimentacoes, filtros);
      const planilhas: DadosPlanilha[] = [
        {
          nome: 'Resumo por Equipe',
          dados: Object.entries(dadosProcessados.resumoPorEquipe).map(([equipe, quantidade]) => ({
            'Equipe': equipe,
            'Nº de Movimentações': quantidade,
            'Percentual': `${Math.round((quantidade / dadosProcessados.totalMovimentacoes) * 100)}%`
          })),
          colunas: ['Equipe', 'Nº de Movimentações', 'Percentual']
        },
        {
          nome: 'Histórico Completo',
          dados: dadosProcessados.movimentacoes.map(mov => ({
            'Data': this.formatarData(mov.data_movimentacao),
            'Tipo': mov.tipo_movimentacao,
            'Agente ID': mov.agente_id,
            'Quantidade': mov.quantidade,
            'Equipe Responsável': mov.equipe_responsavel,
            'Responsável': mov.responsavel || '-',
            'Destino/Origem': mov.destino || mov.origem || '-',
            'Observações': mov.observacoes || '-'
          })),
          colunas: ['Data', 'Tipo', 'Agente ID', 'Quantidade', 'Equipe Responsável', 'Responsável', 'Destino/Origem', 'Observações']
        },
        {
          nome: 'Resumo Mensal',
          dados: this.criarResumoMensal(dadosProcessados.movimentacoes),
          colunas: ['Mês/Ano', 'Entradas', 'Saídas', 'Saldo', 'Total Movimentações']
        }
      ];

      const nomeArquivo = await this.gerarArquivoExcel(planilhas, 'movimentacoes');
      return nomeArquivo;
    } catch (error) {
      console.error('Erro ao exportar movimentações:', error);
      throw new Error('Falha na exportação dos dados de movimentações');
    }
  }

  // Exportar dados de checklists
  async exportarChecklists(checklists: ChecklistAgente[], filtros?: FiltroRelatorio): Promise<string> {
    try {
      const dadosProcessados = this.processarDadosChecklists(checklists, filtros);
      const planilhas: DadosPlanilha[] = [
        {
          nome: 'Resumo de Conformidade',
          dados: [
            {
              'Indicador': 'Total de Checklists',
              'Valor': dadosProcessados.totalChecklists,
              'Percentual': '100%'
            },
            {
              'Indicador': 'Conformes',
              'Valor': dadosProcessados.conformes,
              'Percentual': `${dadosProcessados.percentualConformidade}%`
            },
            {
              'Indicador': 'Não Conformes',
              'Valor': dadosProcessados.naoConformes,
              'Percentual': `${100 - dadosProcessados.percentualConformidade}%`
            }
          ],
          colunas: ['Indicador', 'Valor', 'Percentual']
        },
        {
          nome: 'Histórico Detalhado',
          dados: dadosProcessados.checklists.map(check => ({
            'Data': this.formatarData(check.data_checklist),
            'Agente ID': check.agente_id,
            'Responsável': check.responsavel,
            'Integridade da Embalagem': check.integridade_embalagem ? 'Conforme' : 'Não Conforme',
            'Validade Verificada': check.validade_verificada ? 'Conforme' : 'Não Conforme',
            'Quantidade Conferida': check.quantidade_conferida ? 'Conforme' : 'Não Conforme',
            'Status Geral': this.obterStatusChecklist(check),
            'Observações': check.observacoes || '-'
          })),
          colunas: ['Data', 'Agente ID', 'Responsável', 'Integridade da Embalagem', 'Validade Verificada', 'Quantidade Conferida', 'Status Geral', 'Observações']
        }
      ];

      const nomeArquivo = await this.gerarArquivoExcel(planilhas, 'checklists');
      return nomeArquivo;
    } catch (error) {
      console.error('Erro ao exportar checklists:', error);
      throw new Error('Falha na exportação dos dados de checklists');
    }
  }

  // Exportar relatório consolidado
  async exportarConsolidado(
    agentes: AgenteExtintor[], 
    movimentacoes: Movimentacao[], 
    checklists: ChecklistAgente[],
    filtros?: FiltroRelatorio
  ): Promise<string> {
    try {
      const planilhas: DadosPlanilha[] = [
        {
          nome: 'Dashboard Executivo',
          dados: [
            { 'Indicador': 'Total de Agentes', 'Valor': agentes.length },
            { 'Indicador': 'Total de Movimentações', 'Valor': movimentacoes.length },
            { 'Indicador': 'Total de Checklists', 'Valor': checklists.length },
            { 'Indicador': 'Agentes Vencidos', 'Valor': agentes.filter(a => new Date(a.data_validade) < new Date()).length },
            { 'Indicador': 'LGE (Litros)', 'Valor': agentes.filter(a => a.tipo === 'LGE').reduce((sum, a) => sum + a.quantidade, 0) },
            { 'Indicador': 'Pó Químico (Kg)', 'Valor': agentes.filter(a => a.tipo === 'PO_QUIMICO').reduce((sum, a) => sum + a.quantidade, 0) },
            { 'Indicador': 'Nitrogênio (Cilindros)', 'Valor': agentes.filter(a => a.tipo === 'NITROGENIO').reduce((sum, a) => sum + a.quantidade, 0) }
          ],
          colunas: ['Indicador', 'Valor']
        }
      ];

      // Adicionar planilhas detalhadas
      const dadosEstoque = this.processarDadosEstoque(agentes, filtros);
      planilhas.push({
        nome: 'Estoque Detalhado',
        dados: dadosEstoque.agentes.map(agente => ({
          'Tipo': this.formatarTipoAgente(agente.tipo),
          'Fabricante': agente.fabricante,
          'Quantidade': agente.quantidade,
          'Unidade': agente.unidade,
          'Situação': agente.situacao,
          'Validade': this.formatarData(agente.data_validade),
          'Status': this.obterStatusValidade(agente.data_validade)
        })),
        colunas: ['Tipo', 'Fabricante', 'Quantidade', 'Unidade', 'Situação', 'Validade', 'Status']
      });

      const dadosMovimentacoes = this.processarDadosMovimentacoes(movimentacoes, filtros);
      planilhas.push({
        nome: 'Movimentações Recentes',
        dados: dadosMovimentacoes.movimentacoes.slice(0, 100).map(mov => ({
          'Data': this.formatarData(mov.data_movimentacao),
          'Tipo': mov.tipo_movimentacao,
          'Quantidade': mov.quantidade,
          'Equipe': mov.equipe_responsavel
        })),
        colunas: ['Data', 'Tipo', 'Quantidade', 'Equipe']
      });

      const nomeArquivo = await this.gerarArquivoExcel(planilhas, 'consolidado');
      return nomeArquivo;
    } catch (error) {
      console.error('Erro ao exportar consolidado:', error);
      throw new Error('Falha na exportação do relatório consolidado');
    }
  }

  // Processar dados de estoque
  private processarDadosEstoque(agentes: AgenteExtintor[], filtros?: FiltroRelatorio) {
    let agentesFiltrados = agentes;
    
    if (filtros?.tipoAgente && filtros.tipoAgente !== 'TODOS') {
      agentesFiltrados = agentesFiltrados.filter(a => a.tipo === filtros.tipoAgente);
    }
    
    const resumoPorTipo = {
      LGE: {
        quantidade: agentesFiltrados.filter(a => a.tipo === 'LGE').reduce((sum, a) => sum + a.quantidade, 0),
        agentes: agentesFiltrados.filter(a => a.tipo === 'LGE').length,
        vencidos: agentesFiltrados.filter(a => a.tipo === 'LGE' && new Date(a.data_validade) < new Date()).length,
        unidade: 'L'
      },
      PO_QUIMICO: {
        quantidade: agentesFiltrados.filter(a => a.tipo === 'PO_QUIMICO').reduce((sum, a) => sum + a.quantidade, 0),
        agentes: agentesFiltrados.filter(a => a.tipo === 'PO_QUIMICO').length,
        vencidos: agentesFiltrados.filter(a => a.tipo === 'PO_QUIMICO' && new Date(a.data_validade) < new Date()).length,
        unidade: 'Kg'
      },
      NITROGENIO: {
        quantidade: agentesFiltrados.filter(a => a.tipo === 'NITROGENIO').reduce((sum, a) => sum + a.quantidade, 0),
        agentes: agentesFiltrados.filter(a => a.tipo === 'NITROGENIO').length,
        vencidos: agentesFiltrados.filter(a => a.tipo === 'NITROGENIO' && new Date(a.data_validade) < new Date()).length,
        unidade: 'Cilindros'
      }
    };
    
    return {
      agentes: agentesFiltrados,
      resumoPorTipo
    };
  }

  // Processar dados de movimentações
  private processarDadosMovimentacoes(movimentacoes: Movimentacao[], filtros?: FiltroRelatorio) {
    let movimentacoesFiltradas = movimentacoes;
    
    if (filtros?.dataInicio && filtros?.dataFim) {
      const inicio = new Date(filtros.dataInicio);
      const fim = new Date(filtros.dataFim);
      movimentacoesFiltradas = movimentacoesFiltradas.filter(m => {
        const data = new Date(m.data_movimentacao);
        return data >= inicio && data <= fim;
      });
    }
    
    const resumoPorEquipe = {
      Alfa: movimentacoesFiltradas.filter(m => m.equipe_responsavel === 'Alfa').length,
      Bravo: movimentacoesFiltradas.filter(m => m.equipe_responsavel === 'Bravo').length,
      Charlie: movimentacoesFiltradas.filter(m => m.equipe_responsavel === 'Charlie').length,
      Delta: movimentacoesFiltradas.filter(m => m.equipe_responsavel === 'Delta').length
    };
    
    return {
      movimentacoes: movimentacoesFiltradas,
      resumoPorEquipe,
      totalMovimentacoes: movimentacoesFiltradas.length
    };
  }

  // Processar dados de checklists
  private processarDadosChecklists(checklists: ChecklistAgente[], filtros?: FiltroRelatorio) {
    let checklistsFiltrados = checklists;
    
    if (filtros?.dataInicio && filtros?.dataFim) {
      const inicio = new Date(filtros.dataInicio);
      const fim = new Date(filtros.dataFim);
      checklistsFiltrados = checklistsFiltrados.filter(c => {
        const data = new Date(c.data_checklist);
        return data >= inicio && data <= fim;
      });
    }
    
    const conformes = checklistsFiltrados.filter(c => 
      c.integridade_embalagem && c.validade_verificada && c.quantidade_conferida
    );
    
    const naoConformes = checklistsFiltrados.filter(c => 
      !c.integridade_embalagem || !c.validade_verificada || !c.quantidade_conferida
    );
    
    return {
      checklists: checklistsFiltrados,
      totalChecklists: checklistsFiltrados.length,
      conformes: conformes.length,
      naoConformes: naoConformes.length,
      percentualConformidade: checklistsFiltrados.length > 0 
        ? Math.round((conformes.length / checklistsFiltrados.length) * 100) 
        : 0
    };
  }

  // Criar resumo por tipos
  private criarResumoTipos(resumoPorTipo: any) {
    return Object.entries(resumoPorTipo).map(([tipo, dados]: [string, any]) => ({
      'Tipo de Agente': this.formatarTipoAgente(tipo),
      'Quantidade Total': dados.quantidade,
      'Nº de Agentes': dados.agentes,
      'Vencidos': dados.vencidos,
      'Unidade': dados.unidade
    }));
  }

  // Criar resumo mensal
  private criarResumoMensal(movimentacoes: Movimentacao[]) {
    const resumoMensal: { [key: string]: { entradas: number, saidas: number, total: number } } = {};
    
    movimentacoes.forEach(mov => {
      const data = new Date(mov.data_movimentacao);
      const chave = `${data.getMonth() + 1}/${data.getFullYear()}`;
      
      if (!resumoMensal[chave]) {
        resumoMensal[chave] = { entradas: 0, saidas: 0, total: 0 };
      }
      
      if (mov.tipo_movimentacao === 'ENTRADA') {
        resumoMensal[chave].entradas += mov.quantidade;
      } else {
        resumoMensal[chave].saidas += mov.quantidade;
      }
      resumoMensal[chave].total++;
    });
    
    return Object.entries(resumoMensal).map(([mes, dados]) => ({
      'Mês/Ano': mes,
      'Entradas': dados.entradas,
      'Saídas': dados.saidas,
      'Saldo': dados.entradas - dados.saidas,
      'Total Movimentações': dados.total
    }));
  }

  // Gerar arquivo Excel (simulado)
  private async gerarArquivoExcel(planilhas: DadosPlanilha[], tipo: string): Promise<string> {
    // Simular tempo de processamento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const nomeArquivo = `${this.config.nomeArquivo}-${tipo}-${this.formatarDataArquivo()}.xlsx`;
    
    // Em uma implementação real, aqui seria usado SheetJS, ExcelJS ou similar
    console.log('Excel gerado:', {
      nomeArquivo,
      planilhas: planilhas.map(p => ({
        nome: p.nome,
        linhas: p.dados.length,
        colunas: p.colunas.length
      }))
    });
    
    return nomeArquivo;
  }

  // Utilitários de formatação
  private formatarTipoAgente(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'LGE': 'LGE (Líquido Gerador de Espuma)',
      'PO_QUIMICO': 'Pó Químico',
      'NITROGENIO': 'Nitrogênio'
    };
    return tipos[tipo] || tipo;
  }

  private formatarData(dataISO: string): string {
    return new Date(dataISO).toLocaleDateString('pt-BR');
  }

  private formatarDataArquivo(): string {
    return new Date().toISOString().split('T')[0];
  }

  private obterStatusValidade(dataValidade: string): string {
    const hoje = new Date();
    const validade = new Date(dataValidade);
    const diasRestantes = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diasRestantes < 0) return 'Vencido';
    if (diasRestantes <= 30) return 'Próximo ao Vencimento';
    if (diasRestantes <= 90) return 'Atenção';
    return 'Válido';
  }

  private obterStatusChecklist(checklist: ChecklistAgente): string {
    const conforme = checklist.integridade_embalagem && 
                    checklist.validade_verificada && 
                    checklist.quantidade_conferida;
    return conforme ? 'Conforme' : 'Não Conforme';
  }
}

// Instância padrão do exportador
export const excelExporter = new ExcelExporter();

// Função utilitária para exportar dados rapidamente
export const exportarExcel = {
  estoque: (agentes: AgenteExtintor[], filtros?: FiltroRelatorio) => 
    excelExporter.exportarEstoque(agentes, filtros),
    
  movimentacoes: (movimentacoes: Movimentacao[], filtros?: FiltroRelatorio) => 
    excelExporter.exportarMovimentacoes(movimentacoes, filtros),
    
  checklists: (checklists: ChecklistAgente[], filtros?: FiltroRelatorio) => 
    excelExporter.exportarChecklists(checklists, filtros),
    
  consolidado: (
    agentes: AgenteExtintor[], 
    movimentacoes: Movimentacao[], 
    checklists: ChecklistAgente[],
    filtros?: FiltroRelatorio
  ) => excelExporter.exportarConsolidado(agentes, movimentacoes, checklists, filtros)
};

export default ExcelExporter;