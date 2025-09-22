
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export interface TPVerificacao {
  id: string
  data_verificacao: string
  local: string
  responsavel: string
  equipe: 'Alfa' | 'Bravo' | 'Charlie' | 'Delta'
  membros_equipe: string[]
  status: 'em_andamento' | 'concluida' | 'cancelada'
  etapa_atual: number
  total_conformes: number
  total_nao_conformes: number
  total_nao_verificados: number
  percentual_conformidade: number
  observacoes?: string // Adicionado campo observações
  created_at: string
  updated_at: string
  
  // Categoria 1 - Etiquetas e CA
  cat1_etiquetas_visiveis?: 'conforme' | 'nao_conforme' | 'nao_verificado'
  cat1_etiquetas_membros?: string[]
  cat1_etiquetas_observacoes?: string
  cat1_ca_valido?: 'conforme' | 'nao_conforme' | 'nao_verificado'
  cat1_ca_membros?: string[]
  cat1_ca_observacoes?: string
  
  // Categoria 2 - Capacetes
  cat2_capacetes_integros?: 'conforme' | 'nao_conforme' | 'nao_verificado'
  cat2_capacetes_membros?: string[]
  cat2_capacetes_observacoes?: string
  
  // Categoria 3 - Vestimentas
  cat3_vestimentas_integras?: 'conforme' | 'nao_conforme' | 'nao_verificado'
  cat3_vestimentas_membros?: string[]
  cat3_vestimentas_observacoes?: string
  cat3_bom_estado?: 'conforme' | 'nao_conforme' | 'nao_verificado'
  cat3_bom_estado_membros?: string[]
  cat3_bom_estado_observacoes?: string
  cat3_faixas_reflexivas?: 'conforme' | 'nao_conforme' | 'nao_verificado'
  cat3_faixas_membros?: string[]
  cat3_faixas_observacoes?: string
  cat3_bolsos_dispositivos?: 'conforme' | 'nao_conforme' | 'nao_verificado'
  cat3_bolsos_membros?: string[]
  cat3_bolsos_observacoes?: string
  cat3_costuras_integras?: 'conforme' | 'nao_conforme' | 'nao_verificado'
  cat3_costuras_membros?: string[]
  cat3_costuras_observacoes?: string
  cat3_barreira_umidade?: 'conforme' | 'nao_conforme' | 'nao_verificado'
  cat3_barreira_membros?: string[]
  cat3_barreira_observacoes?: string
  cat3_punhos_elasticidade?: 'conforme' | 'nao_conforme' | 'nao_verificado'
  cat3_punhos_membros?: string[]
  cat3_punhos_observacoes?: string
  cat3_costuras_seladas?: 'conforme' | 'nao_conforme' | 'nao_verificado'
  cat3_seladas_membros?: string[]
  cat3_seladas_observacoes?: string
  
  // Categoria 4 - Botas
  cat4_botas_bom_estado?: 'conforme' | 'nao_conforme' | 'nao_verificado'
  cat4_botas_membros?: string[]
  cat4_botas_observacoes?: string
  cat4_solas_integras?: 'conforme' | 'nao_conforme' | 'nao_verificado'
  cat4_solas_membros?: string[]
  cat4_solas_observacoes?: string
  
  // Categoria 5 - Luvas
  cat5_luvas_bom_estado?: 'conforme' | 'nao_conforme' | 'nao_verificado'
  cat5_luvas_membros?: string[]
  cat5_luvas_observacoes?: string
  cat5_costuras_luvas?: 'conforme' | 'nao_conforme' | 'nao_verificado'
  cat5_costuras_membros?: string[]
  cat5_costuras_observacoes?: string
  
  // Categoria 6 - Capuzes
  cat6_capuzes_bom_estado?: 'conforme' | 'nao_conforme' | 'nao_verificado'
  cat6_capuzes_membros?: string[]
  cat6_capuzes_observacoes?: string
}

// Hook principal para buscar verificações
export function useTPVerificacoes() {
  return useQuery({
    queryKey: ['tp-verificacoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tp_verificacoes')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as TPVerificacao[]
    }
  })
}

// Hook para deletar verificação
export function useDeleteTPVerificacao() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tp_verificacoes')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tp-verificacoes'] })
      toast({
        title: 'Sucesso',
        description: 'Verificação excluída com sucesso!',
      })
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir verificação: ' + error.message,
        variant: 'destructive',
      })
    }
  })
}

// Hook para criar verificação
export function useCreateTPVerificacao() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (verificacao: Omit<TPVerificacao, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('tp_verificacoes')
        .insert([verificacao])
        .select()
        .single()
      
      if (error) throw error
      return data as TPVerificacao
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tp-verificacoes'] })
      toast({
        title: 'Sucesso',
        description: 'Verificação criada com sucesso!',
      })
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao criar verificação: ' + error.message,
        variant: 'destructive',
      })
    }
  })
}

// Hook para atualizar verificação
export function useUpdateTPVerificacao() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TPVerificacao> & { id: string }) => {
      const { data, error } = await supabase
        .from('tp_verificacoes')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as TPVerificacao
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tp-verificacoes'] })
      toast({
        title: 'Sucesso',
        description: 'Verificação atualizada com sucesso!',
      })
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar verificação: ' + error.message,
        variant: 'destructive',
      })
    }
  })
}
