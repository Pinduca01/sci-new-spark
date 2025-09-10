import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TAFAvaliacao {
  id: string;
  bombeiro_id: string;
  data_teste: string;
  avaliador_nome: string;
  faixa_etaria: string;
  idade_na_data: number;
  flexoes_realizadas: number;
  abdominais_realizadas: number;
  polichinelos_realizados: number;
  tempo_total_segundos: number;
  tempo_limite_minutos: number;
  aprovado: boolean;
  observacoes?: string;
  equipe?: string;
  tipo_avaliacao?: string;
  created_at?: string;
  updated_at?: string;
  bombeiros?: {
    nome: string;
    email: string;
    funcao: string;
    equipe: string;
  };
}

export interface NovaAvaliacaoTAF {
  bombeiro_id: string;
  data_teste: string;
  avaliador_nome: string;
  faixa_etaria: string;
  idade_na_data: number;
  flexoes_realizadas: number;
  abdominais_realizadas: number;
  polichinelos_realizados: number;
  tempo_total_segundos: number;
  tempo_limite_minutos: number;
  aprovado: boolean;
  observacoes?: string;
  equipe?: string;
  tipo_avaliacao?: string;
}

export const useTAFAvaliacoes = () => {
  const queryClient = useQueryClient();

  // Buscar todas as avaliações
  const {
    data: avaliacoes = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['taf-avaliacoes'],
    queryFn: async (): Promise<TAFAvaliacao[]> => {
      console.log('🔍 Buscando avaliações TAF do banco de dados...');
      
      const { data, error } = await supabase
        .from('taf_avaliacoes')
        .select(`
          *,
          bombeiros!inner(
            nome,
            email,
            funcao,
            equipe
          )
        `)
        .order('data_teste', { ascending: false });

      if (error) {
        console.error('Erro ao buscar avaliações TAF:', error);
        throw error;
      }

      console.log('📊 Avaliações carregadas:', {
        total: data?.length || 0,
        equipes: [...new Set(data?.map(a => a.equipe) || [])],
        datas: [...new Set(data?.map(a => a.data_teste) || [])]
      });
      
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // Buscar avaliação por ID
  const buscarPorId = useMutation({
    mutationFn: async (id: string): Promise<TAFAvaliacao | null> => {
      const { data, error } = await supabase
        .from('taf_avaliacoes')
        .select(`
          *,
          bombeiros!inner(
            nome,
            email,
              funcao,
            equipe
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar avaliação TAF:', error);
        throw error;
      }

      return data;
    },
  });

  // Buscar avaliações por bombeiro
  const buscarPorBombeiro = (bombeiroId: string) => {
    return useQuery({
      queryKey: ['taf-avaliacoes-bombeiro', bombeiroId],
      queryFn: async (): Promise<TAFAvaliacao[]> => {
        const { data, error } = await supabase
          .from('taf_avaliacoes')
          .select(`
            *,
            bombeiros!inner(
              nome,
              email,
              funcao,
              equipe
            )
          `)
          .eq('bombeiro_id', bombeiroId)
          .order('data_teste', { ascending: false });

        if (error) {
          console.error('Erro ao buscar avaliações do bombeiro:', error);
          throw error;
        }

        return data || [];
      },
      enabled: !!bombeiroId,
    });
  };

  // Criar nova avaliação
  const criarAvaliacao = useMutation({
    mutationFn: async (novaAvaliacao: NovaAvaliacaoTAF): Promise<TAFAvaliacao> => {
      const { data, error } = await supabase
        .from('taf_avaliacoes')
        .insert([novaAvaliacao])
        .select(`
          *,
          bombeiros!inner(
            nome,
            email,
            funcao,
            equipe
          )
        `)
        .single();

      if (error) {
        console.error('Erro ao criar avaliação TAF:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['taf-avaliacoes'] });
      queryClient.invalidateQueries({ queryKey: ['taf-estatisticas'] });
      queryClient.invalidateQueries({ queryKey: ['taf-avaliacoes-bombeiro', data.bombeiro_id] });
      toast.success('Avaliação TAF criada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar avaliação:', error);
      toast.error('Erro ao criar avaliação TAF');
    },
  });

  // Atualizar avaliação
  const atualizarAvaliacao = useMutation({
    mutationFn: async ({ id, dados }: { id: string; dados: Partial<NovaAvaliacaoTAF> }): Promise<TAFAvaliacao> => {
      const { data, error } = await supabase
        .from('taf_avaliacoes')
        .update({ ...dados, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
          *,
          bombeiros!inner(
            nome,
            email,
            funcao,
            equipe
          )
        `)
        .single();

      if (error) {
        console.error('Erro ao atualizar avaliação TAF:', error);
        throw error;
      }

      return data;
    },
    onSuccess: async (data) => {
      console.log('✅ Avaliação atualizada com sucesso:', {
        id: data.id,
        bombeiro_id: data.bombeiro_id,
        equipe: data.equipe,
        data_teste: data.data_teste
      });
      
      // Aguardar a invalidação das queries para garantir que os dados sejam recarregados
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['taf-avaliacoes'] }),
        queryClient.invalidateQueries({ queryKey: ['taf-estatisticas'] }),
        queryClient.invalidateQueries({ queryKey: ['taf-avaliacao', data.id] }),
        queryClient.invalidateQueries({ queryKey: ['taf-avaliacoes-bombeiro', data.bombeiro_id] })
      ]);
      
      console.log('🔄 Queries invalidadas, dados devem ser recarregados');
      toast.success('Avaliação TAF atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar avaliação:', error);
      toast.error('Erro ao atualizar avaliação TAF');
    },
  });

  // Excluir avaliação
  const excluirAvaliacao = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('taf_avaliacoes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir avaliação TAF:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taf-avaliacoes'] });
      queryClient.invalidateQueries({ queryKey: ['taf-estatisticas'] });
      toast.success('Avaliação TAF excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir avaliação:', error);
      toast.error('Erro ao excluir avaliação TAF');
    },
  });

  return {
    avaliacoes,
    isLoading,
    error,
    refetch,
    buscarPorId,
    buscarPorBombeiro,
    criarAvaliacao,
    atualizarAvaliacao,
    excluirAvaliacao,
    isCreating: criarAvaliacao.isPending,
    isUpdating: atualizarAvaliacao.isPending,
    isDeleting: excluirAvaliacao.isPending,
  };
};