
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';
import { useTAFEstatisticas } from '@/hooks/useTAFEstatisticas';

const TAFDashboard = () => {
  const { estatisticas, isLoading } = useTAFEstatisticas();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
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

  const cards = [
    {
      title: "Taxa de Aprovação",
      value: `${estatisticas?.taxa_aprovacao?.toFixed(1) || 0}%`,
      icon: CheckCircle,
      description: "Últimos 12 meses",
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Total de Avaliações",
      value: estatisticas?.total_avaliacoes || 0,
      icon: Activity,
      description: "Últimos 12 meses",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Bombeiros Pendentes",
      value: estatisticas?.bombeiros_pendentes || 0,
      icon: AlertTriangle,
      description: "TAF vencido",
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      title: "Bombeiros Ativos",
      value: ((estatisticas?.total_avaliacoes || 0) - (estatisticas?.bombeiros_pendentes || 0)),
      icon: Users,
      description: "TAF em dia",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <Card key={index} className="glass-card hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.description}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${card.bgColor}`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Médias de Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Flexões</span>
                <span>{estatisticas?.media_flexoes?.toFixed(1) || 0}/30</span>
              </div>
              <Progress 
                value={((estatisticas?.media_flexoes || 0) / 30) * 100} 
                className="h-2" 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Abdominais</span>
                <span>{estatisticas?.media_abdominais?.toFixed(1) || 0}/45</span>
              </div>
              <Progress 
                value={((estatisticas?.media_abdominais || 0) / 45) * 100} 
                className="h-2" 
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Polichinelos</span>
                <span>{estatisticas?.media_polichinelos?.toFixed(1) || 0}/45</span>
              </div>
              <Progress 
                value={((estatisticas?.media_polichinelos || 0) / 45) * 100} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Distribuição de Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">TAF em Dia</span>
                </div>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  {((estatisticas?.total_avaliacoes || 0) - (estatisticas?.bombeiros_pendentes || 0))} bombeiros
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium">TAF Vencido</span>
                </div>
                <Badge variant="outline" className="text-red-700 border-red-300">
                  {estatisticas?.bombeiros_pendentes || 0} bombeiros
                </Badge>
              </div>

              {estatisticas && (
                <div className="mt-4 p-4 bg-muted/20 rounded-lg">
                  <p className="text-sm text-muted-foreground text-center">
                    <strong>Taxa de Conformidade:</strong>{' '}
                    {(((estatisticas.total_avaliacoes - estatisticas.bombeiros_pendentes) / Math.max(estatisticas.total_avaliacoes, 1)) * 100).toFixed(1)}%
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TAFDashboard;
