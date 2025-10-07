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
    loadChecklistData();
  }, [viaturaId, tipoChecklistOverride]);

  const loadChecklistData = async () => {
    try {
      setLoading(true);
      // Proteger contra id inválido (não-UUID) para evitar erro 22P02 no Postgres
      const isUuid = (value: string) => {
        return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(value);
      };
      if (!viaturaId || !isUuid(viaturaId)) {
        setLoading(false);
        toast.error('ID da viatura inválido. Abra a viatura pela lista.');
        return;
      }
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

      // 3. Tentar carregar itens do template_checklist (estratégia direta e robusta)
      try {
        let tipoChecklistId: string | null = null;
        
        // Estratégia 1: Se tipoChecklistOverride for fornecido, usar ele
        if (tipoChecklistOverride) {
          if (tipoChecklistOverride === 'CRS') {
            const { data: tipoCRS } = await supabase
              .from('tipos_checklist')
              .select('id, nome, descricao')
              .eq('nome', 'CRS Viatura')
              .maybeSingle();
            tipoChecklistId = tipoCRS?.id || null;
          } else if (tipoChecklistOverride === 'EQUIPAMENTOS') {
            const { data: tipoEquip } = await supabase
              .from('tipos_checklist')
              .select('id, nome, descricao')
              .eq('nome', 'CCI Equipamentos')
              .maybeSingle();
            tipoChecklistId = tipoEquip?.id || null;
          }
        }
        
        // Estratégia 2: Mapear por tipo de viatura
        if (!tipoChecklistId) {
          if (viaturaData.tipo === 'CRS') {
            const { data: tipoCRS } = await supabase
              .from('tipos_checklist')
              .select('id, nome, descricao')
              .eq('nome', 'CRS Viatura')
              .maybeSingle();
            tipoChecklistId = tipoCRS?.id || null;
          } else if (viaturaData.tipo === 'CCI') {
            // Para CCI, assumir checklist de VIATURA por padrão
            const { data: tipoViatura } = await supabase
              .from('tipos_checklist')
              .select('id, nome, descricao')
              .eq('nome', 'CCI Viatura')
              .maybeSingle();
            tipoChecklistId = tipoViatura?.id || null;
          }
        }
        
        // Se encontrou um tipo válido, buscar os itens
        if (tipoChecklistId) {
          const { data: itensTemplate, error: itensError } = await supabase
            .from('template_checklist')
            .select('id, item, categoria, ordem, tipo_checklist_id')
            .eq('tipo_checklist_id', tipoChecklistId)
            .order('ordem', { ascending: true });

          if (!itensError && Array.isArray(itensTemplate) && itensTemplate.length > 0) {
            const { data: tipoInfo } = await supabase
              .from('tipos_checklist')
              .select('nome, descricao')
              .eq('id', tipoChecklistId)
              .maybeSingle();

            const builtTemplate = {
              id: tipoChecklistId,
              nome: tipoInfo?.descricao || `Template ${viaturaData.tipo}`,
              tipo_viatura: viaturaData.tipo,
              itens: itensTemplate.map((it: any) => ({
                id: (it.id ?? crypto.randomUUID()).toString(),
                nome: it.item,
                categoria: it.categoria,
              }))
            } as ChecklistTemplate;

            console.info('[Checklist] Template carregado:', tipoInfo?.nome, 'com', itensTemplate.length, 'itens');

            setTemplate(builtTemplate as any);
            initializeItems((builtTemplate.itens as any) || []);

            await saveToCache(`checklist_data_${viaturaId}`, {
              viatura: viaturaData,
              bombeiro: bombeiroData,
              template: builtTemplate
            });

            loadAutoSavedProgress();
            setLoading(false);
            return;
          }
        }

        console.warn('[Checklist] Nenhum template encontrado em template_checklist');
      } catch (e) {
        console.warn('Falha ao carregar itens de template_checklist, tentando outras fontes...', e);
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