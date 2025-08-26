
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
  Clock,
  QrCode
} from "lucide-react";
import { ChecklistForm } from "@/components/ChecklistForm";
import { OrdemServicoForm } from "@/components/OrdemServicoForm";
import { HistoricoChecklists } from "@/components/HistoricoChecklists";
import { HistoricoOS } from "@/components/HistoricoOS";
import { QRGenerator } from "@/components/qr-checklist/QRGenerator";

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
  qr_code?: string;
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
  const [activeTab, setActiveTab] = useState("overview");

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
            <p className="text-muted-foreground">{viatura.placa} • {viatura.modelo}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <p className="text-sm text-muted-foreground">Ano</p>
              <p className="font-medium">{viatura.ano}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Km Atual</p>
              <p className="font-medium">{formatKm(viatura.km_atual)} km</p>
            </div>
          </div>

          {/* QR Code Status */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">QR Code para Checklist</p>
                {viatura.qr_code ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <QrCode className="h-3 w-3" />
                    QR Ativo
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <QrCode className="h-3 w-3" />
                    Sem QR Code
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {(viatura.data_ultima_revisao || viatura.proxima_revisao) && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {viatura.data_ultima_revisao && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Última Revisão</p>
                    <p className="font-medium">{new Date(viatura.data_ultima_revisao).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
                {viatura.proxima_revisao && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Próxima Revisão</p>
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${isRevisaoVencida(viatura.proxima_revisao) ? 'text-destructive' : ''}`}>
                        {new Date(viatura.proxima_revisao).toLocaleDateString('pt-BR')}
                      </p>
                      {isRevisaoVencida(viatura.proxima_revisao) && (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {viatura.observacoes && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Observações</p>
              <p className="text-sm">{viatura.observacoes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]" 
              onClick={() => setShowOS(true)}>
          <CardContent className="p-6 text-center">
            <Wrench className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Gerar OS</h3>
            <p className="text-sm text-muted-foreground">Criar ordem de serviço</p>
          </CardContent>
        </Card>
      </div>

      {/* Históricos */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="checklists" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Histórico de Checklists
          </TabsTrigger>
          <TabsTrigger value="os" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Histórico de OS
          </TabsTrigger>
          <TabsTrigger value="qr-code" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            QR Code
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="checklists">
          <HistoricoChecklists viaturaId={viatura.id} />
        </TabsContent>
        
        <TabsContent value="os">
          <HistoricoOS viaturaId={viatura.id} />
        </TabsContent>
        
        <TabsContent value="qr-code">
          <QRGenerator viaturas={[viatura]} onUpdate={onUpdate} />
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
