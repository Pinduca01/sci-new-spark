import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Iniciando geração de PDF PTR-BA');

    if (req.method !== 'POST') {
      throw new Error('Método não permitido');
    }

    const { dadosPtr } = await req.json();
    console.log('📋 Dados PTR recebidos para PDF:', JSON.stringify(dadosPtr, null, 2));

    // Validar dados básicos
    if (!dadosPtr || !dadosPtr.data || !dadosPtr.equipe) {
      throw new Error('Dados obrigatórios não fornecidos');
    }

    // Inicializar Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('📂 Buscando template PDF no storage...');
    
    // Tentar baixar template do storage (buscar qualquer arquivo PDF no bucket)
    const { data: files, error: listError } = await supabase.storage
      .from('Template - PTR-BA')
      .list()

    if (listError) {
      console.error('❌ Erro ao listar arquivos do bucket:', listError);
      throw new Error(`Erro ao acessar templates: ${listError.message}`);
    }

    console.log('📋 Arquivos encontrados no bucket:', files);

    // Procurar por arquivo PDF
    const pdfFile = files?.find(file => file.name.toLowerCase().endsWith('.pdf'));
    
    if (!pdfFile) {
      console.log('⚠️ Nenhum template PDF encontrado, criando PDF do zero...');
      return await criarPDFDoZero(dadosPtr);
    }

    console.log('📄 Template encontrado:', pdfFile.name);

    // Baixar o template PDF
    const { data: templateBuffer, error: downloadError } = await supabase.storage
      .from('Template - PTR-BA')
      .download(pdfFile.name);

    if (downloadError) {
      console.error('❌ Erro ao baixar template:', downloadError);
      throw new Error(`Erro ao baixar template: ${downloadError.message}`);
    }

    console.log('✅ Template baixado, processando...');

    // Converter para ArrayBuffer e validar
    const arrayBuffer = await templateBuffer.arrayBuffer();
    
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      console.log('⚠️ Template vazio ou corrompido, criando PDF do zero...');
      return await criarPDFDoZero(dadosPtr);
    }

    console.log(`📄 Template carregado: ${arrayBuffer.byteLength} bytes`);
    
    // Carregar PDF template
    let pdfDoc;
    try {
      pdfDoc = await PDFDocument.load(arrayBuffer);
      console.log('✅ Template PDF carregado com sucesso');
    } catch (error) {
      console.log('⚠️ Erro ao carregar template PDF, criando do zero...', error.message);
      return await criarPDFDoZero(dadosPtr);
    }
    const form = pdfDoc.getForm();

    console.log('📝 Preenchendo campos do template...');

    // Preencher campos do formulário PDF (tentar diferentes nomes de campos)
    try {
      // Campos básicos
      const camposBasicos = [
        { campo: 'data', valor: dadosPtr.data },
        { campo: 'Data', valor: dadosPtr.data },
        { campo: 'DATE', valor: dadosPtr.data },
        { campo: 'equipe', valor: dadosPtr.equipe?.nome_equipe || dadosPtr.equipe },
        { campo: 'Equipe', valor: dadosPtr.equipe?.nome_equipe || dadosPtr.equipe },
        { campo: 'TEAM', valor: dadosPtr.equipe?.nome_equipe || dadosPtr.equipe },
      ];

      for (const { campo, valor } of camposBasicos) {
        try {
          const field = form.getTextField(campo);
          field.setText(valor || '');
          console.log(`✅ Campo '${campo}' preenchido com: ${valor}`);
        } catch (e) {
          // Campo não existe, continuar
        }
      }

      // Preencher dados dos PTRs
      if (dadosPtr.ptrs && Array.isArray(dadosPtr.ptrs)) {
        for (let i = 0; i < dadosPtr.ptrs.length; i++) {
          const ptr = dadosPtr.ptrs[i];
          const prefixos = [`ptr${i+1}_`, `PTR${i+1}_`, `ptr_${i+1}_`];
          
          for (const prefixo of prefixos) {
            try {
              const camposPtr = [
                { campo: `${prefixo}tipo`, valor: ptr.tipo },
                { campo: `${prefixo}hora_inicio`, valor: ptr.hora_inicio },
                { campo: `${prefixo}hora_fim`, valor: ptr.hora_fim },
                { campo: `${prefixo}instrutor`, valor: ptr.instrutor_nome || '' },
                { campo: `${prefixo}duracao`, valor: ptr.duracao || '' },
                { campo: `${prefixo}observacoes`, valor: ptr.observacoes || '' }
              ];

              for (const { campo, valor } of camposPtr) {
                try {
                  const field = form.getTextField(campo);
                  field.setText(valor || '');
                  console.log(`✅ Campo PTR '${campo}' preenchido com: ${valor}`);
                } catch (e) {
                  // Campo não existe
                }
              }
            } catch (e) {
              // Continuar com próximo prefixo
            }
          }
        }
      }

      // Preencher participantes
      if (dadosPtr.participantes && Array.isArray(dadosPtr.participantes)) {
        let listaParticipantes = '';
        dadosPtr.participantes.forEach((p, index) => {
          const status = p.presente ? 'P' : 'A';
          listaParticipantes += `${index + 1}. ${p.nome} - ${status}\n`;
        });

        const camposParticipantes = ['participantes', 'Participantes', 'PARTICIPANTS'];
        for (const campo of camposParticipantes) {
          try {
            const field = form.getTextField(campo);
            field.setText(listaParticipantes);
            console.log(`✅ Lista de participantes preenchida`);
            break;
          } catch (e) {
            // Campo não existe
          }
        }
      }

    } catch (error) {
      console.error('⚠️ Erro ao preencher campos do formulário:', error);
      // Continuar mesmo se houver erro nos campos
    }

    console.log('💾 Gerando PDF final...');

    // Gerar PDF final
    const pdfBytes = await pdfDoc.save();

    // Validar se o PDF foi gerado corretamente
    if (!pdfBytes || pdfBytes.length === 0) {
      throw new Error('Falha na geração do PDF - arquivo vazio');
    }

    console.log(`✅ PDF gerado com sucesso! Tamanho: ${pdfBytes.length} bytes`);

    // Criar resposta com headers corretos para download de PDF
    const response = new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBytes.length.toString(),
        'Content-Disposition': `attachment; filename="PTR-BA-${dadosPtr.data.replace(/\//g, '-')}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    return response;

  } catch (error) {
    console.error('❌ Erro na geração do PDF:', error);
    
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

// Função para criar PDF do zero caso não exista template
async function criarPDFDoZero(dadosPtr: any): Promise<Response> {
  console.log('📄 Criando PDF do zero...');
  
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const { width, height } = page.getSize();
  let yPos = height - 50;

  // Título
  page.drawText('RELATÓRIO PTR-BA', {
    x: 50,
    y: yPos,
    size: 18,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  yPos -= 40;

  // Data
  page.drawText(`Data: ${dadosPtr.data}`, {
    x: 50,
    y: yPos,
    size: 12,
    font: font,
  });
  yPos -= 20;

  // Equipe
  page.drawText(`Equipe: ${dadosPtr.equipe?.nome_equipe || dadosPtr.equipe}`, {
    x: 50,
    y: yPos,
    size: 12,
    font: font,
  });
  yPos -= 30;

  // PTRs
  if (dadosPtr.ptrs && Array.isArray(dadosPtr.ptrs)) {
    page.drawText('INSTRUÇÕES PTR:', {
      x: 50,
      y: yPos,
      size: 14,
      font: fontBold,
    });
    yPos -= 25;

    dadosPtr.ptrs.forEach((ptr: any, index: number) => {
      page.drawText(`${index + 1}. ${ptr.tipo}`, {
        x: 70,
        y: yPos,
        size: 11,
        font: fontBold,
      });
      yPos -= 15;

      page.drawText(`   Horário: ${ptr.hora_inicio} às ${ptr.hora_fim} (${ptr.duracao || 'N/A'})`, {
        x: 70,
        y: yPos,
        size: 10,
        font: font,
      });
      yPos -= 12;

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
        page.drawText(`   Observações: ${ptr.observacoes}`, {
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

  // Participantes
  if (dadosPtr.participantes && Array.isArray(dadosPtr.participantes)) {
    yPos -= 10;
    page.drawText('PARTICIPANTES:', {
      x: 50,
      y: yPos,
      size: 14,
      font: fontBold,
    });
    yPos -= 20;

    dadosPtr.participantes.forEach((participante: any, index: number) => {
      const status = participante.presente ? 'PRESENTE' : 'AUSENTE';
      page.drawText(`${index + 1}. ${participante.nome} - ${status}`, {
        x: 70,
        y: yPos,
        size: 10,
        font: font,
      });
      yPos -= 15;
    });
  }

  const pdfBytes = await pdfDoc.save();

  // Validar PDF gerado
  if (!pdfBytes || pdfBytes.length === 0) {
    throw new Error('Falha na criação do PDF do zero - arquivo vazio');
  }

  console.log(`✅ PDF criado do zero com sucesso! Tamanho: ${pdfBytes.length} bytes`);

  return new Response(pdfBytes, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBytes.length.toString(),
      'Content-Disposition': `attachment; filename="PTR-BA-${dadosPtr.data.replace(/\//g, '-')}.pdf"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}