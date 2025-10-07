import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, History, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChecklistItemCard } from '@/components/checklist-mobile/ChecklistItemCard';
import { ChecklistProgress } from '@/components/checklist-mobile/ChecklistProgress';
import { OnlineStatusBadge } from '@/components/checklist-mobile/OnlineStatusBadge';
import { useChecklistMobileExecution } from '@/hooks/useChecklistMobileExecution';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { saveChecklistOffline } from '@/lib/offlineDb';
import { Progress } from '@/components/ui/progress';
import { ShineBorder } from '../components/ui/shine-border';

export default function ChecklistMobileViatura() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const tipoCRS = location.state?.tipoCRS === true;
  const [saving, setSaving] = useState(false);
  const [finalizado, setFinalizado] = useState(false);
  const [createdChecklistId, setCreatedChecklistId] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<string>('');
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const firstItemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lastAnsweredItemIdRef = useRef<string | null>(null);
  const SCROLL_OFFSET = 80; // ajuste conforme altura do header fixo

  const smoothScrollToTop = (el: HTMLElement, offset = SCROLL_OFFSET) => {
    const y = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  // Validação simples de UUID (versões com 36 chars e hífens)
  const isValidUUID = (value: string | undefined) => {
    if (!value) return false;
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(value);
  };

  const viaturaIdValida = isValidUUID(id);

  // Se o id da rota for inválido, evitar inicializar o hook que consulta Supabase
  const {
    loading,
    template,
    items,
    viatura,
    bombeiro,
    updateItemStatus,
    updateItemObservacao,
    addItemFotos,
    removeItemFoto,
    getProgress,
    validateChecklist,
    clearAutoSavedProgress
  } = useChecklistMobileExecution(viaturaIdValida ? id! : '', tipoCRS ? 'CRS' : undefined);

  const progress = getProgress();

  // Auto-scroll para o primeiro item ao mudar a categoria
  useEffect(() => {
    if (!currentSection) return;
    // Aguardar transição de abertura do Accordion para calcular posição final
    const timer = setTimeout(() => {
      const el = firstItemRefs.current[currentSection];
      if (el) smoothScrollToTop(el);
    }, 250);
    return () => clearTimeout(timer);
  }, [currentSection]);

  // Render de proteção para id inválido de viatura (evita erro 22P02 - UUID)
  if (!viaturaIdValida) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/checklist-mobile')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-bold text-lg">Checklist de Viatura</h1>
        </div>
        <Alert>
          <AlertDescription>
            ID da viatura inválido. Use um link gerado pela lista de viaturas.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => navigate('/checklist-mobile')}>Voltar para lista</Button>
        </div>
      </div>
    );
  }

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

  // Após classificar um item, avançar para o próximo item não classificado.
  useEffect(() => {
    const lastId = lastAnsweredItemIdRef.current;
    if (!lastId) return;

    // Identificar categoria e posição do item respondido
    const answeredItem = items.find(i => i.id === lastId);
    const category = answeredItem?.categoria || 'Geral';
    const categoryItems = itemsByCategory[category] || [];
    const currentIndex = categoryItems.findIndex(i => i.id === lastId);

    // Buscar próximo item não classificado na mesma categoria
    const nextInCategory = categoryItems.find((i, idx) => idx > currentIndex && !i.status);
    if (nextInCategory) {
      const target = itemRefs.current[nextInCategory.id];
      if (target) smoothScrollToTop(target);
      lastAnsweredItemIdRef.current = null;
      return;
    }

    // Caso não tenha, avançar para a próxima categoria com itens pendentes
    const categories = Object.keys(itemsByCategory);
    const catIndex = categories.indexOf(category);
    const nextCategory = categories.slice(catIndex + 1).find(cat => itemsByCategory[cat]?.some(i => !i.status));
    if (nextCategory) {
      setCurrentSection(nextCategory);
    }

    lastAnsweredItemIdRef.current = null;
  }, [items, itemsByCategory]);

  const handleFinalizarChecklist = async () => {
    const validation = validateChecklist();
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }
    setSaving(true);
    const isOnline = navigator.onLine;
    
    try {
      // Se offline, salvar localmente
      if (!isOnline) {
        const naoConformidades = items.filter(item => item.status === 'nao_conforme').map(item => ({
          item_id: item.id,
          item_nome: item.nome,
          secao: item.categoria || 'Geral',
          descricao: item.observacao || 'Não conforme',
          imagens: []
        }));

        await saveChecklistOffline({
          id: crypto.randomUUID(),
          viatura_id: id!,
          template_id: template?.id!,
          bombeiro_id: bombeiro?.id!,
          bombeiro_nome: bombeiro?.nome!,
          data_checklist: new Date().toISOString().split('T')[0],
          hora_checklist: new Date().toTimeString().split(' ')[0],
          status: 'pending_sync',
          itens_checklist: items.map(item => ({
            id: item.id,
            nome: item.nome,
            categoria: item.categoria,
            status: item.status,
            observacao: item.observacao
          })),
          photos: items
            .filter(item => item.fotos && item.fotos.length > 0)
            .flatMap(item => 
              item.fotos!.map(foto => ({
                item_id: item.id,
                blob: foto,
                name: foto.name
              }))
            ),
          nao_conformidades: naoConformidades
        });

        clearAutoSavedProgress();
        setFinalizado(true);
        setCreatedChecklistId(null);
        toast.success('Checklist finalizado (offline). Será sincronizado quando houver conexão.');
        return;
      }
      // 1. Fazer upload de todas as fotos de NC
      const naoConformidades = items.filter(item => item.status === 'nao_conforme');
      const uploadedNCs = await Promise.all(
        naoConformidades.map(async (item) => {
          const fotosUrls: string[] = [];

          if (item.fotos && item.fotos.length > 0) {
            for (const foto of item.fotos) {
              const fileName = `${crypto.randomUUID()}_${foto.name}`;
              const filePath = `${id}/${fileName}`;

              const { error: uploadError } = await supabase.storage
                .from('nao-conformidades')
                .upload(filePath, foto);

              if (uploadError) throw uploadError;

              const { data: { publicUrl } } = supabase.storage
                .from('nao-conformidades')
                .getPublicUrl(filePath);

              fotosUrls.push(publicUrl);
            }
          }

          return {
            item_id: item.id,
            item_nome: item.nome,
            secao: item.categoria || 'Geral',
            descricao: item.observacao || 'Não conforme',
            imagens: fotosUrls,
            imagem_url: fotosUrls[0] || null // Compatibilidade
          };
        })
      );

      // 2. Criar registro do checklist
      const { data: checklistData, error: checklistError } = await supabase
        .from('checklists_viaturas')
        .insert({
          viatura_id: id,
          template_id: template?.id,
          bombeiro_responsavel_id: bombeiro?.id,
          bombeiro_responsavel: bombeiro?.nome,
          tipo_checklist: tipoCRS ? 'CRS' : 'VIATURA',
          equipe: bombeiro?.equipe,
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
          observacoes_gerais: `Checklist realizado via mobile. ${uploadedNCs.length} não conformidade(s) detectada(s).`,
          timestamp_conclusao: new Date().toISOString()
        })
        .select()
        .single();

      if (checklistError) throw checklistError;

      // 3. Inserir não conformidades
      if (uploadedNCs.length > 0) {
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
              bombeiro_responsavel: bombeiro?.nome
            }))
          );

        if (ncError) throw ncError;
      }

      // 4. Registrar no timeline
      await supabase.rpc('registrar_timeline_checklist', {
        p_checklist_id: checklistData.id,
        p_checklist_tipo: 'viatura',
        p_operacao: 'CREATE',
        p_descricao: `Checklist mobile concluído por ${bombeiro?.nome}`,
        p_dados_alterados: {
          viatura: viatura?.prefixo,
          total_itens: items.length,
          nao_conformidades: uploadedNCs.length
        }
      });

      // 5. Limpar progresso salvo
      clearAutoSavedProgress();
      setFinalizado(true);
      setCreatedChecklistId(checklistData.id);
      toast.success('Checklist finalizado com sucesso!');
      
      // Navegar para o histórico após 1.5 segundos
      setTimeout(() => {
        navigate(`/checklist-mobile/historico/${viatura.id}`);
      }, 1500);
    } catch (error: any) {
      console.error('Erro ao salvar checklist:', error);
      toast.error('Erro ao finalizar checklist: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Carregando checklist...</p>
        </div>
      </div>
    );
  }

  if (!template || !viatura || !bombeiro) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Alert variant="destructive">
          <AlertDescription>
            Erro ao carregar dados do checklist. Verifique sua conexão.
          </AlertDescription>
        </Alert>
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
          <Button onClick={() => navigate(`/checklist-mobile/historico/${id}`)} className="min-w-[160px]">Ver detalhes</Button>
          <Button variant="outline" onClick={() => navigate('/checklist-mobile')} className="min-w-[160px]">Voltar ao início</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <OnlineStatusBadge />
      
      {/* Header Fixo */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="relative">
          <ShineBorder className="rounded-none" shineColor={["#f97316","#8b5cf6","#06b6d4"]} />
        </div>
        <div className="flex items-center justify-between p-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/checklist-mobile')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center flex-1">
            <h1 className="font-bold text-lg">{viatura.prefixo}</h1>
            <p className="text-sm text-muted-foreground">{template.nome}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/checklist-mobile/historico/${id}`)}
          >
            <History className="w-5 h-5" />
          </Button>
        </div>

        <div className="px-3 pb-2">
          <ChecklistProgress {...progress} />
        </div>
        {/* Navbar horizontal removida conforme solicitação */}
      </div>

      {/* Conteúdo */}
      <div className="p-3 space-y-3">
        <Accordion
          type="single"
          collapsible
          value={currentSection}
          onValueChange={setCurrentSection}
          className="space-y-2"
        >
          {Object.entries(itemsByCategory).map(([categoria, categoryItems]) => {
            const done = categoryItems.filter(i => i.status !== null).length;
            const total = categoryItems.length;
            const percentage = Math.round((done / total) * 100);
            return (
            <AccordionItem key={categoria} value={categoria} className="border rounded-xl bg-card shadow-sm data-[state=open]:border-primary data-[state=open]:shadow-md">
              <AccordionTrigger className="px-3 py-2 hover:no-underline rounded-lg transition-colors data-[state=open]:bg-primary/5 data-[state=open]:text-primary">
                <div className="flex items-center justify-between w-full gap-3 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{categoria}</span>
                    <span className="text-xs rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                      {done}/{total}
                    </span>
                  </div>
                  <div className="flex-1">
                    <Progress value={percentage} className="h-1" />
                  </div>
                  <span className="text-xs text-muted-foreground w-10 text-right">{percentage}%</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 space-y-2">
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
          );})}
        </Accordion>
      </div>

      {/* Footer Fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t p-4">
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
  );
}
