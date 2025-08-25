
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EstatisticaTroca {
  equipe_id: string;
  equipe_nome: string;
  total_trocas: number;
  trocas_pendentes: number;
  trocas_aprovadas: number;
  trocas_rejeitadas: number;
  trocas_concluidas: number;
}

export const useTrocasEstatisticas = (mes: number, ano: number) => {
  const {
    data: estatisticas = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['trocas-estatisticas', mes, ano],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trocas_plantao')
        .select(`
          equipe_id,
          status,
          equipe:equipes(nome_equipe)
        `)
        .eq('mes_referencia', mes)
        .eq('ano_referencia', ano);

      if (error) throw error;

      // Agrupar dados por equipe
      const estatisticasMap = new Map<string, EstatisticaTroca>();

      data.forEach((troca: any) => {
        const equipeId = troca.equipe_id;
        const equipeNome = troca.equipe?.nome_equipe || 'Equipe não informada';
        
        if (!estatisticasMap.has(equipeId)) {
          estatisticasMap.set(equipeId, {
            equipe_id: equipeId,
            equipe_nome: equipeNome,
            total_trocas: 0,
            trocas_pendentes: 0,
            trocas_aprovadas: 0,
            trocas_rejeitadas: 0,
            trocas_concluidas: 0
          });
        }

        const estatistica = estatisticasMap.get(equipeId)!;
        estatistica.total_trocas++;

        switch (troca.status) {
          case 'pendente':
            estatistica.trocas_pendentes++;
            break;
          case 'aprovada':
            estatistica.trocas_aprovadas++;
            break;
          case 'rejeitada':
            estatistica.trocas_rejeitadas++;
            break;
          case 'concluida':
            estatistica.trocas_concluidas++;
            break;
        }
      });

      return Array.from(estatisticasMap.values());
    }
  });

  return {
    estatisticas,
    isLoading,
    error
  };
};
