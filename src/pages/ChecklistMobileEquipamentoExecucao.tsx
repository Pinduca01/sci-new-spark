import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useCurrentUserName } from '@/hooks/useCurrentUserName';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  const { loading: roleLoading, canDoChecklist, isBA2, baseName } = useUserRole();
  const { name: userName } = useCurrentUserName();

  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [finalizado, setFinalizado] = useState(false);
  const [createdChecklistId, setCreatedChecklistId] = useState<string | null>(null);

  // Offset configurável para compensar header fixo
  const SCROLL_OFFSET = 80;

  // Refs para itens e primeiro item por categoria, e último item respondido
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const firstItemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lastAnsweredItemIdRef = useRef<string | null>(null);

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
  }, [navigate, roleLoading, canDoChecklist, isBA2]);

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
  } = useChecklistEquipamentoExecution(viaturaId);

  const progress = getProgress();

  // Agrupar itens por categoria
  const itemsByCategory = useMemo(() => {
    const grouped = items.reduce((acc, item) => {
      const category = item.categoria || 'Geral';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {} as Record<string, typeof items>);
    // Definir seção inicial na primeira categoria com itens não concluídos
    const firstIncomplete = Object.entries(grouped).find(([_, arr]) => arr.some(i => !i.status));
    if (!currentSection && firstIncomplete) {
      setCurrentSection(firstIncomplete[0]);
    }
    return grouped;
  }, [items, currentSection]);

  // Auto-scroll para o primeiro item ao mudar a categoria
  useEffect(() => {
    if (!currentSection) return;
    const el = firstItemRefs.current[currentSection];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentSection]);

  // Após classificar um item, avançar para o próximo item não classificado ou próxima categoria
  useEffect(() => {
    const lastId = lastAnsweredItemIdRef.current;
    if (!lastId) return;

    const answeredItem = items.find(i => i.id === lastId);
    const category = answeredItem?.categoria || 'Geral';
    const categoryItems = itemsByCategory[category] || [];
    const currentIndex = categoryItems.findIndex(i => i.id === lastId);

    // Próximo item não classificado na mesma categoria
    const nextInCategory = categoryItems.find((i, idx) => idx > currentIndex && !i.status);
    if (nextInCategory) {
      const target = itemRefs.current[nextInCategory.id];
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      lastAnsweredItemIdRef.current = null;
      return;
    }

    // Próxima categoria com itens pendentes
    const categories = Object.keys(itemsByCategory);
    const catIndex = categories.indexOf(category);
    const nextCategory = categories.slice(catIndex + 1).find(cat => itemsByCategory[cat]?.some(i => !i.status));
    if (nextCategory) {
      setCurrentSection(nextCategory);
    }

    lastAnsweredItemIdRef.current = null;
  }, [items, itemsByCategory]);

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

      const offlineId = `equip-${viaturaId}-${Date.now()}`;

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
      clearAutoSavedProgress();
      setFinalizado(true);
      setCreatedChecklistId(null);
      toast.success('Checklist salvo offline! Será sincronizado quando houver conexão.');
    } catch (error) {
      console.error('Erro ao salvar checklist offline:', error);
      toast.error('Erro ao salvar checklist');
    }
  };

  const handleFinalizarChecklist = async () => {
    const validation = validateChecklist();
    if (!validation.valid) {
      toast.error(validation.message || 'Checklist incompleto');
      return;
    }
    setSaving(true);

    const isOnline = navigator.onLine;
    try {
      if (!isOnline) {
        await handleSalvarOffline();
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Sessão expirada');
        navigate('/checklist-mobile/login');
        return;
      }

      // 1) Upload das imagens de não conformidade (até 3 por item)
      const uploadedNCs = await Promise.all(
        items
          .filter(item => item.status === 'nao_conforme')
          .map(async (item) => {
            const fotos = item.fotos || [];
            const fotosUrls: string[] = [];
            for (let i = 0; i < Math.min(fotos.length, 3); i++) {
              const file = fotos[i];
              const fileName = `${Date.now()}_${item.id}_${i}.jpg`;
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('nao-conformidades')
                .upload(fileName, file, { contentType: file.type || 'image/jpeg', upsert: false });
              if (uploadError) {
                console.warn('Falha ao subir imagem de NC:', uploadError.message);
                continue;
              }
              const { data: publicUrl } = supabase.storage.from('nao-conformidades').getPublicUrl(uploadData.path);
              if (publicUrl?.publicUrl) fotosUrls.push(publicUrl.publicUrl);
            }
            return {
              item_id: item.id,
              item_nome: item.nome,
              secao: item.categoria || 'Geral',
              descricao: item.observacao || 'Não conforme',
              imagens: fotosUrls,
              imagem_url: fotosUrls[0] || null
            };
          })
      );

      // 2) Criar registro do checklist (armazenado em checklists_viaturas com tipo BA-2)
      const { data: checklistData, error: checklistError } = await supabase
        .from('checklists_viaturas')
        .insert({
          viatura_id: viaturaId,
          template_id: template?.id,
          bombeiro_responsavel_id: session.user.id,
          bombeiro_responsavel: userName || 'Usuário',
          tipo_checklist: 'EQUIPAMENTOS',
          data_checklist: new Date().toISOString().split('T')[0],
          hora_checklist: new Date().toTimeString().split(' ')[0],
          status_geral: uploadedNCs.length > 0 ? 'pendente' : 'aprovado',
          itens_checklist: items.map(item => ({
            id: item.id,
            nome: item.nome,
            categoria: item.categoria,
            status: item.status,
            observacao: item.observacao
          })),
          observacoes_gerais: `Checklist de equipamentos (BA-2) realizado via mobile. ${uploadedNCs.length} não conformidade(s).`,
          timestamp_conclusao: new Date().toISOString()
        })
        .select()
        .single();

      if (checklistError) throw checklistError;

      // 3) Inserir não conformidades vinculadas
      if (uploadedNCs.length > 0 && checklistData?.id) {
        const { error: ncError } = await supabase
          .from('nao_conformidades')
          .insert(
            uploadedNCs.map(nc => ({
              checklist_id: checklistData.id,
              item_id: nc.item_id,
              item_nome: nc.item_nome,
              secao: nc.secao,
              descricao: nc.descricao,
              imagens: nc.imagens,
              imagem_url: nc.imagem_url,
              bombeiro_responsavel: userName || 'Usuário'
            }))
          );
        if (ncError) throw ncError;
      }

      // 4) Registrar timeline
      if (checklistData?.id) {
        await supabase.rpc('registrar_timeline_checklist', {
          p_checklist_id: checklistData.id,
          p_checklist_tipo: 'viatura',
          p_operacao: 'CREATE',
          p_descricao: `Checklist de equipamentos concluído por ${userName || 'Usuário'}`,
          p_dados_alterados: {
            viatura: viaturaId || '—',
            total_itens: items.length,
            nao_conformidades: uploadedNCs.length
          }
        });
      }

      clearAutoSavedProgress();
      setFinalizado(true);
      setCreatedChecklistId(checklistData?.id || null);
      toast.success('Checklist de equipamentos finalizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao finalizar checklist:', error);
      toast.error('Erro ao finalizar checklist: ' + (error?.message || 'desconhecido'));
    } finally {
      setSaving(false);
    }
  };

  if (loading || roleLoading || execLoading) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Carregando execução do checklist...</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen p-6">
        <Button variant="outline" onClick={() => navigate('/checklist-mobile/equipamentos')}>Voltar</Button>
        <Card className="mt-4">
          <CardContent className="pt-6">
            <p className="text-center text-destructive">Erro ao carregar template do checklist. Verifique sua conexão.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (finalizado) {
    return (
      <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Checklist Finalizado</h2>
        <p className="text-muted-foreground mb-6">Registro concluído no SCI Core{createdChecklistId ? '' : ' (offline)'}.</p>
        <div className="flex gap-3">
          {viaturaId ? (
            <Button onClick={() => navigate(`/checklist-mobile/historico/${viaturaId}`)} className="min-w-[160px]">Ver detalhes</Button>
          ) : null}
          <Button variant="outline" onClick={() => navigate('/checklist-mobile')} className="min-w-[160px]">Voltar ao início</Button>
        </div>
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

        {/* Info do checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">CCI Equipamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p className="text-muted-foreground">
                Checklist completo de equipamentos da viatura conforme procedimento CCI.
              </p>
              <div className="font-medium">
                Total de itens: {template?.itens?.length || 0}
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
        <Accordion
          type="single"
          collapsible
          value={currentSection}
          onValueChange={setCurrentSection}
          className="space-y-3"
        >
          {Object.entries(itemsByCategory).map(([categoria, categoryItems]) => (
            <AccordionItem key={categoria} value={categoria} className="border rounded-lg data-[state=open]:border-primary data-[state=open]:shadow-md">
              <AccordionTrigger className="px-4 hover:no-underline data-[state=open]:bg-primary/5 data-[state=open]:text-primary rounded-lg">
                <div className="flex items-center justify-between w-full pr-2">
                  <span className="font-semibold">{categoria}</span>
                  <span className="text-sm text-muted-foreground">
                    {categoryItems.filter(i => i.status !== null).length}/{categoryItems.length}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-3">
                {categoryItems.map((item, index) => (
                  <div
                    key={item.id}
                    ref={(el) => {
                      itemRefs.current[item.id] = el;
                      if (index === 0) {
                        firstItemRefs.current[categoria] = el;
                      }
                    }}
                    style={{ scrollMarginTop: SCROLL_OFFSET }}
                  >
                    <ChecklistItemCard
                      item={item}
                      index={index}
                      onStatusChange={(status) => {
                        lastAnsweredItemIdRef.current = item.id;
                        updateItemStatus(item.id, status);
                      }}
                      onObservacaoChange={(obs) => updateItemObservacao(item.id, obs)}
                      onAddFotos={(fotos) => addItemFotos(item.id, fotos)}
                      onRemoveFoto={(idx) => removeItemFoto(item.id, idx)}
                    />
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Footer: Finalizar */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
          <Button
            onClick={handleFinalizarChecklist}
            disabled={saving || progress.percentage < 100}
            className="w-full h-12 text-base"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            {saving ? 'Salvando...' : 'Finalizar Checklist'}
          </Button>
        </div>
      </div>
    </div>
  );
}