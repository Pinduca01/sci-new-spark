import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BombeiroRow {
  id: string;
  nome: string;
  email: string;
  funcao: string;
  base_id: string;
  ativo: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Iniciando criação de usuários para bombeiros...');

    // Buscar bombeiros sem user_id e ativos
    const { data: bombeiros, error: fetchError } = await supabase
      .from('bombeiros')
      .select('id, nome, email, funcao, base_id, ativo')
      .is('user_id', null)
      .eq('ativo', true);

    if (fetchError) {
      console.error('Erro ao buscar bombeiros:', fetchError);
      throw fetchError;
    }

    if (!bombeiros || bombeiros.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Nenhum bombeiro pendente de criação de usuário.',
          created: 0,
          list: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Encontrados ${bombeiros.length} bombeiros para criar usuários`);

    const results = [];
    const errors = [];

    // Mapear funções para roles
    const funcaoToRole = (funcao: string): string => {
      switch (funcao.toUpperCase()) {
        case 'BA-CE': return 'ba_ce';
        case 'BA-LR': return 'ba_lr';
        case 'BA-MC': return 'ba_mc';
        case 'BA-2': return 'ba_2';
        case 'GS': return 'gs_base';
        default: return 'ba_2'; // Role padrão
      }
    };

    // Processar cada bombeiro
    for (const bombeiro of bombeiros as BombeiroRow[]) {
      try {
        console.log(`Processando bombeiro: ${bombeiro.nome} (${bombeiro.email})`);

        // Criar usuário no auth.users
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: bombeiro.email,
          password: 'Bombeiro@2025',
          email_confirm: true,
          user_metadata: {
            full_name: bombeiro.nome,
          }
        });

        if (authError) {
          console.error(`Erro ao criar auth para ${bombeiro.email}:`, authError);
          errors.push({ bombeiro: bombeiro.nome, error: authError.message });
          continue;
        }

        const userId = authData.user.id;
        console.log(`Usuário criado: ${userId}`);

        // Atualizar bombeiro com user_id
        const { error: updateError } = await supabase
          .from('bombeiros')
          .update({ user_id: userId })
          .eq('id', bombeiro.id);

        if (updateError) {
          console.error(`Erro ao atualizar bombeiro ${bombeiro.id}:`, updateError);
          errors.push({ bombeiro: bombeiro.nome, error: updateError.message });
          continue;
        }

        // Inserir role
        const role = funcaoToRole(bombeiro.funcao);
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });

        if (roleError) {
          console.error(`Erro ao inserir role para ${userId}:`, roleError);
          errors.push({ bombeiro: bombeiro.nome, error: roleError.message });
          continue;
        }

        // Atualizar/Criar profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: userId,
            email: bombeiro.email,
            full_name: bombeiro.nome,
            base_id: bombeiro.base_id,
            ativo: true,
          }, { onConflict: 'user_id' });

        if (profileError) {
          console.error(`Erro ao atualizar profile para ${userId}:`, profileError);
          errors.push({ bombeiro: bombeiro.nome, error: profileError.message });
          continue;
        }

        results.push({
          nome: bombeiro.nome,
          email: bombeiro.email,
          senha_temporaria: 'Bombeiro@2025',
          role,
          success: true
        });

        console.log(`✓ Bombeiro ${bombeiro.nome} processado com sucesso`);
      } catch (error: any) {
        console.error(`Erro ao processar bombeiro ${bombeiro.nome}:`, error);
        errors.push({ bombeiro: bombeiro.nome, error: error.message });
      }
    }

    console.log(`Processamento concluído: ${results.length} sucessos, ${errors.length} erros`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${results.length} usuários criados com sucesso.`,
        created: results.length,
        failed: errors.length,
        list: results,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Erro geral:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
