
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import DOMPurify from 'dompurify';

interface PTRData {
  data: string;
  instrucoesData: Array<{
    id: number;
    hora: string;
    titulo: string;
    tipo: string;
    instrutor: string;
    participantes: Array<{
      id: string;
      nome: string;
      funcao: string;
      presente?: boolean;
    }>;
    fotos?: string[];
    observacoes?: string;
  }>;
}

export const generatePTRPDF = async (data: PTRData): Promise<void> => {
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

  // HTML do template baseado na imagem (sanitizado para segurança)
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
          PROGRAMA DE TREINAMENTO RECORRENTE - PTR-BA
        </h3>
        <p style="margin: 10px 0; font-size: 12px;">
          <strong>DATA:</strong> ${new Date(data.data).toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      ${data.instrucoesData.map((instrucao, index) => `
        <!-- Instrução ${index + 1} -->
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <div style="background-color: #f5f5f5; padding: 10px; border: 1px solid #ccc; margin-bottom: 15px;">
            <h4 style="margin: 0; font-size: 14px; font-weight: bold;">
              INSTRUÇÃO ${index + 1}: ${instrucao.titulo.toUpperCase()}
            </h4>
            <div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 11px;">
              <span><strong>HORÁRIO:</strong> ${instrucao.hora}</span>
              <span><strong>TIPO:</strong> ${instrucao.tipo}</span>
              <span><strong>INSTRUTOR:</strong> ${instrucao.instrutor || 'Não informado'}</span>
            </div>
          </div>

          <!-- Lista de Participantes -->
          <div style="margin-bottom: 20px;">
            <h5 style="margin: 0 0 10px 0; font-size: 12px; font-weight: bold; background-color: #e9ecef; padding: 5px;">
              LISTA DE PRESENÇA
            </h5>
            <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="border: 1px solid #ccc; padding: 5px; text-align: left; font-weight: bold;">NOME</th>
                  <th style="border: 1px solid #ccc; padding: 5px; text-align: center; font-weight: bold; width: 60px;">FUNÇÃO</th>
                  <th style="border: 1px solid #ccc; padding: 5px; text-align: center; font-weight: bold; width: 80px;">PRESENÇA</th>
                  <th style="border: 1px solid #ccc; padding: 5px; text-align: center; font-weight: bold; width: 100px;">ASSINATURA</th>
                </tr>
              </thead>
              <tbody>
                ${instrucao.participantes.map(participante => `
                  <tr>
                    <td style="border: 1px solid #ccc; padding: 5px;">${participante.nome}</td>
                    <td style="border: 1px solid #ccc; padding: 5px; text-align: center;">${participante.funcao}</td>
                    <td style="border: 1px solid #ccc; padding: 5px; text-align: center;">
                      ${participante.presente ? '✓' : '___'}
                    </td>
                    <td style="border: 1px solid #ccc; padding: 5px; text-align: center;">
                      ____________________
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          ${instrucao.fotos && instrucao.fotos.length > 0 ? `
            <!-- Fotos da Instrução -->
            <div style="margin-bottom: 20px;">
              <h5 style="margin: 0 0 10px 0; font-size: 12px; font-weight: bold; background-color: #e9ecef; padding: 5px;">
                REGISTRO FOTOGRÁFICO
              </h5>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                ${instrucao.fotos.slice(0, 2).map((foto, fotoIndex) => `
                  <div style="border: 1px solid #ccc; padding: 5px; text-align: center;">
                    <img src="${foto}" style="max-width: 100%; max-height: 120px; object-fit: cover;" />
                    <p style="margin: 5px 0 0 0; font-size: 9px;">Foto ${fotoIndex + 1}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${instrucao.observacoes ? `
            <!-- Observações -->
            <div style="margin-bottom: 20px;">
              <h5 style="margin: 0 0 5px 0; font-size: 12px; font-weight: bold;">OBSERVAÇÕES:</h5>
              <div style="border: 1px solid #ccc; padding: 8px; min-height: 40px; font-size: 10px;">
                ${instrucao.observacoes}
              </div>
            </div>
          ` : ''}
        </div>
      `).join('')}

      <!-- Rodapé -->
      <div style="margin-top: 40px; border-top: 1px solid #ccc; padding-top: 15px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 30px;">
          <div style="text-align: center; border-top: 1px solid #000; padding-top: 5px;">
            <p style="margin: 0; font-size: 10px; font-weight: bold;">RESPONSÁVEL PELO TREINAMENTO</p>
            <p style="margin: 0; font-size: 9px;">Nome e Assinatura</p>
          </div>
          <div style="text-align: center; border-top: 1px solid #000; padding-top: 5px;">
            <p style="margin: 0; font-size: 10px; font-weight: bold;">SUPERVISOR SCI</p>
            <p style="margin: 0; font-size: 9px;">Nome e Assinatura</p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px; font-size: 9px; color: #666;">
          <p style="margin: 0;">Relatório gerado em ${new Date().toLocaleString('pt-BR')}</p>
        </div>
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

    // Download do PDF
    const fileName = `PTR-BA_${data.data.replace(/-/g, '')}.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error('Falha ao gerar o relatório PDF');
  } finally {
    // Limpar elemento temporário
    document.body.removeChild(tempElement);
  }
};
