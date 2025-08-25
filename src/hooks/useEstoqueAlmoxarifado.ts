
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
      // Primeiro, tentar obter o estoque
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
      
      // Se não há dados no estoque, inserir dados de exemplo automaticamente
      if (data.length === 0) {
        console.log('Estoque vazio, inserindo dados de exemplo...');
        
        // Obter os materiais cadastrados
        const { data: materiais } = await supabase
          .from('materiais')
          .select('id, codigo_material')
          .limit(8);

        if (materiais && materiais.length > 0) {
          // Criar registros de estoque para os materiais
          const estoqueExemplo = materiais.map((material, index) => ({
            material_id: material.id,
            quantidade_disponivel: [50, 25, 15, 8, 100, 200, 75, 30][index] || 10,
            quantidade_minima: [20, 10, 5, 5, 50, 100, 25, 10][index] || 5,
            lote: `LOTE${String(index + 1).padStart(3, '0')}`,
            data_fabricacao: new Date(2024, 0, 1 + index * 15).toISOString().split('T')[0],
            data_validade: new Date(2025, index % 12, 1 + index * 30).toISOString().split('T')[0],
            localizacao_fisica: [`Prateleira A${index + 1}`, `Armário B${index + 1}`, `Setor C${index + 1}`][index % 3],
            observacoes: index < 3 ? 'Estoque baixo - solicitar reposição' : null
          }));

          await supabase
            .from('estoque_almoxarifado')
            .insert(estoqueExemplo);

          // Fazer nova consulta para retornar os dados inseridos
          const { data: novoEstoque } = await supabase
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

          return novoEstoque as EstoqueItem[];
        }
      }
      
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
    alertas: getAlertas()
  };
};
