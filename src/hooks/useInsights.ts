
import { useMemo } from 'react';
import { DashboardStats, useDashboardStats } from './useDashboardStats';

interface Insight {
  tipo: 'comparativo' | 'alerta' | 'recomendacao' | 'sucesso';
  titulo: string;
  descricao: string;
  valor?: string;
  tendencia?: 'positiva' | 'negativa' | 'neutra';
  prioridade?: 'alta' | 'media' | 'baixa';
}

// Sobrecarga para uso sem parâmetros (usa dados atuais)
export function useInsights(): {
  insights: Insight[];
  loading: boolean;
};

// Sobrecarga para uso com parâmetros específicos
export function useInsights(dados: DashboardStats): Insight[];

// Implementação
export function useInsights(dados?: DashboardStats): any {
  // Se não foram fornecidos dados, busca dados atuais
  const shouldReturnWithLoading = dados === undefined;
  
  // Hook para buscar dados quando não fornecidos
  const currentDate = new Date();
  const currentMes = currentDate.getMonth() + 1;
  const currentAno = currentDate.getFullYear();
  
  // Usar useDashboardStats quando necessário
  const currentData = shouldReturnWithLoading ? useDashboardStats(currentMes, currentAno) : dados;
  const mesAnterior = undefined; // Para manter compatibilidade
  return useMemo(() => {
    const insights: Insight[] = [];

    // Verificação de segurança para dados
    if (!currentData) {
      if (shouldReturnWithLoading) {
        return { insights: [], loading: true };
      }
      return insights;
    }

    // Insights de Ocorrências - com verificação de segurança
    if (mesAnterior && currentData.ocorrencias && mesAnterior.ocorrencias) {
      const variacaoOcorrencias = currentData.ocorrencias.ocorrencias_mes_atual - mesAnterior.ocorrencias.ocorrencias_mes_atual;
      if (variacaoOcorrencias > 5) {
        insights.push({
          tipo: 'alerta',
          titulo: 'Aumento de Ocorrências',
          descricao: `Aumento de ${variacaoOcorrencias} ocorrências em relação ao mês anterior.`,
          valor: `+${variacaoOcorrencias}`,
          prioridade: 'alta'
        });
      }
    }

    // Insights de TAF - com verificação de segurança
    if (currentData.taf && typeof currentData.taf === 'object' && currentData.taf.taxa_aprovacao !== undefined) {
      if (currentData.taf.taxa_aprovacao >= 85) {
        insights.push({
          tipo: 'sucesso',
          titulo: 'Excelente Performance TAF',
          descricao: 'Taxa de aprovação acima da meta de 85%. Parabéns à equipe!',
          valor: `${currentData.taf.taxa_aprovacao.toFixed(1)}%`,
          prioridade: 'baixa'
        });
      } else if (currentData.taf.taxa_aprovacao < 70) {
        insights.push({
          tipo: 'alerta',
          titulo: 'Taxa TAF Baixa',
          descricao: 'Taxa de aprovação abaixo de 70%. Considere intensificar os treinamentos.',
          valor: `${currentData.taf.taxa_aprovacao.toFixed(1)}%`,
          prioridade: 'alta'
        });
      }
    }

    // Insights de Viaturas - com verificação de segurança
    if (currentData.viaturas) {
      const { total_viaturas, viaturas_operacionais } = currentData.viaturas;
      if (total_viaturas && viaturas_operacionais !== undefined) {
        const percentualOperacional = (viaturas_operacionais / total_viaturas) * 100;
        if (percentualOperacional < 80) {
          insights.push({
            tipo: 'alerta',
            titulo: 'Viaturas com Baixa Operacionalidade',
            descricao: `Apenas ${percentualOperacional.toFixed(1)}% das viaturas estão operacionais.`,
            valor: `${viaturas_operacionais}/${total_viaturas}`,
            prioridade: 'alta'
          });
        }
      }
    }

    // Insights de Agentes Extintores - com verificação de segurança
    if (currentData.agentes_extintores && currentData.agentes_extintores.vencimento_proximo > 0) {
      const totalAgentes = (currentData.agentes_extintores.total_lge || 0) + (currentData.agentes_extintores.total_pqs || 0);
      if (totalAgentes > 0) {
        const percentualVencimento = (currentData.agentes_extintores.vencimento_proximo / totalAgentes) * 100;
        
        if (percentualVencimento > 20) {
          insights.push({
            tipo: 'alerta',
            titulo: 'Agentes Extintores Vencendo',
            descricao: `${currentData.agentes_extintores.vencimento_proximo} agentes extintores com vencimento próximo (30 dias)`,
            valor: `${percentualVencimento.toFixed(0)}%`,
            prioridade: percentualVencimento > 50 ? 'alta' : 'media'
          });
        }
      }
    }

    // Insights de PTR - com verificação de segurança
    if (currentData.ptr && currentData.ptr.total_horas_treinamento !== undefined) {
      if (currentData.ptr.total_horas_treinamento > 0 && currentData.ptr.total_horas_treinamento >= 40) {
        insights.push({
          tipo: 'sucesso',
          titulo: 'Meta PTR Atingida',
          descricao: 'Horas de treinamento PTR superaram a meta mensal. Excelente dedicação!',
          valor: `${currentData.ptr.total_horas_treinamento}h`,
          prioridade: 'baixa'
        });
      }
    }

    // Recomendações - com verificação de segurança
    if (currentData.ptr && currentData.ptr.participacao_media !== undefined && currentData.ptr.participacao_media < 8) {
      insights.push({
        tipo: 'recomendacao',
        titulo: 'Melhorar Participação PTR',
        descricao: 'Participação média nas instruções PTR está baixa. Considere revisar horários e metodologia.',
        valor: `${currentData.ptr.participacao_media.toFixed(1)} bombeiros`,
        prioridade: 'media'
      });
    }

    if (shouldReturnWithLoading) {
      return { insights: insights.slice(0, 6), loading: false };
    }
    return insights.slice(0, 6); // Limita a 6 insights mais relevantes
  }, [currentData, mesAnterior, shouldReturnWithLoading]);
};
