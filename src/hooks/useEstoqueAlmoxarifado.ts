
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EstoqueItem {
  id: string;
  material_id: string;
  quantidade_disponivel: number;
  quantidade_minima: number;
  lote?: string;
  data_fabricacao?: string;
  data_validade?: string;
  localizacao_fisica?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  materiais?: {
    codigo_material: string;
    nome: string;
    categoria: string;
    unidade_medida: string;
  };
}

export const useEstoqueAlmoxarifado = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: estoque = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['estoque-almoxarifado'],
    queryFn: async () => {
      const { data, error } = await supabase
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
        .order('quantidade_disponivel', { ascending: true });

      if (error) throw error;
      return data as EstoqueItem[];
    }
  });

  const addEstoque = useMutation({
    mutationFn: async (item: Omit<EstoqueItem, 'id' | 'created_at' | 'updated_at' | 'materiais'>) => {
      const { data, error } = await supabase
        .from('estoque_almoxarifado')
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estoque-almoxarifado'] });
      toast({
        title: "Sucesso",
        description: "Item adicionado ao estoque!",
      });
    },
    onError: (error) => {
      console.error('Erro ao adicionar item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o item ao estoque.",
        variant: "destructive",
      });
    }
  });

  const updateEstoque = useMutation({
    mutationFn: async ({ id, ...item }: Partial<EstoqueItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('estoque_almoxarifado')
        .update(item)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estoque-almoxarifado'] });
      toast({
        title: "Sucesso",
        description: "Item atualizado com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o item.",
        variant: "destructive",
      });
    }
  });

  const deleteEstoque = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('estoque_almoxarifado')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estoque-almoxarifado'] });
      toast({
        title: "Sucesso",
        description: "Item excluído com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Erro ao excluir item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o item.",
        variant: "destructive",
      });
    }
  });

  // Função para obter alertas
  const getAlertas = () => {
    const estoqueAtual = new Date();
    const alertas = {
      estoqueBaixo: estoque.filter(item => 
        item.quantidade_disponivel <= item.quantidade_minima
      ),
      vencimentoProximo: estoque.filter(item => {
        if (!item.data_validade) return false;
        const dataVencimento = new Date(item.data_validade);
        const diasParaVencimento = (dataVencimento.getTime() - estoqueAtual.getTime()) / (1000 * 60 * 60 * 24);
        return diasParaVencimento <= 30 && diasParaVencimento >= 0;
      }),
      vencidos: estoque.filter(item => {
        if (!item.data_validade) return false;
        return new Date(item.data_validade) < estoqueAtual;
      })
    };

    return alertas;
  };

  return {
    estoque,
    isLoading,
    error,
    addEstoque,
    updateEstoque,
    deleteEstoque,
    alertas: getAlertas()
  };
};
