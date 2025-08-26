
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

export interface ChecklistTemplate {
  id: string;
  nome: string;
  tipo_viatura: string;
  categoria: string;
  itens: ChecklistItem[];
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  item: string;
  tipo: 'verificacao' | 'contagem' | 'medida';
  obrigatorio: boolean;
  unidade?: string;
  valor?: string | number;
  status?: 'conforme' | 'nao_conforme' | 'nao_aplicavel';
  observacao?: string;
  foto?: string;
}

export interface QRChecklist {
  id?: string;
  qr_code: string;
  viatura_id: string;
  template_id: string;
  bombeiro_id: string;
  bombeiro_nome: string;
  data_checklist: string;
  hora_inicio: string;
  hora_conclusao?: string;
  status: 'em_andamento' | 'concluido' | 'cancelado';
  itens_checklist: ChecklistItem[];
  observacoes_gerais?: string;
  localizacao?: { lat: number; lng: number };
  assinatura_digital?: string;
  fotos?: string[];
  created_at?: string;
  updated_at?: string;
}

export const useQRChecklists = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Buscar templates
  const templatesQuery = useQuery({
    queryKey: ['checklist-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklist_templates')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      
      // Converter Json para ChecklistTemplate[]
      return data.map(template => ({
        ...template,
        itens: typeof template.itens === 'string' 
          ? JSON.parse(template.itens) 
          : (template.itens as unknown as ChecklistItem[])
      })) as ChecklistTemplate[];
    }
  });

  // Buscar checklists por QR code
  const getChecklistByQR = async (qrCode: string) => {
    const { data, error } = await supabase
      .from('qr_checklists')
      .select(`
        *,
        viaturas!inner(id, prefixo, placa, modelo),
        checklist_templates!inner(nome, tipo_viatura)
      `)
      .eq('qr_code', qrCode)
      .single();

    if (error) throw error;
    return data;
  };

  // Criar checklist
  const createChecklist = useMutation({
    mutationFn: async (checklist: Omit<QRChecklist, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('qr_checklists')
        .insert({
          ...checklist,
          itens_checklist: JSON.stringify(checklist.itens_checklist),
          localizacao: checklist.localizacao ? JSON.stringify(checklist.localizacao) : null,
          fotos: checklist.fotos ? JSON.stringify(checklist.fotos) : JSON.stringify([])
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qr-checklists'] });
      toast({
        title: "Sucesso",
        description: "Checklist criado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar checklist",
        variant: "destructive"
      });
    }
  });

  // Atualizar checklist
  const updateChecklist = useMutation({
    mutationFn: async ({ id, ...checklist }: Partial<QRChecklist> & { id: string }) => {
      const updateData: any = {
        ...checklist,
        itens_checklist: checklist.itens_checklist ? JSON.stringify(checklist.itens_checklist) : undefined,
        localizacao: checklist.localizacao ? JSON.stringify(checklist.localizacao) : undefined,
        fotos: checklist.fotos ? JSON.stringify(checklist.fotos) : undefined
      };

      const { data, error } = await supabase
        .from('qr_checklists')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qr-checklists'] });
      toast({
        title: "Sucesso",
        description: "Checklist atualizado com sucesso!",
      });
    }
  });

  return {
    templates: templatesQuery.data || [],
    isLoadingTemplates: templatesQuery.isLoading,
    getChecklistByQR,
    createChecklist,
    updateChecklist
  };
};
