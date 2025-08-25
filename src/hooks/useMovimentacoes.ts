
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Movimentacao {
  id: string;
  material_id: string;
  tipo_movimentacao: string;
  quantidade: number;
  motivo: string;
  responsavel_id: string;
  data_movimentacao: string;
  origem?: string;
  destino?: string;
  observacoes?: string;
  created_at: string;
  materiais?: {
    codigo_material: string;
    nome: string;
    unidade_medida: string;
  };
  bombeiros?: {
    nome: string;
  };
}

export const useMovimentacoes = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: movimentacoes = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['movimentacoes-estoque'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('movimentacoes_estoque')
        .select(`
          *,
          materiais:material_id (
            codigo_material,
            nome,
            unidade_medida
          ),
          bombeiros:responsavel_id (
            nome
          )
        `)
        .order('data_movimentacao', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as Movimentacao[];
    }
  });

  const createMovimentacao = useMutation({
    mutationFn: async (movimentacao: Omit<Movimentacao, 'id' | 'created_at' | 'materiais' | 'bombeiros'>) => {
      // Primeiro, verificar se há estoque suficiente para saídas
      if (movimentacao.tipo_movimentacao === 'saida') {
        const { data: estoque } = await supabase
          .from('estoque_almoxarifado')
          .select('quantidade_disponivel')
          .eq('material_id', movimentacao.material_id)
          .single();

        if (!estoque || estoque.quantidade_disponivel < movimentacao.quantidade) {
          throw new Error('Estoque insuficiente para esta operação');
        }

        // Atualizar estoque
        await supabase
          .from('estoque_almoxarifado')
          .update({
            quantidade_disponivel: estoque.quantidade_disponivel - movimentacao.quantidade
          })
          .eq('material_id', movimentacao.material_id);
      } else if (movimentacao.tipo_movimentacao === 'entrada') {
        // Para entradas, aumentar o estoque
        const { data: estoque } = await supabase
          .from('estoque_almoxarifado')
          .select('quantidade_disponivel')
          .eq('material_id', movimentacao.material_id)
          .maybeSingle();

        if (estoque) {
          await supabase
            .from('estoque_almoxarifado')
            .update({
              quantidade_disponivel: estoque.quantidade_disponivel + movimentacao.quantidade
            })
            .eq('material_id', movimentacao.material_id);
        } else {
          // Se não existe no estoque, criar novo registro
          await supabase
            .from('estoque_almoxarifado')
            .insert({
              material_id: movimentacao.material_id,
              quantidade_disponivel: movimentacao.quantidade,
              quantidade_minima: 0
            });
        }
      }

      // Registrar a movimentação
      const { data, error } = await supabase
        .from('movimentacoes_estoque')
        .insert(movimentacao)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
      queryClient.invalidateQueries({ queryKey: ['estoque-almoxarifado'] });
      toast({
        title: "Sucesso",
        description: "Movimentação registrada com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Erro na movimentação:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro na movimentação.",
        variant: "destructive",
      });
    }
  });

  return {
    movimentacoes,
    isLoading,
    error,
    createMovimentacao
  };
};
