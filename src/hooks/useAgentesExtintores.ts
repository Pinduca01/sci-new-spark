
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AgenteExtintor {
  id: string;
  material_id: string;
  lote: string;
  data_fabricacao: string;
  data_vencimento: string;
  tipo_agente: 'LGE' | 'PQS';
  capacidade: number;
  unidade_capacidade: string;
  localizacao_fisica?: string;
  status_uso: 'disponivel' | 'em_uso' | 'vencido' | 'descartado';
  viatura_id?: string;
  data_ultima_recarga?: string;
  proxima_recarga?: string;
  numero_recargas: number;
  custo_unitario: number;
  fornecedor?: string;
  numero_serie?: string;
  qr_code?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  materiais?: {
    codigo_material: string;
    nome: string;
    categoria: string;
  };
  viaturas?: {
    prefixo: string;
    placa: string;
  };
}

export interface HistoricoRecarga {
  id: string;
  agente_extintor_id: string;
  viatura_id?: string;
  data_recarga: string;
  tipo_manutencao: 'recarga' | 'teste_hidrostatico' | 'manutencao_preventiva' | 'troca_completa';
  responsavel_id?: string;
  responsavel_nome: string;
  custo: number;
  observacoes?: string;
  proxima_manutencao?: string;
  empresa_responsavel?: string;
  certificado_url?: string;
  created_at: string;
}

export interface AlertaVencimento {
  tipo_agente: string;
  lote: string;
  data_vencimento: string;
  dias_para_vencimento: number;
  quantidade: number;
  nivel_alerta: 'critico' | 'alto' | 'medio' | 'baixo';
}

export interface LoteRecomendado {
  lote: string;
  data_vencimento: string;
  quantidade_disponivel: number;
  dias_para_vencimento: number;
}

export const useAgentesExtintores = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Buscar todos os agentes extintores
  const {
    data: agentes = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['agentes-extintores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agentes_extintores_controle')
        .select(`
          *,
          materiais:material_id (
            codigo_material,
            nome,
            categoria
          ),
          viaturas:viatura_id (
            prefixo,
            placa
          )
        `)
        .order('data_vencimento', { ascending: true });

      if (error) throw error;
      return data as AgenteExtintor[];
    }
  });

  // Buscar alertas de vencimento
  const { data: alertas = [] } = useQuery({
    queryKey: ['alertas-vencimento-agentes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_alertas_vencimento_agentes');

      if (error) throw error;
      return data as AlertaVencimento[];
    }
  });

  // Buscar histórico de recargas
  const { data: historico = [] } = useQuery({
    queryKey: ['historico-recargas-agentes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('historico_recargas_agentes')
        .select(`
          *,
          agentes_extintores_controle!inner (
            lote,
            tipo_agente,
            materiais:material_id (
              nome,
              codigo_material
            )
          ),
          viaturas:viatura_id (
            prefixo,
            placa
          ),
          bombeiros:responsavel_id (
            nome
          )
        `)
        .order('data_recarga', { ascending: false });

      if (error) throw error;
      return data as HistoricoRecarga[];
    }
  });

  // Criar agente extintor
  const createAgente = useMutation({
    mutationFn: async (agente: Omit<AgenteExtintor, 'id' | 'created_at' | 'updated_at' | 'materiais' | 'viaturas'>) => {
      const { data, error } = await supabase
        .from('agentes_extintores_controle')
        .insert(agente)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agentes-extintores'] });
      queryClient.invalidateQueries({ queryKey: ['alertas-vencimento-agentes'] });
      toast({
        title: "Sucesso",
        description: "Agente extintor cadastrado com sucesso!",
      });
    }
  });

  // Atualizar agente extintor
  const updateAgente = useMutation({
    mutationFn: async ({ id, ...agente }: Partial<AgenteExtintor> & { id: string }) => {
      const { data, error } = await supabase
        .from('agentes_extintores_controle')
        .update(agente)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agentes-extintores'] });
      queryClient.invalidateQueries({ queryKey: ['alertas-vencimento-agentes'] });
      toast({
        title: "Sucesso",
        description: "Agente extintor atualizado com sucesso!",
      });
    }
  });

  // Registrar recarga
  const registrarRecarga = useMutation({
    mutationFn: async (recarga: Omit<HistoricoRecarga, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('historico_recargas_agentes')
        .insert(recarga)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['historico-recargas-agentes'] });
      queryClient.invalidateQueries({ queryKey: ['agentes-extintores'] });
      toast({
        title: "Sucesso",
        description: "Recarga registrada com sucesso!",
      });
    }
  });

  // Obter recomendação de lote
  const getRecomendacaoLote = async (tipoAgente: 'LGE' | 'PQS'): Promise<LoteRecomendado | null> => {
    const { data, error } = await supabase
      .rpc('get_proximo_lote_recomendado', { p_tipo_agente: tipoAgente });

    if (error) throw error;
    return data?.[0] || null;
  };

  return {
    agentes,
    alertas,
    historico,
    isLoading,
    error,
    createAgente,
    updateAgente,
    registrarRecarga,
    getRecomendacaoLote
  };
};
