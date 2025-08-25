
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type EPIDistribuicao = {
  id: string;
  bombeiro_id?: string;
  bombeiro_nome: string;
  equipe_id?: string;
  tipo_item: string;
  item_descricao: string;
  quantidade_prevista: number;
  quantidade_entregue: number;
  data_entrega?: string;
  mes_referencia: number;
  ano_referencia: number;
  observacoes?: string;
  responsavel_entrega_id?: string;
  responsavel_entrega_nome?: string;
  created_at: string;
  updated_at: string;
};

export const useEPIsDistribuicao = () => {
  return useQuery({
    queryKey: ["epis-distribuicao"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("epis_uniformes_distribuicao")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as EPIDistribuicao[];
    },
  });
};

export const useCreateEPIDistribuicao = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<EPIDistribuicao, "id" | "created_at" | "updated_at">) => {
      const { data: result, error } = await supabase
        .from("epis_uniformes_distribuicao")
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["epis-distribuicao"] });
      toast({
        title: "Distribuição registrada",
        description: "A distribuição foi salva com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao criar distribuição:", error);
      toast({
        title: "Erro",
        description: "Erro ao registrar distribuição.",
        variant: "destructive",
      });
    },
  });
};
