import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    console.log('🔄 Recebendo dados para webhook PTR-BA');

    if (req.method !== 'POST') {
      throw new Error('Método não permitido');
    }

    const dadosPtr = await req.json();
    console.log('📋 Dados PTR recebidos:', JSON.stringify(dadosPtr, null, 2));

    // Validar dados básicos
    if (!dadosPtr.data || !dadosPtr.equipe) {
      throw new Error('Dados obrigatórios não fornecidos');
    }

    // Enviar para webhook N8N
    console.log('🚀 Enviando para N8N...');
    const webhookUrl = 'https://n8n.brenodev.tech/webhook-test/f467668c-8302-4d8d-b144-80aebbdaea86';
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosPtr)
    });

    console.log('📡 Resposta N8N:', response.status, response.statusText);

    if (!response.ok) {
      const responseText = await response.text();
      console.error('❌ Erro N8N:', responseText);
      throw new Error(`Erro no webhook N8N: ${response.status} - ${responseText}`);
    }

    const responseData = await response.text();
    console.log('✅ Sucesso N8N:', responseData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Dados enviados com sucesso para N8N',
        n8nResponse: responseData 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Erro na Edge Function:', error);
    
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
})