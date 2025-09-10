import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rfgmqogwhlnfrhifsbbg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZ21xb2d3aGxuZnJoaWZzYmJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMTExOTIsImV4cCI6MjA3MDY4NzE5Mn0.LHBul7ZS-hRmOoeVtY5wJkdBsfWtGnRhp48tZRHTNR4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testProfilesAccess() {
  console.log('🔍 Testando acesso à tabela profiles após correção RLS...');
  
  try {
    // Teste 1: Verificar se conseguimos acessar a tabela profiles (deve falhar sem autenticação)
    console.log('\n1. Testando acesso geral à tabela profiles (sem autenticação):');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profilesError) {
      console.log('✅ Esperado: Erro ao acessar profiles sem autenticação:', profilesError.message);
    } else {
      console.log('⚠️ Inesperado: Acesso à tabela profiles sem autenticação funcionou');
      console.log('📊 Total de profiles encontrados:', profiles?.length || 0);
    }
    
    // Teste 2: Tentar fazer login com um usuário de teste
    console.log('\n2. Tentando fazer login com usuário de teste...');
    
    // Primeiro, vamos verificar se há usuários na tabela auth.users
    console.log('\n3. Verificando usuários existentes no sistema...');
    
    // Como não podemos acessar auth.users diretamente, vamos tentar criar um usuário de teste
    const testEmail = 'teste@bombeiros.com';
    const testPassword = 'teste123456';
    
    console.log('\n4. Tentando fazer signup/login com usuário de teste...');
    
    // Tentar fazer login primeiro
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    if (loginError && loginError.message.includes('Invalid login credentials')) {
      console.log('👤 Usuário não existe, tentando criar...');
      
      // Tentar criar usuário
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            full_name: 'Usuário Teste'
          }
        }
      });
      
      if (signupError) {
        console.error('❌ Erro ao criar usuário:', signupError.message);
        return;
      } else {
        console.log('✅ Usuário criado com sucesso');
        console.log('📧 Verifique o email para confirmar a conta');
        return;
      }
    } else if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
      return;
    } else {
      console.log('✅ Login realizado com sucesso');
      console.log('👤 User ID:', loginData.user?.id);
      console.log('📧 Email:', loginData.user?.email);
      
      // Teste 5: Buscar perfil do usuário logado
      console.log('\n5. Buscando perfil do usuário logado...');
      const { data: userProfile, error: userProfileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', loginData.user.id)
        .single();
      
      if (userProfileError) {
        if (userProfileError.code === 'PGRST116') {
          console.log('⚠️ Perfil não encontrado, tentando criar...');
          
          // Tentar criar perfil
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              user_id: loginData.user.id,
              email: loginData.user.email,
              full_name: loginData.user.user_metadata?.full_name || 'Usuário Teste',
              role: 'user'
            })
            .select()
            .single();
          
          if (createError) {
            console.error('❌ Erro ao criar perfil:', createError);
          } else {
            console.log('✅ Perfil criado com sucesso:', newProfile);
          }
        } else {
          console.error('❌ Erro ao buscar perfil:', userProfileError);
        }
      } else {
        console.log('✅ Perfil do usuário encontrado:', userProfile);
      }
      
      // Fazer logout
      await supabase.auth.signOut();
      console.log('\n6. Logout realizado');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testProfilesAccess();