
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Bombeiro {
  id: string;
  nome: string;
  funcao: string;
  funcao_completa: string;
  email: string;
  telefone: string;
  equipe: string;
  turno: string;
  status: string;
  matricula?: string;
}

export const useBombeiros = () => {
  const {
    data: bombeiros = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['bombeiros'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bombeiros')
        .select('*')
        .eq('status', 'ativo')
        .order('nome');

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

  return {
    bombeiros,
    bombeirosAtivos,
    isLoading,
    error,
    buscarPorEquipe,
    buscarPorTurno
  };
};
