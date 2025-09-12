
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Equipe {
  nome_equipe: string;
  cor_identificacao?: string;
}

export interface Bombeiro {
  id: string;
  nome: string;
  nome_completo?: string | null;
  funcao: string;
  funcao_completa: string;
  email: string;
  telefone: string;
  equipe: string;
  equipe_id?: string | null; // Adicionando esta propriedade que estava faltando
  turno: string;
  status: string;
  matricula?: string;
  data_admissao: string;
  equipes?: Equipe; // Relacionamento com a tabela equipes
}

export const useBombeiros = (equipeFilter?: string) => {
  const {
    data: bombeiros = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['bombeiros', equipeFilter],
    queryFn: async () => {
      let query = supabase
        .from('bombeiros')
        .select('*')
        .eq('status', 'ativo');
      
      // Aplicar filtro por equipe se fornecido
      if (equipeFilter && equipeFilter !== 'todas') {
        query = query.eq('equipe', equipeFilter);
      }
      
      const { data, error } = await query.order('nome');

      if (error) throw error;
      return data as Bombeiro[];
    }
  });

  // Buscar bombeiros por equipe
  const buscarPorEquipe = (equipe: string) => {
    return bombeiros.filter(bombeiro => bombeiro.equipe === equipe);
  };

  // Buscar bombeiros por turno
  const buscarPorTurno = (turno: string) => {
    return bombeiros.filter(bombeiro => bombeiro.turno === turno);
  };

  // Buscar bombeiros disponíveis (ativo)
  const bombeirosAtivos = bombeiros.filter(bombeiro => bombeiro.status === 'ativo');

  // Buscar bombeiros com função BA-CE
  const bombeirosBACE = bombeiros.filter(bombeiro => 
    bombeiro.status === 'ativo' && 
    (bombeiro.funcao === 'BA-CE' || bombeiro.funcao_completa?.includes('BA-CE'))
  );

  return {
    bombeiros,
    bombeirosAtivos,
    bombeirosBACE,
    isLoading,
    error,
    buscarPorEquipe,
    buscarPorTurno
  };
};

// Hook específico para filtrar bombeiros por equipe
export const useBombeirosPorEquipe = (equipe?: string) => {
  const {
    data: bombeiros = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['bombeiros-por-equipe', equipe],
    queryFn: async () => {
      let query = supabase
        .from('bombeiros')
        .select('*');
      
      // Aplicar filtro por equipe se fornecido
      if (equipe && equipe !== 'todas' && equipe !== '') {
        query = query.eq('equipe', equipe);
      }
      
      const { data, error } = await query.order('nome');

      if (error) throw error;
      return data as Bombeiro[];
    },
    enabled: true // Sempre habilitado para permitir consultas dinâmicas
  });

  return {
    bombeiros,
    isLoading,
    error,
    refetch
  };
};
