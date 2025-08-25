
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { RefreshCw, TrendingUp } from "lucide-react";
import { EstatisticaTroca } from '@/hooks/useTrocasEstatisticas';

interface GraficoTrocasProps {
  dados: EstatisticaTroca[];
}

export const GraficoTrocas: React.FC<GraficoTrocasProps> = ({ dados }) => {
  const totalTrocas = dados.reduce((sum, est) => sum + est.total_trocas, 0);
  
  const dadosStatus = [
    {
      status: 'Pendentes',
      value: dados.reduce((sum, est) => sum + est.trocas_pendentes, 0),
      color: '#f59e0b'
    },
    {
      status: 'Aprovadas',
      value: dados.reduce((sum, est) => sum + est.trocas_aprovadas, 0),
      color: '#10b981'
    },
    {
      status: 'Rejeitadas',
      value: dados.reduce((sum, est) => sum + est.trocas_rejeitadas, 0),
      color: '#ef4444'
    },
    {
      status: 'Concluídas',
      value: dados.reduce((sum, est) => sum + est.trocas_concluidas, 0),
      color: '#3b82f6'
    }
  ];

  const dadosEquipes = dados.map(est => ({
    equipe: est.equipe_nome,
    total: est.total_trocas,
    aprovadas: est.trocas_aprovadas,
    pendentes: est.trocas_pendentes
  }));

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Trocas</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrocas}</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        {dadosStatus.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.status}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: item.color }}>
                {item.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalTrocas > 0 ? ((item.value / totalTrocas) * 100).toFixed(1) : 0}% do total
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status das Trocas</CardTitle>
            <CardDescription>Distribuição por status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosStatus.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trocas por Equipe</CardTitle>
            <CardDescription>Quantidade de trocas por equipe</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosEquipes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="equipe" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#3b82f6" name="Total" />
                <Bar dataKey="aprovadas" fill="#10b981" name="Aprovadas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Detalhada */}
      {dados.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhamento por Equipe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Equipe</th>
                    <th className="text-center py-3 px-4 font-semibold">Total</th>
                    <th className="text-center py-3 px-4 font-semibold">Pendentes</th>
                    <th className="text-center py-3 px-4 font-semibold">Aprovadas</th>
                    <th className="text-center py-3 px-4 font-semibold">Rejeitadas</th>
                    <th className="text-center py-3 px-4 font-semibold">Concluídas</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.map((est) => (
                    <tr key={est.equipe_id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{est.equipe_nome}</td>
                      <td className="text-center py-3 px-4">
                        <Badge variant="outline">{est.total_trocas}</Badge>
                      </td>
                      <td className="text-center py-3 px-4">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          {est.trocas_pendentes}
                        </Badge>
                      </td>
                      <td className="text-center py-3 px-4">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {est.trocas_aprovadas}
                        </Badge>
                      </td>
                      <td className="text-center py-3 px-4">
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          {est.trocas_rejeitadas}
                        </Badge>
                      </td>
                      <td className="text-center py-3 px-4">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {est.trocas_concluidas}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
