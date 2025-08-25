
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Shield, AlertTriangle, CheckCircle } from "lucide-react";

interface AgentesExtintoresStats {
  total_lge: number;
  total_pqs: number;
  vencimento_proximo: number;
  disponivel_uso: number;
}

interface GraficoAgentesExtintoresProps {
  dados: AgentesExtintoresStats;
}

export const GraficoAgentesExtintores: React.FC<GraficoAgentesExtintoresProps> = ({ dados }) => {
  const dadosTipos = [
    {
      name: 'LGE',
      value: dados.total_lge,
      color: '#3b82f6'
    },
    {
      name: 'PQS',
      value: dados.total_pqs,
      color: '#ef4444'
    }
  ];

  const dadosStatus = [
    {
      status: 'Disponível',
      quantidade: dados.disponivel_uso,
      cor: '#10b981'
    },
    {
      status: 'Vencimento Próximo',
      quantidade: dados.vencimento_proximo,
      cor: '#f59e0b'
    },
    {
      status: 'Total',
      quantidade: dados.total_lge + dados.total_pqs,
      cor: '#6b7280'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Agentes Extintores - LGE/PQS
        </CardTitle>
        <CardDescription>
          Controle de estoque por tipo e status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Distribuição por Tipo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-4">Distribuição por Tipo</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={dadosTipos}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosTipos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4 className="font-medium mb-4">Status Operacional</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dadosStatus} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="status" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cards de Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{dados.disponivel_uso}</div>
              <div className="text-sm text-green-700">Disponível para Uso</div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">{dados.vencimento_proximo}</div>
              <div className="text-sm text-yellow-700">Vencimento Próximo</div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <Shield className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{dados.total_lge + dados.total_pqs}</div>
              <div className="text-sm text-blue-700">Total no Estoque</div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
