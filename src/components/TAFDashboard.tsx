import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Target,
  CheckCircle,
  AlertTriangle,
  BarChart3
} from "lucide-react";
import { useTAFEstatisticas } from '@/hooks/useTAFEstatisticas';
import { ApexLineChart } from '@/components/apex/ApexLineChart';
import { ApexDonutChart } from '@/components/apex/ApexDonutChart';
import { ApexBarChart } from '@/components/apex/ApexBarChart';
import { GaugeChart } from '@/components/GaugeChart';

const TAFDashboard = () => {
  const { estatisticas, isLoading, error } = useTAFEstatisticas();

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px] mb-2" />
              <Skeleton className="h-3 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
            <p className="text-muted-foreground">
              Não foi possível carregar as estatísticas do TAF
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!estatisticas) {
    return (
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum dado disponível</h3>
            <p className="text-muted-foreground">
              Ainda não há avaliações TAF registradas no sistema
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'subindo':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'descendo':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTendenciaColor = (tendencia: string) => {
    switch (tendencia) {
      case 'subindo':
        return 'text-green-600';
      case 'descendo':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  // Dados para os gráficos
  const dadosAprovacao = [
    {
      name: 'Aprovados',
      value: estatisticas.taxa_aprovacao,
      color: '#10b981'
    },
    {
      name: 'Reprovados',
      value: 100 - estatisticas.taxa_aprovacao,
      color: '#ef4444'
    }
  ];

  const dadosPerformance = [
    {
      name: 'Flexões',
      value: Math.round(estatisticas.media_flexoes)
    },
    {
      name: 'Abdominais',
      value: Math.round(estatisticas.media_abdominais)
    },
    {
      name: 'Polichinelos',
      value: Math.round(estatisticas.media_polichinelos)
    }
  ];

  const dadosTendencia = [
    {
      name: 'Mês Anterior',
      value: estatisticas.avaliacoes_mes_anterior
    },
    {
      name: 'Mês Atual',
      value: estatisticas.avaliacoes_mes_atual
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.taxa_aprovacao.toFixed(1)}%</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getTendenciaIcon(estatisticas.tendencia_aprovacao)}
              <span className={getTendenciaColor(estatisticas.tendencia_aprovacao)}>
                {estatisticas.tendencia_aprovacao === 'subindo' ? 'Em alta' :
                 estatisticas.tendencia_aprovacao === 'descendo' ? 'Em baixa' : 'Estável'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Avaliações</CardTitle>
            <Target className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.total_avaliacoes}</div>
            <p className="text-xs text-muted-foreground">
              {estatisticas.avaliacoes_mes_atual} este mês
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bombeiros Pendentes</CardTitle>
            <Users className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.bombeiros_pendentes}</div>
            <p className="text-xs text-muted-foreground">
              Sem TAF nos últimos 12 meses
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(estatisticas.tempo_medio_segundos / 60)}:{String(Math.floor(estatisticas.tempo_medio_segundos % 60)).padStart(2, '0')}
            </div>
            <p className="text-xs text-muted-foreground">
              Minutos por avaliação
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfico de Taxa de Aprovação */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Taxa de Aprovação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ApexDonutChart
                dados={dadosAprovacao}
                titulo="Taxa de Aprovação"
                altura={300}
              />
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Performance Média */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Performance Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ApexBarChart
                dados={dadosPerformance}
                titulo="Performance Média"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Detalhadas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Média de Flexões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {estatisticas.media_flexoes.toFixed(1)}
              </div>
              <Badge variant="secondary">Por avaliação</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Média de Abdominais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {estatisticas.media_abdominais.toFixed(1)}
              </div>
              <Badge variant="secondary">Por avaliação</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Média de Polichinelos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {estatisticas.media_polichinelos.toFixed(1)}
              </div>
              <Badge variant="secondary">Por avaliação</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tendência Mensal */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Tendência de Avaliações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ApexLineChart
              dados={dadosTendencia}
              titulo="Tendência de Avaliações"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TAFDashboard;