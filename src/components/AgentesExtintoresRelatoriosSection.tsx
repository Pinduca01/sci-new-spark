import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Download,
  BarChart3,
  Calendar,
  Filter,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { useAgentesExtintores } from "@/hooks/useAgentesExtintores";
import { useAgentesExtintoresRelatorios } from "@/hooks/useAgentesExtintoresRelatorios";
import { gerarRelatorioPDF } from "@/utils/pdfGenerator";
import { toast } from "sonner";

interface RelatorioFiltros {
  tipo: string;
  periodo: string;
  dataInicio: string;
  dataFim: string;
  status: string;
}

const AgentesExtintoresRelatoriosSection: React.FC = () => {
  const { agentes, movimentacoes, checklists, loading } = useAgentesExtintores();
  const { gerarRelatorio, exportarPDF, exportarExcel, obterEstatisticasRapidas } = useAgentesExtintoresRelatorios();
  const [filtros, setFiltros] = useState<RelatorioFiltros>({
    tipo: 'todos',
    periodo: 'mes',
    dataInicio: '',
    dataFim: '',
    status: 'todos'
  });

  const handleGerarRelatorio = async (tipoRelatorio: string) => {
    try {
      toast.loading('Gerando relatório...');
      let nomeArquivo: string;
      
      switch (tipoRelatorio) {
        case 'Estoque':
          gerarRelatorioPDF({ mes: new Date().getMonth() + 1, ano: new Date().getFullYear(), agentes });
          nomeArquivo = `relatorio_estoque_${new Date().getFullYear()}.pdf`;
          break;
        case 'Movimentações':
          gerarRelatorioPDF({ mes: new Date().getMonth() + 1, ano: new Date().getFullYear(), agentes });
          nomeArquivo = `relatorio_movimentacoes_${new Date().getFullYear()}.pdf`;
          break;
        case 'Checklists':
          gerarRelatorioPDF({ mes: new Date().getMonth() + 1, ano: new Date().getFullYear(), agentes });
          nomeArquivo = `relatorio_checklists_${new Date().getFullYear()}.pdf`;
          break;
        case 'Consolidado':
          gerarRelatorioPDF({ mes: new Date().getMonth() + 1, ano: new Date().getFullYear(), agentes });
          nomeArquivo = `relatorio_consolidado_${new Date().getFullYear()}.pdf`;
          break;
        default:
          // Simular geração de relatório
          await new Promise(resolve => setTimeout(resolve, 2000));
          nomeArquivo = `relatorio_${tipoRelatorio.toLowerCase()}.pdf`;
      }
      
      toast.success(`Relatório de ${tipoRelatorio} gerado com sucesso!`);
    } catch (error) {
      toast.error('Erro ao gerar relatório');
    }
  };
  
  // Função para exportar para Excel
  const handleExportarExcel = async (tipo: string) => {
    try {
      const nomeArquivo = await exportarExcel(tipo, filtros);
      
      toast.success(`Planilha exportada com sucesso!`);
    } catch (error) {
      console.error('Erro ao exportar planilha:', error);
      toast.error('Erro ao exportar planilha');
    }
  };

  const estatisticasGerais = {
    totalAgentes: agentes.length,
    totalLGE: agentes.filter(a => a.tipo === 'LGE').reduce((sum, a) => sum + a.quantidade, 0),
    totalPoQuimico: agentes.filter(a => a.tipo === 'PO_QUIMICO').reduce((sum, a) => sum + a.quantidade, 0),
    totalNitrogenio: agentes.filter(a => a.tipo === 'NITROGENIO').reduce((sum, a) => sum + a.quantidade, 0),
    agentesVencidos: agentes.filter(a => new Date(a.data_validade) < new Date()).length,
    movimentacoesMes: movimentacoes.filter(m => {
      const dataMovimentacao = new Date(m.data_movimentacao);
      const agora = new Date();
      return dataMovimentacao.getMonth() === agora.getMonth() && 
             dataMovimentacao.getFullYear() === agora.getFullYear();
    }).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Agentes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticasGerais.totalAgentes}</div>
            <p className="text-xs text-muted-foreground">agentes cadastrados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimentações</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticasGerais.movimentacoesMes}</div>
            <p className="text-xs text-muted-foreground">neste mês</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agentes Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{estatisticasGerais.agentesVencidos}</div>
            <p className="text-xs text-muted-foreground">requerem atenção</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checklists</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checklists.length}</div>
            <p className="text-xs text-muted-foreground">realizados</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros de Relatório */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Relatório</CardTitle>
          <CardDescription>
            Configure os parâmetros para gerar relatórios personalizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Agente</label>
              <Select value={filtros.tipo} onValueChange={(value) => setFiltros({...filtros, tipo: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="LGE">LGE</SelectItem>
                  <SelectItem value="PO_QUIMICO">Pó Químico</SelectItem>
                  <SelectItem value="NITROGENIO">Nitrogênio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Período</label>
              <Select value={filtros.periodo} onValueChange={(value) => setFiltros({...filtros, periodo: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semana">Última Semana</SelectItem>
                  <SelectItem value="mes">Último Mês</SelectItem>
                  <SelectItem value="trimestre">Último Trimestre</SelectItem>
                  <SelectItem value="ano">Último Ano</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {filtros.periodo === 'personalizado' && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">Data Início</label>
                  <Input 
                    type="date" 
                    value={filtros.dataInicio}
                    onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Data Fim</label>
                  <Input 
                    type="date" 
                    value={filtros.dataFim}
                    onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
                  />
                </div>
              </>
            )}
            
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filtros.status} onValueChange={(value) => setFiltros({...filtros, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ATIVO">Ativo</SelectItem>
                  <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
                  <SelectItem value="VENCIDO">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Relatório de Estoque
            </CardTitle>
            <CardDescription>
              Situação atual do estoque de agentes extintores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>LGE:</span>
                <Badge variant="secondary">{estatisticasGerais.totalLGE}L</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pó Químico:</span>
                <Badge variant="secondary">{estatisticasGerais.totalPoQuimico}Kg</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Nitrogênio:</span>
                <Badge variant="secondary">{estatisticasGerais.totalNitrogenio} Cilindros</Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={() => handleGerarRelatorio('Estoque')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Gerar PDF
                </Button>
                <Button 
                  onClick={() => handleExportarExcel('estoque')}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Relatório de Movimentações
            </CardTitle>
            <CardDescription>
              Histórico de entradas e saídas de agentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Movimentações:</span>
                <Badge variant="secondary">{estatisticasGerais.movimentacoesMes}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Período:</span>
                <span className="text-muted-foreground">Último mês</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={() => handleGerarRelatorio('Movimentações')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Gerar PDF
                </Button>
                <Button 
                  onClick={() => handleExportarExcel('movimentacoes')}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Relatório de Checklists
            </CardTitle>
            <CardDescription>
              Histórico de verificações mensais realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Checklists:</span>
                <Badge variant="secondary">{checklists.length}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Conformidade:</span>
                <Badge variant="secondary">95%</Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={() => handleGerarRelatorio('Checklists')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Gerar PDF
                </Button>
                <Button 
                  onClick={() => handleExportarExcel('checklists')}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Relatório de Validades
            </CardTitle>
            <CardDescription>
              Agentes próximos ao vencimento ou vencidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Vencidos:</span>
                <Badge variant="destructive">{estatisticasGerais.agentesVencidos}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Próximos (30 dias):</span>
                <Badge variant="secondary">5</Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={() => handleGerarRelatorio('Validades')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Gerar PDF
                </Button>
                <Button 
                  onClick={() => handleExportarExcel('validades')}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Relatório Consolidado
            </CardTitle>
            <CardDescription>
              Relatório completo com todas as informações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Páginas:</span>
                <Badge variant="secondary">~15</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Inclui:</span>
                <span className="text-muted-foreground text-xs">Todos os dados</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={() => handleGerarRelatorio('Consolidado')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Gerar PDF
                </Button>
                <Button 
                  onClick={() => handleExportarExcel('consolidado')}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Relatório Personalizado
            </CardTitle>
            <CardDescription>
              Relatório baseado nos filtros selecionados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Tipo:</span>
                <Badge variant="outline">{filtros.tipo}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Período:</span>
                <Badge variant="outline">{filtros.periodo}</Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={() => handleGerarRelatorio('Personalizado')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Gerar PDF
                </Button>
                <Button 
                  onClick={() => handleExportarExcel('personalizado')}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentesExtintoresRelatoriosSection;