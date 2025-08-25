
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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

  // Buscar quadrantes
  const { 
    data: quadrantes = [], 
    isLoading: isLoadingQuadrantes, 
    error: errorQuadrantes,
    refetch: refetchQuadrantes 
  } = useQuery({
    queryKey: ['quadrantes-aeroporto'],
    queryFn: async () => {
      console.log('🔍 Buscando quadrantes...');
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
        console.error('❌ Erro ao buscar quadrantes:', error);
        throw new Error(`Erro ao buscar quadrantes: ${error.message}`);
      }
      
      console.log('✅ Quadrantes encontrados:', data?.length || 0, data);
      return data as QuadranteAeroporto[];
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000
  });

  // Buscar extintores
  const { 
    data: extintores = [], 
    isLoading: isLoadingExtintores, 
    error: errorExtintores,
    refetch: refetchExtintores 
  } = useQuery({
    queryKey: ['extintores-aeroporto'],
    queryFn: async () => {
      console.log('🔍 Buscando extintores...');
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
        console.error('❌ Erro ao buscar extintores:', error);
        throw new Error(`Erro ao buscar extintores: ${error.message}`);
      }
      
      console.log('✅ Extintores encontrados:', data?.length || 0, data);
      return data as ExtintorAeroporto[];
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000
  });

  // Buscar inspeções
  const { 
    data: inspecoes = [], 
    isLoading: isLoadingInspecoes, 
    error: errorInspecoes,
    refetch: refetchInspecoes 
  } = useQuery({
    queryKey: ['inspecoes-extintores'],
    queryFn: async () => {
      console.log('🔍 Buscando inspeções...');
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
        console.error('❌ Erro ao buscar inspeções:', error);
        throw new Error(`Erro ao buscar inspeções: ${error.message}`);
      }
      
      console.log('✅ Inspeções encontradas:', data?.length || 0, data);
      return data as InspecaoExtintor[];
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000
  });

  // Criar extintor
  const createExtintor = useMutation({
    mutationFn: async (extintor: Omit<ExtintorAeroporto, 'id' | 'created_at' | 'updated_at' | 'quadrantes_aeroporto'>) => {
      console.log('🚀 Criando extintor:', extintor);
      
      // Validar dados obrigatórios
      if (!extintor.codigo_extintor?.trim()) {
        throw new Error('Código do extintor é obrigatório');
      }
      if (!extintor.localizacao_detalhada?.trim()) {
        throw new Error('Localização detalhada é obrigatória');
      }
      if (!extintor.quadrante_id?.trim()) {
        throw new Error('Quadrante é obrigatório');
      }
      if (!extintor.tipo_extintor?.trim()) {
        throw new Error('Tipo do extintor é obrigatório');
      }
      if (!extintor.capacidade || extintor.capacidade <= 0) {
        throw new Error('Capacidade deve ser maior que zero');
      }
      if (!extintor.data_instalacao) {
        throw new Error('Data de instalação é obrigatória');
      }

      const { data, error } = await supabase
        .from('extintores_aeroporto')
        .insert(extintor)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar extintor:', error);
        if (error.code === '23505') {
          throw new Error('Código do extintor já existe');
        }
        throw new Error(`Erro ao criar extintor: ${error.message}`);
      }
      
      console.log('✅ Extintor criado com sucesso:', data);
      return data;
    },
    onSuccess: () => {
      console.log('🔄 Invalidando cache dos extintores...');
      queryClient.invalidateQueries({ queryKey: ['extintores-aeroporto'] });
    },
    onError: (error: any) => {
      console.error('❌ Erro na mutação de criar extintor:', error);
    }
  });

  // Criar inspeção
  const createInspecao = useMutation({
    mutationFn: async (inspecao: Omit<InspecaoExtintor, 'id' | 'created_at' | 'updated_at' | 'extintores_aeroporto' | 'bombeiros'>) => {
      console.log('🚀 Criando inspeção:', inspecao);
      
      // Validar dados obrigatórios
      if (!inspecao.extintor_id?.trim()) {
        throw new Error('Extintor é obrigatório');
      }
      if (!inspecao.bombeiro_inspetor_id?.trim()) {
        throw new Error('Bombeiro inspetor é obrigatório');
      }
      if (!inspecao.data_inspecao) {
        throw new Error('Data da inspeção é obrigatória');
      }
      if (!inspecao.hora_inspecao) {
        throw new Error('Hora da inspeção é obrigatória');
      }
      if (!inspecao.itens_verificados || inspecao.itens_verificados.length === 0) {
        throw new Error('É necessário verificar pelo menos um item');
      }

      const { data, error } = await supabase
        .from('inspecoes_extintores')
        .insert(inspecao)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar inspeção:', error);
        throw new Error(`Erro ao criar inspeção: ${error.message}`);
      }
      
      console.log('✅ Inspeção criada com sucesso:', data);
      return data;
    },
    onSuccess: () => {
      console.log('🔄 Invalidando cache das inspeções...');
      queryClient.invalidateQueries({ queryKey: ['inspecoes-extintores'] });
    },
    onError: (error: any) => {
      console.error('❌ Erro na mutação de criar inspeção:', error);
    }
  });

  // Atualizar extintor
  const updateExtintor = useMutation({
    mutationFn: async ({ id, ...extintor }: Partial<ExtintorAeroporto> & { id: string }) => {
      console.log('🔄 Atualizando extintor:', id, extintor);
      
      const { data, error } = await supabase
        .from('extintores_aeroporto')
        .update(extintor)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar extintor:', error);
        throw new Error(`Erro ao atualizar extintor: ${error.message}`);
      }
      
      console.log('✅ Extintor atualizado com sucesso:', data);
      return data;
    },
    onSuccess: () => {
      console.log('🔄 Invalidando cache dos extintores...');
      queryClient.invalidateQueries({ queryKey: ['extintores-aeroporto'] });
    },
    onError: (error: any) => {
      console.error('❌ Erro na mutação de atualizar extintor:', error);
    }
  });

  // Log de status geral
  const hasErrors = errorQuadrantes || errorExtintores || errorInspecoes;
  const isLoading = isLoadingQuadrantes || isLoadingExtintores || isLoadingInspecoes;

  console.log('📊 Status geral do hook:', {
    quadrantes: quadrantes.length,
    extintores: extintores.length,
    inspecoes: inspecoes.length,
    isLoading,
    hasErrors: !!hasErrors,
    errors: {
      quadrantes: errorQuadrantes?.message,
      extintores: errorExtintores?.message,
      inspecoes: errorInspecoes?.message
    }
  });

  return {
    quadrantes,
    extintores,
    inspecoes,
    isLoading,
    hasErrors,
    createExtintor,
    createInspecao,
    updateExtintor,
    refetchQuadrantes,
    refetchExtintores,
    refetchInspecoes
  };
};
