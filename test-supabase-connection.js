// Teste de conexão com Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rfgmqogwhlnfrhifsbbg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZ21xb2d3aGxuZnJoaWZzYmJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMTExOTIsImV4cCI6MjA3MDY4NzE5Mn0.LHBul7ZS-hRmOoeVtY5wJkdBsfWtGnRhp48tZRHTNR4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('Testando conexão com Supabase...');
    
    // Teste 1: Verificar se conseguimos conectar
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.error('Erro na conexão:', healthError);
      return;
    }
    
    console.log('✅ Conexão com Supabase estabelecida com sucesso!');
    
    // Teste 2: Verificar tabela movimentacoes
    const { data: movimentacoes, error: movError } = await supabase
      .from('movimentacoes')
      .select('*')
      .limit(1);
    
    if (movError) {
      console.error('Erro ao acessar tabela movimentacoes:', movError);
    } else {
      console.log('✅ Tabela movimentacoes acessível');
      console.log('Estrutura da tabela:', Object.keys(movimentacoes[0] || {}));
    }
    
    // Teste 3: Verificar tabela profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profileError) {
      console.error('Erro ao acessar tabela profiles:', profileError);
    } else {
      console.log('✅ Tabela profiles acessível');
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

testConnection();