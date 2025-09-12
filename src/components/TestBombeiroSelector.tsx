import React, { useState } from 'react'
import { BombeiroSelector } from './BombeiroSelector'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useBombeirosResponsavel } from '@/hooks/useBombeirosSearch'
import type { BombeiroWithDetails } from '@/hooks/useBombeirosSearch'
import { supabase } from '@/integrations/supabase/client'

function TestBombeiroSelector() {
  const [bombeiroSelecionado, setBombeiroSelecionado] = useState<BombeiroWithDetails | null>(null)
  const { bombeiros, isLoading, error } = useBombeirosResponsavel()

  console.log('Debug - Bombeiros:', bombeiros);
  console.log('Debug - Loading:', isLoading);
  console.log('Debug - Error:', error);
  console.log('Debug - Bombeiros length:', bombeiros?.length);
  console.log('Debug - First bombeiro:', bombeiros?.[0]);
  
  // Teste direto da conexão com Supabase
  React.useEffect(() => {
    const testarConexaoSupabase = async () => {
      try {
        console.log('🔍 Testando conexão com Supabase...');
        
        // Teste de conexão básica
        const { data: connectionTest, error: connectionError } = await supabase
          .from('bombeiros')
          .select('count')
          .limit(1);
        
        if (connectionError) {
          console.error('❌ Erro de conexão:', connectionError);
          return;
        }
        
        console.log('✅ Conexão com Supabase OK');
        
        // Buscar alguns bombeiros para teste
        const { data: bombeiros, error: bombeirosError } = await supabase
          .from('bombeiros')
          .select(`
            *,
            equipes(nome_equipe, cor_identificacao)
          `)
          .limit(5);
        
        if (bombeirosError) {
          console.error('❌ Erro ao buscar bombeiros:', bombeirosError);
          return;
        }
        
        console.log('📋 Bombeiros encontrados:', bombeiros);
        console.log('🔧 Processando dados dos bombeiros...');
        
        // Testar o processamento dos dados como no hook
        bombeiros?.forEach((bombeiro, index) => {
          const equipeDisplay = `Equipe ${bombeiro.equipes?.nome_equipe || 'Sem equipe'}`;
          const displayName = `${bombeiro.nome} - ${bombeiro.funcao_completa}`;
          
          console.log(`👤 Bombeiro ${index + 1}:`, {
            nome: bombeiro.nome,
            funcao: bombeiro.funcao_completa,
            equipe_original: bombeiro.equipe,
            equipe_relacionamento: bombeiro.equipes?.nome_equipe,
            equipeDisplay,
            displayName
          });
        });
        
      } catch (error) {
        console.error('❌ Erro geral:', error);
      }
    };
    
    testarConexaoSupabase();
  }, []);

  // Teste adicional para verificar se há dados
  React.useEffect(() => {
    if (!isLoading && bombeiros) {
      console.log('=== DADOS DOS BOMBEIROS (HOOK) ===');
      console.log('Total de bombeiros:', bombeiros.length);
      bombeiros.forEach((bombeiro, index) => {
        console.log(`Bombeiro ${index + 1}:`, {
          id: bombeiro.id,
          nome: bombeiro.nome,
          equipe: bombeiro.equipe?.nome_equipe,
          funcao: bombeiro.funcao,
          status: bombeiro.status
        });
      });
    }
  }, [bombeiros, isLoading]);

  console.log('TestBombeiroSelector - Estado atual:', {
    bombeiroSelecionado,
    totalBombeiros: bombeiros?.length || 0,
    isLoading,
    error,
    primeiros5Bombeiros: bombeiros?.slice(0, 5)?.map(b => ({ id: b.id, nome: b.nome, equipe: b.equipe, status: b.status }))
  })

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Teste do BombeiroSelector</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Selecione um Bombeiro:
            </label>
            <BombeiroSelector
              value={bombeiroSelecionado}
              onChange={(bombeiro) => {
                console.log('Bombeiro selecionado:', bombeiro)
                setBombeiroSelecionado(bombeiro)
              }}
              placeholder="Busque e selecione um bombeiro..."
              showEquipeFilter={true}
              showFuncaoFilter={true}
              className="w-full"
            />
          </div>

          {bombeiroSelecionado && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800">Bombeiro Selecionado:</h3>
              <p><strong>Nome:</strong> {bombeiroSelecionado.nome}</p>
              <p><strong>Função:</strong> {bombeiroSelecionado.funcao_completa}</p>
              <p><strong>Equipe:</strong> {bombeiroSelecionado.equipe}</p>
              <p><strong>Status:</strong> {bombeiroSelecionado.status}</p>
              <p><strong>Matrícula:</strong> {bombeiroSelecionado.matricula}</p>
            </div>
          )}

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800">Informações de Debug:</h3>
            <p><strong>Carregando:</strong> {isLoading ? 'Sim' : 'Não'}</p>
            <p><strong>Erro:</strong> {error ? error.message : 'Nenhum'}</p>
            <p><strong>Total de Bombeiros:</strong> {bombeiros?.length || 0}</p>
            
            {bombeiros && bombeiros.length > 0 && (
              <div className="mt-2">
                <p><strong>Primeiros 3 bombeiros:</strong></p>
                <ul className="list-disc list-inside ml-4">
                  {bombeiros.slice(0, 3).map((bombeiro) => (
                    <li key={bombeiro.id}>
                      {bombeiro.nome} - {bombeiro.equipe} - {bombeiro.status}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Button 
            onClick={() => setBombeiroSelecionado(null)}
            variant="outline"
            className="w-full"
          >
            Limpar Seleção
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default TestBombeiroSelector