import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { texto } = await req.json();

    if (!texto || typeof texto !== 'string' || texto.trim().length === 0) {
      return new Response(
        JSON.stringify({ erro: 'Texto não fornecido ou inválido' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('❌ OPENAI_API_KEY não configurada');
      return new Response(
        JSON.stringify({ erro: 'Chave API OpenAI não configurada' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🔍 Corrigindo gramática do texto:', texto.substring(0, 100) + '...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente especializado em correção gramatical e concordância para relatórios de ocorrências de bombeiros em aeroportos.

INSTRUÇÕES IMPORTANTES:
1. Corrija APENAS gramática, concordância verbal e nominal, pontuação e ortografia
2. PRESERVE COMPLETAMENTE todos os termos técnicos, códigos, siglas, equipamentos específicos do aeroporto
3. MANTENHA o tom formal e técnico do texto original
4. NÃO altere números, horários, localizações específicas ou nomenclaturas técnicas
5. NÃO adicione ou remova informações, apenas corrija a forma de escrevê-las
6. Se houver termos em maiúsculo (códigos/siglas), mantenha em maiúsculo
7. Preserve a estrutura e o sentido técnico original

Retorne APENAS o texto corrigido, sem explicações ou comentários adicionais.`
          },
          {
            role: 'user',
            content: `Corrija a gramática e concordância do seguinte texto de ocorrência aeroportuária:\n\n${texto}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Erro OpenAI:', response.status, errorData);
      throw new Error(`Erro OpenAI: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const textoCorrigido = data.choices[0].message.content.trim();

    console.log('✅ Texto corrigido com sucesso');
    console.log('📝 Original:', texto.substring(0, 50) + '...');
    console.log('📝 Corrigido:', textoCorrigido.substring(0, 50) + '...');

    return new Response(
      JSON.stringify({ 
        textoOriginal: texto,
        textoCorrigido: textoCorrigido,
        alterado: texto !== textoCorrigido
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Erro na correção gramatical:', error);
    return new Response(
      JSON.stringify({ 
        erro: 'Erro interno do servidor', 
        detalhes: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});