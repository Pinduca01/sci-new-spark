
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, TrendingUp, Users, Clock } from "lucide-react";
import { useTAF } from "@/hooks/useTAF";
import TAFCharts from "./TAFCharts";

const TAFDashboard = () => {
  const { estatisticas, isLoadingEstatisticas, avaliacoes, isLoadingAvaliacoes } = useTAF();

  if (isLoadingEstatisticas || isLoadingAvaliacoes) {
    return <div>Carregando dashboard...</div>;
  }

  const formatarNumero = (num: number | undefined) => {
    return num ? Number(num).toFixed(1) : '0.0';
  };

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatarNumero(estatisticas?.taxa_aprovacao)}%
            </div>
            <Progress 
              value={estatisticas?.taxa_aprovacao || 0} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Testes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estatisticas?.total_avaliacoes || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Últimos 12 meses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bombeiros Pendentes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {estatisticas?.bombeiros_pendentes || 0}
            </div>
            <Badge variant="destructive" className="mt-1">
              Precisam fazer TAF
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div>Flexões: {formatarNumero(estatisticas?.media_flexoes)}</div>
              <div>Abdominais: {formatarNumero(estatisticas?.media_abdominais)}</div>
              <div>Polichinelos: {formatarNumero(estatisticas?.media_polichinelos)}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <TAFCharts avaliacoes={avaliacoes} />
    </div>
  );
};

export default TAFDashboard;
