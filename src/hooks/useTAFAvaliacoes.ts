
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// Interfaces temporárias para TAF - serão substituídas quando as tabelas forem criadas
export interface TAFAvaliacao {
  id: string;
  bombeiro_id: string;
  data_teste: string;
  idade_na_data: number;
  faixa_etaria: string;
  flexoes_realizadas: number;
  abdominais_realizadas: number;
  polichinelos_realizados: number;
  tempo_limite_minutos: number;
  tempo_total_segundos: number;
  aprovado: boolean;
  avaliador_nome: string;
  observacoes?: string;
  created_at: string;
  updated_at?: string;
}

export const useTAFAvaliacoes = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Dados mockados temporários
  const mockAvaliacoes: TAFAvaliacao[] = [];

  const {
    data: avaliacoes = mockAvaliacoes,
    isLoading,
    error
  } = useQuery({
    queryKey: ['taf-avaliacoes'],
    queryFn: async () => {
      // Temporariamente retorna dados mockados
      // Quando as tabelas TAF forem criadas, usar:
      // const { data, error } = await supabase.from('taf_avaliacoes').select('*').order('data_teste', { ascending: false });
      return mockAvaliacoes;
    }
  });

  const createAvaliacao = useMutation({
    mutationFn: async (avaliacao: Omit<TAFAvaliacao, 'id' | 'created_at' | 'updated_at'>) => {
      // Temporariamente simula criação
      console.log('TAF Avaliação criada (mockado):', avaliacao);
      
      toast({
        title: "Sucesso",
        description: "TAF registrado com sucesso (modo demonstração)",
      });

      return {
        id: 'mock-' + Date.now(),
        ...avaliacao,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as TAFAvaliacao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taf-avaliacoes'] });
      queryClient.invalidateQueries({ queryKey: ['taf-estatisticas'] });
    }
  });

  const updateAvaliacao = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TAFAvaliacao> & { id: string }) => {
      console.log('TAF Avaliação atualizada (mockado):', { id, updates });
      return { id, ...updates } as TAFAvaliacao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taf-avaliacoes'] });
      queryClient.invalidateQueries({ queryKey: ['taf-estatisticas'] });
    }
  });

  const deleteAvaliacao = useMutation({
    mutationFn: async (id: string) => {
      console.log('TAF Avaliação deletada (mockado):', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taf-avaliacoes'] });
      queryClient.invalidateQueries({ queryKey: ['taf-estatisticas'] });
    }
  });

  return {
    avaliacoes,
    isLoading: false, // Desabilitado loading para dados mockados
    error: null,
    createAvaliacao,
    updateAvaliacao,
    deleteAvaliacao
  };
};
