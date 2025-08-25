
import { useQuery } from '@tanstack/react-query';

export interface TAFEstatisticas {
  total_avaliacoes: number;
  taxa_aprovacao: number;
  media_flexoes: number;
  media_abdominais: number;
  media_polichinelos: number;
  bombeiros_pendentes: number;
}

export const useTAFEstatisticas = () => {
  // Dados mockados das estatísticas
  const mockEstatisticas: TAFEstatisticas = {
    total_avaliacoes: 0,
    taxa_aprovacao: 0,
    media_flexoes: 0,
    media_abdominais: 0,
    media_polichinelos: 0,
    bombeiros_pendentes: 0
  };

  const {
    data: estatisticas,
    isLoading,
    error
  } = useQuery({
    queryKey: ['taf-estatisticas'],
    queryFn: async () => {
      // Temporariamente retorna dados mockados
      // Quando a função get_taf_estatisticas for criada, usar:
      // const { data, error } = await supabase.rpc('get_taf_estatisticas');
      return mockEstatisticas;
    }
  });

  return {
    estatisticas,
    isLoading: false, // Desabilitado loading para dados mockados
    error: null
  };
};
