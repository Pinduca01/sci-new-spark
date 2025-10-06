import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Reutiliza o tipo de item para compatibilidade com ChecklistItemCard
import type { ChecklistItem, ChecklistTemplate } from '@/hooks/useChecklistMobileExecution';

export const useChecklistEquipamentoExecution = (equipamentoId: string) => {
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<ChecklistTemplate | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    loadChecklistData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipamentoId]);

  const loadChecklistData = async () => {
    setLoading(true);
    try {
      // 1) Tenta carregar template de EQUIPAMENTOS via tipos_checklist
      let tipoChecklist: { id: string; descricao: string } | null = null;
      try {
        const { data: tipoEquip } = await supabase
          .from('tipos_checklist')
          .select('id, descricao')
          .eq('descricao', 'EQUIPAMENTOS')
          .single();

        tipoChecklist = tipoEquip || null;

        // Fallback: GERAL
        if (!tipoChecklist) {
          const { data: tipoGeral } = await supabase
            .from('tipos_checklist')
            .select('id, descricao')
            .eq('descricao', 'GERAL')
            .single();
          tipoChecklist = tipoGeral || null;
        }

        if (tipoChecklist?.id) {
          const { data: itensTemplate, error: itensError } = await supabase
            .from('template_checklist')
            .select('id, item, categoria, ordem')
            .eq('tipo_checklist_id', tipoChecklist.id)
            .order('ordem', { ascending: true });

          if (!itensError && Array.isArray(itensTemplate) && itensTemplate.length > 0) {
            const builtTemplate: ChecklistTemplate = {
              id: tipoChecklist.id,
              nome: `Template ${tipoChecklist.descricao}`,
              tipo_viatura: 'EQUIPAMENTOS',
              itens: itensTemplate.map((it: any) => ({
                id: (it.id ?? crypto.randomUUID()).toString(),
                nome: it.item,
                categoria: it.categoria,
              }))
            };

            setTemplate(builtTemplate);
            initializeItems(builtTemplate.itens as any);
            toast.success('Template de equipamentos carregado (template_checklist)');
            loadAutoSavedProgress();
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Falha ao carregar template de equipamentos', e);
      }

      // 2) Se nada foi carregado, cria um fallback simples
      const fallback: ChecklistTemplate = {
        id: `equip_fallback`,
        nome: 'Checklist de Equipamento (Fallback)',
        tipo_viatura: 'EQUIPAMENTOS',
        itens: [
          { id: crypto.randomUUID(), nome: 'Condição geral do equipamento', categoria: 'EQUIPAMENTO' },
          { id: crypto.randomUUID(), nome: 'Quantidade disponível', categoria: 'EQUIPAMENTO' },
        ]
      };
      setTemplate(fallback);
      initializeItems(fallback.itens as any);
      toast.info('Usando template de equipamento (fallback)');
      loadAutoSavedProgress();
    } catch (error: any) {
      console.error('Erro ao carregar checklist de equipamento:', error);
      toast.error(error.message || 'Erro ao carregar checklist');
    } finally {
      setLoading(false);
    }
  };

  const initializeItems = (templateItems: any[]) => {
    const initializedItems: ChecklistItem[] = templateItems.map(item => ({
      id: item.id || crypto.randomUUID(),
      nome: item.nome,
      categoria: item.categoria,
      status: null,
      observacao: '',
      fotos: []
    }));
    setItems(initializedItems);
  };

  const autoSaveProgress = () => {
    try {
      const saveKey = `equip_checklist_progress_${equipamentoId}`;
      const dataToSave = items.map(({ id, status, observacao }) => ({
        id,
        status,
        observacao
      }));
      localStorage.setItem(saveKey, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Erro ao salvar progresso de equipamento:', error);
    }
  };

  const loadAutoSavedProgress = () => {
    try {
      const savedKey = `equip_checklist_progress_${equipamentoId}`;
      const savedData = localStorage.getItem(savedKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setItems(prevItems => 
          prevItems.map(item => {
            const saved = parsed.find((s: any) => s.id === item.id);
            return saved ? { ...item, ...saved, fotos: [] } : item;
          })
        );
        toast.info('Progresso anterior de equipamento recuperado');
      }
    } catch (error) {
      console.error('Erro ao carregar progresso de equipamento:', error);
    }
  };

  const updateItemStatus = (itemId: string, status: 'conforme' | 'nao_conforme' | 'nao_aplicavel') => {
    setItems(prev => 
      prev.map(item => item.id === itemId ? { ...item, status } : item)
    );
    autoSaveProgress();
  };

  const updateItemObservacao = (itemId: string, observacao: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, observacao } : item
      )
    );
    autoSaveProgress();
  };

  const addItemFotos = (itemId: string, newFotos: File[]) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, fotos: [...(item.fotos || []), ...newFotos].slice(0, 3) }
          : item
      )
    );
    autoSaveProgress();
  };

  const removeItemFoto = (itemId: string, fotoIndex: number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, fotos: item.fotos?.filter((_, idx) => idx !== fotoIndex) }
          : item
      )
    );
    autoSaveProgress();
  };

  const clearAutoSavedProgress = () => {
    try {
      localStorage.removeItem(`equip_checklist_progress_${equipamentoId}`);
    } catch (error) {
      console.error('Erro ao limpar progresso de equipamento:', error);
    }
  };

  const getProgress = () => {
    const total = items.length;
    const completed = items.filter(item => item.status !== null).length;
    return { total, completed, percentage: total > 0 ? (completed / total) * 100 : 0 };
  };

  const validateChecklist = (): { valid: boolean; message?: string } => {
    const incomplete = items.filter(item => item.status === null);
    if (incomplete.length > 0) {
      return {
        valid: false,
        message: `${incomplete.length} ${incomplete.length === 1 ? 'item não preenchido' : 'itens não preenchidos'}`
      };
    }

    const ncSemFotoOuObs = items.filter(
      item => item.status === 'nao_conforme' && 
      (!item.fotos || item.fotos.length === 0) && 
      (!item.observacao || item.observacao.trim() === '')
    );

    if (ncSemFotoOuObs.length > 0) {
      return {
        valid: false,
        message: 'Não conformidades precisam de foto ou observação'
      };
    }

    return { valid: true };
  };

  return {
    loading,
    template,
    items,
    updateItemStatus,
    updateItemObservacao,
    addItemFotos,
    removeItemFoto,
    getProgress,
    validateChecklist,
    clearAutoSavedProgress
  };
};