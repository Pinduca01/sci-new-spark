import { useEffect, useMemo, useState, memo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useAgentesExtintores, AgenteExtintor } from '@/hooks/useAgentesExtintores';

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
  const { agentes, loading: equipamentosLoading } = useAgentesExtintores();
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
        if (!canDoChecklist || !isBA2) {
          toast.error('Acesso negado ao checklist de equipamentos');
          navigate('/login');
          return;
        }

        setLoading(false);
      }
    };

    init();
  }, [navigate, roleLoading, canDoChecklist, isBA2]);

  const handleEquipamentoClick = useCallback((id: string) => {
    navigate(`/checklist-mobile/equipamento/${id}`, { state: { viaturaId } });
  }, [navigate, viaturaId]);

  if (loading || roleLoading || equipamentosLoading) {
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
            Checklist de Equipamentos (BA-2)
          </h1>
          <Button variant="outline" onClick={() => navigate('/checklist-mobile')}>Voltar</Button>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Base: {baseName}</span>
          <span>{agentes.length} equipamento(s) disponível(is)</span>
        </div>

        {agentes.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Nenhum equipamento disponível. Em breve: seleção por almoxarifado/material.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {agentes.map((eq: AgenteExtintor) => (
              <EquipamentoCard key={eq.id} eq={eq} onClick={() => handleEquipamentoClick(eq.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const EquipamentoCard = memo(function EquipamentoCard(
  { eq, onClick }: { eq: AgenteExtintor; onClick: () => void }
) {
  return (
    <Card onClick={onClick} className="cursor-pointer">
      <CardHeader>
        <CardTitle className="text-base">{eq.tipo_agente || eq.tipo}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          Lote: {eq.lote ?? '—'} • Quantidade: {eq.quantidade} {eq.unidade}
        </div>
      </CardContent>
    </Card>
  );
});