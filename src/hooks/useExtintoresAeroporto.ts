
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
  const { data: quadrantes = [], isLoading: isLoadingQuadrantes } = useQuery({
    queryKey: ['quadrantes-aeroporto'],
    queryFn: async () => {
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

      if (error) throw error;
      return data as QuadranteAeroporto[];
    }
  });

  // Buscar extintores
  const { data: extintores = [], isLoading: isLoadingExtintores } = useQuery({
    queryKey: ['extintores-aeroporto'],
    queryFn: async () => {
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

      if (error) throw error;
      return data as ExtintorAeroporto[];
    }
  });

  // Buscar inspeções
  const { data: inspecoes = [], isLoading: isLoadingInspecoes } = useQuery({
    queryKey: ['inspecoes-extintores'],
    queryFn: async () => {
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

      if (error) throw error;
      return data as InspecaoExtintor[];
    }
  });

  // Criar extintor
  const createExtintor = useMutation({
    mutationFn: async (extintor: Omit<ExtintorAeroporto, 'id' | 'created_at' | 'updated_at' | 'quadrantes_aeroporto'>) => {
      const { data, error } = await supabase
        .from('extintores_aeroporto')
        .insert(extintor)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extintores-aeroporto'] });
      toast({
        title: "Sucesso",
        description: "Extintor cadastrado com sucesso!",
      });
    }
  });

  // Criar inspeção
  const createInspecao = useMutation({
    mutationFn: async (inspecao: Omit<InspecaoExtintor, 'id' | 'created_at' | 'updated_at' | 'extintores_aeroporto' | 'bombeiros'>) => {
      const { data, error } = await supabase
        .from('inspecoes_extintores')
        .insert(inspecao)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspecoes-extintores'] });
      toast({
        title: "Sucesso",
        description: "Inspeção registrada com sucesso!",
      });
    }
  });

  // Atualizar extintor
  const updateExtintor = useMutation({
    mutationFn: async ({ id, ...extintor }: Partial<ExtintorAeroporto> & { id: string }) => {
      const { data, error } = await supabase
        .from('extintores_aeroporto')
        .update(extintor)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extintores-aeroporto'] });
      toast({
        title: "Sucesso",
        description: "Extintor atualizado com sucesso!",
      });
    }
  });

  return {
    quadrantes,
    extintores,
    inspecoes,
    isLoading: isLoadingQuadrantes || isLoadingExtintores || isLoadingInspecoes,
    createExtintor,
    createInspecao,
    updateExtintor
  };
};
