import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Equipe {
  id: string;
  nome_equipe: string;
  cor_identificacao: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

export const useEquipes = () => {
  return useQuery({
    queryKey: ['equipes'],
    queryFn: async (): Promise<Equipe[]> => {
      const { data, error } = await supabase
        .from('equipes')
        .select('*')
        .eq('ativa', true)
        .order('nome_equipe');

      if (error) {
        throw new Error(`Erro ao carregar equipes: ${error.message}`);
      }

      return data || [];
    },
  });
};