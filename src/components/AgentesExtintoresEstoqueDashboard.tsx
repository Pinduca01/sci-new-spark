import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Droplets, 
  Flame, 
  Wind, 
  AlertTriangle
} from "lucide-react";
import { useAgentesExtintores } from "@/hooks/useAgentesExtintores";
import { Skeleton } from "@/components/ui/skeleton";

const AgentesExtintoresEstoqueDashboard = () => {
  const { loading, getEstatisticas } = useAgentesExtintores();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = getEstatisticas();





  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LGE Total</CardTitle>
            <Droplets className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLGE.toLocaleString()} L</div>

          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pó Químico</CardTitle>
            <Flame className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPoQuimico.toLocaleString()} Kg</div>

          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nitrogênio</CardTitle>
            <Wind className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNitrogenio} Cilindros</div>

          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Alertas de Validade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.alertasValidade.length === 0 ? (
                <div className="text-sm text-muted-foreground py-4 text-center">
                  Nenhum alerta de validade nos próximos 30 dias
                </div>
              ) : (
                stats.alertasValidade.map((agente) => {
                  const diasRestantes = Math.ceil(
                    (new Date(agente.data_validade).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  
                  return (
                    <Alert key={agente.id} className={diasRestantes <= 7 ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex justify-between items-center">
                          <div>
                            <strong>{agente.tipo} - {agente.fabricante}:</strong>
                            <br />
                            <span className="text-sm">
                              Vence em {diasRestantes} dias ({new Date(agente.data_validade).toLocaleDateString('pt-BR')})
                            </span>
                          </div>
                          <Badge variant={diasRestantes <= 7 ? "destructive" : "secondary"}>
                            {diasRestantes <= 7 ? "URGENTE" : "ATENÇÃO"}
                          </Badge>
                        </div>
                      </AlertDescription>
                    </Alert>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Resumo por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">LGE</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{stats.agentesPorTipo.LGE} itens</div>
                  <div className="text-xs text-muted-foreground">{stats.totalLGE.toLocaleString()} L total</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Pó Químico</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{stats.agentesPorTipo.PO_QUIMICO} itens</div>
                  <div className="text-xs text-muted-foreground">{stats.totalPoQuimico.toLocaleString()} Kg total</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Nitrogênio</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{stats.agentesPorTipo.NITROGENIO} itens</div>
                  <div className="text-xs text-muted-foreground">{stats.totalNitrogenio} cilindros total</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentesExtintoresEstoqueDashboard;