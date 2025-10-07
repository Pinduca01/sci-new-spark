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

// ============= FORMATO OFICIAL - PDF MENSAL LANDSCAPE =============

interface ItemDiarioStatus {
  dia: number;
  status: 'C' | 'NC' | 'NA' | '-'; // C=Conforme, NC=Não Conforme, NA=Não Aplicável, -=Sem checklist
}

interface ItemMensal {
  nome: string;
  diasStatus: ItemDiarioStatus[];
}

// Fase 1: Transformar dados para formato mensal
export const transformarDadosParaFormatoMensal = (
  checklists: ChecklistDetalhado[],
  mes: number,
  ano: number
): ItemMensal[] => {
  const diasNoMes = new Date(ano, mes, 0).getDate();
  
  // Agrupar checklists por dia
  const checklistsPorDia: { [dia: number]: ChecklistDetalhado[] } = {};
  
  checklists.forEach(checklist => {
    const dia = new Date(checklist.data).getDate();
    if (!checklistsPorDia[dia]) {
      checklistsPorDia[dia] = [];
    }
    checklistsPorDia[dia].push(checklist);
  });

  // Extrair todos os itens únicos
  const itensUnicos = new Map<string, ItemMensal>();

  checklists.forEach(checklist => {
    checklist.itens.forEach(item => {
      if (!itensUnicos.has(item.nome)) {
        itensUnicos.set(item.nome, {
          nome: item.nome,
          diasStatus: Array.from({ length: diasNoMes }, (_, i) => ({
            dia: i + 1,
            status: '-'
          }))
        });
      }
    });
  });

  // Preencher status de cada item por dia
  itensUnicos.forEach((itemMensal) => {
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const checklistsDoDia = checklistsPorDia[dia] || [];
      
      if (checklistsDoDia.length === 0) {
        itemMensal.diasStatus[dia - 1].status = '-';
        continue;
      }

      // Se houver múltiplos checklists no dia, pegar o pior status
      let piorStatus: 'C' | 'NC' | 'NA' = 'C';
      let itemEncontrado = false;

      checklistsDoDia.forEach(checklist => {
        const item = checklist.itens.find(i => i.nome === itemMensal.nome);
        if (item) {
          itemEncontrado = true;
          const status = item.status === 'conforme' ? 'C' : 
                        item.status === 'nao_conforme' ? 'NC' : 'NA';
          
          // Hierarquia: NC > NA > C
          if (status === 'NC') piorStatus = 'NC';
          else if (status === 'NA' && piorStatus !== 'NC') piorStatus = 'NA';
        }
      });

      itemMensal.diasStatus[dia - 1].status = itemEncontrado ? piorStatus : '-';
    }
  });

  return Array.from(itensUnicos.values());
};

// Fase 2: Gerar PDF no formato oficial (landscape) - MELHORADO
export const generateChecklistMensalFormatoOficialPDF = (
  viaturaPlaca: string,
  mes: number,
  ano: number,
  checklists: ChecklistDetalhado[],
  tipoFiltro?: string // 'CCI', 'EQUIPAMENTOS', 'CRS', undefined = todos
) => {
  // Landscape orientation
  const doc = new jsPDF({ orientation: 'landscape' }) as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  const diasNoMes = new Date(ano, mes, 0).getDate();
  const mesNome = new Date(ano, mes - 1).toLocaleString('pt-BR', { month: 'long' }).toUpperCase();

  // Filtrar por tipo se especificado
  let checklistsFiltrados = checklists;
  let codigoDocumento = 'MMS.BR.BA.FOR.014';
  let tituloDocumento = 'CHECKLIST GERAL';

  if (tipoFiltro) {
    if (tipoFiltro === 'CCI') {
      checklistsFiltrados = checklists.filter(c => 
        c.tipo_detalhe?.toUpperCase().includes('CCI') || 
        c.tipo_detalhe?.toUpperCase().includes('INSPEÇÃO')
      );
      codigoDocumento = 'MMS.BR.BA.FOR.007';
      tituloDocumento = 'CHECKLIST DE INSPEÇÃO DE CCIs';
    } else if (tipoFiltro === 'EQUIPAMENTOS') {
      checklistsFiltrados = checklists.filter(c => 
        c.tipo_detalhe?.toUpperCase().includes('EQUIPAMENTO')
      );
      codigoDocumento = 'MMS.BR.BA.FOR.012';
      tituloDocumento = 'CHECKLIST DE EQUIPAMENTOS';
    } else if (tipoFiltro === 'CRS') {
      checklistsFiltrados = checklists.filter(c => 
        c.tipo_detalhe?.toUpperCase().includes('CRS')
      );
      codigoDocumento = 'MMS.BR.BA.FOR.014';
      tituloDocumento = 'FORMULÁRIO DE INSPEÇÃO DE CRS';
    }
  }

  if (checklistsFiltrados.length === 0) {
    throw new Error(`Nenhum checklist do tipo "${tipoFiltro}" encontrado para o período selecionado`);
  }

  // Transformar dados
  const itensMensais = transformarDadosParaFormatoMensal(checklistsFiltrados, mes, ano);

  // Calcular estatísticas
  const totalDiasComChecklist = itensMensais[0]?.diasStatus.filter(d => d.status !== '-').length || 0;
  const totalNC = itensMensais.reduce((sum, item) => 
    sum + item.diasStatus.filter(d => d.status === 'NC').length, 0
  );

  let yPos = 12;

  // Cabeçalho oficial melhorado
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 51, 102); // Azul escuro
  doc.text('MMS BRASIL SERVIÇOS DE AVIAÇÃO LTDA', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 6;
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(tituloDocumento, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 8;
  
  // Linha de separação
  doc.setDrawColor(0, 51, 102);
  doc.setLineWidth(0.5);
  doc.line(15, yPos, pageWidth - 15, yPos);
  
  yPos += 5;
  
  // Informações do documento
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`CÓDIGO: ${codigoDocumento}`, 15, yPos);
  doc.text(`VIATURA: ${viaturaPlaca}`, pageWidth / 2, yPos, { align: 'center' });
  doc.text(`PERÍODO: ${mesNome}/${ano}`, pageWidth - 15, yPos, { align: 'right' });

  yPos += 4;
  doc.setFontSize(7);
  doc.setTextColor(100);
  doc.text(`Total de dias com checklist: ${totalDiasComChecklist} | Não conformidades: ${totalNC}`, pageWidth / 2, yPos, { align: 'center' });
  doc.setTextColor(0);
  
  yPos += 6;

  // Preparar dados da tabela
  const headerRow = ['ITEM', ...Array.from({ length: diasNoMes }, (_, i) => String(i + 1).padStart(2, '0'))];
  
  const bodyRows = itensMensais.map(item => [
    item.nome,
    ...item.diasStatus.map(d => d.status)
  ]);

  // Configuração de cores por status - PROFISSIONAL
  const getStatusColor = (status: string): [number, number, number] => {
    if (status === 'C') return [200, 255, 200]; // Verde mais suave
    if (status === 'NC') return [255, 200, 200]; // Vermelho mais suave
    if (status === 'NA') return [240, 240, 240]; // Cinza bem claro
    return [255, 255, 255]; // Branco (sem checklist)
  };

  const getStatusTextColor = (status: string): [number, number, number] => {
    if (status === 'C') return [0, 100, 0]; // Verde escuro
    if (status === 'NC') return [139, 0, 0]; // Vermelho escuro
    if (status === 'NA') return [100, 100, 100]; // Cinza escuro
    return [150, 150, 150]; // Cinza claro
  };

  // Gerar tabela com cores profissionais
  doc.autoTable({
    startY: yPos,
    head: [headerRow],
    body: bodyRows,
    theme: 'grid',
    styles: { 
      fontSize: 6,
      cellPadding: 1.5,
      overflow: 'linebreak',
      halign: 'center',
      valign: 'middle',
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    },
    headStyles: { 
      fillColor: [0, 51, 102], // Azul escuro profissional
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 6,
      halign: 'center',
      cellPadding: 2
    },
    columnStyles: {
      0: { 
        cellWidth: 45, 
        halign: 'left', 
        fontStyle: 'bold',
        fontSize: 6.5,
        fillColor: [245, 245, 245]
      },
      ...Object.fromEntries(
        Array.from({ length: diasNoMes }, (_, i) => [i + 1, { cellWidth: 7 }])
      )
    },
    didParseCell: (data) => {
      // Colorir células de status
      if (data.section === 'body' && data.column.index > 0) {
        const status = data.cell.raw as string;
        data.cell.styles.fillColor = getStatusColor(status);
        data.cell.styles.textColor = getStatusTextColor(status);
        data.cell.styles.fontStyle = status === 'NC' ? 'bold' : 'normal';
        data.cell.styles.fontSize = status === 'NC' ? 7 : 6;
      }
    },
    margin: { left: 15, right: 15 }
  });

  // Legenda visual aprimorada
  const finalY = doc.lastAutoTable.finalY + 6;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('LEGENDA:', 15, finalY);
  
  // Quadrados coloridos para legenda
  const legendaX = 35;
  const legendaSpacing = 42;
  
  // C = Conforme
  doc.setFillColor(200, 255, 200);
  doc.rect(legendaX, finalY - 3, 4, 4, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 100, 0);
  doc.text('C = Conforme', legendaX + 6, finalY);
  
  // NC = Não Conforme
  doc.setFillColor(255, 200, 200);
  doc.rect(legendaX + legendaSpacing, finalY - 3, 4, 4, 'F');
  doc.setTextColor(139, 0, 0);
  doc.text('NC = Não Conforme', legendaX + legendaSpacing + 6, finalY);
  
  // NA = Não Aplicável
  doc.setFillColor(240, 240, 240);
  doc.rect(legendaX + legendaSpacing * 2, finalY - 3, 4, 4, 'F');
  doc.setTextColor(100, 100, 100);
  doc.text('NA = Não Aplicável', legendaX + legendaSpacing * 2 + 6, finalY);
  
  // - = Sem Checklist
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(200, 200, 200);
  doc.rect(legendaX + legendaSpacing * 3, finalY - 3, 4, 4, 'FD');
  doc.setTextColor(150, 150, 150);
  doc.text('- = Sem Checklist', legendaX + legendaSpacing * 3 + 6, finalY);
  
  doc.setTextColor(0);

  // Rodapé com assinaturas
  const footerY = pageHeight - 20;
  doc.setDrawColor(0);
  doc.line(15, footerY, 100, footerY);
  doc.line(pageWidth - 100, footerY, pageWidth - 15, footerY);
  
  doc.setFontSize(7);
  doc.text('Responsável pelo Checklist', 57.5, footerY + 4, { align: 'center' });
  doc.text('Supervisor/Gerente', pageWidth - 57.5, footerY + 4, { align: 'center' });

  // Número de página
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(100);
    doc.text(
      `Página ${i}/${pageCount} - Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  // Salvar
  const fileName = `checklist_mensal_${viaturaPlaca.replace(/\s+/g, '_')}_${mesNome}_${ano}_oficial.pdf`;
  doc.save(fileName);
};
