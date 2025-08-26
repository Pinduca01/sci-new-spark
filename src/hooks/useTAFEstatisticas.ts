
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TAFEstatisticas {
  total_avaliacoes: number;
  taxa_aprovacao: number;
  media_flexoes: number;
  media_abdominais: number;
  media_polichinelos: number;
  bombeiros_pendentes: number;
}

export const useTAFEstatisticas = () => {
  const {
    data: estatisticas,
    isLoading,
    error
  } = useQuery({
    queryKey: ['taf-estatisticas'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_taf_estatisticas');

        if (error) {
          console.error('Erro ao buscar estatísticas TAF:', error);
          throw error;
        }

        // A função retorna um array, pegamos o primeiro item
        const stats = data && data.length > 0 ? data[0] : null;

        if (!stats) {
          // Retornar estatísticas zeradas se não há dados
          return {
            total_avaliacoes: 0,
            taxa_aprovacao: 0,
            media_flexoes: 0,
            media_abdominais: 0,
            media_polichinelos: 0,
            bombeiros_pendentes: 0
          } as TAFEstatisticas;
        }

        return stats as TAFEstatisticas;
      } catch (error) {
        console.error('Erro na consulta de estatísticas:', error);
        
        // Fallback: estatísticas zeradas
        return {
          total_avaliacoes: 0,
          taxa_aprovacao: 0,
          media_flexoes: 0,
          media_abdominais: 0,
          media_polichinelos: 0,
          bombeiros_pendentes: 0
        } as TAFEstatisticas;
      }
    }
  });

  return {
    estatisticas,
    isLoading,
    error
  };
};
