import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Target,
  Timer,
  Award,
  TrendingDown,
  Calendar,
  UserCheck,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  MapPin,
  Truck,
  Shield,
  Bell,
  Flame,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Cell, 
  LineChart as RechartsLineChart, 
  Line, 
  Area, 
  AreaChart,
  Pie,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from 'recharts';
import { useOcorrenciasEstatisticas } from '@/hooks/useOcorrenciasEstatisticas';

const OcorrenciasDashboard = () => {
  const { data: estatisticas, isLoading } = useOcorrenciasEstatisticas();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!estatisticas) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">Erro ao carregar dados</h3>
        <p className="text-muted-foreground">Não foi possível carregar as estatísticas das ocorrências.</p>
      </div>
    );
  }

  const cores = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
    purple: '#8b5cf6',
    orange: '#f97316',
    pink: '#ec4899'
  };

  const coresPieChart = [cores.primary, cores.success, cores.warning, cores.danger, cores.info, cores.purple, cores.orange, cores.pink, '#6b7280'];

  // Calcular tendência mensal
  const tendenciaMensal = estatisticas.totalOcorrenciasMesAnterior > 0 
    ? ((estatisticas.totalOcorrenciasMes - estatisticas.totalOcorrenciasMesAnterior) / estatisticas.totalOcorrenciasMesAnterior) * 100
    : 0;

  // Dados para heatmap (simplificado)
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const horas = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="space-y-8 p-6">
      {/* SEÇÃO 1: VISÃO GERAL - Cards Superiores */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          Visão Geral
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Ocorrências Mês */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ocorrências Mês</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalOcorrenciasMes}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {tendenciaMensal >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                )}
                <span className={tendenciaMensal >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {Math.abs(tendenciaMensal).toFixed(1)}%
                </span>
                <span className="ml-1">vs mês anterior</span>
              </div>
            </CardContent>
          </Card>

          {/* Tempo Médio Resposta */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio Resposta</CardTitle>
              <Timer className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.floor(estatisticas.tempoMedioResposta)}:{String(Math.round((estatisticas.tempoMedioResposta % 1) * 60)).padStart(2, '0')}min
              </div>
              <div className="text-xs text-muted-foreground">
                Acionamento → Chegada Local
              </div>
            </CardContent>
          </Card>

          {/* Tempo Médio Total */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio Total</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.floor(estatisticas.tempoMedioTotal / 60)}h{String(Math.round(estatisticas.tempoMedioTotal % 60)).padStart(2, '0')}min
              </div>
              <div className="text-xs text-muted-foreground">
                Acionamento → Término
              </div>
            </CardContent>
          </Card>

          {/* Ocorrências Ativas */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ocorrências Ativas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.ocorrenciasAtivas}</div>
              <div className="text-xs text-muted-foreground">
                Em andamento
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SEÇÃO 2: ANÁLISE POR TIPO DE OCORRÊNCIA */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          Análise por Tipo de Ocorrência
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tipos Mais Frequentes - Gráfico de Rosca */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Tipos Mais Frequentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={estatisticas.tiposMaisFrequentes}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="quantidade"
                  >
                    {estatisticas.tiposMaisFrequentes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={coresPieChart[index % coresPieChart.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, 'Quantidade']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Ranking Tipos - Tabela */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Ranking por Tipo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {estatisticas.rankingTipos.slice(0, 8).map((tipo, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{tipo.tipo.substring(0, 30)}...</p>
                        <p className="text-xs text-gray-500">{tipo.quantidade} ocorrências</p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {tipo.percentual.toFixed(1)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SEÇÃO 3: ANÁLISE TEMPORAL */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Clock className="w-6 h-6 text-purple-600" />
          Análise Temporal
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tempo Resposta por Tipo */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Tempo Resposta por Tipo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={estatisticas.tempoRespostaPorTipo.slice(0, 6)} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="tipo" type="category" width={100} />
                  <Tooltip formatter={(value) => [`${value} min`, 'Tempo Médio']} />
                  <Bar dataKey="tempoMedio" fill={cores.primary} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribuição Tempo Total */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                Distribuição Tempo Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={estatisticas.distribuicaoTempoTotal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="faixa" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill={cores.success} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Meta Tempo Resposta - Gauge */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Meta Tempo Resposta
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
                <div 
                  className="absolute inset-0 rounded-full border-8 border-blue-500 border-t-transparent transform -rotate-90"
                  style={{
                    borderRightColor: estatisticas.metaTempoResposta.atual <= estatisticas.metaTempoResposta.meta ? cores.success : cores.danger,
                    borderBottomColor: estatisticas.metaTempoResposta.atual <= estatisticas.metaTempoResposta.meta ? cores.success : cores.danger,
                    borderLeftColor: estatisticas.metaTempoResposta.atual <= estatisticas.metaTempoResposta.meta ? cores.success : cores.danger,
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{estatisticas.metaTempoResposta.atual.toFixed(1)}</div>
                    <div className="text-xs text-gray-500">min</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">Meta: {estatisticas.metaTempoResposta.meta} min</p>
                <Badge variant={estatisticas.metaTempoResposta.atual <= estatisticas.metaTempoResposta.meta ? "default" : "destructive"}>
                  {estatisticas.metaTempoResposta.atual <= estatisticas.metaTempoResposta.meta ? "Dentro da Meta" : "Acima da Meta"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SEÇÃO 4: ANÁLISE POR LOCAL */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-green-600" />
          Análise por Local
        </h2>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Locais Mais Críticos */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Locais Mais Críticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={estatisticas.locaisCriticos.slice(0, 8)} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="local" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill={cores.warning} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SEÇÃO 5: PERFORMANCE DAS EQUIPES */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600" />
          Performance das Equipes
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ranking Equipes */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Ranking das Equipes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {estatisticas.rankingEquipes.map((equipe, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">Equipe {equipe.equipe}</p>
                        <p className="text-sm text-gray-500">{equipe.quantidade} ocorrências</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{equipe.tempoMedio.toFixed(1)} min</p>
                      <p className="text-xs text-gray-500">tempo médio</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Eficiência por Equipe - Radar */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Eficiência por Equipe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={estatisticas.eficienciaPorEquipe}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="equipe" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Eficiência"
                    dataKey="eficiencia"
                    stroke={cores.primary}
                    fill={cores.primary}
                    fillOpacity={0.3}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SEÇÃO 6: RECURSOS UTILIZADOS */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Truck className="w-6 h-6 text-orange-600" />
          Recursos Utilizados
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Veículos Mais Usados */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Veículos Mais Usados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={estatisticas.veiculosMaisUsados}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="quantidade"
                  >
                    {estatisticas.veiculosMaisUsados.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={coresPieChart[index % coresPieChart.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, 'Usos']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Agentes Extintores */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Agentes Extintores por Tipo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={estatisticas.agentesExtintores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tipo" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="lge" stackId="a" fill={cores.primary} name="LGE" />
                  <Bar dataKey="pqs" stackId="a" fill={cores.success} name="PQS" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SEÇÃO 7: ALERTAS E INDICADORES */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Bell className="w-6 h-6 text-red-600" />
          Alertas e Indicadores
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ocorrências > 30min */}
          <Card className="glass-card border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Tempo Acima 30min
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{estatisticas.ocorrenciasMais30min}</div>
              <p className="text-sm text-gray-600">ocorrências acima da meta</p>
              {estatisticas.ocorrenciasMais30min > 0 && (
                <Alert className="mt-3">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Atenção: {estatisticas.ocorrenciasMais30min} ocorrências ultrapassaram o tempo limite de resposta.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Picos de Atividade */}
          <Card className="glass-card border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <TrendingUp className="w-5 h-5" />
                Picos de Atividade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {estatisticas.picosAtividade.slice(0, 3).map((pico, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                    <span className="text-sm">{pico.data}</span>
                    <Badge variant="outline" className="text-yellow-600">
                      {pico.quantidade} ocorrências
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Próximas Análises */}
          <Card className="glass-card border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Calendar className="w-5 h-5" />
                Próximas Análises
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {estatisticas.proximasAnalises.map((analise, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <div>
                      <p className="text-sm font-medium">{analise.tipo}</p>
                      <p className="text-xs text-gray-500">{analise.prazo}</p>
                    </div>
                    <Badge 
                      variant={analise.status === 'Pendente' ? 'destructive' : 
                              analise.status === 'Em Andamento' ? 'default' : 'secondary'}
                    >
                      {analise.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OcorrenciasDashboard;