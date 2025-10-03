import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, History, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChecklistItemCard } from '@/components/checklist-mobile/ChecklistItemCard';
import { ChecklistProgress } from '@/components/checklist-mobile/ChecklistProgress';
import { AssinaturaDigital } from '@/components/AssinaturaDigital';
import { useChecklistMobileExecution } from '@/hooks/useChecklistMobileExecution';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ChecklistMobileViatura() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [showAssinatura, setShowAssinatura] = useState(false);
  const [currentSection, setCurrentSection] = useState<string>('');

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
  } = useChecklistMobileExecution(id!);

  const progress = getProgress();

  // Agrupar itens por categoria
  const itemsByCategory = useMemo(() => {
    const grouped = items.reduce((acc, item) => {
      const category = item.categoria || 'Geral';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {} as Record<string, typeof items>);
    return grouped;
  }, [items]);

  const handleFinalizarChecklist = () => {
    const validation = validateChecklist();
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }
    setShowAssinatura(true);
  };

  const handleAssinaturaConcluida = async (dados: { documentoId: string; linkAssinatura: string; status: string; assinaturaBase64?: string }) => {
    setSaving(true);
    try {
      const assinaturaUrl = dados.assinaturaBase64 || dados.linkAssinatura;
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
          tipo_checklist: template?.tipo_viatura,
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
          assinatura_digital: assinaturaUrl,
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

      toast.success('Checklist finalizado com sucesso!');
      navigate('/checklist-mobile');
    } catch (error: any) {
      console.error('Erro ao salvar checklist:', error);
      toast.error('Erro ao finalizar checklist: ' + error.message);
    } finally {
      setSaving(false);
      setShowAssinatura(false);
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

  if (showAssinatura) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setShowAssinatura(false)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <AssinaturaDigital
            onAssinaturaConcluida={handleAssinaturaConcluida}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Fixo */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center justify-between p-4">
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

        <div className="px-4 pb-3">
          <ChecklistProgress {...progress} />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4 space-y-4">
        <Accordion
          type="single"
          collapsible
          value={currentSection}
          onValueChange={setCurrentSection}
          className="space-y-3"
        >
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
      </div>

      {/* Footer Fixo */}
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
  );
}
