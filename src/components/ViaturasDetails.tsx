import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Truck, 
  Calendar, 
  Wrench, 
  FileText, 
  Plus,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { ChecklistForm } from "@/components/ChecklistForm";
import { OrdemServicoForm } from "@/components/OrdemServicoForm";
import { HistoricoChecklists } from "@/components/HistoricoChecklists";

interface Viatura {
  id: string;
  nome_viatura: string;
  prefixo: string;
  modelo: string;
  tipo: string;
  status: string;
  observacoes: string | null;
}

interface ViaturasDetailsProps {
  viatura: Viatura;
  onBack: () => void;
  onUpdate: () => void;
}

export const ViaturasDetails = ({ viatura, onBack, onUpdate }: ViaturasDetailsProps) => {
  const [showChecklistBAMC, setShowChecklistBAMC] = useState(false);
  const [showChecklistBA2, setShowChecklistBA2] = useState(false);
  const [showOS, setShowOS] = useState(false);
  const [activeTab, setActiveTab] = useState("ba-mc");

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex items-center gap-3">
          <Truck className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{viatura.prefixo}</h1>
            <p className="text-muted-foreground">{viatura.nome_viatura} • {viatura.modelo}</p>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Informações da Viatura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(viatura.status)}`} />
                <Badge variant={getStatusBadgeVariant(viatura.status)}>
                  {viatura.status.charAt(0).toUpperCase() + viatura.status.slice(1)}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tipo</p>
              <p className="font-medium">{viatura.tipo}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Prefixo</p>
              <p className="font-medium">{viatura.prefixo}</p>
            </div>
          </div>

          {viatura.observacoes && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Observações</p>
              <p className="text-sm">{viatura.observacoes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]" 
                onClick={() => setShowChecklistBAMC(true)}>
            <CardContent className="p-6 text-center">
              <ClipboardCheck className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Checklist BA-MC</h3>
              <p className="text-sm text-muted-foreground">Iniciar checklist de materiais médicos</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]" 
                onClick={() => setShowChecklistBA2(true)}>
            <CardContent className="p-6 text-center">
              <ClipboardCheck className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Checklist BA-2</h3>
              <p className="text-sm text-muted-foreground">Iniciar checklist da viatura</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Históricos */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ba-mc" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Histórico checklist BA-MC
          </TabsTrigger>
          <TabsTrigger value="ba-2" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Histórico checklist BA-2
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="ba-mc">
          <HistoricoChecklists viaturaId={viatura.id} tipoFiltro="BA-MC" />
        </TabsContent>
        
        <TabsContent value="ba-2">
          <HistoricoChecklists viaturaId={viatura.id} tipoFiltro="BA-2" />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showChecklistBAMC && (
        <ChecklistForm
          tipo="BA-MC"
          viaturaId={viatura.id}
          viaturaPrefixo={viatura.prefixo}
          onClose={() => setShowChecklistBAMC(false)}
          onSave={() => {
            setShowChecklistBAMC(false);
            onUpdate();
          }}
        />
      )}

      {showChecklistBA2 && (
        <ChecklistForm
          tipo="BA-2"
          viaturaId={viatura.id}
          viaturaPrefixo={viatura.prefixo}
          onClose={() => setShowChecklistBA2(false)}
          onSave={() => {
            setShowChecklistBA2(false);
            onUpdate();
          }}
        />
      )}

      {showOS && (
        <OrdemServicoForm
          viaturaId={viatura.id}
          viaturaPrefixo={viatura.prefixo}
          onClose={() => setShowOS(false)}
          onSave={() => {
            setShowOS(false);
            onUpdate();
          }}
        />
      )}
    </div>
  );
};