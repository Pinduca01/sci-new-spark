import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface BombeiroEquipeData {
  id: string;
  nome: string;
  equipe_id: string | null;
  equipe: string;
  funcao: string;
  status: string;
}

const TestEquipeData: React.FC = () => {
  const [bombeiros, setBombeiros] = useState<BombeiroEquipeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    comEquipe: 0,
    semEquipe: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔍 Buscando dados de bombeiros e equipes...');
        
        // Buscar bombeiros com informações de equipe
        const { data: bombeirosData, error: bombeirosError } = await supabase
          .from('bombeiros')
          .select(`
            id,
            nome,
            equipe_id,
            equipe,
            funcao,
            status,
            equipes(nome_equipe, cor_identificacao)
          `)
          .eq('status', 'ativo')
          .order('nome');

        if (bombeirosError) {
          console.error('❌ Erro ao buscar bombeiros:', bombeirosError);
          throw bombeirosError;
        }

        console.log('📊 Dados brutos dos bombeiros:', bombeirosData);
        
        // Calcular estatísticas
        const total = bombeirosData?.length || 0;
        const comEquipe = bombeirosData?.filter(b => b.equipe_id !== null).length || 0;
        const semEquipe = total - comEquipe;
        
        console.log('📈 Estatísticas:', {
          total,
          comEquipe,
          semEquipe,
          percentualComEquipe: total > 0 ? ((comEquipe / total) * 100).toFixed(1) + '%' : '0%'
        });
        
        // Mostrar exemplos de bombeiros sem equipe_id
        const semEquipeId = bombeirosData?.filter(b => b.equipe_id === null).slice(0, 5) || [];
        console.log('👥 Exemplos de bombeiros sem equipe_id:', semEquipeId.map(b => ({
          nome: b.nome,
          equipe_campo: b.equipe,
          equipe_id: b.equipe_id,
          equipes_relacionamento: b.equipes
        })));
        
        setBombeiros(bombeirosData || []);
        setStats({ total, comEquipe, semEquipe });
        
      } catch (err) {
        console.error('❌ Erro geral:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-4">Carregando dados de equipes...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Erro: {error}</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Teste de Dados de Equipes</h1>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Estatísticas</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total de Bombeiros</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.comEquipe}</div>
            <div className="text-sm text-gray-600">Com Equipe ID</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.semEquipe}</div>
            <div className="text-sm text-gray-600">Sem Equipe ID</div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b">
          <h3 className="font-semibold">Primeiros 10 Bombeiros</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Nome</th>
                <th className="px-4 py-2 text-left">Equipe ID</th>
                <th className="px-4 py-2 text-left">Campo Equipe</th>
                <th className="px-4 py-2 text-left">Relacionamento</th>
                <th className="px-4 py-2 text-left">Função</th>
              </tr>
            </thead>
            <tbody>
              {bombeiros.slice(0, 10).map((bombeiro, index) => (
                <tr key={bombeiro.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-4 py-2">{bombeiro.nome}</td>
                  <td className="px-4 py-2">
                    <span className={bombeiro.equipe_id ? 'text-green-600' : 'text-red-600'}>
                      {bombeiro.equipe_id || 'NULL'}
                    </span>
                  </td>
                  <td className="px-4 py-2">{bombeiro.equipe || '-'}</td>
                  <td className="px-4 py-2">
                    {(bombeiro as any).equipes?.nome_equipe || '-'}
                  </td>
                  <td className="px-4 py-2">{bombeiro.funcao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TestEquipeData;