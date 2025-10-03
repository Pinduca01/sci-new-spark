import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ChecklistItem {
  id: string;
  nome: string;
  categoria?: string;
  status?: 'conforme' | 'nao_conforme' | 'nao_aplicavel' | null;
  observacao?: string;
  nao_conformidade_id?: string;
  fotos?: File[];
}

export interface ChecklistTemplate {
  id: string;
  nome: string;
  tipo_viatura: string;
  itens: Array<{
    id: string;
    nome: string;
    categoria?: string;
  }>;
}

export const useChecklistMobileExecution = (viaturaId: string) => {
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<ChecklistTemplate | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [viatura, setViatura] = useState<any>(null);
  const [bombeiro, setBombeiro] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadChecklistData();
  }, [viaturaId]);

  const loadChecklistData = async () => {
    try {
      setLoading(true);

      // 1. Buscar dados da viatura
      const { data: viaturaData, error: viaturaError } = await supabase
        .from('viaturas')
        .select('*')
        .eq('id', viaturaId)
        .single();

      if (viaturaError) throw viaturaError;
      setViatura(viaturaData);

      // 2. Buscar dados do bombeiro logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: bombeiroData, error: bombeiroError } = await supabase
        .from('bombeiros')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (bombeiroError) throw bombeiroError;
      setBombeiro(bombeiroData);

      // 3. Buscar template ativo para o tipo de viatura
      const { data: templateData, error: templateError } = await supabase
        .from('checklist_templates')
        .select('*')
        .eq('tipo_viatura', viaturaData.tipo)
        .eq('ativo', true)
        .single();

      if (templateError) {
        // Se não houver template específico, tentar buscar template geral
        const { data: generalTemplate, error: generalError } = await supabase
          .from('checklist_templates')
          .select('*')
          .eq('tipo_viatura', 'GERAL')
          .eq('ativo', true)
          .single();

        if (generalError) throw new Error('Nenhum template ativo encontrado');
        setTemplate(generalTemplate as any);
        initializeItems((generalTemplate.itens as any) || []);
      } else {
        setTemplate(templateData as any);
        initializeItems((templateData.itens as any) || []);
      }

      // 4. Tentar carregar progresso salvo do localStorage
      loadAutoSavedProgress();
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
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

  const loadAutoSavedProgress = () => {
    try {
      const savedKey = `checklist_progress_${viaturaId}`;
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
      console.error('Erro ao carregar progresso:', error);
    }
  };

  const updateItemStatus = (itemId: string, status: 'conforme' | 'nao_conforme' | 'nao_aplicavel') => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, status, fotos: status !== 'nao_conforme' ? [] : item.fotos }
          : item
      )
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

  const autoSaveProgress = () => {
    try {
      const saveKey = `checklist_progress_${viaturaId}`;
      const dataToSave = items.map(({ id, status, observacao }) => ({
        id,
        status,
        observacao
      }));
      localStorage.setItem(saveKey, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
    }
  };

  const clearAutoSavedProgress = () => {
    try {
      localStorage.removeItem(`checklist_progress_${viaturaId}`);
    } catch (error) {
      console.error('Erro ao limpar progresso:', error);
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
    saving,
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
  };
};
