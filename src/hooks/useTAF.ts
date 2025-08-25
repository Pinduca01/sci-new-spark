
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TAFAvaliacao {
  id: string;
  bombeiro_id: string;
  data_teste: string;
  idade_na_data: number;
  faixa_etaria: string;
  tempo_limite_minutos: number;
  flexoes_realizadas: number;
  abdominais_realizadas: number;
  polichinelos_realizados: number;
  tempo_total_segundos: number;
  aprovado: boolean;
  observacoes?: string;
  avaliador_nome: string;
  created_at: string;
  bombeiros?: {
    nome: string;
    funcao: string;
  };
}

export interface NovaAvaliacaoTAF {
  bombeiro_id: string;
  idade_na_data: number;
  flexoes_realizadas: number;
  abdominais_realizadas: number;
  polichinelos_realizados: number;
  tempo_total_segundos: number;
  avaliador_nome: string;
  observacoes?: string;
}

export interface TAFMetas {
  id: string;
  faixa_etaria: string;
  tempo_limite_minutos: number;
  meta_flexoes: number;
  meta_abdominais: number;
  meta_polichinelos: number;
}

export interface TAFEstatisticas {
  total_avaliacoes: number;
  taxa_aprovacao: number;
  media_flexoes: number;
  media_abdominais: number;
  media_polichinelos: number;
  bombeiros_pendentes: number;
}

export const useTAF = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar todas as avaliações TAF
  const {
    data: avaliacoes = [],
    isLoading: isLoadingAvaliacoes,
    error: errorAvaliacoes
  } = useQuery({
    queryKey: ['taf-avaliacoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('taf_avaliacoes')
        .select(`
          *,
          bombeiros(nome, funcao)
        `)
        .order('data_teste', { ascending: false });

      if (error) throw error;
      return data as TAFAvaliacao[];
    }
  });

  // Buscar metas TAF
  const {
    data: metas = [],
    isLoading: isLoadingMetas
  } = useQuery({
    queryKey: ['taf-metas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('taf_metas')
        .select('*')
        .order('faixa_etaria');

      if (error) throw error;
      return data as TAFMetas[];
    }
  });

  // Buscar estatísticas TAF
  const {
    data: estatisticas,
    isLoading: isLoadingEstatisticas
  } = useQuery({
    queryKey: ['taf-estatisticas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_taf_estatisticas');

      if (error) throw error;
      return data[0] as TAFEstatisticas;
    }
  });

  // Criar nova avaliação TAF
  const criarAvaliacao = useMutation({
    mutationFn: async (novaAvaliacao: NovaAvaliacaoTAF) => {
      const faixaEtaria = novaAvaliacao.idade_na_data >= 40 ? 'acima_40' : 'abaixo_40';
      const tempoLimite = novaAvaliacao.idade_na_data >= 40 ? 4 : 3;
      
      // Buscar metas para verificar aprovação
      const metasData = metas.find(m => m.faixa_etaria === faixaEtaria);
      const aprovado = metasData ? (
        novaAvaliacao.flexoes_realizadas >= metasData.meta_flexoes &&
        novaAvaliacao.abdominais_realizadas >= metasData.meta_abdominais &&
        novaAvaliacao.polichinelos_realizados >= metasData.meta_polichinelos &&
        novaAvaliacao.tempo_total_segundos <= (tempoLimite * 60)
      ) : false;

      const avaliacaoCompleta = {
        ...novaAvaliacao,
        faixa_etaria: faixaEtaria,
        tempo_limite_minutos: tempoLimite,
        aprovado
      };

      const { data, error } = await supabase
        .from('taf_avaliacoes')
        .insert(avaliacaoCompleta)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taf-avaliacoes'] });
      queryClient.invalidateQueries({ queryKey: ['taf-estatisticas'] });
      toast({
        title: "Sucesso",
        description: "Avaliação TAF registrada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao registrar avaliação: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Buscar avaliações por bombeiro
  const buscarAvaliacoesPorBombeiro = async (bombeiroId: string) => {
    const { data, error } = await supabase
      .from('taf_avaliacoes')
      .select('*')
      .eq('bombeiro_id', bombeiroId)
      .order('data_teste', { ascending: false });

    if (error) throw error;
    return data as TAFAvaliacao[];
  };

  return {
    avaliacoes,
    isLoadingAvaliacoes,
    errorAvaliacoes,
    metas,
    isLoadingMetas,
    estatisticas,
    isLoadingEstatisticas,
    criarAvaliacao,
    buscarAvaliacoesPorBombeiro
  };
};
