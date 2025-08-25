
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface TrocaPlantao {
  id: string;
  data_servico_trocado: string;
  bombeiro_substituido_id: string;
  bombeiro_substituto_id: string;
  data_servico_pagamento: string;
  equipe_id: string;
  base: string;
  status: 'pendente' | 'aprovada' | 'rejeitada' | 'concluida';
  mes_referencia: number;
  ano_referencia: number;
  observacoes?: string;
  solicitante_id: string;
  created_at: string;
  updated_at: string;
  bombeiro_substituido?: { id: string; nome: string; equipe: string };
  bombeiro_substituto?: { id: string; nome: string; equipe: string };
  solicitante?: { id: string; nome: string; equipe: string };
  equipe?: { id: string; nome_equipe: string; cor_identificacao: string };
}

export interface NovatrocaPlantao {
  data_servico_trocado: string;
  bombeiro_substituido_id: string;
  bombeiro_substituto_id: string;
  data_servico_pagamento: string;
  equipe_id: string;
  base: string;
  mes_referencia: number;
  ano_referencia: number;
  observacoes?: string;
  solicitante_id: string;
}

export const useTrocasPlantao = (mes?: number, ano?: number) => {
  const queryClient = useQueryClient();

  const {
    data: trocas = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['trocas-plantao', mes, ano],
    queryFn: async () => {
      let query = supabase
        .from('trocas_plantao')
        .select(`
          *,
          bombeiro_substituido:bombeiros!bombeiro_substituido_id(id, nome, equipe),
          bombeiro_substituto:bombeiros!bombeiro_substituto_id(id, nome, equipe),
          solicitante:bombeiros!solicitante_id(id, nome, equipe),
          equipe:equipes(id, nome_equipe, cor_identificacao)
        `)
        .order('created_at', { ascending: false });

      if (mes && ano) {
        query = query
          .eq('mes_referencia', mes)
          .eq('ano_referencia', ano);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as TrocaPlantao[];
    }
  });

  const createTrocaMutation = useMutation({
    mutationFn: async (novaTroca: NovatrocaPlantao) => {
      const { data, error } = await supabase
        .from('trocas_plantao')
        .insert([novaTroca])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trocas-plantao'] });
      queryClient.invalidateQueries({ queryKey: ['trocas-estatisticas'] });
      toast({
        title: "Sucesso",
        description: "Troca de plantão registrada com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao registrar troca",
        variant: "destructive",
      });
    }
  });

  const updateTrocaMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TrocaPlantao> }) => {
      const { data, error } = await supabase
        .from('trocas_plantao')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trocas-plantao'] });
      queryClient.invalidateQueries({ queryKey: ['trocas-estatisticas'] });
      toast({
        title: "Sucesso",
        description: "Troca atualizada com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar troca",
        variant: "destructive",
      });
    }
  });

  const deleteTrocaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('trocas_plantao')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trocas-plantao'] });
      queryClient.invalidateQueries({ queryKey: ['trocas-estatisticas'] });
      toast({
        title: "Sucesso",
        description: "Troca removida com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover troca",
        variant: "destructive",
      });
    }
  });

  return {
    trocas,
    isLoading,
    error,
    createTroca: createTrocaMutation.mutate,
    updateTroca: updateTrocaMutation.mutate,
    deleteTroca: deleteTrocaMutation.mutate,
    isCreating: createTrocaMutation.isPending,
    isUpdating: updateTrocaMutation.isPending,
    isDeleting: deleteTrocaMutation.isPending
  };
};
