
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Equipamento {
  id: string;
  material_id: string;
  codigo_equipamento: string;
  numero_serie?: string;
  status: 'ativo' | 'manutencao' | 'inativo' | 'descartado';
  localizacao_fisica?: string;
  data_aquisicao?: string;
  data_instalacao?: string;
  valor_aquisicao?: number;
  fornecedor?: string;
  garantia_ate?: string;
  ultima_manutencao?: string;
  proxima_manutencao?: string;
  viatura_id?: string;
  responsavel_id?: string;
  qr_code?: string;
  fotos?: string[];
  observacoes?: string;
  created_at: string;
  updated_at: string;
  materiais?: {
    codigo_material: string;
    nome: string;
    categoria: string;
    unidade_medida: string;
  };
  viaturas?: {
    prefixo: string;
    nome_viatura: string;
  };
}

export const useEquipamentos = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: equipamentos = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['equipamentos-estoque'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipamentos_estoque')
        .select(`
          *,
          materiais:material_id (
            codigo_material,
            nome,
            categoria,
            unidade_medida
          ),
          viaturas:viatura_id (
            prefixo,
            nome_viatura
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Equipamento[];
    }
  });

  const createEquipamento = useMutation({
    mutationFn: async (equipamento: Omit<Equipamento, 'id' | 'created_at' | 'updated_at' | 'materiais' | 'viaturas'>) => {
      const { data, error } = await supabase
        .from('equipamentos_estoque')
        .insert(equipamento)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos-estoque'] });
      toast({
        title: "Sucesso",
        description: "Equipamento cadastrado com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Erro ao cadastrar equipamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o equipamento.",
        variant: "destructive",
      });
    }
  });

  const updateEquipamento = useMutation({
    mutationFn: async ({ id, ...equipamento }: Partial<Equipamento> & { id: string }) => {
      const { data, error } = await supabase
        .from('equipamentos_estoque')
        .update(equipamento)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos-estoque'] });
      toast({
        title: "Sucesso",
        description: "Equipamento atualizado com sucesso!",
      });
    }
  });

  const deleteEquipamento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('equipamentos_estoque')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos-estoque'] });
      toast({
        title: "Sucesso",
        description: "Equipamento excluído com sucesso!",
      });
    }
  });

  return {
    equipamentos,
    isLoading,
    error,
    createEquipamento,
    updateEquipamento,
    deleteEquipamento
  };
};
