import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Reutiliza o tipo de item para compatibilidade com ChecklistItemCard
import type { ChecklistItem, ChecklistTemplate } from '@/hooks/useChecklistMobileExecution';

export const useChecklistEquipamentoExecution = (viaturaId?: string | null) => {
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<ChecklistTemplate | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    console.log('[useChecklistEquipamentoExecution] Iniciando hook');
    const controller = new AbortController();
    let isMounted = true;

    const load = async () => {
      try {
        await loadChecklistData(controller.signal, isMounted);
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('[useChecklistEquipamentoExecution] Request abortado');
          return;
        }
        console.error('[useChecklistEquipamentoExecution] Erro no load:', error);
      }
    };

    load();

    return () => {
      console.log('[useChecklistEquipamentoExecution] Cleanup');
      controller.abort();
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadChecklistData = async (signal?: AbortSignal, isMounted: boolean = true) => {
    console.log('[useChecklistEquipamentoExecution] 🔄 Iniciando carregamento...');
    setLoading(true);
    
    // Timeout de segurança reduzido para 8s
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.error('[useChecklistEquipamentoExecution] ⚠️ Timeout de 8s atingido');
        setLoading(false);
        toast.error('Tempo limite excedido ao carregar checklist');
      }
    }, 8000);
    
    try {
      if (signal?.aborted) {
        console.log('[useChecklistEquipamentoExecution] Request abortado');
        return;
      }
      
      console.log('[useChecklistEquipamentoExecution] 📋 Buscando template CCI Equipamentos...');
      
      // Buscar template de EQUIPAMENTOS CCI via tipos_checklist
      const { data: tipoEquip, error: tipoError } = await supabase
        .from('tipos_checklist')
        .select('id, nome, descricao')
        .eq('nome', 'CCI Equipamentos')
        .maybeSingle();

      if (tipoError) {
        console.error('[useChecklistEquipamentoExecution] ❌ Erro ao buscar tipo:', tipoError);
        throw tipoError;
      }

      if (!tipoEquip) {
        console.error('[useChecklistEquipamentoExecution] ❌ Tipo CCI Equipamentos não encontrado');
        throw new Error('Template de equipamentos não encontrado');
      }

      console.log('[useChecklistEquipamentoExecution] ✅ Tipo encontrado:', tipoEquip.id);

      console.log('[useChecklistEquipamentoExecution] 📦 Buscando itens do template...');
      
      const { data: itensTemplate, error: itensError } = await supabase
        .from('template_checklist')
        .select('id, item, categoria, ordem')
        .eq('tipo_checklist_id', tipoEquip.id)
        .order('ordem', { ascending: true });

      if (itensError) {
        console.error('[useChecklistEquipamentoExecution] ❌ Erro ao buscar itens:', itensError);
        throw itensError;
      }

      if (!itensTemplate || itensTemplate.length === 0) {
        console.error('[useChecklistEquipamentoExecution] ❌ Nenhum item encontrado');
        throw new Error('Nenhum item encontrado para checklist de equipamentos');
      }

      console.log('[useChecklistEquipamentoExecution] ✅ Itens carregados:', itensTemplate.length);

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

      console.log('[useChecklistEquipamentoExecution] ✅ Template montado:', tipoEquip.nome, 'com', itensTemplate.length, 'itens');

      if (!isMounted) return;

      setTemplate(builtTemplate);
      initializeItems(builtTemplate.itens as any);
      loadAutoSavedProgress();
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('[useChecklistEquipamentoExecution] Request abortado');
        return;
      }
      
      console.error('[useChecklistEquipamentoExecution] ❌ Erro ao carregar:', error);
      
      if (isMounted) {
        toast.error(error.message || 'Erro ao carregar checklist');
        
        // Template vazio para evitar crashes
        setTemplate({
          id: '',
          nome: 'Erro ao carregar',
          tipo_viatura: 'EQUIPAMENTOS',
          itens: []
        });
        
        setItems([]);
      }
    } finally {
      clearTimeout(timeoutId);
      if (isMounted) {
        console.log('[useChecklistEquipamentoExecution] ✅ Finalizando loading...');
        setLoading(false);
      }
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
      const saveKey = `equip_checklist_progress_${viaturaId || 'geral'}`;
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
      const savedKey = `equip_checklist_progress_${viaturaId || 'geral'}`;
      const savedData = localStorage.getItem(savedKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setItems(prevItems => 
          prevItems.map(item => {
            const saved = parsed.find((s: any) => s.id === item.id);
            return saved ? { ...item, ...saved, fotos: [] } : item;
          })
        );
        toast.info('Progresso anterior recuperado');
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
      localStorage.removeItem(`equip_checklist_progress_${viaturaId || 'geral'}`);
    } catch (error) {
      console.error('Erro ao limpar progresso de equipamento:', error);
    }
  };

  const getProgress = () => {
    if (!items || items.length === 0) {
      return { total: 0, completed: 0, percentage: 0 };
    }
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