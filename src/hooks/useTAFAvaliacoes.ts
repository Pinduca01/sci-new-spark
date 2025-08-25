
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TAFAvaliacao {
  id: string;
  bombeiro_id: string;
  data_teste: string;
  idade_na_data: number;
  faixa_etaria: string;
  flexoes_realizadas: number;
  abdominais_realizadas: number;
  polichinelos_realizados: number;
  tempo_limite_minutos: number;
  tempo_total_segundos: number;
  aprovado: boolean;
  avaliador_nome: string;
  observacoes?: string;
  created_at: string;
  updated_at?: string;
}

export const useTAFAvaliacoes = () => {
  const queryClient = useQueryClient();

  const {
    data: avaliacoes = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['taf-avaliacoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('taf_avaliacoes')
        .select('*')
        .order('data_teste', { ascending: false });

      if (error) throw error;
      return data as TAFAvaliacao[];
    }
  });

  const createAvaliacao = useMutation({
    mutationFn: async (avaliacao: Omit<TAFAvaliacao, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('taf_avaliacoes')
        .insert(avaliacao)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taf-avaliacoes'] });
      queryClient.invalidateQueries({ queryKey: ['taf-estatisticas'] });
    }
  });

  const updateAvaliacao = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TAFAvaliacao> & { id: string }) => {
      const { data, error } = await supabase
        .from('taf_avaliacoes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taf-avaliacoes'] });
      queryClient.invalidateQueries({ queryKey: ['taf-estatisticas'] });
    }
  });

  const deleteAvaliacao = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('taf_avaliacoes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taf-avaliacoes'] });
      queryClient.invalidateQueries({ queryKey: ['taf-estatisticas'] });
    }
  });

  return {
    avaliacoes,
    isLoading,
    error,
    createAvaliacao,
    updateAvaliacao,
    deleteAvaliacao
  };
};
