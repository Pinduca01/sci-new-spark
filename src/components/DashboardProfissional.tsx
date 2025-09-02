import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, RefreshCw, AlertTriangle, Activity, Clock, Truck, Users, Shield, Wrench, CheckCircle } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useInsights } from '@/hooks/useInsights';
import { MetricasCard } from './MetricasCard';
import { InsightCard } from './InsightCard';
import { DonutChart } from './DonutChart';
import { GaugeChart } from './GaugeChart';
import { QuickStats } from './QuickStats';
import { ExportadorPDF } from './ExportadorPDF';
import { ApexDonutChart, ApexGaugeChart } from './apex';

const DashboardProfissional = () => {
  const [mesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual] = useState(new Date().getFullYear());
  const [mesSelecionado, setMesSelecionado] = useState(mesAtual);
  const [anoSelecionado, setAnoSelecionado] = useState(anoAtual);

  const dados = useDashboardStats(mesSelecionado, anoSelecionado);
  const insights = useInsights(dados);
  
  const meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  const anos = Array.from({ length: 10 }, (_, i) => anoAtual - 5 + i);
  const periodoFormatado = `${meses.find(m => m.value === mesSelecionado)?.label} ${anoSelecionado}`;

  // Dados para sparklines (simulados - últimos 6 meses)
  const sparklineOcorrencias = [
    { value: 8 }, { value: 12 }, { value: 6 }, { value: 15 }, { value: 10 }, { value: dados.ocorrencias.total_ocorrencias }
  ];

  const sparklineTAF = [
    { value: 78 }, { value: 82 }, { value: 85 }, { value: 80 }, { value: 88 }, { value: dados.taf?.taxa_aprovacao || 0 }
  ];

  const sparklinePTR = [
    { value: 16 }, { value: 20 }, { value: 18 }, { value: 22 }, { value: 24 }, { value: dados.ptr.total_horas_treinamento }
  ];

  const sparklineViaturas = [
    { value: 6 }, { value: 5 }, { value: 6 }, { value: 4 }, { value: 6 }, { value: dados.viaturas.viaturas_operacionais }
  ];

  // Dados para gráfico de pizza das ocorrências
  const dadosOcorrencias = [
    {
      name: 'Aeronáuticas',
      value: dados.ocorrencias.ocorrencias_aeronauticas,
      color: '#dc2626'
    },
    {
      name: 'Não Aeronáuticas',
      value: dados.ocorrencias.ocorrencias_nao_aeronauticas,
      color: '#ea580c'
    }
  ];

  // Dados para gráfico de agentes extintores
  const dadosAgentes = [
    {
      name: 'Disponível',
      value: dados.agentes_extintores.disponivel_uso,
      color: '#10b981'
    },
    {
      name: 'Venc. Próximo',
      value: dados.agentes_extintores.vencimento_proximo,
      color: '#f59e0b'
    }
  ];

  // Quick Stats
  const quickStats = [
    { icone: Users, valor: dados.ptr.bombeiros_treinados, label: 'Bombeiros Treinados', cor: 'text-orange-600' },
    { icone: Shield, valor: dados.agentes_extintores.total_lge + dados.agentes_extintores.total_pqs, label: 'Agentes Disponíveis', cor: 'text-green-600' },
    { icone: Wrench, valor: dados.viaturas.proximas_manutencoes, label: 'Manutenções Pendentes', cor: 'text-yellow-600' },
    { icone: CheckCircle, valor: dados.tp_uniformes.conformidade_percentual + '%', label: 'Conformidade TP', cor: 'text-purple-600' },
    { icone: Activity, valor: dados.ptr.instrucoes_realizadas, label: 'Instruções PTR', cor: 'text-indigo-600' },
    { icone: AlertTriangle, valor: dados.ocorrencias.tempo_medio_resposta + 'min', label: 'Tempo Resposta', cor: 'text-red-600' }
  ];

  return (
    <div className="min-h-screen abstract-bg p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Cabeçalho */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 glass-card rounded-lg p-6 shadow-sm">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard Operacional</h1>
            <p className="text-muted-foreground">Sistema de Controle Integrado - SCI Core</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={mesSelecionado.toString()} onValueChange={(value) => setMesSelecionado(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {meses.map((mes) => (
                    <SelectItem key={mes.value} value={mes.value.toString()}>
                      {mes.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={anoSelecionado.toString()} onValueChange={(value) => setAnoSelecionado(parseInt(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {anos.map((ano) => (
                    <SelectItem key={ano} value={ano.toString()}>
                      {ano}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <ExportadorPDF dados={dados} periodo={periodoFormatado} />
            </div>
          </div>
        </div>

        {/* KPIs Principais com Sparklines */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricasCard
            titulo="Ocorrências Totais"
            valor={dados.ocorrencias.total_ocorrencias}
            icone={AlertTriangle}
            cor="orange"
            tendencia={dados.ocorrencias.tendencia_mensal}
            dadosSparkline={sparklineOcorrencias}
            subvalor="Este mês"
          />
          <MetricasCard
            titulo="Taxa Aprovação TAF"
            valor={`${dados.taf?.taxa_aprovacao?.toFixed(1) || 0}%`}
            icone={Activity}
            cor="green"
            tendencia={5.2}
            dadosSparkline={sparklineTAF}
            formato="percentual"
          />
          <MetricasCard
            titulo="Horas Treinamento"
            valor={dados.ptr.total_horas_treinamento}
            icone={Clock}
            cor="purple"
            tendencia={12.5}
            dadosSparkline={sparklinePTR}
            formato="tempo"
          />
          <MetricasCard
            titulo="Viaturas Operacionais"
            valor={`${dados.viaturas.viaturas_operacionais}/${dados.viaturas.total_viaturas}`}
            icone={Truck}
            cor="orange"
            tendencia={-2.1}
            dadosSparkline={sparklineViaturas}
          />
        </div>

        {/* Análises Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ocorrências */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Distribuição de Ocorrências
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ApexDonutChart 
                dados={dadosOcorrencias}
                titulo="Por Tipo"
                altura={200}
              />
            </CardContent>
          </Card>

          {/* TAF Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Performance TAF
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ApexGaugeChart
                valor={dados.taf?.taxa_aprovacao || 0}
                maximo={100}
                titulo="Taxa de Aprovação"
                unidade="%"
              />
            </CardContent>
          </Card>

          {/* Agentes Extintores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Status Agentes Extintores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ApexDonutChart 
                dados={dadosAgentes}
                titulo="Por Status"
                altura={200}
              />
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="glass-card rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Estatísticas Rápidas</h2>
          <QuickStats stats={quickStats} />
        </div>

        {/* Insights Automáticos */}
        <div className="glass-card rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Insights e Análises</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <InsightCard
                key={index}
                tipo={insight.tipo}
                titulo={insight.titulo}
                descricao={insight.descricao}
                valor={insight.valor}
                tendencia={insight.tendencia}
                prioridade={insight.prioridade}
              />
            ))}
          </div>
        </div>

        {/* Cards de TP/Uniformes - Redesenhados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Verificações TP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{dados.tp_uniformes.verificacoes_mes}</div>
              <p className="text-xs text-muted-foreground mt-1">Este mês</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Conformidade TP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{dados.tp_uniformes.conformidade_percentual}%</div>
              <p className="text-xs text-muted-foreground mt-1">Taxa de conformidade</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Higienizações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{dados.tp_uniformes.higienizacoes_realizadas}</div>
              <p className="text-xs text-muted-foreground mt-1">TPs higienizados</p>
            </CardContent>
          </Card>
          

        </div>

        {/* Rodapé */}
        <div className="text-center text-sm text-muted-foreground mt-8 pb-4">
          <p>Dashboard atualizado em tempo real • SCI-Core v2.1 • Última atualização: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardProfissional;
