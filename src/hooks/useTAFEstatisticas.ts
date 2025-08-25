
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
      const { data, error } = await supabase
        .rpc('get_taf_estatisticas');

      if (error) throw error;
      return data[0] as TAFEstatisticas;
    }
  });

  return {
    estatisticas,
    isLoading,
    error
  };
};
