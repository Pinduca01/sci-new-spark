
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Interfaces para TAF
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
  const { toast } = useToast();

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

      if (error) {
        console.error('Erro ao buscar avaliações TAF:', error);
        throw error;
      }

      return data || [];
    }
  });

  const createAvaliacao = useMutation({
    mutationFn: async (avaliacao: Omit<TAFAvaliacao, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('taf_avaliacoes')
        .insert([avaliacao])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar avaliação TAF:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taf-avaliacoes'] });
      queryClient.invalidateQueries({ queryKey: ['taf-estatisticas'] });
      
      toast({
        title: "Sucesso",
        description: "TAF registrado com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Erro na mutação:', error);
      toast({
        title: "Erro",
        description: "Falha ao registrar TAF. Tente novamente.",
        variant: "destructive",
      });
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

      if (error) {
        console.error('Erro ao atualizar avaliação TAF:', error);
        throw error;
      }

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

      if (error) {
        console.error('Erro ao deletar avaliação TAF:', error);
        throw error;
      }
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
