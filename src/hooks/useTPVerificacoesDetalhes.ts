// Hook temporariamente desabilitado - tabela tp_verificacoes_detalhes foi removida
// Este arquivo será reconfigurado quando o novo checklist for implementado

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type TPVerificacaoDetalhe = {
  id: string;
  tp_verificacao_id: string;
  integrante_id: string;
  item_checklist: number;
  item_descricao: string;
  conforme: boolean | null;
  descricao_nao_conformidade: string | null;
  acao_corretiva: string | null;
  responsavel_acao: string | null;
  status_acao: 'pendente' | 'em_andamento' | 'concluida';
  data_acao: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateTPVerificacaoDetalhe = Omit<TPVerificacaoDetalhe, 'id' | 'created_at' | 'updated_at'>;

export type UpdateTPVerificacaoDetalhe = {
  id: string;
  conforme?: boolean | null;
  descricao_nao_conformidade?: string | null;
  acao_corretiva?: string | null;
  responsavel_acao?: string | null;
  status_acao?: 'pendente' | 'em_andamento' | 'concluida';
  data_acao?: string | null;
};

// Hook temporariamente desabilitado - retorna array vazio
export const useTPVerificacaoDetalhes = (tpVerificacaoId: string | null) => {
  return useQuery({
    queryKey: ['tp-verificacao-detalhes', tpVerificacaoId],
    queryFn: async () => {
      // Retorna array vazio até nova implementação
      return [] as TPVerificacaoDetalhe[];
    },
    enabled: !!tpVerificacaoId,
  });
};

// Hook temporariamente desabilitado
export const useCreateTPVerificacaoDetalhes = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (detalhes: CreateTPVerificacaoDetalhe[]) => {
      // Função desabilitada temporariamente
      throw new Error("Funcionalidade temporariamente indisponível - aguardando nova implementação");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tp-verificacao-detalhes'] });
      toast({
        title: "Detalhes criados",
        description: "Os detalhes da verificação foram criados com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar detalhes",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook temporariamente desabilitado
export const useUpdateTPVerificacaoDetalhe = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateTPVerificacaoDetalhe) => {
      // Função desabilitada temporariamente
      throw new Error("Funcionalidade temporariamente indisponível - aguardando nova implementação");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tp-verificacao-detalhes'] });
      toast({
        title: "Detalhe atualizado",
        description: "O detalhe foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar detalhe",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook temporariamente desabilitado
export const useUpdateTPVerificacaoDetalhesLote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (updates: UpdateTPVerificacaoDetalhe[]) => {
      // Função desabilitada temporariamente
      throw new Error("Funcionalidade temporariamente indisponível - aguardando nova implementação");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tp-verificacao-detalhes'] });
      toast({
        title: "Detalhes atualizados",
        description: "Os detalhes foram atualizados com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar detalhes",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook temporariamente desabilitado
export const useDeleteTPVerificacaoDetalhes = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (tpVerificacaoId: string) => {
      // Função desabilitada temporariamente
      throw new Error("Funcionalidade temporariamente indisponível - aguardando nova implementação");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tp-verificacao-detalhes'] });
      toast({
        title: "Detalhes removidos",
        description: "Os detalhes foram removidos com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover detalhes",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook temporariamente desabilitado
export const useTPVerificacaoEstatisticas = (tpVerificacaoId: string | null) => {
  return useQuery({
    queryKey: ['tp-verificacao-estatisticas', tpVerificacaoId],
    queryFn: async () => {
      // Retorna dados vazios até nova implementação
      return {
        totalIntegrantes: 0,
        estatisticasPorIntegrante: {},
        resumoGeral: {
          totalItens: 0,
          conformes: 0,
          naoConformes: 0,
          naoAvaliados: 0,
          percentualConformidade: 0
        }
      };
    },
    enabled: !!tpVerificacaoId,
  });
};