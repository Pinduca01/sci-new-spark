import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, RefreshCw, AlertTriangle, Activity, Clock, Truck } from 'lucide-react';
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
  const [mesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual] = useState(new Date().getFullYear());
  const [mesSelecionado, setMesSelecionado] = useState(mesAtual);
  const [anoSelecionado, setAnoSelecionado] = useState(anoAtual);

  const dados = useDashboardStats(mesSelecionado, anoSelecionado);
  
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Operacional</h1>
            <p className="text-gray-600 mt-1">Sistema de Controle Integrado - SCI Core</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            {/* Seletores de Período */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
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

            {/* Botões de Ação */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <ExportadorPDF dados={dados} periodo={periodoFormatado} />
            </div>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricasCard
            titulo="Ocorrências Totais"
            valor={dados.ocorrencias.total_ocorrencias}
            icone={AlertTriangle}
            cor="blue"
            tendencia={dados.ocorrencias.tendencia_mensal}
          />
          <MetricasCard
            titulo="Taxa Aprovação TAF"
            valor={`${dados.taf?.taxa_aprovacao?.toFixed(1) || 0}%`}
            icone={Activity}
            cor="green"
            tendencia={5.2}
          />
          <MetricasCard
            titulo="Horas Treinamento"
            valor={dados.ptr.total_horas_treinamento}
            icone={Clock}
            cor="purple"
            tendencia={12.5}
          />
          <MetricasCard
            titulo="Viaturas Operacionais"
            valor={`${dados.viaturas.viaturas_operacionais}/${dados.viaturas.total_viaturas}`}
            icone={Truck}
            cor="orange"
            tendencia={-2.1}
          />
        </div>

        {/* Gráficos - Linha Superior */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GraficoOcorrencias dados={dados.ocorrencias} />
          <GraficoTAF dados={dados.taf} />
        </div>

        {/* Gráficos - Linha Média */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GraficoPTR dados={dados.ptr} />
          <GraficoAgentesExtintores dados={dados.agentes_extintores} />
        </div>

        {/* Seção Inferior */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TabelaViaturas dados={dados.viaturas} />
          </div>
          <div>
            <GraficoTrocas dados={dados.trocas} />
          </div>
        </div>

        {/* Cards de TP/Uniformes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Verificações TP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dados.tp_uniformes.verificacoes_mes}</div>
              <p className="text-xs text-gray-600 mt-1">Este mês</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Conformidade TP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dados.tp_uniformes.conformidade_percentual}%</div>
              <p className="text-xs text-gray-600 mt-1">Taxa de conformidade</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Higienizações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dados.tp_uniformes.higienizacoes_realizadas}</div>
              <p className="text-xs text-gray-600 mt-1">TPs higienizados</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">EPIs Distribuídos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dados.tp_uniformes.epis_distribuidos}</div>
              <p className="text-xs text-gray-600 mt-1">Este mês</p>
            </CardContent>
          </Card>
        </div>

        {/* Rodapé */}
        <div className="text-center text-sm text-gray-500 mt-8 pb-4">
          <p>Dashboard atualizado em tempo real • SCI-Core v2.0</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardProfissional;
