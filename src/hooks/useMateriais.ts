
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Material {
  id: string;
  codigo_material: string;
  nome: string;
  categoria: string;
  tipo_unidade: string;
  unidade_medida: string;
  descricao?: string;
  fabricante?: string;
  especificacoes_tecnicas?: any;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export const useMateriais = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: materiais = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['materiais'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materiais')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      return data as Material[];
    }
  });

  const createMaterial = useMutation({
    mutationFn: async (material: Omit<Material, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('materiais')
        .insert(material)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiais'] });
      toast({
        title: "Sucesso",
        description: "Material cadastrado com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Erro ao cadastrar material:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o material.",
        variant: "destructive",
      });
    }
  });

  const updateMaterial = useMutation({
    mutationFn: async ({ id, ...material }: Partial<Material> & { id: string }) => {
      const { data, error } = await supabase
        .from('materiais')
        .update(material)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiais'] });
      toast({
        title: "Sucesso",
        description: "Material atualizado com sucesso!",
      });
    }
  });

  return {
    materiais,
    isLoading,
    error,
    createMaterial,
    updateMaterial
  };
};
