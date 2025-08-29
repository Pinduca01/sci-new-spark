
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useEstoqueAlmoxarifado } from '@/hooks/useEstoqueAlmoxarifado';
import { useMateriais } from '@/hooks/useMateriais';
import { useMovimentacoes } from '@/hooks/useMovimentacoes';
import { useAgentesExtintores } from '@/hooks/useAgentesExtintores';
import { useChecklistsAlmoxarifado } from '@/hooks/useChecklistsAlmoxarifado';
import jsPDF from 'jspdf';

type PeriodoTipo = 'ultimo_mes' | 'ultimo_trimestre' | 'ultimo_semestre' | 'ultimo_ano';

export const RelatorioEquipamentosGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [periodo, setPeriodo] = useState<PeriodoTipo>('ultimo_mes');
  const { toast } = useToast();

  const { estoque, alertas } = useEstoqueAlmoxarifado();
  const { materiais } = useMateriais();
  const { movimentacoes } = useMovimentacoes();
  const { agentes, alertas: alertasAgentes } = useAgentesExtintores();
  const { checklists } = useChecklistsAlmoxarifado();

  const getPeriodoTexto = (periodo: PeriodoTipo): string => {
    switch (periodo) {
      case 'ultimo_mes': return 'Último Mês';
      case 'ultimo_trimestre': return 'Último Trimestre';
      case 'ultimo_semestre': return 'Último Semestre';
      case 'ultimo_ano': return 'Último Ano';
      default: return 'Último Mês';
    }
  };

  const getPeriodoData = (periodo: PeriodoTipo): Date => {
    const hoje = new Date();
    switch (periodo) {
      case 'ultimo_mes':
        return new Date(hoje.getFullYear(), hoje.getMonth() - 1, hoje.getDate());
      case 'ultimo_trimestre':
        return new Date(hoje.getFullYear(), hoje.getMonth() - 3, hoje.getDate());
      case 'ultimo_semestre':
        return new Date(hoje.getFullYear(), hoje.getMonth() - 6, hoje.getDate());
      case 'ultimo_ano':
        return new Date(hoje.getFullYear() - 1, hoje.getMonth(), hoje.getDate());
      default:
        return new Date(hoje.getFullYear(), hoje.getMonth() - 1, hoje.getDate());
    }
  };

  const gerarRelatorioPDF = async () => {
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const dataInicio = getPeriodoData(periodo);
      const dataHoje = new Date();
      
      // Cabeçalho
      pdf.setFontSize(20);
      pdf.text('RELATÓRIO DE EQUIPAMENTOS', 20, 30);
      
      pdf.setFontSize(14);
      pdf.text('Sistema de Gestão - SCI Core', 20, 40);
      
      pdf.setFontSize(12);
      pdf.text(`Período: ${getPeriodoTexto(periodo)}`, 20, 50);
      pdf.text(`Gerado em: ${dataHoje.toLocaleDateString('pt-BR')} às ${dataHoje.toLocaleTimeString('pt-BR')}`, 20, 58);
      
      // Linha separadora
      pdf.setLineWidth(0.5);
      pdf.line(20, 65, 190, 65);

      let yPosition = 75;

      // 1. RESUMO EXECUTIVO
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('1. RESUMO EXECUTIVO', 20, yPosition);
      yPosition += 10;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      
      const totalItensEstoque = estoque.reduce((acc, item) => acc + item.quantidade_disponivel, 0);
      const totalCategorias = [...new Set(materiais.map(m => m.categoria))].length;
      const movimentacoesPeriodo = movimentacoes.filter(m => 
        new Date(m.data_movimentacao) >= dataInicio
      );
      const totalAgentes = agentes.length;
      const agentesDisponiveis = agentes.filter(a => a.status_uso === 'disponivel').length;
      
      pdf.text(`• Total de itens em estoque: ${Math.round(totalItensEstoque)} unidades`, 25, yPosition);
      yPosition += 6;
      pdf.text(`• Categorias de materiais: ${totalCategorias}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`• Movimentações no período: ${movimentacoesPeriodo.length}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`• Agentes extintores: ${agentesDisponiveis}/${totalAgentes} disponíveis`, 25, yPosition);
      yPosition += 6;
      pdf.text(`• Alertas críticos: ${alertas.vencidos.length + alertas.estoqueBaixo.length}`, 25, yPosition);
      yPosition += 15;

      // 2. ESTOQUE DO ALMOXARIFADO
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('2. ESTOQUE DO ALMOXARIFADO', 20, yPosition);
      yPosition += 10;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.text(`Total de tipos de materiais: ${estoque.length}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Quantidade total disponível: ${Math.round(totalItensEstoque)} unidades`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Materiais com estoque baixo: ${alertas.estoqueBaixo.length}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Materiais próximos ao vencimento: ${alertas.vencimentoProximo.length}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Materiais vencidos: ${alertas.vencidos.length}`, 25, yPosition);
      yPosition += 15;

      // 3. AGENTES EXTINTORES
      if (yPosition > 220) {
        pdf.addPage();
        yPosition = 30;
      }
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('3. AGENTES EXTINTORES', 20, yPosition);
      yPosition += 10;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      
      const agentesLGE = agentes.filter(a => a.tipo_agente === 'LGE');
      const agentesPQS = agentes.filter(a => a.tipo_agente === 'PQS');
      const agentesVencimentoProximo = alertasAgentes.filter(a => a.nivel_alerta === 'alto').length;
      const agentesVencidos = alertasAgentes.filter(a => a.nivel_alerta === 'critico').length;
      
      pdf.text(`Total de agentes LGE: ${agentesLGE.length}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Total de agentes PQS: ${agentesPQS.length}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Agentes disponíveis para uso: ${agentesDisponiveis}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Agentes com vencimento próximo: ${agentesVencimentoProximo}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Agentes vencidos: ${agentesVencidos}`, 25, yPosition);
      yPosition += 15;

      // 4. MOVIMENTAÇÕES DO PERÍODO
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('4. MOVIMENTAÇÕES DO PERÍODO', 20, yPosition);
      yPosition += 10;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      
      const entradas = movimentacoesPeriodo.filter(m => m.tipo_movimentacao === 'entrada');
      const saidas = movimentacoesPeriodo.filter(m => m.tipo_movimentacao === 'saida');
      const quantidadeEntradas = entradas.reduce((acc, m) => acc + m.quantidade, 0);
      const quantidadeSaidas = saidas.reduce((acc, m) => acc + m.quantidade, 0);
      
      pdf.text(`Total de movimentações: ${movimentacoesPeriodo.length}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Entradas: ${entradas.length} movimentos (${Math.round(quantidadeEntradas)} unidades)`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Saídas: ${saidas.length} movimentos (${Math.round(quantidadeSaidas)} unidades)`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Saldo líquido: ${Math.round(quantidadeEntradas - quantidadeSaidas)} unidades`, 25, yPosition);
      yPosition += 15;

      // 5. CHECKLISTS E CONFORMIDADE
      if (yPosition > 220) {
        pdf.addPage();
        yPosition = 30;
      }
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('5. CHECKLISTS E CONFORMIDADE', 20, yPosition);
      yPosition += 10;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      
      const checklistsPeriodo = checklists.filter(c => 
        new Date(c.data_checklist) >= dataInicio
      );
      const checklistsConcluidos = checklistsPeriodo.filter(c => 
        c.itens && c.itens.length > 0 && c.itens.every(item => item.status && item.status !== '')
      );
      const totalItensVerificados = checklistsPeriodo.reduce((acc, c) => acc + (c.total_itens || 0), 0);
      const totalItensConformes = checklistsPeriodo.reduce((acc, c) => acc + (c.itens_conformes || 0), 0);
      const taxaConformidade = totalItensVerificados > 0 ? (totalItensConformes / totalItensVerificados * 100).toFixed(1) : '0';
      
      pdf.text(`Checklists realizados no período: ${checklistsPeriodo.length}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Checklists concluídos: ${checklistsConcluidos.length}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Taxa de conformidade: ${taxaConformidade}%`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Total de itens verificados: ${totalItensVerificados}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Itens não conformes: ${totalItensVerificados - totalItensConformes}`, 25, yPosition);
      yPosition += 15;

      // 6. MATERIAIS POR CATEGORIA
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('6. MATERIAIS POR CATEGORIA', 20, yPosition);
      yPosition += 10;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      
      const categorias = [...new Set(materiais.map(m => m.categoria))];
      categorias.forEach(categoria => {
        const materiaisCategoria = materiais.filter(m => m.categoria === categoria);
        pdf.text(`• ${categoria}: ${materiaisCategoria.length} tipos`, 25, yPosition);
        yPosition += 6;
      });

      yPosition += 10;

      // Rodapé
      if (yPosition > 240) {
        pdf.addPage();
        yPosition = 30;
      }
      
      pdf.setFontSize(10);
      pdf.text('_'.repeat(85), 20, yPosition);
      yPosition += 8;
      pdf.text('Relatório gerado automaticamente pelo Sistema SCI Core', 20, yPosition);
      yPosition += 5;
      pdf.text(`Data/Hora: ${dataHoje.toLocaleString('pt-BR')}`, 20, yPosition);
      yPosition += 5;
      pdf.text('Responsável pela geração: Sistema Automatizado', 20, yPosition);

      // Salvar PDF
      const nomeArquivo = `relatorio-equipamentos-${periodo}-${dataHoje.toISOString().split('T')[0]}.pdf`;
      pdf.save(nomeArquivo);
      
      toast({
        title: "Sucesso",
        description: "Relatório de equipamentos gerado com sucesso!",
      });
      
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar o relatório de equipamentos.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Select value={periodo} onValueChange={(value: PeriodoTipo) => setPeriodo(value)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ultimo_mes">Último Mês</SelectItem>
          <SelectItem value="ultimo_trimestre">Último Trimestre</SelectItem>
          <SelectItem value="ultimo_semestre">Último Semestre</SelectItem>
          <SelectItem value="ultimo_ano">Último Ano</SelectItem>
        </SelectContent>
      </Select>
      
      <Button
        onClick={gerarRelatorioPDF}
        disabled={isGenerating}
        variant="outline"
        className="flex items-center gap-2"
      >
        {isGenerating ? (
          <>
            <FileText className="h-4 w-4 animate-pulse" />
            Gerando...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Gerar Relatório
          </>
        )}
      </Button>
    </div>
  );
};
