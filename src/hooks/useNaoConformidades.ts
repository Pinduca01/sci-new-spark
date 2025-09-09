import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export interface NaoConformidade {
  id: string;
  checklist_id: string;
  item_id: string;
  item_nome: string;
  secao: string;
  descricao: string;
  bombeiro_responsavel: string;
  imagem_url?: string;
  imagem_nome?: string;
  data_registro: string;
  created_at: string;
  updated_at: string;
}

export const useNaoConformidades = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar todas as não conformidades
  const {
    data: naoConformidades = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['nao-conformidades'],
    queryFn: async (): Promise<NaoConformidade[]> => {
      // Return empty array since table doesn't exist yet
      return [];
    }
  });

  // Buscar não conformidades por checklist
  const buscarPorChecklist = async (checklistId: string): Promise<NaoConformidade[]> => {
    return [];
  };

  // Criar nova não conformidade
  const criarNaoConformidade = useMutation({
    mutationFn: async (dados: Omit<NaoConformidade, 'id' | 'created_at' | 'updated_at'>) => {
      throw new Error('Tabela nao_conformidades não existe ainda');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nao-conformidades'] });
      toast({
        title: "Sucesso",
        description: "Não conformidade registrada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao registrar não conformidade: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Atualizar não conformidade
  const atualizarNaoConformidade = useMutation({
    mutationFn: async ({ id, dados }: { id: string; dados: Partial<NaoConformidade> }) => {
      throw new Error('Tabela nao_conformidades não existe ainda');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nao-conformidades'] });
      toast({
        title: "Sucesso",
        description: "Não conformidade atualizada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar não conformidade: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Deletar não conformidade
  const deletarNaoConformidade = useMutation({
    mutationFn: async (id: string) => {
      throw new Error('Tabela nao_conformidades não existe ainda');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nao-conformidades'] });
      toast({
        title: "Sucesso",
        description: "Não conformidade removida com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao remover não conformidade: " + error.message,
        variant: "destructive",
      });
    }
  });

  return {
    naoConformidades,
    isLoading,
    error,
    buscarPorChecklist,
    criarNaoConformidade,
    atualizarNaoConformidade,
    deletarNaoConformidade
  };
};