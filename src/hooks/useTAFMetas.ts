
import { useQuery } from '@tanstack/react-query';

export interface TAFMeta {
  id: string;
  faixa_etaria: string;
  meta_flexoes: number;
  meta_abdominais: number;
  meta_polichinelos: number;
  tempo_limite_minutos: number;
  created_at?: string;
  updated_at?: string;
}

export const useTAFMetas = () => {
  // Dados mockados das metas TAF padrão
  const mockMetas: TAFMeta[] = [
    {
      id: '1',
      faixa_etaria: 'menor_40',
      meta_flexoes: 30,
      meta_abdominais: 45,
      meta_polichinelos: 45,
      tempo_limite_minutos: 12,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      faixa_etaria: 'maior_igual_40',
      meta_flexoes: 25,
      meta_abdominais: 40,
      meta_polichinelos: 40,
      tempo_limite_minutos: 15,
      created_at: new Date().toISOString()
    }
  ];

  const {
    data: metas = mockMetas,
    isLoading,
    error
  } = useQuery({
    queryKey: ['taf-metas'],
    queryFn: async () => {
      // Temporariamente retorna dados mockados
      // Quando a tabela taf_metas for criada, usar:
      // const { data, error } = await supabase.from('taf_metas').select('*').order('faixa_etaria');
      return mockMetas;
    }
  });

  const getMetaPorIdade = (idade: number): TAFMeta | undefined => {
    const faixaEtaria = idade < 40 ? 'menor_40' : 'maior_igual_40';
    return metas.find(meta => meta.faixa_etaria === faixaEtaria);
  };

  return {
    metas,
    isLoading: false, // Desabilitado loading para dados mockados
    error: null,
    getMetaPorIdade
  };
};
