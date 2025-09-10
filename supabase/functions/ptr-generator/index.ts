import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PTRData {
  data: string;
  equipe: string | { nome_equipe: string };
  ptrs: Array<{
    tipo: string;
    hora_inicio: string;
    hora_fim: string;
    duracao?: string;
    instrutor_nome?: string;
    observacoes?: string;
  }>;
  participantes: Array<{
    nome: string;
    funcao?: string;
    presente: boolean;
    situacao?: string;
  }>;
}

interface ParticipanteTemplate {
  numeroLinha: number;
  funcao: string;
  nome: string;
  situacao: string;
  presente: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Iniciando geração de relatório PTR-BA estruturado');

    if (req.method !== 'POST') {
      throw new Error('Método não permitido');
    }

    const url = new URL(req.url);
    const format = url.searchParams.get('format') || 'docx';
    
    const { dadosPtr }: { dadosPtr: PTRData } = await req.json();
    console.log('📋 Dados PTR recebidos:', JSON.stringify(dadosPtr, null, 2));
    console.log('📄 Formato solicitado:', format);

    if (!dadosPtr || !dadosPtr.data || !dadosPtr.equipe) {
      throw new Error('Dados obrigatórios não fornecidos (data, equipe)');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (format === 'docx') {
      return await gerarDOCXEstruturado(dadosPtr, supabase);
    } else if (format === 'pdf') {
      return await criarPDFEstruturado(dadosPtr);
    } else {
      throw new Error('Formato não suportado. Use "docx" ou "pdf"');
    }

  } catch (error) {
    console.error('❌ Erro na geração do relatório:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

function prepararDadosTemplate(dadosPtr: PTRData) {
  const equipeNome = typeof dadosPtr.equipe === 'string' ? dadosPtr.equipe : dadosPtr.equipe.nome_equipe;
  
  // Garantir sempre 11 linhas na tabela de participantes
  const participantesCompletos: ParticipanteTemplate[] = [];
  
  dadosPtr.participantes.forEach((participante, index) => {
    participantesCompletos.push({
      numeroLinha: index + 1,
      funcao: participante.funcao || '',
      nome: participante.nome || '',
      situacao: participante.presente ? 'PRESENTE' : 'AUSENTE',
      presente: participante.presente
    });
  });
  
  // Completar com linhas vazias até 11
  for (let i = dadosPtr.participantes.length; i < 11; i++) {
    participantesCompletos.push({
      numeroLinha: i + 1,
      funcao: '',
      nome: '',
      situacao: '',
      presente: false
    });
  }
  
  return {
    data: dadosPtr.data,
    equipe: equipeNome,
    participantesCompletos,
    ptrs: dadosPtr.ptrs.map((ptr, index) => ({
      numero: index + 1,
      tipo: ptr.tipo,
      horario: `${ptr.hora_inicio} às ${ptr.hora_fim}`,
      duracao: ptr.duracao || '',
      instrutor_nome: ptr.instrutor_nome || '',
      observacoes: ptr.observacoes || ''
    })),
    totalParticipantes: dadosPtr.participantes.length,
    participantesPresentes: dadosPtr.participantes.filter(p => p.presente).length,
    participantesAusentes: dadosPtr.participantes.filter(p => !p.presente).length
  };
}

async function gerarDOCXEstruturado(dadosPtr: PTRData, supabase: any): Promise<Response> {
  console.log('📄 Gerando DOCX estruturado baseado no template...');
  
  const dadosTemplate = prepararDadosTemplate(dadosPtr);
  console.log('📊 Dados preparados:', {
    totalLinhas: dadosTemplate.participantesCompletos.length,
    participantesComNome: dadosTemplate.participantesCompletos.filter(p => p.nome).length
  });
  
  const htmlContent = gerarHTMLTemplate(dadosTemplate);
  const docxContent = converterParaDOCX(htmlContent);
  
  console.log(`✅ DOCX estruturado criado! Tamanho: ${docxContent.length} bytes`);

  const filename = `PTR-BA-${dadosPtr.data.replace(/\//g, '-')}.docx`;
  
  return new Response(docxContent, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Length': docxContent.length.toString(),
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}

function gerarHTMLTemplate(dadosTemplate: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>PTR-BA - ${dadosTemplate.data}</title>
    <style>
        @page { 
            size: A4; 
            margin: 2cm 1.5cm; 
        }
        body { 
            font-family: 'Times New Roman', serif; 
            font-size: 11pt; 
            line-height: 1.3; 
            margin: 0; 
            padding: 0;
            color: #000;
        }
        .header { 
            text-align: center; 
            margin-bottom: 25px; 
            border-bottom: 2px solid #000; 
            padding-bottom: 15px;
        }
        .title { 
            font-size: 16pt; 
            font-weight: bold; 
            margin-bottom: 10px; 
            text-transform: uppercase;
        }
        .info { 
            font-size: 12pt; 
            margin-bottom: 10px; 
        }
        .section { 
            margin-bottom: 25px; 
            page-break-inside: avoid;
        }
        .section-title { 
            font-size: 12pt; 
            font-weight: bold; 
            margin-bottom: 15px; 
            padding: 8px; 
            background-color: #f0f0f0; 
            border: 1px solid #000;
            text-align: center;
        }
        .participants-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 10px; 
            font-size: 10pt;
        }
        .participants-table th, 
        .participants-table td { 
            border: 1px solid #000; 
            padding: 8px; 
            text-align: left; 
            vertical-align: middle;
            height: 25px;
        }
        .participants-table th { 
            background-color: #e0e0e0; 
            font-weight: bold; 
            text-align: center;
        }
        .ptr-item { 
            margin-bottom: 15px; 
            padding: 10px; 
            border: 1px solid #ccc; 
            background-color: #f9f9f9;
        }
        .ptr-title { 
            font-weight: bold; 
            margin-bottom: 8px; 
            font-size: 11pt;
        }
        .ptr-details { 
            margin-left: 15px; 
            font-size: 10pt; 
            line-height: 1.4;
        }
        .signature-section {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
        }
        .signature-box {
            width: 45%;
            text-align: center;
            border-top: 1px solid #000;
            padding-top: 10px;
            margin-top: 40px;
        }
        .status-presente {
            color: #006400;
            font-weight: bold;
        }
        .status-ausente {
            color: #8b0000;
            font-weight: bold;
        }
        .summary-info {
            margin-bottom: 15px;
            padding: 8px;
            background-color: #f5f5f5;
            border-left: 3px solid #333;
            font-size: 10pt;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">RELATÓRIO DE TREINAMENTO PERIÓDICO - PTR-BA</div>
        <div class="info">
            <strong>Data:</strong> ${dadosTemplate.data}<br>
            <strong>Equipe:</strong> ${dadosTemplate.equipe}
        </div>
    </div>

    <div class="section">
        <div class="section-title">PARTICIPANTES DO TREINAMENTO</div>
        
        <div class="summary-info">
            <strong>Resumo:</strong> 
            ${dadosTemplate.totalParticipantes} participantes cadastrados | 
            ${dadosTemplate.participantesPresentes} presentes | 
            ${dadosTemplate.participantesAusentes} ausentes
        </div>
        
        <table class="participants-table">
            <thead>
                <tr>
                    <th style="width: 8%;">Nº</th>
                    <th style="width: 25%;">FUNÇÃO</th>
                    <th style="width: 40%;">NOME COMPLETO</th>
                    <th style="width: 15%;">SITUAÇÃO</th>
                    <th style="width: 12%;">ASSINATURA</th>
                </tr>
            </thead>
            <tbody>
                ${dadosTemplate.participantesCompletos.map(p => `
                    <tr>
                        <td style="text-align: center;">${p.numeroLinha}</td>
                        <td>${p.funcao}</td>
                        <td>${p.nome}</td>
                        <td style="text-align: center;" class="${p.presente && p.nome ? 'status-presente' : (!p.presente && p.nome) ? 'status-ausente' : ''}">${p.situacao}</td>
                        <td style="border-bottom: 1px solid #ccc;"></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">TREINAMENTOS REALIZADOS (PTR)</div>
        ${dadosTemplate.ptrs.map(ptr => `
            <div class="ptr-item">
                <div class="ptr-title">${ptr.numero}. ${ptr.tipo}</div>
                <div class="ptr-details">
                    <div><strong>Horário:</strong> ${ptr.horario}</div>
                    ${ptr.duracao ? `<div><strong>Duração:</strong> ${ptr.duracao}</div>` : ''}
                    ${ptr.instrutor_nome ? `<div><strong>Instrutor:</strong> ${ptr.instrutor_nome}</div>` : ''}
                    ${ptr.observacoes ? `<div><strong>Observações:</strong> ${ptr.observacoes}</div>` : ''}
                </div>
            </div>
        `).join('')}
    </div>

    <div class="signature-section">
        <div class="signature-box">
            <strong>Responsável pelo Treinamento</strong><br><br>
            Nome: ____________________________________<br><br>
            Assinatura: _______________________________<br>
            Data: _____ / _____ / _______
        </div>
        <div class="signature-box">
            <strong>Supervisor de Equipe</strong><br><br>
            Nome: ____________________________________<br><br>
            Assinatura: _______________________________<br>
            Data: _____ / _____ / _______
        </div>
    </div>

    <div style="margin-top: 30px; font-size: 9pt; text-align: center; color: #666;">
        Documento gerado automaticamente em ${new Date().toLocaleString('pt-BR')}
    </div>
</body>
</html>`;
}

function converterParaDOCX(htmlContent: string): Uint8Array {
  // Por enquanto retornamos HTML estruturado
  // TODO: Implementar biblioteca docx-templates para conversão real
  console.log('🔧 Convertendo HTML para formato DOCX...');
  
  const encoder = new TextEncoder();
  return encoder.encode(htmlContent);
}

async function criarPDFEstruturado(dadosPtr: PTRData): Promise<Response> {
  console.log('📄 Criando PDF estruturado...');
  
  const dadosTemplate = prepararDadosTemplate(dadosPtr);
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const { width, height } = page.getSize();
  let yPos = height - 50;

  // Cabeçalho
  page.drawText('RELATÓRIO PTR-BA', {
    x: (width - 200) / 2,
    y: yPos,
    size: 18,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  yPos -= 30;

  // Linha horizontal
  page.drawLine({
    start: { x: 50, y: yPos },
    end: { x: width - 50, y: yPos },
    thickness: 2,
    color: rgb(0, 0, 0),
  });
  yPos -= 25;

  // Informações básicas
  page.drawText(`Data: ${dadosTemplate.data}`, {
    x: 50,
    y: yPos,
    size: 12,
    font: font,
  });
  yPos -= 20;

  page.drawText(`Equipe: ${dadosTemplate.equipe}`, {
    x: 50,
    y: yPos,
    size: 12,
    font: font,
  });
  yPos -= 35;

  // Resumo dos participantes
  page.drawText('PARTICIPANTES:', {
    x: 50,
    y: yPos,
    size: 14,
    font: fontBold,
  });
  yPos -= 18;

  page.drawText(`Total: ${dadosTemplate.totalParticipantes} | Presentes: ${dadosTemplate.participantesPresentes} | Ausentes: ${dadosTemplate.participantesAusentes}`, {
    x: 70,
    y: yPos,
    size: 10,
    font: font,
  });
  yPos -= 20;

  // Lista de participantes (somente os que têm nome)
  dadosTemplate.participantesCompletos.forEach((participante: ParticipanteTemplate) => {
    if (participante.nome) {
      const funcao = participante.funcao ? ` (${participante.funcao})` : '';
      page.drawText(`${participante.numeroLinha}. ${participante.nome}${funcao} - ${participante.situacao}`, {
        x: 70,
        y: yPos,
        size: 10,
        font: font,
        color: participante.presente ? rgb(0, 0.4, 0) : rgb(0.6, 0, 0),
      });
      yPos -= 15;
    }
  });

  yPos -= 20;

  // Treinamentos realizados
  if (dadosTemplate.ptrs && Array.isArray(dadosTemplate.ptrs)) {
    page.drawText('TREINAMENTOS REALIZADOS:', {
      x: 50,
      y: yPos,
      size: 14,
      font: fontBold,
    });
    yPos -= 25;

    dadosTemplate.ptrs.forEach((ptr: any) => {
      page.drawText(`${ptr.numero}. ${ptr.tipo}`, {
        x: 70,
        y: yPos,
        size: 11,
        font: fontBold,
      });
      yPos -= 15;

      page.drawText(`   Horário: ${ptr.horario}`, {
        x: 70,
        y: yPos,
        size: 10,
        font: font,
      });
      yPos -= 12;

      if (ptr.duracao) {
        page.drawText(`   Duração: ${ptr.duracao}`, {
          x: 70,
          y: yPos,
          size: 10,
          font: font,
        });
        yPos -= 12;
      }

      if (ptr.instrutor_nome) {
        page.drawText(`   Instrutor: ${ptr.instrutor_nome}`, {
          x: 70,
          y: yPos,
          size: 10,
          font: font,
        });
        yPos -= 12;
      }

      if (ptr.observacoes) {
        page.drawText(`   Observações: ${ptr.observacoes.substring(0, 80)}${ptr.observacoes.length > 80 ? '...' : ''}`, {
          x: 70,
          y: yPos,
          size: 10,
          font: font,
        });
        yPos -= 15;
      }

      yPos -= 10;
    });
  }

  // Área de assinaturas
  if (yPos > 100) {
    yPos = 120;
    
    page.drawText('Responsável pelo Treinamento', {
      x: 70,
      y: yPos,
      size: 10,
      font: fontBold,
    });
    
    page.drawLine({
      start: { x: 70, y: yPos - 15 },
      end: { x: 250, y: yPos - 15 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    page.drawText('Supervisor de Equipe', {
      x: 320,
      y: yPos,
      size: 10,
      font: fontBold,
    });
    
    page.drawLine({
      start: { x: 320, y: yPos - 15 },
      end: { x: 500, y: yPos - 15 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
  }

  const pdfBytes = await pdfDoc.save();

  if (!pdfBytes || pdfBytes.length === 0) {
    throw new Error('Falha na criação do PDF');
  }

  console.log(`✅ PDF estruturado criado! Tamanho: ${pdfBytes.length} bytes`);

  const filename = `PTR-BA-${dadosPtr.data.replace(/\//g, '-')}.pdf`;

  return new Response(pdfBytes, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBytes.length.toString(),
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}