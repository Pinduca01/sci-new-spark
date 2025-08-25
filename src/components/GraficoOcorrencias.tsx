
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle } from "lucide-react";
import { OcorrenciaStats } from '@/hooks/useDashboardStats';

interface GraficoOcorrenciasProps {
  dados: OcorrenciaStats;
}

export const GraficoOcorrencias: React.FC<GraficoOcorrenciasProps> = ({ dados }) => {
  const dadosGrafico = [
    {
      name: 'Aeronáuticas',
      value: dados.ocorrencias_aeronauticas,
      color: '#ef4444'
    },
    {
      name: 'Não Aeronáuticas',
      value: dados.ocorrencias_nao_aeronauticas,
      color: '#3b82f6'
    }
  ];

  const dadosTendencia = [
    { mes: 'Jan', ocorrencias: 12 },
    { mes: 'Fev', ocorrencias: 8 },
    { mes: 'Mar', ocorrencias: 15 },
    { mes: 'Abr', ocorrencias: 6 },
    { mes: 'Mai', ocorrencias: 10 },
    { mes: 'Jun', ocorrencias: dados.ocorrencias_mes_atual }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Tipos de Ocorrências
          </CardTitle>
          <CardDescription>
            Distribuição por categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dadosGrafico}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dadosGrafico.map((entry, index) => (
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
          <CardTitle>Tendência Mensal</CardTitle>
          <CardDescription>
            Ocorrências por mês
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dadosTendencia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="ocorrencias" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
