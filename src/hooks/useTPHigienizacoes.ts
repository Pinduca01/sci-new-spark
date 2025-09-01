
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type TPHigienizacao = {
  id: string;
  equipe_id?: string | null;
  base: string;
  mes_referencia: number;
  ano_referencia: number;
  data_higienizacao: string;
  quantidade_higienizada: number;
  quantidade_total: number;
  tipo_higienizacao: string;
  observacoes?: string;
  responsavel_id?: string;
  responsavel_nome: string;
  created_at: string;
  updated_at: string;
};

export const useTPHigienizacoes = () => {
  return useQuery({
    queryKey: ["tp-higienizacoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tp_higienizacoes")
        .select("*")
        .order("data_higienizacao", { ascending: false });

      if (error) throw error;
      return data as TPHigienizacao[];
    },
  });
};

export const useCreateTPHigienizacao = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<TPHigienizacao, "id" | "created_at" | "updated_at">) => {
      const { data: result, error } = await supabase
        .from("tp_higienizacoes")
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tp-higienizacoes"] });
      toast({
        title: "Higienização registrada",
        description: "A higienização foi salva com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao criar higienização:", error);
      toast({
        title: "Erro",
        description: "Erro ao registrar higienização.",
        variant: "destructive",
      });
    },
  });
};
