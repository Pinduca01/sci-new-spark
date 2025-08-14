import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, Calendar, Wrench, AlertTriangle, CheckCircle } from "lucide-react";

interface Viatura {
  id: string;
  prefixo: string;
  placa: string;
  modelo: string;
  ano: number;
  tipo: string;
  status: string;
  km_atual: number;
  data_ultima_revisao: string | null;
  proxima_revisao: string | null;
  observacoes: string | null;
}

interface ViaturasGridProps {
  viaturas: Viatura[];
  onSelectViatura: (viatura: Viatura) => void;
}

export const ViaturasGrid = ({ viaturas, onSelectViatura }: ViaturasGridProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-emerald-500';
      case 'manutenção': return 'bg-amber-500';
      case 'inativo': return 'bg-red-500';
      default: return 'bg-muted';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ativo': return 'default';
      case 'manutenção': return 'secondary';
      case 'inativo': return 'destructive';
      default: return 'outline';
    }
  };

  const isRevisaoVencida = (proximaRevisao: string | null) => {
    if (!proximaRevisao) return false;
    return new Date(proximaRevisao) < new Date();
  };

  const formatKm = (km: number) => {
    return new Intl.NumberFormat('pt-BR').format(km);
  };

  if (viaturas.length === 0) {
    return (
      <div className="text-center py-12">
        <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Nenhuma viatura cadastrada
        </h3>
        <p className="text-sm text-muted-foreground">
          Clique em "Adicionar Nova Viatura" para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {viaturas.map((viatura) => (
        <Card 
          key={viatura.id} 
          className="glass-card hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-l-4 border-l-primary"
          onClick={() => onSelectViatura(viatura)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-semibold">
                  {viatura.prefixo}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className={`w-3 h-3 rounded-full ${getStatusColor(viatura.status)}`}
                  title={`Status: ${viatura.status}`}
                />
                {isRevisaoVencida(viatura.proxima_revisao) && (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                )}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">
                {viatura.placa}
              </p>
              <Badge variant={getStatusBadgeVariant(viatura.status)} className="w-fit">
                {viatura.status.charAt(0).toUpperCase() + viatura.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Modelo:</span>
                <span className="font-medium">{viatura.modelo}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Ano:</span>
                <span className="font-medium">{viatura.ano}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="font-medium">{viatura.tipo}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Km Atual:</span>
                <span className="font-medium">{formatKm(viatura.km_atual)} km</span>
              </div>
            </div>

            {viatura.proxima_revisao && (
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-muted-foreground">Próxima Revisão:</p>
                    <p className={`font-medium ${isRevisaoVencida(viatura.proxima_revisao) ? 'text-destructive' : 'text-foreground'}`}>
                      {new Date(viatura.proxima_revisao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectViatura(viatura);
                }}
              >
                Ver Detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};