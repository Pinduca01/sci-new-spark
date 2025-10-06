import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useCurrentUserName } from '@/hooks/useCurrentUserName';
import { useAgentesExtintores } from '@/hooks/useAgentesExtintores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { saveChecklistOffline } from '@/lib/offlineDb';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChecklistItemCard } from '@/components/checklist-mobile/ChecklistItemCard';
import { ChecklistProgress } from '@/components/checklist-mobile/ChecklistProgress';
import { useChecklistEquipamentoExecution } from '@/hooks/useChecklistEquipamentoExecution';

export default function ChecklistMobileEquipamentoExecucao() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { loading: roleLoading, canDoChecklist, isBA2, baseName } = useUserRole();
  const { name: userName } = useCurrentUserName();
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

  const equipamento = useMemo(() => agentes.find(a => a.id === id), [agentes, id]);

  // Hook de execução específico para equipamentos (carrega template_checklist via tipos_checklist -> EQUIPAMENTOS)
  const {
    loading: execLoading,
    template,
    items,
    updateItemStatus,
    updateItemObservacao,
    addItemFotos,
    removeItemFoto,
    getProgress,
    validateChecklist,
    clearAutoSavedProgress
  } = useChecklistEquipamentoExecution(id!);

  const progress = getProgress();

  // Agrupar itens por categoria
  const itemsByCategory = useMemo(() => {
    const grouped = items.reduce((acc, item) => {
      const category = item.categoria || 'Geral';
      if (!acc[category]) acc[category] = [] as typeof items;
      acc[category].push(item);
      return acc;
    }, {} as Record<string, typeof items>);
    return grouped;
  }, [items]);

  const handleSalvarOffline = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Sessão expirada');
        navigate('/checklist-mobile/login');
        return;
      }

      // Validar preenchimento
      const validation = validateChecklist();
      if (!validation.valid) {
        toast.error(validation.message || 'Checklist incompleto');
        return;
      }

      const offlineId = `equip-${id}-${Date.now()}`;

      // Mapear itens preenchidos
      const itensChecklist = items.map((item) => ({
        item_id: item.id,
        descricao: item.nome,
        categoria: item.categoria,
        conforme: item.status === 'conforme',
        observacoes: item.observacao || '',
      }));

      // Mapear fotos
      const photos = items.flatMap((item) =>
        (item.fotos || []).map((file, idx) => ({
          item_id: item.id,
          blob: file,
          name: file.name || `${item.id}-${idx}.jpg`,
        }))
      );

      // Mapear não conformidades
      const naoConformidades = items
        .filter((it) => it.status === 'nao_conforme')
        .map((it) => ({
          item_id: it.id,
          descricao: it.nome,
          observacao: it.observacao,
          nivel: 'baixa',
        }));

      await saveChecklistOffline({
        id: offlineId,
        viatura_id: viaturaId || 'equipamento',
        template_id: template?.id || 'EQUIPAMENTOS',
        bombeiro_id: session.user.id,
        bombeiro_nome: userName || 'Usuário',
        data_checklist: new Date().toISOString().split('T')[0],
        hora_checklist: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status: 'pending_sync',
        itens_checklist: itensChecklist,
        photos,
        nao_conformidades: naoConformidades,
      });

      toast.success('Checklist salvo offline!');
      navigate('/checklist-mobile/sync');
    } catch (error) {
      console.error('Erro ao salvar checklist offline:', error);
      toast.error('Erro ao salvar checklist');
    }
  };

  if (loading || roleLoading || equipamentosLoading || execLoading) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Carregando execução do checklist...</p>
      </div>
    );
  }

  if (!equipamento) {
    return (
      <div className="min-h-screen p-6">
        <Button variant="outline" onClick={() => navigate('/checklist-mobile/equipamentos')}>Voltar</Button>
        <Card className="mt-4">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Equipamento não encontrado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/checklist-mobile/equipamentos')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Checklist de Equipamento
            </h1>
            <p className="text-sm text-muted-foreground">Base: {baseName}</p>
          </div>
        </div>

        {/* Info do equipamento */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{equipamento.tipo_agente || equipamento.tipo}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Lote</span>
                <div className="font-medium">{equipamento.lote ?? '—'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Quantidade</span>
                <div className="font-medium">{equipamento.quantidade} {equipamento.unidade}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Situação</span>
                <div>
                  <Badge variant="secondary">{equipamento.situacao}</Badge>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Viatura</span>
                <div className="font-medium">{viaturaId ? viaturaId : '—'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progresso */}
        {template && (
          <Card>
            <CardContent className="pt-6">
              <ChecklistProgress {...progress} />
            </CardContent>
          </Card>
        )}

        {/* Itens do template divididos por categoria */}
        <Accordion type="single" collapsible className="space-y-3">
          {Object.entries(itemsByCategory).map(([categoria, categoryItems]) => (
            <AccordionItem key={categoria} value={categoria} className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center justify-between w-full pr-2">
                  <span className="font-semibold">{categoria}</span>
                  <span className="text-sm text-muted-foreground">
                    {categoryItems.filter(i => i.status !== null).length}/{categoryItems.length}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-3">
                {categoryItems.map((item, index) => (
                  <ChecklistItemCard
                    key={item.id}
                    item={item}
                    index={index}
                    onStatusChange={(status) => updateItemStatus(item.id, status)}
                    onObservacaoChange={(obs) => updateItemObservacao(item.id, obs)}
                    onAddFotos={(fotos) => addItemFotos(item.id, fotos)}
                    onRemoveFoto={(idx) => removeItemFoto(item.id, idx)}
                  />
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Footer: Finalizar */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
          <Button
            onClick={handleSalvarOffline}
            disabled={progress.percentage < 100}
            className="w-full h-12 text-base"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Finalizar Checklist
          </Button>
        </div>
      </div>
    </div>
  );
}