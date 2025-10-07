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
      console.log('[Checklist Equipamento] Iniciando carregamento para equipamento:', equipamentoId);
      
      // Buscar template de EQUIPAMENTOS CCI via tipos_checklist
      const { data: tipoEquip, error: tipoError } = await supabase
        .from('tipos_checklist')
        .select('id, nome, descricao')
        .eq('nome', 'CCI Equipamentos')
        .maybeSingle();

      if (tipoError) {
        console.error('[Checklist Equipamento] Erro ao buscar tipo:', tipoError);
        throw tipoError;
      }

      if (!tipoEquip) {
        console.warn('[Checklist Equipamento] Tipo CCI Equipamentos não encontrado');
        throw new Error('Template de equipamentos não encontrado');
      }

      console.log('[Checklist Equipamento] Tipo encontrado:', tipoEquip);

      const { data: itensTemplate, error: itensError } = await supabase
        .from('template_checklist')
        .select('id, item, categoria, ordem')
        .eq('tipo_checklist_id', tipoEquip.id)
        .order('ordem', { ascending: true });

      if (itensError) {
        console.error('[Checklist Equipamento] Erro ao buscar itens:', itensError);
        throw itensError;
      }

      if (!itensTemplate || itensTemplate.length === 0) {
        console.warn('[Checklist Equipamento] Nenhum item encontrado');
        throw new Error('Nenhum item encontrado para checklist de equipamentos');
      }

      console.log('[Checklist Equipamento] Itens carregados:', itensTemplate.length);

      const builtTemplate: ChecklistTemplate = {
        id: tipoEquip.id,
        nome: tipoEquip.descricao,
        tipo_viatura: 'EQUIPAMENTOS',
        itens: itensTemplate.map((it: any) => ({
          id: it.id.toString(),
          nome: it.item,
          categoria: it.categoria,
        }))
      };

      console.info('[Checklist Equipamento] Template montado:', tipoEquip.nome, 'com', itensTemplate.length, 'itens');

      setTemplate(builtTemplate);
      initializeItems(builtTemplate.itens as any);
      loadAutoSavedProgress();
      setLoading(false);
    } catch (error: any) {
      console.error('Erro ao carregar checklist de equipamento:', error);
      toast.error(error.message || 'Erro ao carregar checklist');
      setLoading(false); // Permitir que o componente mostre erro
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