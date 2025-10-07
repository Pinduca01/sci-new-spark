import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { buildRealTemplateForViatura } from '@/utils/checklistTemplatesReal';
import { toast } from 'sonner';
import { saveToCache, getFromCache } from '@/lib/offlineDb';
import { buildFallbackTemplateForViatura } from '@/utils/checklistTemplatesFallback';
import { buildStaticTemplateForViatura } from '@/hooks/checklistStaticTemplates';

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

export const useChecklistMobileExecution = (viaturaId: string, tipoChecklistOverride?: string) => {
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<ChecklistTemplate | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [viatura, setViatura] = useState<any>(null);
  const [bombeiro, setBombeiro] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    console.log('[useChecklistMobileExecution] Iniciando hook');
    const controller = new AbortController();
    let isMounted = true;

    const load = async () => {
      if (!viaturaId) return;
      
      try {
        await loadChecklistData(controller.signal, isMounted);
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('[useChecklistMobileExecution] Request abortado');
          return;
        }
        console.error('[useChecklistMobileExecution] Erro no load:', error);
      }
    };

    load();

    return () => {
      console.log('[useChecklistMobileExecution] Cleanup');
      controller.abort();
      isMounted = false;
    };
  }, [viaturaId, tipoChecklistOverride]);

  const loadChecklistData = async (signal?: AbortSignal, isMounted: boolean = true) => {
    // Timeout de segurança
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('[useChecklistMobileExecution] Timeout de 10s atingido');
        setLoading(false);
      }
    }, 10000);

    try {
      setLoading(true);
      
      if (signal?.aborted) return;
      
      // Proteger contra id inválido (não-UUID) para evitar erro 22P02 no Postgres
      const isUuid = (value: string) => {
        return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(value);
      };
      if (!viaturaId || !isUuid(viaturaId)) {
        setLoading(false);
        toast.error('ID da viatura inválido. Abra a viatura pela lista.');
        return;
      }
      
      if (signal?.aborted) return;
      const isOnline = navigator.onLine;

      // Tentar carregar do cache primeiro se offline
      if (!isOnline) {
        const cachedData = await getFromCache(`checklist_data_${viaturaId}`);
        if (cachedData) {
          setViatura(cachedData.viatura);
          setBombeiro(cachedData.bombeiro);
          setTemplate(cachedData.template);
          initializeItems(cachedData.template.itens || []);
          loadAutoSavedProgress();
          toast.info('Dados carregados do cache (Modo Offline)');
          return;
        } else {
          throw new Error('Sem dados offline. Conecte à internet primeiro.');
        }
      }

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

      // 3. Tentar carregar itens do template_checklist
      try {
        let tipoChecklistNome: string | null = null;
        
        console.log('[Checklist] Iniciando busca de template', {
          tipoChecklistOverride,
          viaturaId,
          viaturaData
        });
        
        // Determinar qual template buscar baseado no override ou tipo da viatura
        if (tipoChecklistOverride === 'CRS') {
          tipoChecklistNome = 'CRS Viatura';
        } else if (tipoChecklistOverride === 'EQUIPAMENTOS') {
          tipoChecklistNome = 'CCI Equipamentos';
        } else if (viaturaData.tipo === 'CRS') {
          tipoChecklistNome = 'CRS Viatura';
        } else if (viaturaData.tipo === 'CCI' || viaturaData.tipo === 'BA-MC') {
          tipoChecklistNome = 'CCI Viatura';
        } else {
          // Fallback: tentar CCI Viatura como padrão
          tipoChecklistNome = 'CCI Viatura';
        }

        console.log('[Checklist] Buscando template:', tipoChecklistNome);
        
        // Buscar o tipo de checklist
        const { data: tipoChecklist, error: tipoError } = await supabase
          .from('tipos_checklist')
          .select('id, nome, descricao')
          .eq('nome', tipoChecklistNome)
          .maybeSingle();

        if (tipoError) {
          console.error('[Checklist] Erro ao buscar tipo:', tipoError);
          throw tipoError;
        }

        if (!tipoChecklist) {
          console.warn('[Checklist] Tipo de checklist não encontrado:', tipoChecklistNome);
          throw new Error(`Tipo de checklist não encontrado: ${tipoChecklistNome}`);
        }

        console.log('[Checklist] Tipo encontrado:', tipoChecklist);
        
        // Buscar os itens do template
        const { data: itensTemplate, error: itensError } = await supabase
          .from('template_checklist')
          .select('id, item, categoria, ordem')
          .eq('tipo_checklist_id', tipoChecklist.id)
          .order('ordem', { ascending: true });

        if (itensError) {
          console.error('[Checklist] Erro ao buscar itens:', itensError);
          throw itensError;
        }

        if (!itensTemplate || itensTemplate.length === 0) {
          console.warn('[Checklist] Nenhum item encontrado para tipo:', tipoChecklist.nome);
          throw new Error(`Nenhum item encontrado para ${tipoChecklist.nome}`);
        }

        console.log('[Checklist] Itens carregados:', itensTemplate.length);

        const builtTemplate = {
          id: tipoChecklist.id,
          nome: tipoChecklist.descricao,
          tipo_viatura: viaturaData.tipo,
          itens: itensTemplate.map((it: any) => ({
            id: it.id.toString(),
            nome: it.item,
            categoria: it.categoria,
          }))
        } as ChecklistTemplate;

        console.info('[Checklist] Template montado:', tipoChecklist.nome, 'com', itensTemplate.length, 'itens');

        setTemplate(builtTemplate as any);
        initializeItems((builtTemplate.itens as any) || []);

        await saveToCache(`checklist_data_${viaturaId}`, {
          viatura: viaturaData,
          bombeiro: bombeiroData,
          template: builtTemplate
        });

        loadAutoSavedProgress();
        setLoading(false);
        return; // Sucesso, não precisa de fallback
      } catch (e) {
        console.error('[Checklist] Erro ao carregar template:', e);
        console.warn('[Checklist] Tentando fallback para templates antigos...');
      }

      // 4. Fallback: Buscar template ativo antigo (checklist_templates JSONB)
      const tipoParaBuscar = tipoChecklistOverride || viaturaData.tipo;
      const { data: templateData, error: templateError } = await supabase
        .from('checklist_templates')
        .select('*')
        .eq('tipo_viatura', tipoParaBuscar)
        .eq('ativo', true)
        .maybeSingle();

      if (templateError) {
        // Se não houver template específico, tentar buscar template geral
        const { data: generalTemplate, error: generalError } = await supabase
          .from('checklist_templates')
          .select('*')
          .eq('tipo_viatura', 'GERAL')
          .eq('ativo', true)
          .maybeSingle();

        if (generalError || !generalTemplate) {
          // Tentar construir template real com base nas tabelas (equipamentos/agentes)
          try {
            const realTemplate = await buildRealTemplateForViatura(viaturaId, viaturaData.tipo as 'BA-MC' | 'BA-2');
            // Se o template real estiver muito pequeno, preferir o estático completo
            if (!realTemplate?.itens || realTemplate.itens.length < 12) {
              const staticTemplate = buildStaticTemplateForViatura(viaturaData.tipo);
              setTemplate(staticTemplate as any);
              initializeItems((staticTemplate.itens as any) || []);

              await saveToCache(`checklist_data_${viaturaId}`, {
                viatura: viaturaData,
                bombeiro: bombeiroData,
                template: staticTemplate
              });
            } else {
              setTemplate(realTemplate as any);
              initializeItems((realTemplate.itens as any) || []);

              await saveToCache(`checklist_data_${viaturaId}`, {
                viatura: viaturaData,
                bombeiro: bombeiroData,
                template: realTemplate
              });
            }
          } catch (e) {
            // Se não foi possível montar o template real, usar fallback estático completo (BA‑MC/CCI ou BA‑2)
            const staticTemplate = buildStaticTemplateForViatura(viaturaData.tipo);
            if (staticTemplate?.itens?.length) {
              setTemplate(staticTemplate as any);
              initializeItems((staticTemplate.itens as any) || []);

              await saveToCache(`checklist_data_${viaturaId}`, {
                viatura: viaturaData,
                bombeiro: bombeiroData,
                template: staticTemplate
              });
            } else {
              // Fallback mínimo caso o estático falhe
              const fallback = buildFallbackTemplateForViatura(viaturaData.tipo);
              setTemplate(fallback as any);
              initializeItems((fallback.itens as any) || []);

              await saveToCache(`checklist_data_${viaturaId}`, {
                viatura: viaturaData,
                bombeiro: bombeiroData,
                template: fallback
              });
            }
          }
        } else {
          setTemplate(generalTemplate as any);
          initializeItems((generalTemplate.itens as any) || []);
          
          // Salvar no cache
          await saveToCache(`checklist_data_${viaturaId}`, {
            viatura: viaturaData,
            bombeiro: bombeiroData,
            template: generalTemplate
          });
        }
      } else {
        setTemplate(templateData as any);
        initializeItems((templateData.itens as any) || []);
        
        // Salvar no cache
        await saveToCache(`checklist_data_${viaturaId}`, {
          viatura: viaturaData,
          bombeiro: bombeiroData,
          template: templateData
        });
      }

      // 5. Tentar carregar progresso salvo do localStorage
      if (isMounted) {
        loadAutoSavedProgress();
      }
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.error('Erro ao carregar dados:', error);
      if (isMounted) {
        toast.error(error.message || 'Erro ao carregar checklist');
      }
    } finally {
      clearTimeout(timeoutId);
      if (isMounted) {
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