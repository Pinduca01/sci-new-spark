
import { useMemo } from 'react';
import { DashboardStats } from './useDashboardStats';

interface Insight {
  tipo: 'comparativo' | 'alerta' | 'recomendacao' | 'sucesso';
  titulo: string;
  descricao: string;
  valor?: string;
  tendencia?: 'positiva' | 'negativa' | 'neutra';
  prioridade?: 'alta' | 'media' | 'baixa';
}

export const useInsights = (dados: DashboardStats, mesAnterior?: DashboardStats): Insight[] => {
  return useMemo(() => {
    const insights: Insight[] = [];

    // Insights de Ocorrências
    if (mesAnterior) {
      const diferencaOcorrencias = dados.ocorrencias.total_ocorrencias - mesAnterior.ocorrencias.total_ocorrencias;
      if (diferencaOcorrencias !== 0) {
        insights.push({
          tipo: 'comparativo',
          titulo: 'Comparativo de Ocorrências',
          descricao: `Este mês tivemos ${Math.abs(diferencaOcorrencias)} ${diferencaOcorrencias > 0 ? 'ocorrências a mais' : 'ocorrências a menos'} que o mês anterior`,
          valor: `${diferencaOcorrencias > 0 ? '+' : ''}${diferencaOcorrencias}`,
          tendencia: diferencaOcorrencias > 0 ? 'negativa' : 'positiva',
          prioridade: Math.abs(diferencaOcorrencias) > 5 ? 'alta' : 'media'
        });
      }
    }

    // Insights de TAF
    if (dados.taf?.taxa_aprovacao) {
      if (dados.taf.taxa_aprovacao >= 85) {
        insights.push({
          tipo: 'sucesso',
          titulo: 'Excelente Performance TAF',
          descricao: 'Taxa de aprovação acima da meta de 85%. Parabéns à equipe!',
          valor: `${dados.taf.taxa_aprovacao.toFixed(1)}%`,
          prioridade: 'baixa'
        });
      } else if (dados.taf.taxa_aprovacao < 70) {
        insights.push({
          tipo: 'alerta',
          titulo: 'Taxa TAF Baixa',
          descricao: 'Taxa de aprovação abaixo de 70%. Considere intensificar os treinamentos.',
          valor: `${dados.taf.taxa_aprovacao.toFixed(1)}%`,
          prioridade: 'alta'
        });
      }
    }

    // Insights de Viaturas
    const viaturasProblemas = dados.viaturas.total_viaturas - dados.viaturas.viaturas_operacionais;
    if (viaturasProblemas > 0) {
      insights.push({
        tipo: 'alerta',
        titulo: 'Viaturas em Manutenção',
        descricao: `${viaturasProblemas} ${viaturasProblemas === 1 ? 'viatura precisa' : 'viaturas precisam'} de atenção para manter a frota operacional`,
        valor: `${viaturasProblemas}`,
        prioridade: viaturasProblemas > 2 ? 'alta' : 'media'
      });
    }

    // Insights de Agentes Extintores
    if (dados.agentes_extintores.vencimento_proximo > 0) {
      const percentualVencimento = (dados.agentes_extintores.vencimento_proximo / (dados.agentes_extintores.total_lge + dados.agentes_extintores.total_pqs)) * 100;
      
      if (percentualVencimento > 20) {
        insights.push({
          tipo: 'alerta',
          titulo: 'Agentes Extintores Vencendo',
          descricao: `${dados.agentes_extintores.vencimento_proximo} agentes extintores com vencimento próximo (30 dias)`,
          valor: `${percentualVencimento.toFixed(0)}%`,
          prioridade: percentualVencimento > 50 ? 'alta' : 'media'
        });
      }
    }

    // Insights de PTR
    if (dados.ptr.total_horas_treinamento > 0) {
      if (dados.ptr.total_horas_treinamento >= 40) {
        insights.push({
          tipo: 'sucesso',
          titulo: 'Meta PTR Atingida',
          descricao: 'Horas de treinamento PTR superaram a meta mensal. Excelente dedicação!',
          valor: `${dados.ptr.total_horas_treinamento}h`,
          prioridade: 'baixa'
        });
      }
    }

    // Recomendações
    if (dados.ptr.participacao_media < 8) {
      insights.push({
        tipo: 'recomendacao',
        titulo: 'Melhorar Participação PTR',
        descricao: 'Participação média nas instruções PTR está baixa. Considere revisar horários e metodologia.',
        valor: `${dados.ptr.participacao_media.toFixed(1)} bombeiros`,
        prioridade: 'media'
      });
    }

    return insights.slice(0, 6); // Limita a 6 insights mais relevantes
  }, [dados, mesAnterior]);
};
