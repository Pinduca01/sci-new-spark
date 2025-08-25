
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  const {
    data: metas = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['taf-metas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('taf_metas')
        .select('*')
        .order('faixa_etaria');

      if (error) throw error;
      return data as TAFMeta[];
    }
  });

  const getMetaPorIdade = (idade: number): TAFMeta | undefined => {
    const faixaEtaria = idade < 40 ? 'menor_40' : 'maior_igual_40';
    return metas.find(meta => meta.faixa_etaria === faixaEtaria);
  };

  return {
    metas,
    isLoading,
    error,
    getMetaPorIdade
  };
};
