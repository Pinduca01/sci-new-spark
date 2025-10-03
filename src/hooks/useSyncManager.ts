import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  getChecklistsToSync, 
  updateChecklistStatus, 
  markAsSynced, 
  deleteLocalChecklist,
  getPendingCount 
} from '@/lib/offlineDb';

export const useSyncManager = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const updatePendingCount = useCallback(async () => {
    const count = await getPendingCount();
    setPendingCount(count);
  }, []);

  useEffect(() => {
    updatePendingCount();

    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Conexão restabelecida! Sincronizando...');
      startSync();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Modo offline ativado');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const uploadPhoto = async (photo: { blob: Blob; name: string }, checklistId: string) => {
    const file = new File([photo.blob], photo.name, { type: photo.blob.type });
    
    const { data, error } = await supabase.storage
      .from('checklist-photos')
      .upload(`${checklistId}/${photo.name}`, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('checklist-photos')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const syncSingleChecklist = async (checklist: any) => {
    try {
      await updateChecklistStatus(checklist.id, 'syncing');

      // 1. Upload de fotos
      const uploadedPhotos: { [key: string]: string[] } = {};
      
      for (const photo of checklist.photos) {
        const url = await uploadPhoto(photo, checklist.id);
        if (!uploadedPhotos[photo.item_id]) {
          uploadedPhotos[photo.item_id] = [];
        }
        uploadedPhotos[photo.item_id].push(url);
      }

      // 2. Atualizar itens com URLs das fotos
      const itensComFotos = checklist.itens_checklist.map((item: any) => ({
        ...item,
        fotos: uploadedPhotos[item.id] || []
      }));

      // 3. Criar checklist no Supabase
      const { data: checklistData, error: checklistError } = await supabase
        .from('checklists_viaturas')
        .insert({
          viatura_id: checklist.viatura_id,
          template_id: checklist.template_id,
          bombeiro_responsavel_id: checklist.bombeiro_id,
          bombeiro_responsavel: checklist.bombeiro_nome,
          data_checklist: checklist.data_checklist,
          hora_checklist: checklist.hora_checklist,
          itens_checklist: itensComFotos,
          assinatura_digital: checklist.assinatura_base64,
          status_geral: 'concluido',
          tipo_checklist: 'diario'
        })
        .select()
        .single();

      if (checklistError) throw checklistError;

      // 4. Registrar não conformidades
      if (checklist.nao_conformidades && checklist.nao_conformidades.length > 0) {
        for (const nc of checklist.nao_conformidades) {
          const { error: ncError } = await supabase
            .from('nao_conformidades')
            .insert({
              checklist_id: checklistData.id,
              item_id: nc.item_id,
              item_nome: nc.item_nome,
              secao: nc.secao || 'Geral',
              descricao: nc.descricao,
              imagens: nc.imagens || [],
              bombeiro_responsavel: checklist.bombeiro_nome
            });

          if (ncError) throw ncError;
        }
      }

      // 5. Registrar no timeline
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('registrar_timeline_checklist', {
          p_checklist_id: checklistData.id,
          p_checklist_tipo: 'viatura',
          p_operacao: 'CREATE',
          p_descricao: 'Checklist criado offline e sincronizado'
        });
      }

      await markAsSynced(checklist.id);
      await deleteLocalChecklist(checklist.id);

      return { success: true, checklistId: checklistData.id };
    } catch (error: any) {
      console.error('Erro ao sincronizar checklist:', error);
      await updateChecklistStatus(
        checklist.id, 
        'error', 
        error.message || 'Erro desconhecido'
      );
      return { success: false, error: error.message };
    }
  };

  const startSync = useCallback(async () => {
    if (!navigator.onLine || syncing) return;

    setSyncing(true);

    try {
      const checklists = await getChecklistsToSync();
      
      if (checklists.length === 0) {
        toast.info('Nenhum checklist pendente');
        setSyncing(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const checklist of checklists) {
        // Limitar tentativas
        if (checklist.sync_attempts >= 3) {
          errorCount++;
          continue;
        }

        const result = await syncSingleChecklist(checklist);
        
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      }

      await updatePendingCount();

      if (successCount > 0) {
        toast.success(`${successCount} checklist(s) sincronizado(s)`);
      }
      
      if (errorCount > 0) {
        toast.error(`${errorCount} checklist(s) com erro`);
      }
    } catch (error: any) {
      console.error('Erro na sincronização:', error);
      toast.error('Erro ao sincronizar checklists');
    } finally {
      setSyncing(false);
    }
  }, [syncing]);

  return { 
    isOnline, 
    syncing, 
    pendingCount, 
    startSync,
    updatePendingCount 
  };
};
