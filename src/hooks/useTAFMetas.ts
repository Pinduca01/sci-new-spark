
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

      if (error) {
        console.error('Erro ao buscar metas TAF:', error);
        throw error;
      }

      // Se não há metas no banco, criar as padrões
      if (!data || data.length === 0) {
        const metasPadrao = [
          {
            faixa_etaria: 'abaixo_40',
            meta_flexoes: 30,
            meta_abdominais: 45,
            meta_polichinelos: 45,
            tempo_limite_minutos: 12
          },
          {
            faixa_etaria: 'acima_40',
            meta_flexoes: 25,
            meta_abdominais: 40,
            meta_polichinelos: 40,
            tempo_limite_minutos: 15
          }
        ];

        const { data: novasMetas, error: insertError } = await supabase
          .from('taf_metas')
          .insert(metasPadrao)
          .select();

        if (insertError) {
          console.error('Erro ao criar metas padrão:', insertError);
          return [];
        }

        return novasMetas || [];
      }

      return data;
    }
  });

  const getMetaPorIdade = (idade: number): TAFMeta | undefined => {
    const faixaEtaria = idade < 40 ? 'abaixo_40' : 'acima_40';
    return metas.find(meta => meta.faixa_etaria === faixaEtaria);
  };

  return {
    metas,
    isLoading,
    error,
    getMetaPorIdade
  };
};
