import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AgenteExtintor } from '@/hooks/useAgentesExtintores';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface RelatorioData {
  mes: number;
  ano: number;
  agentes: AgenteExtintor[];
}

const mesesNomes = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const tipoLabels = {
  'LGE': 'LGE (Líquido Gerador de Espuma)',
  'PO_QUIMICO': 'Pó Químico',
  'NITROGENIO': 'Nitrogênio'
};

const situacaoLabels = {
  'ESTOQUE': 'Em Estoque',
  'EM_USO': 'Em Uso',
  'MANUTENCAO': 'Manutenção',
  'DESCARTADO': 'Descartado'
};

export const gerarRelatorioPDF = ({ mes, ano, agentes }: RelatorioData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Configurações de cores
  const primaryColor: [number, number, number] = [41, 128, 185]; // Azul
  const secondaryColor: [number, number, number] = [52, 73, 94]; // Cinza escuro
  const lightGray: [number, number, number] = [236, 240, 241]; // Cinza claro
  
  // Cabeçalho
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  // Título principal
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO MENSAL DE AGENTES EXTINTORES', pageWidth / 2, 15, { align: 'center' });
  
  // Subtítulo
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`${mesesNomes[mes - 1]} de ${ano}`, pageWidth / 2, 25, { align: 'center' });
  
  // Informações do relatório
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(10);
  const dataGeracao = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Gerado em: ${dataGeracao}`, 15, 45);
  doc.text(`Total de registros: ${agentes.length}`, pageWidth - 15, 45, { align: 'right' });
  
  // Linha separadora
  doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setLineWidth(0.5);
  doc.line(15, 50, pageWidth - 15, 50);
  
  // Resumo estatístico
  let yPosition = 60;
  
  if (agentes.length > 0) {
    // Estatísticas por tipo
    const estatisticas = {
      LGE: agentes.filter(a => a.tipo === 'LGE').length,
      PO_QUIMICO: agentes.filter(a => a.tipo === 'PO_QUIMICO').length,
      NITROGENIO: agentes.filter(a => a.tipo === 'NITROGENIO').length
    };
    
    // Estatísticas por situação
    const situacoes = {
      ESTOQUE: agentes.filter(a => a.situacao === 'ESTOQUE').length,
      EM_USO: agentes.filter(a => a.situacao === 'EM_USO').length,
      MANUTENCAO: agentes.filter(a => a.situacao === 'MANUTENCAO').length,
      DESCARTADO: agentes.filter(a => a.situacao === 'DESCARTADO').length
    };
    
    // Título da seção de resumo
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('RESUMO EXECUTIVO', 15, yPosition);
    yPosition += 15;
    
    // Tabela de estatísticas por tipo
    doc.autoTable({
      startY: yPosition,
      head: [['Tipo de Agente', 'Quantidade']],
      body: [
        ['LGE (Líquido Gerador de Espuma)', estatisticas.LGE.toString()],
        ['Pó Químico', estatisticas.PO_QUIMICO.toString()],
        ['Nitrogênio', estatisticas.NITROGENIO.toString()]
      ],
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 5
      },
      margin: { left: 15, right: pageWidth / 2 + 10 }
    });
    
    // Tabela de estatísticas por situação
    doc.autoTable({
      startY: yPosition,
      head: [['Situação', 'Quantidade']],
      body: [
        ['Em Estoque', situacoes.ESTOQUE.toString()],
        ['Em Uso', situacoes.EM_USO.toString()],
        ['Manutenção', situacoes.MANUTENCAO.toString()],
        ['Descartado', situacoes.DESCARTADO.toString()]
      ],
      theme: 'grid',
      headStyles: {
        fillColor: secondaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 5
      },
      margin: { left: pageWidth / 2 + 10, right: 15 }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 20;
    
    // Título da tabela principal
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('DETALHAMENTO DOS AGENTES EXTINTORES', 15, yPosition);
    yPosition += 10;
    
    // Preparar dados para a tabela principal
    const tableData = agentes.map(agente => [
      tipoLabels[agente.tipo] || agente.tipo,
      agente.fabricante,
      agente.lote || '-',
      agente.quantidade.toString(),
      agente.unidade,
      situacaoLabels[agente.situacao] || agente.situacao,
      agente.data_validade ? new Date(agente.data_validade).toLocaleDateString('pt-BR') : '-',
      new Date(agente.data_fabricacao).toLocaleDateString('pt-BR'),
      new Date(agente.created_at).toLocaleDateString('pt-BR')
    ]);
    
    // Tabela principal com todos os dados
    doc.autoTable({
      startY: yPosition,
      head: [[
        'Tipo',
        'Fabricante',
        'Lote',
        'Qtd',
        'Unidade',
        'Situação',
        'Validade',
        'Fabricação',
        'Cadastro'
      ]],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Tipo
        1: { cellWidth: 20 }, // Fabricante
        2: { cellWidth: 15 }, // Lote
        3: { cellWidth: 12 }, // Quantidade
        4: { cellWidth: 15 }, // Unidade
        5: { cellWidth: 18 }, // Situação
        6: { cellWidth: 18 }, // Validade
        7: { cellWidth: 18 }, // Fabricação
        8: { cellWidth: 18 }  // Cadastro
      },
      margin: { left: 15, right: 15 },
      didDrawPage: (data) => {
        // Rodapé em cada página
        const totalPages = (doc as any).internal.getNumberOfPages();
        const pageNum = (doc as any).internal.getCurrentPageInfo().pageNumber || 1;
        
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Página ${pageNum} de ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        
        doc.text(
          'Sistema de Controle de Incêndio - SCI',
          15,
          pageHeight - 10
        );
        
        doc.text(
          `Relatório gerado em ${dataGeracao}`,
          pageWidth - 15,
          pageHeight - 10,
          { align: 'right' }
        );
      }
    });
  } else {
    // Mensagem quando não há dados
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(
      'Nenhum agente extintor foi cadastrado no período selecionado.',
      pageWidth / 2,
      yPosition + 30,
      { align: 'center' }
    );
  }
  
  // Salvar o PDF
  const nomeArquivo = `relatorio_agentes_${mesesNomes[mes - 1].toLowerCase()}_${ano}.pdf`;
  doc.save(nomeArquivo);
};