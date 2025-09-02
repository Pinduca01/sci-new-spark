import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import DOMPurify from 'dompurify';

interface TPVerificacaoData {
  data_verificacao: string;
  local_contrato: string;
  ba_ce_nome: string;
  responsavel_nome: string;
  equipe_id: string;
  integrantes: string[];
  checklist: Array<{
    item: string;
    conforme: 'S' | 'N';
    observacoes?: string;
  }>;
}

export const generateTPVerificacaoPDF = async (data: TPVerificacaoData): Promise<Blob> => {
  // Criar elemento temporário para renderização
  const tempElement = document.createElement('div');
  tempElement.style.position = 'absolute';
  tempElement.style.left = '-9999px';
  tempElement.style.top = '0';
  tempElement.style.width = '210mm'; // A4 width
  tempElement.style.background = 'white';
  tempElement.style.fontFamily = 'Arial, sans-serif';
  tempElement.style.fontSize = '12px';
  tempElement.style.color = 'black';
  tempElement.style.padding = '20mm';

  // HTML do template baseado no formulário TP
  const htmlTemplate = `
    <div style="width: 100%; max-width: 170mm;">
      <!-- Cabeçalho -->
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 15px;">
        <h1 style="margin: 0; font-size: 18px; font-weight: bold; color: #000;">
          CORPO DE BOMBEIROS MILITAR DE MINAS GERAIS
        </h1>
        <h2 style="margin: 5px 0; font-size: 16px; font-weight: bold; color: #000;">
          AEROPORTO INTERNACIONAL TANCREDO NEVES
        </h2>
        <h3 style="margin: 5px 0; font-size: 14px; font-weight: bold; color: #000;">
          VERIFICAÇÃO DE TRAJES DE PROTEÇÃO (TP-1)
        </h3>
      </div>

      <!-- Informações Gerais -->
      <div style="margin-bottom: 20px; border: 1px solid #000;">
        <div style="background-color: #f5f5f5; padding: 8px; border-bottom: 1px solid #000; font-weight: bold; text-align: center;">
          INFORMAÇÕES GERAIS
        </div>
        <div style="padding: 10px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 10px;">
            <div><strong>Data da Verificação:</strong> ${new Date(data.data_verificacao).toLocaleDateString('pt-BR')}</div>
            <div><strong>Local/Contrato:</strong> ${data.local_contrato}</div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 10px;">
            <div><strong>BA/CE:</strong> ${data.ba_ce_nome}</div>
            <div><strong>Responsável:</strong> ${data.responsavel_nome}</div>
          </div>
          <div><strong>Equipe ID:</strong> ${data.equipe_id}</div>
        </div>
      </div>

      <!-- Integrantes da Equipe -->
      ${data.integrantes.length > 0 ? `
        <div style="margin-bottom: 20px; border: 1px solid #000;">
          <div style="background-color: #f5f5f5; padding: 8px; border-bottom: 1px solid #000; font-weight: bold; text-align: center;">
            INTEGRANTES DA EQUIPE
          </div>
          <div style="padding: 10px;">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
              ${data.integrantes.map((integrante, index) => `
                <div style="padding: 5px; border-bottom: 1px dotted #ccc;">
                  <strong>${index + 1}.</strong> ${integrante}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Checklist de Verificação -->
      <div style="margin-bottom: 20px; border: 1px solid #000;">
        <div style="background-color: #f5f5f5; padding: 8px; border-bottom: 1px solid #000; font-weight: bold; text-align: center;">
          CHECKLIST DE VERIFICAÇÃO DE TRAJES DE PROTEÇÃO (TP-1)
        </div>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="border: 1px solid #000; padding: 8px; text-align: center; width: 40px;">ITEM</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: left;">VERIFICAÇÃO</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center; width: 30px;">S</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center; width: 30px;">N</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: left;">DESCRIÇÃO DA NÃO CONFORMIDADE/ AÇÃO CORRETIVA ADOTADA</th>
            </tr>
          </thead>
          <tbody>
            ${data.checklist.map((item, index) => `
              <tr>
                <td style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">${index + 1}</td>
                <td style="border: 1px solid #000; padding: 8px; font-size: 9px;">${item.item}</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: center;">
                  ${item.conforme === 'S' ? '✓' : ''}
                </td>
                <td style="border: 1px solid #000; padding: 8px; text-align: center;">
                  ${item.conforme === 'N' ? '✓' : ''}
                </td>
                <td style="border: 1px solid #000; padding: 8px; font-size: 9px;">
                  ${item.observacoes || ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Legenda -->
      <div style="margin-bottom: 20px; padding: 10px; background-color: #f9f9f9; border: 1px solid #ccc;">
        <p style="margin: 0; font-size: 10px; text-align: center;">
          <strong>LEGENDA:</strong> S = SIM | N = NÃO QUANDO "NÃO" DESCREVER A NÃO CONFORMIDADE
        </p>
      </div>

      <!-- Assinatura -->
      <div style="margin-top: 40px; border: 1px solid #000;">
        <div style="background-color: #f5f5f5; padding: 8px; border-bottom: 1px solid #000; font-weight: bold; text-align: center;">
          ASSINATURA DIGITAL DO RESPONSÁVEL
        </div>
        <div style="padding: 20px; text-align: center;">
          <div style="margin: 40px 0; border-top: 1px solid #000; padding-top: 5px; display: inline-block; min-width: 300px;">
            <p style="margin: 0; font-size: 10px; font-weight: bold;">${data.responsavel_nome}</p>
            <p style="margin: 0; font-size: 9px;">Responsável pela Verificação</p>
          </div>
        </div>
      </div>

      <!-- Rodapé -->
      <div style="margin-top: 20px; text-align: center; font-size: 9px; color: #666;">
        <p style="margin: 0;">Documento gerado em ${new Date().toLocaleString('pt-BR')}</p>
        <p style="margin: 0;">Sistema SCI Core - Corpo de Bombeiros Militar de Minas Gerais</p>
      </div>
    </div>
  `;

  // Sanitizar o HTML antes de inserir no DOM para prevenir XSS
  tempElement.innerHTML = DOMPurify.sanitize(htmlTemplate);

  document.body.appendChild(tempElement);

  try {
    // Converter para canvas
    const canvas = await html2canvas(tempElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: tempElement.scrollWidth,
      height: tempElement.scrollHeight
    });

    // Criar PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // Adicionar primeira página
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Adicionar páginas extras se necessário
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    // Retornar o PDF como Blob para uso na assinatura
    return pdf.output('blob');

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error('Falha ao gerar o PDF da verificação TP');
  } finally {
    // Limpar elemento temporário
    document.body.removeChild(tempElement);
  }
};

// Função auxiliar para baixar o PDF
export const downloadTPVerificacaoPDF = async (data: TPVerificacaoData, filename?: string) => {
  try {
    const pdfBlob = await generateTPVerificacaoPDF(data);
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `Verificacao_TP_${data.data_verificacao.replace(/-/g, '')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao baixar PDF:', error);
    throw error;
  }
};