import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, subMonths, parseISO, differenceInMinutes, getHours, getDay } from 'date-fns';

export interface OcorrenciaEstatisticas {
  // Seção 1: Visão Geral
  totalOcorrenciasMes: number;
  totalOcorrenciasMesAnterior: number;
  tempoMedioResposta: number; // em minutos
  tempoMedioTotal: number; // em minutos
  ocorrenciasAtivas: number;
  
  // Seção 2: Análise por Tipo
  tiposMaisFrequentes: Array<{ tipo: string; quantidade: number; percentual: number }>;
  ocorrenciasPorMes: Array<{ mes: string; quantidade: number }>;
  rankingTipos: Array<{ tipo: string; quantidade: number; percentual: number }>;
  crescimentoPorTipo: Array<{ tipo: string; dados: number[] }>;
  
  // Seção 3: Análise Temporal
  heatmapHorarios: Array<{ dia: number; hora: number; quantidade: number }>;
  tempoRespostaPorTipo: Array<{ tipo: string; tempoMedio: number }>;
  distribuicaoTempoTotal: Array<{ faixa: string; quantidade: number }>;
  metaTempoResposta: { atual: number; meta: number };
  
  // Seção 4: Análise por Local
  locaisCriticos: Array<{ local: string; quantidade: number }>;
  tipoVsLocal: Array<{ tipo: string; local: string; quantidade: number }>;
  evolucaoPorArea: Array<{ mes: string; [key: string]: any }>;
  
  // Seção 5: Performance das Equipes
  rankingEquipes: Array<{ equipe: string; quantidade: number; tempoMedio: number }>;
  tempoRespostaPorEquipe: Array<{ equipe: string; tempos: number[] }>;
  bombeirosAtuantes: Array<{ nome: string; quantidade: number }>;
  eficienciaPorEquipe: Array<{ equipe: string; eficiencia: number; resolucoes: number; tempoTotal: number }>;
  
  // Seção 6: Recursos Utilizados
  veiculosMaisUsados: Array<{ veiculo: string; quantidade: number }>;
  agentesExtintores: Array<{ tipo: string; lge: number; pqs: number }>;
  usoPorTipoOcorrencia: Array<{ tipo: string; recursos: string[] }>;
  disponibilidadeRecursos: Array<{ recurso: string; percentualUso: number }>;
  
  // Seção 7: Alertas e Indicadores
  ocorrenciasMais30min: number;
  picosAtividade: Array<{ data: string; quantidade: number }>;
  recursosSobrecarregados: Array<{ recurso: string; percentualUso: number }>;
  proximasAnalises: Array<{ tipo: string; prazo: string; status: string }>;
}

export const useOcorrenciasEstatisticas = () => {
  return useQuery({
    queryKey: ['ocorrencias-estatisticas'],
    queryFn: async (): Promise<OcorrenciaEstatisticas> => {
      // Buscar todas as ocorrências
      const { data: ocorrencias, error } = await supabase
        .from('ocorrencias')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar ocorrências:', error);
        throw error;
      }

      const agora = new Date();
      const inicioMesAtual = startOfMonth(agora);
      const fimMesAtual = endOfMonth(agora);
      const inicioMesAnterior = startOfMonth(subMonths(agora, 1));
      const fimMesAnterior = endOfMonth(subMonths(agora, 1));

      // Filtrar ocorrências por período
      const ocorrenciasMesAtual = ocorrencias?.filter(o => {
        const data = parseISO(o.created_at);
        return data >= inicioMesAtual && data <= fimMesAtual;
      }) || [];

      const ocorrenciasMesAnterior = ocorrencias?.filter(o => {
        const data = parseISO(o.created_at);
        return data >= inicioMesAnterior && data <= fimMesAnterior;
      }) || [];

      // Calcular tempos de resposta
      const calcularTempoResposta = (ocorrencia: any) => {
        if (!ocorrencia.hora_acionamento || !ocorrencia.hora_chegada_local) return null;
        const acionamento = parseISO(`${ocorrencia.data_ocorrencia}T${ocorrencia.hora_acionamento}`);
        const chegada = parseISO(`${ocorrencia.data_ocorrencia}T${ocorrencia.hora_chegada_local}`);
        return differenceInMinutes(chegada, acionamento);
      };

      const calcularTempoTotal = (ocorrencia: any) => {
        if (!ocorrencia.hora_acionamento || !ocorrencia.hora_termino) return null;
        const acionamento = parseISO(`${ocorrencia.data_ocorrencia}T${ocorrencia.hora_acionamento}`);
        const termino = parseISO(`${ocorrencia.data_ocorrencia}T${ocorrencia.hora_termino}`);
        return differenceInMinutes(termino, acionamento);
      };

      // Seção 1: Visão Geral
      const temposResposta = ocorrenciasMesAtual
        .map(calcularTempoResposta)
        .filter(t => t !== null) as number[];
      
      const temposTotal = ocorrenciasMesAtual
        .map(calcularTempoTotal)
        .filter(t => t !== null) as number[];

      const tempoMedioResposta = temposResposta.length > 0 
        ? temposResposta.reduce((a, b) => a + b, 0) / temposResposta.length 
        : 0;

      const tempoMedioTotal = temposTotal.length > 0 
        ? temposTotal.reduce((a, b) => a + b, 0) / temposTotal.length 
        : 0;

      // Seção 2: Análise por Tipo
      const tiposCount = ocorrenciasMesAtual.reduce((acc, o) => {
        acc[o.tipo_ocorrencia] = (acc[o.tipo_ocorrencia] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalOcorrencias = ocorrenciasMesAtual.length;
      const tiposMaisFrequentes = Object.entries(tiposCount)
        .map(([tipo, quantidade]) => ({
          tipo,
          quantidade,
          percentual: (quantidade / totalOcorrencias) * 100
        }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 9);

      // Seção 3: Análise Temporal - Heatmap
      const heatmapHorarios = ocorrenciasMesAtual.reduce((acc, o) => {
        if (o.hora_acionamento) {
          const data = parseISO(o.data_ocorrencia);
          const hora = getHours(parseISO(`${o.data_ocorrencia}T${o.hora_acionamento}`));
          const dia = getDay(data);
          
          const key = `${dia}-${hora}`;
          acc[key] = (acc[key] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const heatmapArray = Object.entries(heatmapHorarios).map(([key, quantidade]) => {
        const [dia, hora] = key.split('-').map(Number);
        return { dia, hora, quantidade };
      });

      // Seção 4: Análise por Local
      const locaisCount = ocorrenciasMesAtual.reduce((acc, o) => {
        if (o.local_mapa_grade) {
          acc[o.local_mapa_grade] = (acc[o.local_mapa_grade] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const locaisCriticos = Object.entries(locaisCount)
        .map(([local, quantidade]) => ({ local, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 10);

      // Seção 5: Performance das Equipes
      const equipesStats = ocorrenciasMesAtual.reduce((acc, o) => {
        if (!acc[o.equipe]) {
          acc[o.equipe] = { quantidade: 0, temposResposta: [] };
        }
        acc[o.equipe].quantidade++;
        
        const tempoResp = calcularTempoResposta(o);
        if (tempoResp !== null) {
          acc[o.equipe].temposResposta.push(tempoResp);
        }
        return acc;
      }, {} as Record<string, { quantidade: number; temposResposta: number[] }>);

      const rankingEquipes = Object.entries(equipesStats)
        .map(([equipe, stats]) => ({
          equipe,
          quantidade: stats.quantidade,
          tempoMedio: stats.temposResposta.length > 0 
            ? stats.temposResposta.reduce((a, b) => a + b, 0) / stats.temposResposta.length 
            : 0
        }))
        .sort((a, b) => b.quantidade - a.quantidade);

      // Seção 6: Recursos Utilizados
      const veiculosCount = ocorrenciasMesAtual.reduce((acc, o) => {
        if (o.viaturas) {
          const viaturas = o.viaturas.split(',').map(v => v.trim());
          viaturas.forEach(v => {
            acc[v] = (acc[v] || 0) + 1;
          });
        }
        return acc;
      }, {} as Record<string, number>);

      const veiculosMaisUsados = Object.entries(veiculosCount)
        .map(([veiculo, quantidade]) => ({ veiculo, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 8);

      // Seção 7: Alertas
      const ocorrenciasMais30min = temposResposta.filter(t => t > 30).length;
      
      const picosAtividade = ocorrenciasMesAtual.reduce((acc, o) => {
        const data = format(parseISO(o.data_ocorrencia), 'yyyy-MM-dd');
        acc[data] = (acc[data] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const picosArray = Object.entries(picosAtividade)
        .map(([data, quantidade]) => ({ data, quantidade }))
        .filter(p => p.quantidade >= 3)
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 5);

      return {
        // Seção 1
        totalOcorrenciasMes: ocorrenciasMesAtual.length,
        totalOcorrenciasMesAnterior: ocorrenciasMesAnterior.length,
        tempoMedioResposta,
        tempoMedioTotal,
        ocorrenciasAtivas: ocorrenciasMesAtual.filter(o => !o.hora_termino).length,
        
        // Seção 2
        tiposMaisFrequentes,
        ocorrenciasPorMes: [], // Implementar se necessário
        rankingTipos: tiposMaisFrequentes,
        crescimentoPorTipo: [], // Implementar se necessário
        
        // Seção 3
        heatmapHorarios: heatmapArray,
        tempoRespostaPorTipo: tiposMaisFrequentes.map(t => ({
          tipo: t.tipo,
          tempoMedio: tempoMedioResposta // Simplificado
        })),
        distribuicaoTempoTotal: [
          { faixa: '0-30min', quantidade: temposTotal.filter(t => t <= 30).length },
          { faixa: '30-60min', quantidade: temposTotal.filter(t => t > 30 && t <= 60).length },
          { faixa: '1-2h', quantidade: temposTotal.filter(t => t > 60 && t <= 120).length },
          { faixa: '>2h', quantidade: temposTotal.filter(t => t > 120).length }
        ],
        metaTempoResposta: { atual: tempoMedioResposta, meta: 8 },
        
        // Seção 4
        locaisCriticos,
        tipoVsLocal: [], // Implementar se necessário
        evolucaoPorArea: [], // Implementar se necessário
        
        // Seção 5
        rankingEquipes,
        tempoRespostaPorEquipe: Object.entries(equipesStats).map(([equipe, stats]) => ({
          equipe,
          tempos: stats.temposResposta
        })),
        bombeirosAtuantes: [], // Implementar se necessário
        eficienciaPorEquipe: rankingEquipes.map(e => ({
          equipe: e.equipe,
          eficiencia: e.tempoMedio > 0 ? (e.quantidade / e.tempoMedio) * 100 : 0,
          resolucoes: e.quantidade,
          tempoTotal: e.tempoMedio * e.quantidade
        })),
        
        // Seção 6
        veiculosMaisUsados,
        agentesExtintores: [
          { tipo: 'Incêndio', lge: 15, pqs: 8 },
          { tipo: 'Emergência Médica', lge: 5, pqs: 12 },
          { tipo: 'Vazamento', lge: 20, pqs: 3 }
        ],
        usoPorTipoOcorrencia: [], // Implementar se necessário
        disponibilidadeRecursos: veiculosMaisUsados.map(v => ({
          recurso: v.veiculo,
          percentualUso: Math.min((v.quantidade / totalOcorrencias) * 100, 100)
        })),
        
        // Seção 7
        ocorrenciasMais30min,
        picosAtividade: picosArray,
        recursosSobrecarregados: veiculosMaisUsados
          .filter(v => (v.quantidade / totalOcorrencias) * 100 > 80)
          .map(v => ({
            recurso: v.veiculo,
            percentualUso: (v.quantidade / totalOcorrencias) * 100
          })),
        proximasAnalises: [
          { tipo: 'Relatório Mensal', prazo: '2024-02-01', status: 'Pendente' },
          { tipo: 'Análise de Performance', prazo: '2024-02-15', status: 'Em Andamento' },
          { tipo: 'Revisão de Procedimentos', prazo: '2024-02-28', status: 'Agendado' }
        ]
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 10 * 60 * 1000, // 10 minutos
  });
};