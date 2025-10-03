import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ChecklistDetalhado } from '@/hooks/useChecklistsHistorico';

// Extend jsPDF interface
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
  lastAutoTable: { finalY: number };
}

// Gerar PDF de checklist individual (sem fotos)
export const generateChecklistPDF = (checklist: ChecklistDetalhado) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.width;
  let yPos = 20;

  // Cabeçalho
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SCI-CORE - Relatório de Checklist', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;

  // Informações gerais
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Informações Gerais', 14, yPos);
  
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const info = [
    ['Tipo:', checklist.tipo_detalhe],
    ['Data:', new Date(checklist.data).toLocaleDateString('pt-BR')],
    ['Hora:', checklist.hora],
    ['Responsável:', checklist.responsavel],
    ['Equipe:', checklist.equipe || 'N/A'],
    ['Status:', checklist.status === 'conforme' ? 'CONFORME' : checklist.status === 'nao_conforme' ? 'NÃO CONFORME' : 'EM ANDAMENTO'],
  ];

  if (checklist.viatura_placa) {
    info.push(['Viatura:', checklist.viatura_placa]);
  }

  info.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 50, yPos);
    yPos += 6;
  });

  yPos += 5;

  // Estatísticas
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Estatísticas', 14, yPos);
  
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const stats = [
    ['Total de Itens:', `${checklist.total_itens}`],
    ['Conformes:', `${checklist.itens_conformes} (${checklist.total_itens > 0 ? Math.round((checklist.itens_conformes / checklist.total_itens) * 100) : 0}%)`],
    ['Não Conformes:', `${checklist.itens_nao_conformes} (${checklist.total_itens > 0 ? Math.round((checklist.itens_nao_conformes / checklist.total_itens) * 100) : 0}%)`],
  ];

  stats.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 50, yPos);
    yPos += 6;
  });

  yPos += 10;

  // Tabela de itens
  const tableData = checklist.itens.map(item => [
    item.nome || 'N/A',
    item.status === 'conforme' ? '✓ Conforme' : 
    item.status === 'nao_conforme' ? '✗ Não Conforme' :
    item.status === 'nao_existente_nao_aplicavel' ? 'N/A' : item.status,
    item.justificativa || '-'
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['Item', 'Status', 'Justificativa']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 40 },
      2: { cellWidth: 60 }
    }
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // Observações
  if (checklist.observacoes) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Observações Gerais', 14, yPos);
    
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitText = doc.splitTextToSize(checklist.observacoes, pageWidth - 28);
    doc.text(splitText, 14, yPos);
  }

  // Rodapé
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(
      `Página ${i} de ${pageCount} - SCI-CORE`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Salvar
  const fileName = `checklist_${checklist.tipo_detalhe}_${new Date(checklist.data).toLocaleDateString('pt-BR').replace(/\//g, '-')}_${checklist.responsavel.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
};

// Gerar PDF mensal consolidado por viatura
export const generateChecklistMensalViaturaPDF = (
  viaturaPlaca: string,
  mes: number,
  ano: number,
  checklists: ChecklistDetalhado[]
) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.width;
  let yPos = 20;

  const mesNome = new Date(ano, mes - 1).toLocaleString('pt-BR', { month: 'long' });

  // Cabeçalho
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SCI-CORE - Relatório Mensal de Checklists', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(12);
  doc.text(`Viatura: ${viaturaPlaca}`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 7;
  doc.text(`Período: ${mesNome} de ${ano}`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;

  // Estatísticas gerais
  const totalChecklists = checklists.length;
  const totalItensVerificados = checklists.reduce((sum, c) => sum + c.total_itens, 0);
  const totalConformes = checklists.reduce((sum, c) => sum + c.itens_conformes, 0);
  const totalNaoConformes = checklists.reduce((sum, c) => sum + c.itens_nao_conformes, 0);
  const taxaConformidade = totalItensVerificados > 0 ? Math.round((totalConformes / totalItensVerificados) * 100) : 0;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Estatísticas do Mês', 14, yPos);
  
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const stats = [
    ['Total de Checklists:', `${totalChecklists}`],
    ['Itens Verificados:', `${totalItensVerificados}`],
    ['Conformes:', `${totalConformes} (${taxaConformidade}%)`],
    ['Não Conformes:', `${totalNaoConformes} (${100 - taxaConformidade}%)`],
  ];

  stats.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 60, yPos);
    yPos += 6;
  });

  yPos += 10;

  // Tabela de checklists
  const tableData = checklists.map(c => [
    new Date(c.data).toLocaleDateString('pt-BR'),
    c.hora,
    c.tipo_detalhe,
    c.responsavel,
    c.equipe || 'N/A',
    `${c.itens_conformes}/${c.total_itens}`,
    c.status === 'conforme' ? '✓' : c.status === 'nao_conforme' ? '✗' : '⋯'
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['Data', 'Hora', 'Tipo', 'Responsável', 'Equipe', 'Conformes', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 18 },
      2: { cellWidth: 25 },
      3: { cellWidth: 35 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
      6: { cellWidth: 20 }
    }
  });

  // Rodapé
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(
      `Página ${i} de ${pageCount} - SCI-CORE`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Salvar
  const fileName = `relatorio_mensal_${viaturaPlaca.replace(/\s+/g, '_')}_${mesNome}_${ano}.pdf`;
  doc.save(fileName);
};
