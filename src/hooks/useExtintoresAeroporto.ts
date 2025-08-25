
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface QuadranteAeroporto {
  id: string;
  nome_quadrante: string;
  descricao?: string;
  equipe_responsavel_id?: string;
  cor_identificacao: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  equipes?: {
    nome_equipe: string;
    cor_identificacao: string;
  };
}

export interface ExtintorAeroporto {
  id: string;
  codigo_extintor: string;
  localizacao_detalhada: string;
  quadrante_id: string;
  tipo_extintor: string;
  capacidade: number;
  unidade_capacidade: string;
  fabricante?: string;
  data_fabricacao?: string;
  data_instalacao: string;
  ultima_recarga?: string;
  proxima_recarga?: string;
  ultimo_teste_hidrostatico?: string;
  proximo_teste_hidrostatico?: string;
  status: string;
  qr_code?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  quadrantes_aeroporto?: {
    nome_quadrante: string;
    cor_identificacao: string;
  };
}

export interface InspecaoExtintor {
  id: string;
  extintor_id: string;
  bombeiro_inspetor_id: string;
  data_inspecao: string;
  hora_inspecao: string;
  tipo_inspecao: string;
  status_extintor: string;
  itens_verificados: any[];
  observacoes?: string;
  proxima_inspecao?: string;
  assinatura_digital?: string;
  fotos?: any[];
  created_at: string;
  updated_at: string;
  extintores_aeroporto?: {
    codigo_extintor: string;
    localizacao_detalhada: string;
  };
  bombeiros?: {
    nome: string;
    funcao: string;
  };
}

export const useExtintoresAeroporto = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Buscar quadrantes
  const { data: quadrantes = [], isLoading: isLoadingQuadrantes, error: errorQuadrantes } = useQuery({
    queryKey: ['quadrantes-aeroporto'],
    queryFn: async () => {
      console.log('Buscando quadrantes...');
      const { data, error } = await supabase
        .from('quadrantes_aeroporto')
        .select(`
          *,
          equipes:equipe_responsavel_id (
            nome_equipe,
            cor_identificacao
          )
        `)
        .eq('ativo', true)
        .order('nome_quadrante');

      if (error) {
        console.error('Erro ao buscar quadrantes:', error);
        throw error;
      }
      console.log('Quadrantes encontrados:', data?.length || 0);
      return data as QuadranteAeroporto[];
    },
    retry: 3,
    retryDelay: 1000
  });

  // Buscar extintores
  const { data: extintores = [], isLoading: isLoadingExtintores, error: errorExtintores } = useQuery({
    queryKey: ['extintores-aeroporto'],
    queryFn: async () => {
      console.log('Buscando extintores...');
      const { data, error } = await supabase
        .from('extintores_aeroporto')
        .select(`
          *,
          quadrantes_aeroporto (
            nome_quadrante,
            cor_identificacao
          )
        `)
        .order('codigo_extintor');

      if (error) {
        console.error('Erro ao buscar extintores:', error);
        throw error;
      }
      console.log('Extintores encontrados:', data?.length || 0);
      return data as ExtintorAeroporto[];
    },
    retry: 3,
    retryDelay: 1000
  });

  // Buscar inspeções
  const { data: inspecoes = [], isLoading: isLoadingInspecoes, error: errorInspecoes } = useQuery({
    queryKey: ['inspecoes-extintores'],
    queryFn: async () => {
      console.log('Buscando inspeções...');
      const { data, error } = await supabase
        .from('inspecoes_extintores')
        .select(`
          *,
          extintores_aeroporto (
            codigo_extintor,
            localizacao_detalhada
          ),
          bombeiros (
            nome,
            funcao
          )
        `)
        .order('data_inspecao', { ascending: false });

      if (error) {
        console.error('Erro ao buscar inspeções:', error);
        throw error;
      }
      console.log('Inspeções encontradas:', data?.length || 0);
      return data as InspecaoExtintor[];
    },
    retry: 3,
    retryDelay: 1000
  });

  // Criar extintor
  const createExtintor = useMutation({
    mutationFn: async (extintor: Omit<ExtintorAeroporto, 'id' | 'created_at' | 'updated_at' | 'quadrantes_aeroporto'>) => {
      console.log('Criando extintor:', extintor);
      const { data, error } = await supabase
        .from('extintores_aeroporto')
        .insert(extintor)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar extintor:', error);
        throw error;
      }
      console.log('Extintor criado com sucesso:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extintores-aeroporto'] });
      toast({
        title: "Sucesso",
        description: "Extintor cadastrado com sucesso!",
      });
    },
    onError: (error: any) => {
      console.error('Erro na mutação de criar extintor:', error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar extintor: " + (error.message || 'Erro desconhecido'),
        variant: "destructive",
      });
    }
  });

  // Criar inspeção
  const createInspecao = useMutation({
    mutationFn: async (inspecao: Omit<InspecaoExtintor, 'id' | 'created_at' | 'updated_at' | 'extintores_aeroporto' | 'bombeiros'>) => {
      console.log('Criando inspeção:', inspecao);
      const { data, error } = await supabase
        .from('inspecoes_extintores')
        .insert(inspecao)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar inspeção:', error);
        throw error;
      }
      console.log('Inspeção criada com sucesso:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspecoes-extintores'] });
      toast({
        title: "Sucesso",
        description: "Inspeção registrada com sucesso!",
      });
    },
    onError: (error: any) => {
      console.error('Erro na mutação de criar inspeção:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar inspeção: " + (error.message || 'Erro desconhecido'),
        variant: "destructive",
      });
    }
  });

  // Atualizar extintor
  const updateExtintor = useMutation({
    mutationFn: async ({ id, ...extintor }: Partial<ExtintorAeroporto> & { id: string }) => {
      console.log('Atualizando extintor:', id, extintor);
      const { data, error } = await supabase
        .from('extintores_aeroporto')
        .update(extintor)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar extintor:', error);
        throw error;
      }
      console.log('Extintor atualizado com sucesso:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extintores-aeroporto'] });
      toast({
        title: "Sucesso",
        description: "Extintor atualizado com sucesso!",
      });
    },
    onError: (error: any) => {
      console.error('Erro na mutação de atualizar extintor:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar extintor: " + (error.message || 'Erro desconhecido'),
        variant: "destructive",
      });
    }
  });

  // Log de erros para debug
  if (errorQuadrantes) console.error('Erro nos quadrantes:', errorQuadrantes);
  if (errorExtintores) console.error('Erro nos extintores:', errorExtintores);
  if (errorInspecoes) console.error('Erro nas inspeções:', errorInspecoes);

  const hasErrors = errorQuadrantes || errorExtintores || errorInspecoes;
  const isLoading = isLoadingQuadrantes || isLoadingExtintores || isLoadingInspecoes;

  return {
    quadrantes,
    extintores,
    inspecoes,
    isLoading,
    hasErrors,
    createExtintor,
    createInspecao,
    updateExtintor
  };
};
