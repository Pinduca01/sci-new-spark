import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1'
import { createDoc } from 'https://esm.sh/docx-templates@4.12.0'

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

function prepararDadosParaTemplate(dadosPtr: PTRData) {
  const equipeNome = typeof dadosPtr.equipe === 'string' ? dadosPtr.equipe : dadosPtr.equipe.nome_equipe;
  
  // Preparar participantes exatamente como o template espera
  const participantes = [];
  
  // Adicionar participantes reais
  dadosPtr.participantes.forEach((participante) => {
    participantes.push({
      funcao: participante.funcao || '',
      nome: participante.nome || '',
      situacao: participante.presente ? 'PRESENTE' : 'AUSENTE'
    });
  });
  
  // Completar com linhas vazias até 11 participantes
  while (participantes.length < 11) {
    participantes.push({
      funcao: '',
      nome: '',
      situacao: ''
    });
  }
  
  // Preparar PTRs com campos separados
  const ptrs = dadosPtr.ptrs.map((ptr) => ({
    tipo: ptr.tipo || '',
    hora_inicio: ptr.hora_inicio || '',
    hora_fim: ptr.hora_fim || '',
    duracao: ptr.duracao || '',
    instrutor_nome: ptr.instrutor_nome || '',
    observacoes: ptr.observacoes || ''
  }));
  
  return {
    data: dadosPtr.data,
    equipe: equipeNome,
    participantes: participantes,
    ptrs: ptrs,
    fotos: [] // Placeholder para fotos futuras
  };
}

function prepararDadosParaPDF(dadosPtr: PTRData) {
  const equipeNome = typeof dadosPtr.equipe === 'string' ? dadosPtr.equipe : dadosPtr.equipe.nome_equipe;
  
  // Preparar participantes com estatísticas para PDF
  const participantesCompletos = [];
  let participantesPresentes = 0;
  let participantesAusentes = 0;
  
  dadosPtr.participantes.forEach((participante, index) => {
    const presente = participante.presente;
    if (presente) {
      participantesPresentes++;
    } else {
      participantesAusentes++;
    }
    
    participantesCompletos.push({
      numeroLinha: index + 1,
      funcao: participante.funcao || '',
      nome: participante.nome || '',
      situacao: presente ? 'PRESENTE' : 'AUSENTE',
      presente: presente
    });
  });
  
  const totalParticipantes = dadosPtr.participantes.length;
  
  // Preparar PTRs formatados para PDF
  const ptrs = dadosPtr.ptrs.map((ptr, index) => ({
    numero: index + 1,
    tipo: ptr.tipo || '',
    horario: ptr.hora_inicio && ptr.hora_fim ? `${ptr.hora_inicio} às ${ptr.hora_fim}` : '',
    duracao: ptr.duracao || '',
    instrutor_nome: ptr.instrutor_nome || '',
    observacoes: ptr.observacoes || ''
  }));
  
  return {
    data: dadosPtr.data,
    equipe: equipeNome,
    totalParticipantes,
    participantesPresentes,
    participantesAusentes,
    participantesCompletos,
    ptrs
  };
}

async function gerarDOCXEstruturado(dadosPtr: PTRData, supabase: any): Promise<Response> {
  console.log('📄 Gerando DOCX a partir do template real...');
  
  try {
    // Baixar o template DOCX do bucket Supabase
    const { data: templateData, error: downloadError } = await supabase.storage
      .from('Template - PTR-BA')
      .download('arquivo ptr place.docx');
    
    if (downloadError) {
      throw new Error(`Erro ao baixar template: ${downloadError.message}`);
    }
    
    console.log('📋 Template baixado com sucesso');
    
    // Converter arquivo para buffer
    const templateBuffer = await templateData.arrayBuffer();
    
    // Preparar dados no formato correto para o template
    const dadosTemplate = prepararDadosParaTemplate(dadosPtr);
    console.log('📊 Dados preparados para template:', JSON.stringify(dadosTemplate, null, 2));
    
    // Processar template com os dados
    const docxBuffer = await createDoc({
      template: new Uint8Array(templateBuffer),
      data: dadosTemplate,
      cmdDelimiter: ['{', '}'],
    });
    
    console.log(`✅ DOCX real criado! Tamanho: ${docxBuffer.length} bytes`);

    const filename = `PTR-BA-${dadosPtr.data.replace(/\//g, '-')}.docx`;
    
    return new Response(docxBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Length': docxBuffer.length.toString(),
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao processar template DOCX:', error);
    throw new Error(`Falha ao gerar DOCX: ${error.message}`);
  }
}


async function criarPDFEstruturado(dadosPtr: PTRData): Promise<Response> {
  console.log('📄 Criando PDF estruturado...');
  
  const dadosTemplate = prepararDadosParaPDF(dadosPtr);
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