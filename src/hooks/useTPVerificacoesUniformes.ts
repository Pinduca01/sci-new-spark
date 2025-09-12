import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export interface TPVerificacaoUniformes {
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
  created_at: string
  updated_at: string
  
  // Categoria Uniformes (8 itens obrigatórios)
  // Item 1: GANDOLAS DE BOMBEIRO DE AERODROMO
  cat1_gandolas?: 'conforme' | 'nao_conforme' | 'nao_verificado'
  cat1_gandolas_membros?: string[]
  cat1_gandolas_observacoes?: string
  
  // Item 2: CALÇAS DE BOMBEIRO DE AERODROMO
  cat1_calcas?: 'conforme' | 'nao_conforme' | 'nao_verificado'
  cat1_calcas_membros?: string[]
  cat1_calcas_observacoes?: string
  
  // Item 3: CINTO DE BOMBEIRO DE AERODROMO
  cat1_cinto?: 'conforme' | 'nao_conforme' | 'nao_verificado'
  cat1_cinto_membros?: string[]
  cat1_cinto_observacoes?: string
  
  // Item 4: BOTA DE SEGURANÇA DE BOMBEIRO DE AERODROMO
  cat1_bota?: 'conforme' | 'nao_conforme' | 'nao_verificado'
  cat1_bota_membros?: string[]
  cat1_bota_observacoes?: string
  
  // Item 5: CAMISAS DE BOMBEIRO DE AERODROMO
  cat1_camisas?: 'conforme' | 'nao_conforme' | 'nao_verificado'
  cat1_camisas_membros?: string[]
  cat1_camisas_observacoes?: string
  
  // Item 6: BERMUDAS DE BOMBEIRO DE AERODROMO
  cat1_bermudas?: 'conforme' | 'nao_conforme' | 'nao_verificado'
  cat1_bermudas_membros?: string[]
  cat1_bermudas_observacoes?: string
  
  // Item 7: TARJETA DE NOME/FUNÇÃO/NUMERAÇÃO FRENTE E COSTAS
  cat1_tarjeta?: 'conforme' | 'nao_conforme' | 'nao_verificado'
  cat1_tarjeta_membros?: string[]
  cat1_tarjeta_observacoes?: string
  
  // Item 8: ÓCULOS DE PROTEÇÃO/PROTETOR AURICULAR
  cat1_oculos?: 'conforme' | 'nao_conforme' | 'nao_verificado'
  cat1_oculos_membros?: string[]
  cat1_oculos_observacoes?: string
}

// Hook principal para buscar verificações de uniformes
export function useTPVerificacoesUniformes() {
  return useQuery({
    queryKey: ['tp-verificacoes-uniformes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tp_verificacoes_uniformes')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as TPVerificacaoUniformes[]
    }
  })
}

// Hook para deletar verificação de uniformes
export function useDeleteTPVerificacaoUniformes() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tp_verificacoes_uniformes')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tp-verificacoes-uniformes'] })
      toast({
        title: 'Sucesso',
        description: 'Verificação de uniformes excluída com sucesso!',
      })
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir verificação de uniformes: ' + error.message,
        variant: 'destructive',
      })
    }
  })
}

// Hook para criar verificação de uniformes
export function useCreateTPVerificacaoUniformes() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (verificacao: Omit<TPVerificacaoUniformes, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('tp_verificacoes_uniformes')
        .insert([verificacao])
        .select()
        .single()
      
      if (error) throw error
      return data as TPVerificacaoUniformes
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tp-verificacoes-uniformes'] })
      toast({
        title: 'Sucesso',
        description: 'Verificação de uniformes criada com sucesso!',
      })
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao criar verificação de uniformes: ' + error.message,
        variant: 'destructive',
      })
    }
  })
}

// Hook para atualizar verificação de uniformes
export function useUpdateTPVerificacaoUniformes() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TPVerificacaoUniformes> & { id: string }) => {
      const { data, error } = await supabase
        .from('tp_verificacoes_uniformes')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as TPVerificacaoUniformes
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tp-verificacoes-uniformes'] })
      toast({
        title: 'Sucesso',
        description: 'Verificação de uniformes atualizada com sucesso!',
      })
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar verificação de uniformes: ' + error.message,
        variant: 'destructive',
      })
    }
  })
}

// Hook para obter estatísticas das verificações de uniformes
export function useTPVerificacoesUniformesEstatisticas() {
  return useQuery({
    queryKey: ['tp-verificacoes-uniformes-estatisticas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tp_verificacoes_uniformes')
        .select('*')
      
      if (error) throw error
      
      const verificacoes = data as TPVerificacaoUniformes[]
      
      const totalVerificacoes = verificacoes.length
      const verificacoesConcluidas = verificacoes.filter(v => v.status === 'concluida').length
      const verificacoesEmAndamento = verificacoes.filter(v => v.status === 'em_andamento').length
      const verificacoesCanceladas = verificacoes.filter(v => v.status === 'cancelada').length
      
      // Calcular conformidade média apenas das verificações concluídas
      const verificacoesComConformidade = verificacoes.filter(v => 
        v.status === 'concluida' && v.percentual_conformidade !== undefined
      )
      
      const conformidadeMedia = verificacoesComConformidade.length > 0
        ? verificacoesComConformidade.reduce((acc, v) => acc + v.percentual_conformidade, 0) / verificacoesComConformidade.length
        : 0
      
      return {
        totalVerificacoes,
        verificacoesConcluidas,
        verificacoesEmAndamento,
        verificacoesCanceladas,
        conformidadeMedia: Math.round(conformidadeMedia * 100) / 100
      }
    }
  })
}