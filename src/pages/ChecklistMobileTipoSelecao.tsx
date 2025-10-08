import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Truck, Package, Ambulance, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function ChecklistMobileTipoSelecao() {
  const navigate = useNavigate();
  const { viaturaId } = useParams<{ viaturaId: string }>();

  const { data: viatura, isLoading } = useQuery({
    queryKey: ['viatura', viaturaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('viaturas')
        .select('id, prefixo, tipo')
        .eq('id', viaturaId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!viaturaId,
  });

  if (!viaturaId) {
    navigate('/checklist-mobile/viaturas');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!viatura) {
    return (
      <div className="min-h-screen p-4 bg-gradient-to-br from-background to-muted/20">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive">Viatura não encontrada</h1>
            <Button 
              className="mt-4"
              onClick={() => navigate('/checklist-mobile/viaturas')}
            >
              Voltar para viaturas
            </Button>
          </div>
        </div>
      </div>
    );
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card de Viatura */}
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

          {/* Card de Equipamentos - comum para todos */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
            onClick={() => navigate('/checklist-mobile/equipamentos/execucao', { state: { viaturaId } })}
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
        </div>
      </div>
    </div>
  );
}
