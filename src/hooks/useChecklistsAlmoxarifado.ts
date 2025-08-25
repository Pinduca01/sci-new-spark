
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChecklistItem {
  material_id: string;
  codigo_material: string;
  nome: string;
  categoria: string;
  unidade_medida: string;
  quantidade_teorica: number;
  quantidade_encontrada?: number;
  status: 'pendente' | 'conforme' | 'divergencia' | 'nao_localizado';
  justificativa?: string;
  foto_evidencia?: string;
}

export interface ChecklistAlmoxarifado {
  id?: string;
  data_checklist: string;
  hora_checklist: string;
  bombeiro_responsavel_id: string;
  bombeiro_responsavel_nome: string;
  status_geral: 'em_andamento' | 'concluido' | 'pendente';
  itens_checklist: ChecklistItem[];
  assinatura_digital?: string;
  observacoes_gerais?: string;
  total_itens: number;
  itens_conformes: number;
  itens_divergentes: number;
  created_at?: string;
  updated_at?: string;
}

export const useChecklistsAlmoxarifado = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Buscar checklists existentes
  const {
    data: checklists = [],
    isLoading
  } = useQuery({
    queryKey: ['checklists-almoxarifado'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklists_almoxarifado')
        .select('*')
        .order('data_checklist', { ascending: false })
        .order('hora_checklist', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      return (data || []).map(item => ({
        ...item,
        itens_checklist: Array.isArray(item.itens_checklist) 
          ? item.itens_checklist as ChecklistItem[]
          : []
      })) as ChecklistAlmoxarifado[];
    }
  });

  // Criar novo checklist
  const createChecklist = useMutation({
    mutationFn: async (checklist: Omit<ChecklistAlmoxarifado, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('checklists_almoxarifado')
        .insert({
          ...checklist,
          itens_checklist: checklist.itens_checklist as any
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists-almoxarifado'] });
      toast({
        title: "Sucesso",
        description: "Checklist criado com sucesso!",
      });
    }
  });

  // Atualizar checklist
  const updateChecklist = useMutation({
    mutationFn: async ({ id, ...checklist }: Partial<ChecklistAlmoxarifado> & { id: string }) => {
      const updateData = {
        ...checklist,
        itens_checklist: checklist.itens_checklist as any
      };
      
      const { data, error } = await supabase
        .from('checklists_almoxarifado')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists-almoxarifado'] });
    }
  });

  // Preparar itens do checklist a partir do estoque
  const prepareChecklistItems = async (): Promise<ChecklistItem[]> => {
    const { data: estoque, error } = await supabase
      .from('estoque_almoxarifado')
      .select(`
        *,
        materiais:material_id (
          codigo_material,
          nome,
          categoria,
          unidade_medida
        )
      `)
      .order('materiais(categoria)', { ascending: true })
      .order('materiais(nome)', { ascending: true });

    if (error) throw error;

    return (estoque || []).map(item => ({
      material_id: item.material_id,
      codigo_material: item.materiais?.codigo_material || '',
      nome: item.materiais?.nome || '',
      categoria: item.materiais?.categoria || '',
      unidade_medida: item.materiais?.unidade_medida || '',
      quantidade_teorica: Number(item.quantidade_disponivel),
      status: 'pendente' as const
    }));
  };

  return {
    checklists,
    isLoading,
    createChecklist,
    updateChecklist,
    prepareChecklistItems
  };
};
