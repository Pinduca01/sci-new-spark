
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
  LineChart
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
  Pie
} from 'recharts';
import { useTAFEstatisticas } from '@/hooks/useTAFEstatisticas';

const TAFDashboard = () => {
  const { estatisticas, isLoading } = useTAFEstatisticas();

  // Dados mockados para demonstração completa da dashboard
  const mockData = {
    // Seção 1: Visão Geral
    taxaAprovacao: 85,
    tempoMedio: 150, // segundos
    totalAvaliados: 45,
    taxaConclusao: 92,
    
    // Seção 2: Análise por Faixa Etária
    aprovacaoPorIdade: [
      { faixa: 'Até 39 anos', aprovacao: 88, tempo: 140 },
      { faixa: '40+ anos', aprovacao: 82, tempo: 165 }
    ],
    
    distribuicaoTempo: [
      { tempo: '&lt; 2min', quantidade: 12 },
      { tempo: '2-3min', quantidade: 18 },
      { tempo: '3-4min', quantidade: 10 },
      { tempo: '&gt; 4min', quantidade: 5 }
    ],
    
    // Seção 3: Performance por Exercício
    falhasPorExercicio: [
      { exercicio: 'Flexões', naoCompletou: 15 },
      { exercicio: 'Abdominais', naoCompletou: 8 },
      { exercicio: 'Polichinelos', naoCompletou: 12 }
    ],
    
    combinacoesFalha: [
      { name: 'Só Flexões', value: 8, color: '#ef4444' },
      { name: 'Só Abdominais', value: 3, color: '#f97316' },
      { name: 'Só Polichinelos', value: 5, color: '#eab308' },
      { name: 'Flexões + Abdominais', value: 4, color: '#dc2626' },
      { name: 'Múltiplas falhas', value: 2, color: '#991b1b' }
    ],
    
    // Seção 4: Análise Temporal
    distribuicaoTempoDetalhada: {
      aprovadosMenos2: 12,
      aprovados2a3: 18,
      aprovados3a4: 8,
      reprovadosTempo: 7
    },
    
    margemSeguranca: [
      { tempo: 60, quantidade: 2 },
      { tempo: 90, quantidade: 8 },
      { tempo: 120, quantidade: 15 },
      { tempo: 150, quantidade: 12 },
      { tempo: 180, quantidade: 6 },
      { tempo: 210, quantidade: 2 }
    ],
    
    // Seção 6: Evolução Temporal
    evolucaoMensal: [
      { mes: 'Jan', aprovacao: 82, meta: 85 },
      { mes: 'Fev', aprovacao: 85, meta: 85 },
      { mes: 'Mar', aprovacao: 88, meta: 85 },
      { mes: 'Abr', aprovacao: 84, meta: 85 },
      { mes: 'Mai', aprovacao: 87, meta: 85 },
      { mes: 'Jun', aprovacao: 85, meta: 85 }
    ],
    
    // Seção 7: Alertas e Ações
    colaboradoresCriticos: [
      { nome: 'João Silva', falhas: 3, ultimoTAF: '2024-01-15', status: 'Crítico' },
      { nome: 'Maria Santos', falhas: 2, ultimoTAF: '2024-01-20', status: 'Atenção' },
      { nome: 'Pedro Costa', falhas: 2, ultimoTAF: '2024-01-18', status: 'Atenção' }
    ],
    
    proximosTAFs: [
      { nome: 'Carlos Lima', data: '2024-02-15', equipe: 'Alfa' },
      { nome: 'Ana Oliveira', data: '2024-02-18', equipe: 'Bravo' },
      { nome: 'Roberto Silva', data: '2024-02-20', equipe: 'Charlie' }
    ]
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="glass-card">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatTempo = (segundos) => {
    const min = Math.floor(segundos / 60);
    const sec = segundos % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 p-6">
      {/* SEÇÃO 1: VISÃO GERAL */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-600" />
          Visão Geral TAF
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Taxa de Aprovação Geral */}
          <Card className={`glass-card hover:shadow-lg transition-all duration-300 ${mockData.taxaAprovacao >= 85 ? 'border-green-200 bg-gradient-to-br from-green-50 to-green-100' : 'border-red-200 bg-gradient-to-br from-red-50 to-red-100'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Aprovação Geral</p>
                  <p className={`text-3xl font-bold ${mockData.taxaAprovacao >= 85 ? 'text-green-600' : 'text-red-600'}`}>
                    {mockData.taxaAprovacao}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Meta: 85%</p>
                </div>
                <div className={`p-3 rounded-full ${mockData.taxaAprovacao >= 85 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <CheckCircle className={`w-8 h-8 ${mockData.taxaAprovacao >= 85 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tempo Médio de Conclusão */}
          <Card className="glass-card hover:shadow-lg transition-all duration-300 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tempo Médio</p>
                  <p className="text-3xl font-bold text-blue-600">{formatTempo(mockData.tempoMedio)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Meta: {mockData.tempoMedio <= 180 ? '3:00min' : '4:00min'}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <Timer className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total de Colaboradores Avaliados */}
          <Card className="glass-card hover:shadow-lg transition-all duration-300 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Avaliados</p>
                  <p className="text-3xl font-bold text-purple-600">{mockData.totalAvaliados}</p>
                  <p className="text-xs text-muted-foreground mt-1">Último período</p>
                </div>
                <div className="p-3 rounded-full bg-purple-100">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Taxa de Conclusão Completa */}
          <Card className="glass-card hover:shadow-lg transition-all duration-300 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxa Conclusão</p>
                  <p className="text-3xl font-bold text-emerald-600">{mockData.taxaConclusao}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Completos</p>
                </div>
                <div className="p-3 rounded-full bg-emerald-100">
                  <UserCheck className="w-8 h-8 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SEÇÃO 2: ANÁLISE POR FAIXA ETÁRIA */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-orange-600" />
          Análise por Faixa Etária
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Aprovação por Idade */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Aprovação: Até 39 vs 40+ anos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mockData.aprovacaoPorIdade}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="faixa" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="aprovacao" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribuição de Tempo */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Distribuição de Tempo Utilizado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mockData.distribuicaoTempo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tempo" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Vantagem do Tempo Extra */}
        <Card className="glass-card border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vantagem Tempo Extra (40+)</p>
                <p className="text-2xl font-bold text-orange-600">+15 segundos</p>
                <p className="text-xs text-muted-foreground mt-1">Diferença média de tempo</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEÇÃO 3: PERFORMANCE POR EXERCÍCIO */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Award className="w-6 h-6 text-red-600" />
          Performance por Exercício
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* % que NÃO completou cada exercício */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-500" />
                % que NÃO completou cada exercício
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mockData.falhasPorExercicio} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="exercicio" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="naoCompletou" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Combinações de Falha */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Combinações de Falha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={mockData.combinacoesFalha}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {mockData.combinacoesFalha.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Exercício que mais reprova */}
        <Card className="glass-card border-red-200 bg-gradient-to-r from-red-50 to-red-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Exercício que Mais Reprova</p>
                <p className="text-2xl font-bold text-red-600">Flexões</p>
                <p className="text-xs text-muted-foreground mt-1">15 falhas registradas</p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEÇÃO 4: ANÁLISE TEMPORAL */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Timer className="w-6 h-6 text-indigo-600" />
          Análise Temporal
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Aprovados em < 2min */}
          <Card className="glass-card border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Aprovados &lt; 2min</p>
                <p className="text-2xl font-bold text-green-600">{mockData.distribuicaoTempoDetalhada.aprovadosMenos2}</p>
                <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '80%'}}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aprovados entre 2-3min */}
          <Card className="glass-card border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Aprovados 2-3min</p>
                <p className="text-2xl font-bold text-yellow-600">{mockData.distribuicaoTempoDetalhada.aprovados2a3}</p>
                <div className="w-full bg-yellow-200 rounded-full h-2 mt-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{width: '90%'}}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aprovados entre 3-4min */}
          <Card className="glass-card border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Aprovados 3-4min</p>
                <p className="text-2xl font-bold text-orange-600">{mockData.distribuicaoTempoDetalhada.aprovados3a4}</p>
                <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{width: '60%'}}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reprovados por tempo */}
          <Card className="glass-card border-red-200 bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Reprovados Tempo</p>
                <p className="text-2xl font-bold text-red-600">{mockData.distribuicaoTempoDetalhada.reprovadosTempo}</p>
                <div className="w-full bg-red-200 rounded-full h-2 mt-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{width: '40%'}}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Margem de Segurança */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="w-5 h-5" />
              Margem de Segurança - Distribuição dos Tempos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={mockData.margemSeguranca}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tempo" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="quantidade" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* SEÇÃO 6: EVOLUÇÃO TEMPORAL */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-600" />
          Evolução Temporal
        </h2>
        
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Taxa de Aprovação por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={mockData.evolucaoMensal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="aprovacao" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} />
                <Line type="monotone" dataKey="meta" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* SEÇÃO 7: ALERTAS E AÇÕES */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          Alertas e Ações
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Colaboradores Críticos */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-red-500" />
                Colaboradores Críticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockData.colaboradoresCriticos.map((colaborador, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <p className="font-medium text-gray-800">{colaborador.nome}</p>
                      <p className="text-sm text-gray-600">{colaborador.falhas} falhas - Último TAF: {colaborador.ultimoTAF}</p>
                    </div>
                    <Badge variant={colaborador.status === 'Crítico' ? 'destructive' : 'secondary'}>
                      {colaborador.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Próximos TAFs */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Próximos TAFs Agendados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockData.proximosTAFs.map((taf, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <p className="font-medium text-gray-800">{taf.nome}</p>
                      <p className="text-sm text-gray-600">Equipe {taf.equipe}</p>
                    </div>
                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                      {taf.data}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas de Meta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Meta Não Atingida:</strong> Taxa de aprovação abaixo de 85% no último mês.
            </AlertDescription>
          </Alert>
          
          <Alert className="border-yellow-200 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Atenção:</strong> 15 colaboradores com TAF vencendo em 30 dias.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default TAFDashboard;
