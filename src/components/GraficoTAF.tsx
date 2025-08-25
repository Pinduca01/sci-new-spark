
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Users, TrendingUp } from "lucide-react";
import { TAFEstatisticas } from '@/hooks/useTAFEstatisticas';

interface GraficoTAFProps {
  dados?: TAFEstatisticas;
}

export const GraficoTAF: React.FC<GraficoTAFProps> = ({ dados }) => {
  if (!dados) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              Carregando dados TAF...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dadosExercicios = [
    {
      exercicio: 'Flexões',
      media: dados.media_flexoes || 0,
      meta: 30,
      cor: '#3b82f6'
    },
    {
      exercicio: 'Abdominais',
      media: dados.media_abdominais || 0,
      meta: 45,
      cor: '#10b981'
    },
    {
      exercicio: 'Polichinelos',
      media: dados.media_polichinelos || 0,
      meta: 45,
      cor: '#f59e0b'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance por Exercício
          </CardTitle>
          <CardDescription>
            Média vs Meta por exercício
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosExercicios}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="exercicio" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="media" fill="#3b82f6" name="Média" />
              <Bar dataKey="meta" fill="#e5e7eb" name="Meta" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Taxa de Aprovação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {dados.taxa_aprovacao?.toFixed(1) || 0}%
              </div>
              <p className="text-sm text-muted-foreground">Últimos 12 meses</p>
            </div>
            
            <Progress value={dados.taxa_aprovacao || 0} className="h-3" />
            
            <Badge variant={dados.taxa_aprovacao >= 80 ? "default" : "destructive"} className="w-full justify-center">
              {dados.taxa_aprovacao >= 80 ? "Meta Atingida" : "Abaixo da Meta"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Status dos Bombeiros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">TAF em Dia</span>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  {((dados.total_avaliacoes || 0) - (dados.bombeiros_pendentes || 0))} bombeiros
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium">TAF Vencido</span>
                <Badge variant="outline" className="text-red-700 border-red-300">
                  {dados.bombeiros_pendentes || 0} bombeiros
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
