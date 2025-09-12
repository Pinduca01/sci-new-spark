import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Bombeiro {
  id: string;
  nome: string;
  equipe: string;
  funcao_completa: string;
  status: string;
  matricula?: string;
}

export const TestSupabaseConnection: React.FC = () => {
  const [bombeiros, setBombeiros] = useState<Bombeiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBombeiros = async () => {
      try {
        console.log('🔍 Iniciando busca de bombeiros...');
        
        const { data, error } = await supabase
          .from('bombeiros')
          .select('id, nome, equipe, funcao_completa, status, matricula')
          .eq('status', 'ativo')
          .order('nome');

        console.log('📊 Resultado da busca:', { data, error });
        
        if (error) {
          console.error('❌ Erro ao buscar bombeiros:', error);
          setError(error.message);
        } else {
          console.log('✅ Bombeiros encontrados:', data?.length || 0);
          setBombeiros(data || []);
        }
      } catch (err) {
        console.error('💥 Erro inesperado:', err);
        setError('Erro inesperado ao buscar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchBombeiros();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Teste de Conexão Supabase</h2>
        <p>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Teste de Conexão Supabase</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Erro:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Teste de Conexão Supabase</h2>
      <p className="mb-4">Total de bombeiros ativos encontrados: {bombeiros.length}</p>
      
      <div className="space-y-2">
        {bombeiros.map((bombeiro) => (
          <div key={bombeiro.id} className="border p-3 rounded">
            <div><strong>Nome:</strong> {bombeiro.nome}</div>
            <div><strong>Equipe:</strong> {bombeiro.equipe}</div>
            <div><strong>Função:</strong> {bombeiro.funcao_completa}</div>
            <div><strong>Status:</strong> {bombeiro.status}</div>
            {bombeiro.matricula && <div><strong>Matrícula:</strong> {bombeiro.matricula}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestSupabaseConnection;