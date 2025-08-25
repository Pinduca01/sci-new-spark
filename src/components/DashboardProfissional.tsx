
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  RefreshCw,
  Users,
  Truck,
  Shield,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  Package
} from "lucide-react";
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { MetricasCard } from './MetricasCard';
import { GraficoOcorrencias } from './GraficoOcorrencias';
import { GraficoTAF } from './GraficoTAF';
import { GraficoPTR } from './GraficoPTR';
import { GraficoAgentesExtintores } from './GraficoAgentesExtintores';
import { GraficoTrocas } from './GraficoTrocas';
import { TabelaViaturas } from './TabelaViaturas';
import { ExportadorPDF } from './ExportadorPDF';

const DashboardProfissional = () => {
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const dashboardStats = useDashboardStats(mesAtual, anoAtual);

  // Auto refresh a cada 30 segundos
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      window.location.reload();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header do Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Operacional</h1>
          <p className="text-muted-foreground">
            Indicadores e métricas - {meses[mesAtual - 1]} {anoAtual}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <select 
              value={mesAtual}
              onChange={(e) => setMesAtual(Number(e.target.value))}
              className="px-3 py-2 border rounded-md"
            >
              {meses.map((mes, index) => (
                <option key={index} value={index + 1}>{mes}</option>
              ))}
            </select>
            
            <select 
              value={anoAtual}
              onChange={(e) => setAnoAtual(Number(e.target.value))}
              className="px-3 py-2 border rounded-md"
            >
              {[2023, 2024, 2025].map(ano => (
                <option key={ano} value={ano}>{ano}</option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "text-green-600" : "text-gray-600"}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>

          <ExportadorPDF 
            dados={dashboardStats}
            periodo={`${meses[mesAtual - 1]} ${anoAtual}`}
          />
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricasCard
          titulo="Ocorrências"
          valor={dashboardStats.ocorrencias.total_ocorrencias}
          subvalor={`${dashboardStats.ocorrencias.ocorrencias_mes_atual} este mês`}
          icone={AlertTriangle}
          cor="text-orange-600"
          tendencia={dashboardStats.ocorrencias.tendencia_mensal}
        />
        
        <MetricasCard
          titulo="Pessoal TAF Ativo"
          valor={((dashboardStats.taf?.total_avaliacoes || 0) - (dashboardStats.taf?.bombeiros_pendentes || 0))}
          subvalor={`${dashboardStats.taf?.taxa_aprovacao?.toFixed(1) || 0}% aprovação`}
          icone={Users}
          cor="text-green-600"
          tendencia={5}
        />
        
        <MetricasCard
          titulo="Viaturas Operacionais"
          valor={dashboardStats.viaturas.viaturas_operacionais}
          subvalor={`${dashboardStats.viaturas.total_viaturas} total`}
          icone={Truck}
          cor="text-blue-600"
          tendencia={0}
        />
        
        <MetricasCard
          titulo="Agentes Extintores"
          valor={dashboardStats.agentes_extintores.disponivel_uso}
          subvalor={`${dashboardStats.agentes_extintores.vencimento_proximo} vencendo`}
          icone={Shield}
          cor="text-purple-600"
          tendencia={-2}
        />
      </div>

      {/* Gráficos e Tabelas Detalhadas */}
      <Tabs defaultValue="ocorrencias" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="ocorrencias">Ocorrências</TabsTrigger>
          <TabsTrigger value="taf">TAF</TabsTrigger>
          <TabsTrigger value="ptr">PTR-BA</TabsTrigger>
          <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
          <TabsTrigger value="viaturas">Viaturas</TabsTrigger>
          <TabsTrigger value="trocas">Trocas</TabsTrigger>
        </TabsList>

        <TabsContent value="ocorrencias" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GraficoOcorrencias dados={dashboardStats.ocorrencias} />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Tempo de Resposta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold text-primary">
                    {dashboardStats.ocorrencias.tempo_medio_resposta}min
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tempo médio de resposta às ocorrências
                  </p>
                  <Badge variant={dashboardStats.ocorrencias.tempo_medio_resposta <= 8 ? "default" : "destructive"}>
                    {dashboardStats.ocorrencias.tempo_medio_resposta <= 8 ? "Dentro da Meta" : "Acima da Meta"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="taf" className="space-y-6">
          <GraficoTAF dados={dashboardStats.taf} />
        </TabsContent>

        <TabsContent value="ptr" className="space-y-6">
          <GraficoPTR dados={dashboardStats.ptr} />
        </TabsContent>

        <TabsContent value="equipamentos" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GraficoAgentesExtintores dados={dashboardStats.agentes_extintores} />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  TP e Uniformes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {dashboardStats.tp_uniformes.verificacoes_mes}
                    </div>
                    <p className="text-sm text-muted-foreground">Verificações</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {dashboardStats.tp_uniformes.conformidade_percentual}%
                    </div>
                    <p className="text-sm text-muted-foreground">Conformidade</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {dashboardStats.tp_uniformes.higienizacoes_realizadas}
                    </div>
                    <p className="text-sm text-muted-foreground">Higienizações</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {dashboardStats.tp_uniformes.epis_distribuidos}
                    </div>
                    <p className="text-sm text-muted-foreground">EPIs Entregues</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="viaturas" className="space-y-6">
          <TabelaViaturas dados={dashboardStats.viaturas} />
        </TabsContent>

        <TabsContent value="trocas" className="space-y-6">
          <GraficoTrocas dados={dashboardStats.trocas} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardProfissional;
