
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, Package, TrendingUp } from "lucide-react";
import { useAgentesExtintores } from "@/hooks/useAgentesExtintores";

export const AgentesExtintoresDashboard = () => {
  const { agentes, alertas } = useAgentesExtintores();

  const estatisticas = {
    totalLGE: agentes.filter(a => a.tipo_agente === 'LGE' && a.status_uso === 'disponivel').length,
    totalPQS: agentes.filter(a => a.tipo_agente === 'PQS' && a.status_uso === 'disponivel').length,
    proximosVencimento: alertas.filter(a => a.nivel_alerta === 'alto' || a.nivel_alerta === 'critico').length,
    vencidos: alertas.filter(a => a.nivel_alerta === 'critico').length
  };

  const getNivelAlertaColor = (nivel: string) => {
    switch (nivel) {
      case 'critico': return 'bg-red-500';
      case 'alto': return 'bg-orange-500';
      case 'medio': return 'bg-yellow-500';
      case 'baixo': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getNivelAlertaBadge = (nivel: string) => {
    switch (nivel) {
      case 'critico': return 'destructive';
      case 'alto': return 'secondary';
      case 'medio': return 'outline';
      case 'baixo': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LGE Disponível</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{estatisticas.totalLGE}</div>
            <p className="text-xs text-muted-foreground">
              Líquido Gerador de Espuma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PQS Disponível</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{estatisticas.totalPQS}</div>
            <p className="text-xs text-muted-foreground">
              Pó Químico Seco
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próx. Vencimento</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{estatisticas.proximosVencimento}</div>
            <p className="text-xs text-muted-foreground">
              Lotes em 30-60 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{estatisticas.vencidos}</div>
            <p className="text-xs text-muted-foreground">
              Necessitam atenção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Vencimento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Alertas de Vencimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alertas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <p className="text-lg font-medium">Nenhum alerta no momento</p>
              <p className="text-sm">Todos os lotes estão dentro do prazo de validade</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alertas.map((alerta, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${getNivelAlertaColor(alerta.nivel_alerta)}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{alerta.tipo_agente}</span>
                        <Badge variant="outline">Lote {alerta.lote}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {alerta.quantidade} unidades • Vence em {alerta.dias_para_vencimento} dias
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={getNivelAlertaBadge(alerta.nivel_alerta) as any}>
                      {alerta.nivel_alerta.charAt(0).toUpperCase() + alerta.nivel_alerta.slice(1)}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(alerta.data_vencimento).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
