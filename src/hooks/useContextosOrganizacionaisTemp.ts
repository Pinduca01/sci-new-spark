
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ContextoOrganizacional {
  id: string;
  nome: string;
  tipo: 'diretoria' | 'secao' | 'equipe' | 'quadrante';
  parent_id: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export const useContextosOrganizacionaisTemp = () => {
  const {
    data: contextos = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['contextos-organizacionais-temp'],
    queryFn: async (): Promise<ContextoOrganizacional[]> => {
      console.log('Fetching contextos organizacionais via RPC...');
      
      try {
        // Tentar usar query direta por enquanto
        const { data, error } = await supabase.rpc('exec', {
          sql: `
            SELECT id, nome, tipo, parent_id, ativo, created_at, updated_at 
            FROM contextos_organizacionais 
            WHERE ativo = true 
            ORDER BY nome
          `
        });
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching contextos:', error);
        // Retornar array vazio em caso de erro para não quebrar a aplicação
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  const getContextosByTipo = (tipo: ContextoOrganizacional['tipo']) => {
    return contextos.filter(contexto => contexto.tipo === tipo);
  };

  const getContextosByParent = (parentId: string) => {
    return contextos.filter(contexto => contexto.parent_id === parentId);
  };

  const getContextoHierarchy = (contextoId: string): ContextoOrganizacional[] => {
    const hierarchy: ContextoOrganizacional[] = [];
    let currentContexto = contextos.find(c => c.id === contextoId);

    while (currentContexto) {
      hierarchy.unshift(currentContexto);
      currentContexto = contextos.find(c => c.id === currentContexto?.parent_id);
    }

    return hierarchy;
  };

  const diretorias = getContextosByTipo('diretoria');
  const secoes = getContextosByTipo('secao');
  const equipes = getContextosByTipo('equipe');
  const quadrantes = getContextosByTipo('quadrante');

  return {
    contextos,
    diretorias,
    secoes,
    equipes,
    quadrantes,
    isLoading,
    error,
    refetch,
    getContextosByTipo,
    getContextosByParent,
    getContextoHierarchy
  };
};
