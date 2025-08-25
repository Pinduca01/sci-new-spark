
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type TPVerificacao = {
  id: string;
  equipe_id: string | null;
  base: string;
  mes_referencia: number;
  ano_referencia: number;
  data_verificacao: string;
  tp_conformes: number;
  tp_nao_conformes: number;
  total_verificados: number;
  observacoes?: string;
  responsavel_id?: string;
  responsavel_nome: string;
  created_at: string;
  updated_at: string;
};

export const useTPVerificacoes = () => {
  return useQuery({
    queryKey: ["tp-verificacoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tp_verificacoes")
        .select("*")
        .order("data_verificacao", { ascending: false });

      if (error) throw error;
      return data as TPVerificacao[];
    },
  });
};

export const useCreateTPVerificacao = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<TPVerificacao, "id" | "created_at" | "updated_at">) => {
      const { data: result, error } = await supabase
        .from("tp_verificacoes")
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tp-verificacoes"] });
      toast({
        title: "Verificação de TP registrada",
        description: "A verificação foi salva com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao criar verificação de TP:", error);
      toast({
        title: "Erro",
        description: "Erro ao registrar verificação de TP.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateTPVerificacao = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<TPVerificacao> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("tp_verificacoes")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tp-verificacoes"] });
      toast({
        title: "Verificação atualizada",
        description: "A verificação foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao atualizar verificação:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar verificação.",
        variant: "destructive",
      });
    },
  });
};
