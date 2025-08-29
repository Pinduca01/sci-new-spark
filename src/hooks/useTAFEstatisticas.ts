import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TAFEstatisticas {
  total_avaliacoes: number;
  taxa_aprovacao: number;
  bombeiros_pendentes: number;
  media_flexoes: number;
  media_abdominais: number;
  media_polichinelos: number;
  tempo_medio_segundos: number;
  avaliacoes_mes_atual: number;
  avaliacoes_mes_anterior: number;
  tendencia_aprovacao: 'subindo' | 'descendo' | 'estavel';
}

export const useTAFEstatisticas = () => {
  const {
    data: estatisticas,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['taf-estatisticas'],
    queryFn: async (): Promise<TAFEstatisticas> => {
      try {
        // Buscar estatísticas usando a função do banco
        const { data: stats, error: statsError } = await supabase
          .rpc('get_taf_estatisticas');

        if (statsError) {
          console.error('Erro ao buscar estatísticas TAF:', statsError);
          throw statsError;
        }

        // Se a função RPC não existir, calcular manualmente
        if (!stats) {
          const { data: avaliacoes, error: avaliacoesError } = await supabase
            .from('taf_avaliacoes')
            .select(`
              *,
              bombeiros!inner(nome, status)
            `);

          if (avaliacoesError) {
            console.error('Erro ao buscar avaliações TAF:', avaliacoesError);
            throw avaliacoesError;
          }

          // Buscar total de bombeiros ativos
          const { data: bombeirosAtivos, error: bombeirosError } = await supabase
            .from('bombeiros')
            .select('id')
            .eq('status', 'ativo');

          if (bombeirosError) {
            console.error('Erro ao buscar bombeiros ativos:', bombeirosError);
            throw bombeirosError;
          }

          const totalAvaliacoes = avaliacoes?.length || 0;
          const aprovados = avaliacoes?.filter(a => a.aprovado).length || 0;
          const taxaAprovacao = totalAvaliacoes > 0 ? (aprovados / totalAvaliacoes) * 100 : 0;
          
          const mediaFlexoes = totalAvaliacoes > 0 
            ? avaliacoes!.reduce((sum, a) => sum + a.flexoes_realizadas, 0) / totalAvaliacoes 
            : 0;
          
          const mediaAbdominais = totalAvaliacoes > 0 
            ? avaliacoes!.reduce((sum, a) => sum + a.abdominais_realizadas, 0) / totalAvaliacoes 
            : 0;
          
          const mediaPolichinelos = totalAvaliacoes > 0 
            ? avaliacoes!.reduce((sum, a) => sum + a.polichinelos_realizados, 0) / totalAvaliacoes 
            : 0;
          
          const tempoMedio = totalAvaliacoes > 0 
            ? avaliacoes!.reduce((sum, a) => sum + a.tempo_total_segundos, 0) / totalAvaliacoes 
            : 0;

          // Calcular avaliações do mês atual e anterior
          const agora = new Date();
          const inicioMesAtual = new Date(agora.getFullYear(), agora.getMonth(), 1);
          const inicioMesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
          const fimMesAnterior = new Date(agora.getFullYear(), agora.getMonth(), 0);

          const avaliacoesMesAtual = avaliacoes?.filter(a => 
            new Date(a.data_teste) >= inicioMesAtual
          ).length || 0;

          const avaliacoesMesAnterior = avaliacoes?.filter(a => {
            const dataAvaliacao = new Date(a.data_teste);
            return dataAvaliacao >= inicioMesAnterior && dataAvaliacao <= fimMesAnterior;
          }).length || 0;

          // Determinar tendência
          let tendencia: 'subindo' | 'descendo' | 'estavel' = 'estavel';
          if (avaliacoesMesAtual > avaliacoesMesAnterior) {
            tendencia = 'subindo';
          } else if (avaliacoesMesAtual < avaliacoesMesAnterior) {
            tendencia = 'descendo';
          }

          // Calcular bombeiros com TAF pendente (sem avaliação nos últimos 12 meses)
          const umAnoAtras = new Date();
          umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1);
          
          const bombeirosComTAFRecente = new Set(
            avaliacoes?.filter(a => new Date(a.data_teste) >= umAnoAtras)
              .map(a => a.bombeiro_id) || []
          );
          
          const bombeirosPendentes = (bombeirosAtivos?.length || 0) - bombeirosComTAFRecente.size;

          return {
            total_avaliacoes: totalAvaliacoes,
            taxa_aprovacao: taxaAprovacao,
            bombeiros_pendentes: Math.max(0, bombeirosPendentes),
            media_flexoes: mediaFlexoes,
            media_abdominais: mediaAbdominais,
            media_polichinelos: mediaPolichinelos,
            tempo_medio_segundos: tempoMedio,
            avaliacoes_mes_atual: avaliacoesMesAtual,
            avaliacoes_mes_anterior: avaliacoesMesAnterior,
            tendencia_aprovacao: tendencia
          };
        }

        return stats;
      } catch (error) {
        console.error('Erro ao processar estatísticas TAF:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  return {
    estatisticas,
    isLoading,
    error,
    refetch
  };
};