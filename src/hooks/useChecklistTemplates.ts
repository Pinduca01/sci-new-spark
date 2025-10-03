import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TemplateItem {
  id: number;
  item: string;
  tipo: 'verificacao' | 'contagem' | 'medida';
  obrigatorio: boolean;
  unidade?: string;
  categoria?: string;
  ordem: number;
  ajuda?: string;
  valor_minimo?: number;
}

export interface ChecklistTemplate {
  id: string;
  nome: string;
  tipo_viatura: string;
  categoria: string;
  itens: TemplateItem[];
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export const useChecklistTemplates = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar todos os templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['checklist-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklist_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as ChecklistTemplate[];
    },
  });

  // Buscar template por ID
  const fetchTemplateById = async (id: string) => {
    const { data, error } = await supabase
      .from('checklist_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as unknown as ChecklistTemplate;
  };

  // Criar template
  const createMutation = useMutation({
    mutationFn: async (template: Omit<ChecklistTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('checklist_templates')
        .insert(template as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
      toast({
        title: 'Template criado',
        description: 'Template de checklist criado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Atualizar template
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ChecklistTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('checklist_templates')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
      toast({
        title: 'Template atualizado',
        description: 'Template de checklist atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Excluir template
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('checklist_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
      toast({
        title: 'Template excluído',
        description: 'Template de checklist excluído com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Toggle status ativo/inativo
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { data, error } = await supabase
        .from('checklist_templates')
        .update({ ativo })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
      toast({
        title: data.ativo ? 'Template ativado' : 'Template desativado',
        description: `Template ${data.ativo ? 'ativado' : 'desativado'} com sucesso.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao alterar status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Duplicar template
  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      const original = await fetchTemplateById(id);
      const { data, error } = await supabase
        .from('checklist_templates')
        .insert({
          nome: `${original.nome} (Cópia)`,
          tipo_viatura: original.tipo_viatura,
          categoria: original.categoria,
          itens: original.itens as any,
          ativo: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
      toast({
        title: 'Template duplicado',
        description: 'Template duplicado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao duplicar template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    templates,
    isLoading,
    fetchTemplateById,
    createTemplate: createMutation.mutate,
    updateTemplate: updateMutation.mutate,
    deleteTemplate: deleteMutation.mutate,
    toggleStatus: toggleStatusMutation.mutate,
    duplicateTemplate: duplicateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
