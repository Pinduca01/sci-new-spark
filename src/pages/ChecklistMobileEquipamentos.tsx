import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Package, ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';

interface EquipamentoResumo {
  id: string;
  nome: string;
  codigo?: string;
  status?: string;
}

export default function ChecklistMobileEquipamentos() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loading: roleLoading, canDoChecklist, isBA2, baseName } = useUserRole();
  const [loading, setLoading] = useState(true);

  const viaturaId = useMemo(() => {
    const state = location.state as { viaturaId?: string } | undefined;
    return state?.viaturaId ?? null;
  }, [location.state]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/checklist-mobile/login');
        return;
      }

      if (!roleLoading) {
        if (!canDoChecklist) {
          toast.error('Acesso negado ao checklist de equipamentos');
          navigate('/checklist-mobile/login');
          return;
        }

        setLoading(false);
      }
    };

    init();
  }, [navigate, roleLoading, canDoChecklist]);

  const handleIniciarChecklist = () => {
    navigate('/checklist-mobile/equipamentos/execucao', { state: { viaturaId } });
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Carregando equipamentos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Checklist de Equipamentos
          </h1>
          <Button variant="outline" onClick={() => navigate(viaturaId ? `/checklist-mobile/tipo/${viaturaId}` : '/checklist-mobile/viaturas')}>
            Voltar
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <span>Base: {baseName}</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              CCI Equipamentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Checklist completo de equipamentos da viatura conforme procedimento CCI.
              Inclui 64 itens de verificação distribuídos em categorias.
            </p>
            <Button onClick={handleIniciarChecklist} className="w-full">
              Iniciar Checklist
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
