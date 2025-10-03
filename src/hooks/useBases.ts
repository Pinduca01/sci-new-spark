import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Base {
  id: string;
  nome: string;
  endereco: string;
  ativa: boolean;
}

export const useBases = () => {
  return useQuery({
    queryKey: ['bases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bases')
        .select('id, nome, endereco, ativa')
        .eq('ativa', true)
        .order('nome');
      
      if (error) throw error;
      return data as Base[];
    },
  });
};
