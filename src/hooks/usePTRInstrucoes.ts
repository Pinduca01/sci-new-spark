
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PTRInstrucao {
  id: string;
  data: string;
  hora: string;
  tipo: string;
  titulo: string;
  instrutor_id?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface NovaInstrucao {
  data: string;
  hora: string;
  tipo: string;
  instrutor_id?: string;
  observacoes?: string;
}

export const usePTRInstrucoes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar todas as instruções
  const {
    data: instrucoes = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['ptr-instrucoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ptr_instrucoes')
        .select(`
          *,
          bombeiros!ptr_instrucoes_instrutor_id_fkey(nome, funcao)
        `)
        .order('data', { ascending: false })
        .order('hora', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  // Buscar instruções por data
  const buscarInstrucoesPorData = async (data: string) => {
    const { data: result, error } = await supabase
      .from('ptr_instrucoes')
      .select(`
        *,
        bombeiros!ptr_instrucoes_instrutor_id_fkey(nome, funcao),
        ptr_participantes(
          id,
          bombeiro_id,
          presente,
          observacoes,
          bombeiros!ptr_participantes_bombeiro_id_fkey(nome, funcao)
        )
      `)
      .eq('data', data)
      .order('hora', { ascending: true });

    if (error) throw error;
    return result;
  };

  // Criar nova instrução
  const criarInstrucao = useMutation({
    mutationFn: async (novaInstrucao: NovaInstrucao) => {
      const instrucaoParaDB = {
        ...novaInstrucao,
        titulo: novaInstrucao.tipo // Use tipo como titulo
      };
      
      const { data, error } = await supabase
        .from('ptr_instrucoes')
        .insert(instrucaoParaDB)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ptr-instrucoes'] });
      toast({
        title: "Sucesso",
        description: "Instrução PTR-BA criada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar instrução: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Atualizar instrução
  const atualizarInstrucao = useMutation({
    mutationFn: async ({ id, dados }: { id: string; dados: Partial<NovaInstrucao> }) => {
      const { data, error } = await supabase
        .from('ptr_instrucoes')
        .update(dados)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ptr-instrucoes'] });
      toast({
        title: "Sucesso",
        description: "Instrução atualizada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar instrução: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Deletar instrução
  const deletarInstrucao = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ptr_instrucoes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ptr-instrucoes'] });
      toast({
        title: "Sucesso",
        description: "Instrução deletada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao deletar instrução: " + error.message,
        variant: "destructive",
      });
    }
  });

  return {
    instrucoes,
    isLoading,
    error,
    buscarInstrucoesPorData,
    criarInstrucao,
    atualizarInstrucao,
    deletarInstrucao
  };
};
