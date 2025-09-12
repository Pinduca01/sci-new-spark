
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  FileText,
  Users,
  Zap,
  AlertCircle,
  TrendingUp
} from "lucide-react";

import { useDashboardStats } from "@/hooks/useDashboardStats";
import DashboardProfissional from "@/components/DashboardProfissional";

const Dashboard = () => {
  const { stats, loading: statsLoading } = useDashboardStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header simples */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-blue-500 text-white shadow-lg">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Dashboard Principal
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Visão geral do sistema
                </p>
              </div>
            </div>
            
            {/* Indicadores rápidos no header */}
            {!statsLoading && (
              <div className="hidden md:flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalBombeiros}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Bombeiros</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.ocorrenciasResolvidas}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Resolvidas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.equipamentosAtivos}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Equipamentos</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de métricas gerais */}
        {!statsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Card: Ocorrências Resolvidas */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Ocorrências Resolvidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-green-800 dark:text-green-200">{stats.ocorrenciasResolvidas}</div>
                  <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex items-center mt-2 text-xs text-green-600 dark:text-green-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>+12% este mês</span>
                </div>
              </CardContent>
            </Card>

            {/* Card: Equipamentos Ativos */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Equipamentos Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{stats.equipamentosAtivos}</div>
                  <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex items-center mt-2 text-xs text-blue-600 dark:text-blue-400">
                  <Zap className="h-3 w-3 mr-1" />
                  <span>Operacionais</span>
                </div>
              </CardContent>
            </Card>

            {/* Card: Alertas Pendentes */}
            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Alertas Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-red-800 dark:text-red-200">{stats.alertasPendentes}</div>
                  <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex items-center mt-2 text-xs text-red-600 dark:text-red-400">
                  <Zap className="h-3 w-3 mr-1" />
                  <span>Requer atenção</span>
                </div>
              </CardContent>
            </Card>

            {/* Card: Total Bombeiros */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Bombeiros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">{stats.totalBombeiros}</div>
                  <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex items-center mt-2 text-xs text-purple-600 dark:text-purple-400">
                  <Activity className="h-3 w-3 mr-1" />
                  <span>Ativos</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dashboard Principal */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Dashboard Profissional</h2>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Relatório Geral
            </Button>
          </div>
          <DashboardProfissional />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
