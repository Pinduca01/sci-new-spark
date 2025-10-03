import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChecklistItem {
  material_id?: string;
  codigo_material?: string;
  nome: string;
  categoria?: string;
  unidade_medida?: string;
  quantidade_teorica?: number;
  quantidade_encontrada?: number;
  status: string;
  justificativa?: string;
  foto_evidencia?: string;
  fotos?: string[];
}

export interface ChecklistDetalhado {
  id: string;
  tipo: 'viatura' | 'almoxarifado';
  tipo_detalhe: string;
  data: string;
  hora: string;
  responsavel: string;
  responsavel_id?: string;
  equipe?: string;
  status: string;
  total_itens: number;
  itens_conformes: number;
  itens_nao_conformes: number;
  observacoes?: string;
  viatura_id?: string;
  viatura_placa?: string;
  itens: ChecklistItem[];
  created_at: string;
  updated_at?: string;
  timestamp_conclusao?: string;
}

export interface TimelineItem {
  id: string;
  operacao: string;
  usuario_nome: string;
  usuario_role?: string;
  descricao?: string;
  created_at: string;
}

export const useChecklistsHistorico = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Buscar checklists de viaturas
  const viaturasQuery = useQuery({
    queryKey: ['checklists-viaturas-historico'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklists_viaturas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar dados das viaturas separadamente se necessário
      const viaturasIds = [...new Set((data || []).map(item => item.viatura_id).filter(Boolean))];
      const viaturasMap = new Map();

      if (viaturasIds.length > 0) {
        const { data: viaturasData } = await supabase
          .from('viaturas')
          .select('id, placa, tipo')
          .in('id', viaturasIds as string[]);

        viaturasData?.forEach(v => viaturasMap.set(v.id, v));
      }

      return (data || []).map(item => {
        const viatura = item.viatura_id ? viaturasMap.get(item.viatura_id) : null;
        return {
          id: item.id,
          tipo: 'viatura' as const,
          tipo_detalhe: item.tipo_checklist || 'BA-2',
          data: item.data_checklist,
          hora: item.hora_checklist || '00:00',
          responsavel: item.bombeiro_responsavel || 'N/A',
          equipe: item.equipe,
          status: item.status_geral || 'em_andamento',
          total_itens: Array.isArray(item.itens_checklist) ? item.itens_checklist.length : 0,
          itens_conformes: Array.isArray(item.itens_checklist) ? item.itens_checklist.filter((i: any) => i.status === 'conforme').length : 0,
          itens_nao_conformes: Array.isArray(item.itens_checklist) ? item.itens_checklist.filter((i: any) => i.status === 'nao_conforme').length : 0,
          observacoes: item.observacoes_gerais,
          viatura_id: item.viatura_id,
          viatura_placa: viatura?.placa,
          itens: Array.isArray(item.itens_checklist) ? item.itens_checklist : [],
          created_at: item.created_at,
          updated_at: item.updated_at,
          timestamp_conclusao: item.timestamp_conclusao
        };
      });
    }
  });

  // Buscar checklists de almoxarifado
  const almoxarifadoQuery = useQuery({
    queryKey: ['checklists-almoxarifado-historico'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklists_almoxarifado')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        tipo: 'almoxarifado' as const,
        tipo_detalhe: 'Almoxarifado',
        data: item.data_checklist,
        hora: item.hora_checklist || '00:00',
        responsavel: item.bombeiro_responsavel_nome || 'N/A',
        responsavel_id: item.bombeiro_responsavel_id,
        status: item.status_geral || 'em_andamento',
        total_itens: item.total_itens || 0,
        itens_conformes: item.itens_conformes || 0,
        itens_nao_conformes: item.itens_divergentes || 0,
        observacoes: item.observacoes_gerais,
        itens: Array.isArray(item.itens_checklist) ? item.itens_checklist : [],
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    }
  });

  // Buscar timeline de um checklist
  const getTimeline = async (checklistId: string, tipo: 'viatura' | 'almoxarifado'): Promise<TimelineItem[]> => {
    const { data, error } = await supabase
      .from('checklist_timeline')
      .select('*')
      .eq('checklist_id', checklistId)
      .eq('checklist_tipo', tipo)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar timeline:', error);
      return [];
    }

    return data || [];
  };

  // Excluir checklist
  const deleteChecklist = useMutation({
    mutationFn: async ({ id, tipo }: { id: string; tipo: 'viatura' | 'almoxarifado' }) => {
      // Registrar no timeline antes de excluir
      await supabase.rpc('registrar_timeline_checklist', {
        p_checklist_id: id,
        p_checklist_tipo: tipo,
        p_operacao: 'exclusao',
        p_descricao: 'Checklist excluído'
      });

      const table = tipo === 'viatura' ? 'checklists_viaturas' : 'checklists_almoxarifado';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`checklists-${variables.tipo}s-historico`] });
      toast({
        title: "Sucesso",
        description: "Checklist excluído com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Erro ao excluir checklist:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o checklist",
        variant: "destructive"
      });
    }
  });

  // Registrar exportação de PDF no timeline
  const registrarExportacao = async (checklistId: string, tipo: 'viatura' | 'almoxarifado', descricao?: string) => {
    try {
      await supabase.rpc('registrar_timeline_checklist', {
        p_checklist_id: checklistId,
        p_checklist_tipo: tipo,
        p_operacao: 'exportacao_pdf',
        p_descricao: descricao || 'PDF exportado'
      });
    } catch (error) {
      console.error('Erro ao registrar exportação:', error);
    }
  };

  return {
    checklists: {
      viaturas: viaturasQuery.data || [],
      almoxarifado: almoxarifadoQuery.data || [],
      all: [...(viaturasQuery.data || []), ...(almoxarifadoQuery.data || [])].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    },
    isLoading: viaturasQuery.isLoading || almoxarifadoQuery.isLoading,
    deleteChecklist,
    getTimeline,
    registrarExportacao
  };
};
