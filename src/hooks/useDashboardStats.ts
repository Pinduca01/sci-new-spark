
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTAFEstatisticas } from './useTAFEstatisticas';
import { useTrocasEstatisticas } from './useTrocasEstatisticas';

export interface OcorrenciaStats {
  total_ocorrencias: number;
  ocorrencias_aeronauticas: number;
  ocorrencias_nao_aeronauticas: number;
  tempo_medio_resposta: number;
  ocorrencias_mes_atual: number;
  tendencia_mensal: number;
}

export interface PTRStats {
  total_horas_treinamento: number;
  instrucoes_realizadas: number;
  participacao_media: number;
  bombeiros_treinados: number;
}

export interface ViaturasStats {
  total_viaturas: number;
  checklists_realizados: number;
  nao_conformidades: number;
  viaturas_operacionais: number;
  proximas_manutencoes: number;
}

export interface DashboardStats {
  ocorrencias: OcorrenciaStats;
  ptr: PTRStats;
  viaturas: ViaturasStats;
  agentes_extintores: {
    total_lge: number;
    total_pqs: number;
    vencimento_proximo: number;
    disponivel_uso: number;
  };
  tp_uniformes: {
    verificacoes_mes: number;
    conformidade_percentual: number;
    higienizacoes_realizadas: number;
  };
  taf: any;
  trocas: any[];
}

export const useDashboardStats = (mes: number, ano: number) => {
  const { estatisticas: tafStats } = useTAFEstatisticas();
  const { estatisticas: trocasStats } = useTrocasEstatisticas(mes, ano);

  // Estatísticas de Ocorrências
  const { data: ocorrenciasStats } = useQuery({
    queryKey: ['dashboard-ocorrencias', mes, ano],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ocorrencias')
        .select('*')
        .gte('data_ocorrencia', `${ano}-01-01`)
        .lte('data_ocorrencia', `${ano}-12-31`);

      if (error) throw error;

      const currentMonth = data?.filter(o => {
        const date = new Date(o.data_ocorrencia);
        return date.getMonth() + 1 === mes && date.getFullYear() === ano;
      }) || [];

      const aeronauticas = data?.filter(o => 
        o.tipo_ocorrencia?.toLowerCase().includes('aeronáutic') || 
        o.tipo_ocorrencia?.toLowerCase().includes('aeronautic')
      ).length || 0;

      const tempoMedio = data?.reduce((acc, curr) => {
        return acc + (curr.tempo_gasto_minutos || 0);
      }, 0) / (data?.length || 1);

      return {
        total_ocorrencias: data?.length || 0,
        ocorrencias_aeronauticas: aeronauticas,
        ocorrencias_nao_aeronauticas: (data?.length || 0) - aeronauticas,
        tempo_medio_resposta: Math.round(tempoMedio),
        ocorrencias_mes_atual: currentMonth.length,
        tendencia_mensal: currentMonth.length - (currentMonth.length * 0.8)
      } as OcorrenciaStats;
    }
  });

  // Estatísticas PTR
  const { data: ptrStats } = useQuery({
    queryKey: ['dashboard-ptr', mes, ano],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ptr_instrucoes')
        .select(`
          *,
          ptr_participantes(*)
        `)
        .gte('data', `${ano}-${mes.toString().padStart(2, '0')}-01`)
        .lte('data', `${ano}-${mes.toString().padStart(2, '0')}-31`);

      if (error) throw error;

      const totalParticipantes = data?.reduce((acc, instrucao) => {
        return acc + (instrucao.ptr_participantes?.length || 0);
      }, 0) || 0;

      return {
        total_horas_treinamento: (data?.length || 0) * 2, // Estimativa de 2h por instrução
        instrucoes_realizadas: data?.length || 0,
        participacao_media: totalParticipantes / Math.max(data?.length || 1, 1),
        bombeiros_treinados: totalParticipantes
      } as PTRStats;
    }
  });

  // Estatísticas de Viaturas
  const { data: viaturasStats } = useQuery({
    queryKey: ['dashboard-viaturas', mes, ano],
    queryFn: async () => {
      const [checklists, ordens] = await Promise.all([
        supabase
          .from('checklists_viaturas')
          .select('*, viaturas(*)')
          .gte('data_checklist', `${ano}-${mes.toString().padStart(2, '0')}-01`)
          .lte('data_checklist', `${ano}-${mes.toString().padStart(2, '0')}-31`),
        supabase
          .from('ordens_servico')
          .select('*')
          .eq('status', 'aberta')
      ]);

      const naoConformidades = checklists.data?.filter(c => 
        (c as any).itens_checklist && (c as any).itens_checklist.some((item: any) => item.status === 'nao_conforme')
      ).length || 0;

      return {
        total_viaturas: 6, // Valor fixo baseado no dashboard atual
        checklists_realizados: checklists.data?.length || 0,
        nao_conformidades: naoConformidades,
        viaturas_operacionais: 6 - naoConformidades,
        proximas_manutencoes: ordens.data?.length || 0
      } as ViaturasStats;
    }
  });

  // Estatísticas de Agentes Extintores
  const { data: agentesStats } = useQuery({
    queryKey: ['dashboard-agentes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agentes_extintores_controle')
        .select('*');

      if (error) throw error;

      const lge = data?.filter(a => a.tipo_agente === 'LGE').length || 0;
      const pqs = data?.filter(a => a.tipo_agente === 'PQS').length || 0;
      const vencimentoProximo = data?.filter(a => {
        const vencimento = new Date(a.data_vencimento);
        const hoje = new Date();
        const diasAteVencimento = (vencimento.getTime() - hoje.getTime()) / (1000 * 3600 * 24);
        return diasAteVencimento <= 30 && diasAteVencimento > 0;
      }).length || 0;

      const disponivelUso = data?.filter(a => a.status_uso === 'disponivel').length || 0;

      return {
        total_lge: lge,
        total_pqs: pqs,
        vencimento_proximo: vencimentoProximo,
        disponivel_uso: disponivelUso
      };
    }
  });

  // Estatísticas de TP e Uniformes
  const { data: tpStats } = useQuery({
    queryKey: ['dashboard-tp', mes, ano],
    queryFn: async () => {
      const [verificacoes, higienizacoes] = await Promise.all([
        supabase
          .from('tp_verificacoes')
          .select('*')
          .eq('mes_referencia', mes)
          .eq('ano_referencia', ano),
        supabase
          .from('tp_higienizacoes')
          .select('*')
          .eq('mes_referencia', mes)
          .eq('ano_referencia', ano)
      ]);

      const totalVerificacoes = verificacoes.data?.reduce((acc, v) => acc + v.total_verificados, 0) || 0;
      const totalConformes = verificacoes.data?.reduce((acc, v) => acc + v.tp_conformes, 0) || 0;
      const conformidadePercentual = totalVerificacoes > 0 ? (totalConformes / totalVerificacoes) * 100 : 0;

      const totalHigienizacoes = higienizacoes.data?.reduce((acc, h) => acc + h.quantidade_higienizada, 0) || 0;

      return {
        verificacoes_mes: totalVerificacoes,
        conformidade_percentual: Math.round(conformidadePercentual),
        higienizacoes_realizadas: totalHigienizacoes
      };
    }
  });

  return {
    ocorrencias: ocorrenciasStats || {
      total_ocorrencias: 0,
      ocorrencias_aeronauticas: 0,
      ocorrencias_nao_aeronauticas: 0,
      tempo_medio_resposta: 0,
      ocorrencias_mes_atual: 0,
      tendencia_mensal: 0
    },
    ptr: ptrStats || {
      total_horas_treinamento: 0,
      instrucoes_realizadas: 0,
      participacao_media: 0,
      bombeiros_treinados: 0
    },
    viaturas: viaturasStats || {
      total_viaturas: 6,
      checklists_realizados: 0,
      nao_conformidades: 0,
      viaturas_operacionais: 6,
      proximas_manutencoes: 0
    },
    agentes_extintores: agentesStats || {
      total_lge: 0,
      total_pqs: 0,
      vencimento_proximo: 0,
      disponivel_uso: 0
    },
    tp_uniformes: tpStats || {
      verificacoes_mes: 0,
      conformidade_percentual: 0,
      higienizacoes_realizadas: 0
    },
    taf: tafStats,
    trocas: trocasStats
  };
};
