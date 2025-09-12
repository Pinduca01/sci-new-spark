import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

// Interface para a tabela 'uniformes' do Supabase
export interface UniformeVerificacao {
  id: string
  bombeiro_id?: string
  bombeiro_nome: string
  equipe_id?: string
  base: string
  data_verificacao: string
  mes_referencia: number
  ano_referencia: number
  responsavel_id?: string
  responsavel_nome: string
  status: 'APROVADO' | 'REPROVADO' | 'PENDENTE'
  
  // 8 itens obrigatórios de uniformes
  gandolas_bombeiro: 'CONFORME' | 'NAO_CONFORME'
  gandolas_observacoes?: string
  gandolas_imagem_url?: string
  
  calcas_bombeiro: 'CONFORME' | 'NAO_CONFORME'
  calcas_observacoes?: string
  calcas_imagem_url?: string
  
  cinto_bombeiro: 'CONFORME' | 'NAO_CONFORME'
  cinto_observacoes?: string
  cinto_imagem_url?: string
  
  bota_seguranca: 'CONFORME' | 'NAO_CONFORME'
  bota_observacoes?: string
  bota_imagem_url?: string
  
  camisas_bombeiro: 'CONFORME' | 'NAO_CONFORME'
  camisas_observacoes?: string
  camisas_imagem_url?: string
  
  bermudas_bombeiro: 'CONFORME' | 'NAO_CONFORME'
  bermudas_observacoes?: string
  bermudas_imagem_url?: string
  
  tarjeta_identificacao: 'CONFORME' | 'NAO_CONFORME'
  tarjeta_observacoes?: string
  tarjeta_imagem_url?: string
  
  oculos_protetor: 'CONFORME' | 'NAO_CONFORME'
  oculos_observacoes?: string
  oculos_imagem_url?: string
  
  total_itens_verificados: number
  itens_conformes: number
  itens_nao_conformes: number
  percentual_conformidade?: number
  observacoes_gerais?: string
  
  created_at?: string
  updated_at?: string
}

// Interface para criação de nova verificação
export interface NovaVerificacaoUniforme {
  bombeiro_nome: string
  base: string
  mes_referencia: number
  ano_referencia: number
  responsavel_nome: string
  
  // Status dos 8 itens obrigatórios
  gandolas_bombeiro: 'CONFORME' | 'NAO_CONFORME'
  gandolas_observacoes?: string
  
  calcas_bombeiro: 'CONFORME' | 'NAO_CONFORME'
  calcas_observacoes?: string
  
  cinto_bombeiro: 'CONFORME' | 'NAO_CONFORME'
  cinto_observacoes?: string
  
  bota_seguranca: 'CONFORME' | 'NAO_CONFORME'
  bota_observacoes?: string
  
  camisas_bombeiro: 'CONFORME' | 'NAO_CONFORME'
  camisas_observacoes?: string
  
  bermudas_bombeiro: 'CONFORME' | 'NAO_CONFORME'
  bermudas_observacoes?: string
  
  tarjeta_identificacao: 'CONFORME' | 'NAO_CONFORME'
  tarjeta_observacoes?: string
  
  oculos_protetor: 'CONFORME' | 'NAO_CONFORME'
  oculos_observacoes?: string
  
  observacoes_gerais?: string
}

// Hook para buscar todas as verificações de uniformes
export function useUniformesVerificacoes() {
  return useQuery({
    queryKey: ['uniformes-verificacoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('uniformes')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Erro ao buscar verificações de uniformes:', error)
        throw error
      }
      
      return data as UniformeVerificacao[]
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos para dados em tempo real
    staleTime: 10000 // Considera dados obsoletos após 10 segundos
  })
}

// Hook para buscar verificações por bombeiro
export function useUniformesVerificacoesPorBombeiro(bombeiroNome: string) {
  return useQuery({
    queryKey: ['uniformes-verificacoes', 'bombeiro', bombeiroNome],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('uniformes')
        .select('*')
        .eq('bombeiro_nome', bombeiroNome)
        .order('data_verificacao', { ascending: false })
      
      if (error) {
        console.error('Erro ao buscar verificações por bombeiro:', error)
        throw error
      }
      
      return data as UniformeVerificacao[]
    },
    enabled: !!bombeiroNome,
    refetchInterval: 30000
  })
}

// Hook para buscar verificações por período
export function useUniformesVerificacoesPorPeriodo(mes: number, ano: number) {
  return useQuery({
    queryKey: ['uniformes-verificacoes', 'periodo', mes, ano],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('uniformes')
        .select('*')
        .eq('mes_referencia', mes)
        .eq('ano_referencia', ano)
        .order('data_verificacao', { ascending: false })
      
      if (error) {
        console.error('Erro ao buscar verificações por período:', error)
        throw error
      }
      
      return data as UniformeVerificacao[]
    },
    enabled: !!mes && !!ano,
    refetchInterval: 30000
  })
}

// Hook para criar nova verificação de uniforme
export function useCreateUniformeVerificacao() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (novaVerificacao: NovaVerificacaoUniforme) => {
      // Calcular estatísticas automaticamente
      const itensVerificados = [
        novaVerificacao.gandolas_bombeiro,
        novaVerificacao.calcas_bombeiro,
        novaVerificacao.cinto_bombeiro,
        novaVerificacao.bota_seguranca,
        novaVerificacao.camisas_bombeiro,
        novaVerificacao.bermudas_bombeiro,
        novaVerificacao.tarjeta_identificacao,
        novaVerificacao.oculos_protetor
      ]
      
      const itensConformes = itensVerificados.filter(item => item === 'CONFORME').length
      const itensNaoConformes = itensVerificados.filter(item => item === 'NAO_CONFORME').length
      
      // Determinar status geral
      let status: 'APROVADO' | 'REPROVADO' | 'PENDENTE'
      if (itensNaoConformes === 0) {
        status = 'APROVADO'
      } else if (itensConformes === 0) {
        status = 'REPROVADO'
      } else {
        status = 'PENDENTE'
      }
      
      const verificacaoCompleta = {
        ...novaVerificacao,
        status,
        total_itens_verificados: 8,
        itens_conformes: itensConformes,
        itens_nao_conformes: itensNaoConformes,
        data_verificacao: new Date().toISOString().split('T')[0]
      }
      
      const { data, error } = await supabase
        .from('uniformes')
        .insert([verificacaoCompleta])
        .select()
        .single()
      
      if (error) {
        console.error('Erro ao criar verificação:', error)
        throw error
      }
      
      return data as UniformeVerificacao
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['uniformes-verificacoes'] })
      toast({
        title: 'Sucesso',
        description: `Verificação de uniforme criada com sucesso! Status: ${data.status}`,
      })
    },
    onError: (error: any) => {
      console.error('Erro na mutação:', error)
      toast({
        title: 'Erro',
        description: `Erro ao criar verificação: ${error.message}`,
        variant: 'destructive',
      })
    }
  })
}

// Hook para atualizar verificação existente
export function useUpdateUniformeVerificacao() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<UniformeVerificacao> & { id: string }) => {
      const { data, error } = await supabase
        .from('uniformes')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Erro ao atualizar verificação:', error)
        throw error
      }
      
      return data as UniformeVerificacao
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uniformes-verificacoes'] })
      toast({
        title: 'Sucesso',
        description: 'Verificação atualizada com sucesso!',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: `Erro ao atualizar verificação: ${error.message}`,
        variant: 'destructive',
      })
    }
  })
}

// Hook para deletar verificação
export function useDeleteUniformeVerificacao() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('uniformes')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('Erro ao deletar verificação:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uniformes-verificacoes'] })
      toast({
        title: 'Sucesso',
        description: 'Verificação excluída com sucesso!',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: `Erro ao excluir verificação: ${error.message}`,
        variant: 'destructive',
      })
    }
  })
}

// Hook para estatísticas em tempo real
export function useUniformesEstatisticas() {
  return useQuery({
    queryKey: ['uniformes-estatisticas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('uniformes')
        .select('status, percentual_conformidade, itens_conformes, itens_nao_conformes')
      
      if (error) {
        console.error('Erro ao buscar estatísticas:', error)
        throw error
      }
      
      const verificacoes = data as Pick<UniformeVerificacao, 'status' | 'percentual_conformidade' | 'itens_conformes' | 'itens_nao_conformes'>[]
      
      const totalVerificacoes = verificacoes.length
      const aprovadas = verificacoes.filter(v => v.status === 'APROVADO').length
      const reprovadas = verificacoes.filter(v => v.status === 'REPROVADO').length
      const pendentes = verificacoes.filter(v => v.status === 'PENDENTE').length
      
      const conformidadeMedia = verificacoes.length > 0
        ? verificacoes.reduce((acc, v) => acc + (v.percentual_conformidade || 0), 0) / verificacoes.length
        : 0
      
      const totalItensConformes = verificacoes.reduce((acc, v) => acc + v.itens_conformes, 0)
      const totalItensNaoConformes = verificacoes.reduce((acc, v) => acc + v.itens_nao_conformes, 0)
      
      return {
        totalVerificacoes,
        aprovadas,
        reprovadas,
        pendentes,
        conformidadeMedia: Math.round(conformidadeMedia * 100) / 100,
        totalItensConformes,
        totalItensNaoConformes,
        percentualAprovacao: totalVerificacoes > 0 ? Math.round((aprovadas / totalVerificacoes) * 100) : 0
      }
    },
    refetchInterval: 30000, // Atualiza estatísticas a cada 30 segundos
    staleTime: 10000
  })
}

// Hook para validação em tempo real de uniformes por bombeiro
export function useValidacaoUniformesBombeiro(bombeiroNome: string) {
  return useQuery({
    queryKey: ['validacao-uniformes', bombeiroNome],
    queryFn: async () => {
      if (!bombeiroNome) return null
      
      const mesAtual = new Date().getMonth() + 1
      const anoAtual = new Date().getFullYear()
      
      const { data, error } = await supabase
        .from('uniformes')
        .select('*')
        .eq('bombeiro_nome', bombeiroNome)
        .eq('mes_referencia', mesAtual)
        .eq('ano_referencia', anoAtual)
        .order('data_verificacao', { ascending: false })
        .limit(1)
      
      if (error) {
        console.error('Erro ao validar uniformes:', error)
        throw error
      }
      
      const ultimaVerificacao = data?.[0] as UniformeVerificacao | undefined
      
      return {
        temVerificacaoAtual: !!ultimaVerificacao,
        ultimaVerificacao,
        statusAtual: ultimaVerificacao?.status || 'PENDENTE',
        conformidadeAtual: ultimaVerificacao?.percentual_conformidade || 0,
        itensNaoConformes: ultimaVerificacao?.itens_nao_conformes || 0
      }
    },
    enabled: !!bombeiroNome,
    refetchInterval: 15000, // Validação mais frequente para tempo real
    staleTime: 5000
  })
}