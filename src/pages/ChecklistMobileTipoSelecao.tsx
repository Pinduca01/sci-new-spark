import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Truck, Package, Ambulance } from 'lucide-react';

export default function ChecklistMobileTipoSelecao() {
  const navigate = useNavigate();
  const { viaturaId } = useParams<{ viaturaId: string }>();

  if (!viaturaId) {
    navigate('/checklist-mobile/viaturas');
    return null;
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/checklist-mobile/viaturas')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Selecione o Tipo de Checklist</h1>
            <p className="text-sm text-muted-foreground">Escolha qual checklist deseja realizar</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
            onClick={() => navigate(`/checklist-mobile/viatura/${viaturaId}`)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-6 w-6 text-primary" />
                Checklist de Viatura
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Verificação completa da viatura: pneus, luzes, equipamentos, documentação e itens de segurança.
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
            onClick={() => navigate('/checklist-mobile/equipamentos', { state: { viaturaId } })}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" />
                Checklist de Equipamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Verificação de equipamentos de combate a incêndio, EPIs, EPRs e materiais especializados.
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
            onClick={() => navigate(`/checklist-mobile/viatura/${viaturaId}`, { state: { tipoCRS: true } })}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ambulance className="h-6 w-6 text-primary" />
                Checklist CRS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Carro de Resgate e Salvamento - Equipamentos especializados, ferramentas e materiais de resgate.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
