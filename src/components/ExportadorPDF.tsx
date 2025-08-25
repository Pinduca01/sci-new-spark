
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportadorPDFProps {
  dados: any;
  periodo: string;
}

export const ExportadorPDF: React.FC<ExportadorPDFProps> = ({ dados, periodo }) => {
  const [exportando, setExportando] = useState(false);
  const { toast } = useToast();

  const gerarPDF = async () => {
    setExportando(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Cabeçalho
      pdf.setFontSize(20);
      pdf.text('Relatório Operacional - SCI Core', 20, 30);
      
      pdf.setFontSize(14);
      pdf.text(`Período: ${periodo}`, 20, 45);
      pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 55);
      
      // Linha separadora
      pdf.setLineWidth(0.5);
      pdf.line(20, 65, 190, 65);

      let yPosition = 80;

      // Seção: Ocorrências
      pdf.setFontSize(16);
      pdf.text('1. OCORRÊNCIAS', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.text(`Total de Ocorrências: ${dados.ocorrencias?.total_ocorrencias || 0}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Aeronáuticas: ${dados.ocorrencias?.ocorrencias_aeronauticas || 0}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Não Aeronáuticas: ${dados.ocorrencias?.ocorrencias_nao_aeronauticas || 0}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Tempo Médio de Resposta: ${dados.ocorrencias?.tempo_medio_resposta || 0} min`, 25, yPosition);
      yPosition += 15;

      // Seção: TAF
      pdf.setFontSize(16);
      pdf.text('2. TESTE DE APTIDÃO FÍSICA (TAF)', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.text(`Taxa de Aprovação: ${dados.taf?.taxa_aprovacao?.toFixed(1) || 0}%`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Total de Avaliações: ${dados.taf?.total_avaliacoes || 0}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Bombeiros Pendentes: ${dados.taf?.bombeiros_pendentes || 0}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Média Flexões: ${dados.taf?.media_flexoes?.toFixed(1) || 0}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Média Abdominais: ${dados.taf?.media_abdominais?.toFixed(1) || 0}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Média Polichinelos: ${dados.taf?.media_polichinelos?.toFixed(1) || 0}`, 25, yPosition);
      yPosition += 15;

      // Seção: PTR-BA
      pdf.setFontSize(16);
      pdf.text('3. PTR-BA (TREINAMENTO)', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.text(`Horas de Treinamento: ${dados.ptr?.total_horas_treinamento || 0}h`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Instruções Realizadas: ${dados.ptr?.instrucoes_realizadas || 0}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Bombeiros Treinados: ${dados.ptr?.bombeiros_treinados || 0}`, 25, yPosition);
      yPosition += 15;

      // Seção: Viaturas
      pdf.setFontSize(16);
      pdf.text('4. VIATURAS', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.text(`Total de Viaturas: ${dados.viaturas?.total_viaturas || 0}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Operacionais: ${dados.viaturas?.viaturas_operacionais || 0}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Checklists Realizados: ${dados.viaturas?.checklists_realizados || 0}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Não Conformidades: ${dados.viaturas?.nao_conformidades || 0}`, 25, yPosition);
      yPosition += 15;

      // Nova página se necessário
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 30;
      }

      // Seção: Agentes Extintores
      pdf.setFontSize(16);
      pdf.text('5. AGENTES EXTINTORES', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.text(`Total LGE: ${dados.agentes_extintores?.total_lge || 0}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Total PQS: ${dados.agentes_extintores?.total_pqs || 0}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Disponível para Uso: ${dados.agentes_extintores?.disponivel_uso || 0}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Vencimento Próximo: ${dados.agentes_extintores?.vencimento_proximo || 0}`, 25, yPosition);
      yPosition += 15;

      // Seção: TP e Uniformes
      pdf.setFontSize(16);
      pdf.text('6. TP E UNIFORMES/EPI', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.text(`Verificações Realizadas: ${dados.tp_uniformes?.verificacoes_mes || 0}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Conformidade: ${dados.tp_uniformes?.conformidade_percentual || 0}%`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Higienizações: ${dados.tp_uniformes?.higienizacoes_realizadas || 0}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`EPIs Distribuídos: ${dados.tp_uniformes?.epis_distribuidos || 0}`, 25, yPosition);
      yPosition += 15;

      // Seção: Trocas de Plantão
      const totalTrocas = dados.trocas?.reduce((acc: number, t: any) => acc + t.total_trocas, 0) || 0;
      pdf.setFontSize(16);
      pdf.text('7. TROCAS DE PLANTÃO', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.text(`Total de Trocas: ${totalTrocas}`, 25, yPosition);
      yPosition += 6;
      
      if (dados.trocas && dados.trocas.length > 0) {
        dados.trocas.forEach((equipe: any) => {
          pdf.text(`${equipe.equipe_nome}: ${equipe.total_trocas} trocas`, 30, yPosition);
          yPosition += 4;
        });
      }

      // Rodapé
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.text(`Página ${i} de ${pageCount}`, 170, 280);
        pdf.text('SCI-Core - Sistema de Gestão Contraincêndio', 20, 280);
      }

      // Salvar PDF
      pdf.save(`relatorio-operacional-${periodo.toLowerCase().replace(' ', '-')}.pdf`);
      
      toast({
        title: "Sucesso",
        description: "Relatório PDF gerado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar o relatório PDF.",
        variant: "destructive",
      });
    } finally {
      setExportando(false);
    }
  };

  return (
    <Button
      onClick={gerarPDF}
      disabled={exportando}
      variant="outline"
      className="flex items-center gap-2"
    >
      {exportando ? (
        <>
          <FileText className="h-4 w-4 animate-pulse" />
          Gerando...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Exportar PDF
        </>
      )}
    </Button>
  );
};
