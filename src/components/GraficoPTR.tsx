
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BookOpen, Clock, Users, Award } from "lucide-react";
import { PTRStats } from '@/hooks/useDashboardStats';

interface GraficoPTRProps {
  dados: PTRStats;
}

export const GraficoPTR: React.FC<GraficoPTRProps> = ({ dados }) => {
  const dadosHoras = [
    { mes: 'Jan', horas: 16 },
    { mes: 'Fev', horas: 20 },
    { mes: 'Mar', horas: 18 },
    { mes: 'Abr', horas: 22 },
    { mes: 'Mai', horas: 24 },
    { mes: 'Jun', horas: dados.total_horas_treinamento }
  ];

  const metricasCards = [
    {
      titulo: "Horas de Treinamento",
      valor: dados.total_horas_treinamento,
      icone: Clock,
      cor: "text-blue-600",
      sufixo: "h"
    },
    {
      titulo: "Instruções Realizadas",
      valor: dados.instrucoes_realizadas,
      icone: BookOpen,
      cor: "text-green-600",
      sufixo: ""
    },
    {
      titulo: "Bombeiros Treinados",
      valor: dados.bombeiros_treinados,
      icone: Users,
      cor: "text-purple-600",
      sufixo: ""
    },
    {
      titulo: "Participação Média",
      valor: Math.round(dados.participacao_media),
      icone: Award,
      cor: "text-orange-600",
      sufixo: ""
    }
  ];

  return (
    <div className="space-y-6">
      {/* Métricas do PTR */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricasCards.map((metrica, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metrica.titulo}</CardTitle>
              <metrica.icone className={`h-4 w-4 ${metrica.cor}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrica.valor}{metrica.sufixo}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráfico de Horas de Treinamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Evolução das Horas de Treinamento
          </CardTitle>
          <CardDescription>
            Horas acumuladas por mês
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosHoras}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="horas" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
