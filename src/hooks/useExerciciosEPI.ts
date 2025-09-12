import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { 
  ExercicioEPIIndividual, 
  ExercicioEPIAgrupado, 
  CreateExercicioEPI, 
  UpdateExercicioEPI,
  ExercicioEPI // Mantido para compatibilidade
} from '../types/exercicioEPI'
import { toast } from 'sonner'

// Hook para buscar o chefe de equipe baseado na equipe
export const useChefeEquipe = (equipe: string) => {
  return useQuery({
    queryKey: ['chefe-equipe', equipe],
    queryFn: async (): Promise<string> => {
      if (!equipe) return ''
      
      const { data, error } = await supabase
        .from('bombeiros')
        .select('nome')
        .eq('equipe', equipe)
        .eq('funcao', 'BA-CE')
        .eq('status', 'ativo')
        .limit(1)

      if (error) {
        console.error('Erro ao buscar chefe de equipe:', error)
        throw new Error(`Erro ao buscar chefe da equipe ${equipe}: ${error.message}`)
      }

      // Retorna o primeiro resultado se existir
      if (data && data.length > 0) {
        return data[0].nome
      }
      
      // Se não encontrou nenhum chefe, retorna mensagem informativa
      console.warn(`Nenhum chefe encontrado para a equipe: ${equipe}`)
      return 'Chefe não encontrado'
    },
    enabled: !!equipe,
  })
}

// Hook para buscar todos os exercícios individuais
export const useExerciciosEPIIndividuais = () => {
  return useQuery({
    queryKey: ['exercicios-epi-individuais'],
    queryFn: async (): Promise<ExercicioEPIIndividual[]> => {
      const { data, error } = await supabase
        .from('exercicios_epi')
        .select('*')
        .order('data', { ascending: false })
        .order('hora', { ascending: false })

      if (error) {
        console.error('Erro ao buscar exercícios EPI:', error)
        throw new Error('Erro ao carregar exercícios EPI')
      }

      return data || []
    },
  })
}

// Hook para buscar exercícios agrupados por sessão
export const useExerciciosEPI = () => {
  return useQuery({
    queryKey: ['exercicios-epi-agrupados'],
    queryFn: async (): Promise<ExercicioEPIAgrupado[]> => {
      const { data, error } = await supabase
        .from('exercicios_epi')
        .select('*')
        .order('data', { ascending: false })
        .order('hora', { ascending: false })

      if (error) {
        console.error('Erro ao buscar exercícios EPI:', error)
        throw new Error('Erro ao carregar exercícios EPI')
      }

      // Agrupar dados por exercicio_grupo_id
      const grupos = new Map<string, ExercicioEPIIndividual[]>()
      
      data?.forEach(item => {
        const grupoId = item.exercicio_grupo_id
        if (!grupos.has(grupoId)) {
          grupos.set(grupoId, [])
        }
        grupos.get(grupoId)!.push(item)
      })

      // Converter para formato agrupado
      const exerciciosAgrupados: ExercicioEPIAgrupado[] = []
      
      grupos.forEach((bombeiros, grupoId) => {
        if (bombeiros.length > 0) {
          const primeiro = bombeiros[0]
          exerciciosAgrupados.push({
            exercicio_grupo_id: grupoId,
            data: primeiro.data,
            hora: primeiro.hora,
            equipe: primeiro.equipe,
            chefe_equipe: primeiro.chefe_equipe,
            tipo_epi: primeiro.tipo_epi,
            identificacao_local: primeiro.identificacao_local,
            observacoes: primeiro.observacoes,
            status: primeiro.status,
            created_at: primeiro.created_at,
            updated_at: primeiro.updated_at,
            bombeiros: bombeiros.map(b => ({
              id: b.id,
              bombeiro_id: b.bombeiro_id,
              bombeiro_nome: b.bombeiro_nome,
              bombeiro_funcao: b.bombeiro_funcao,
              tempo_calca_bota: b.tempo_calca_bota,
              tempo_tp_completo: b.tempo_tp_completo,
              tempo_epr_tp_completo: b.tempo_epr_tp_completo,
              tempo_epr_sem_tp: b.tempo_epr_sem_tp
            }))
          })
        }
      })

      return exerciciosAgrupados
    },
  })
}

// Hook para buscar um exercício agrupado específico
export const useExercicioEPI = (grupoId: string) => {
  return useQuery({
    queryKey: ['exercicio-epi-agrupado', grupoId],
    queryFn: async (): Promise<ExercicioEPIAgrupado | null> => {
      const { data, error } = await supabase
        .from('exercicios_epi')
        .select('*')
        .eq('exercicio_grupo_id', grupoId)
        .order('bombeiro_nome')

      if (error) {
        console.error('Erro ao buscar exercício EPI:', error)
        throw new Error('Erro ao carregar exercício EPI')
      }

      if (!data || data.length === 0) {
        return null
      }

      // Converter para formato agrupado
      const primeiro = data[0]
      return {
        exercicio_grupo_id: grupoId,
        data: primeiro.data,
        hora: primeiro.hora,
        equipe: primeiro.equipe,
        chefe_equipe: primeiro.chefe_equipe,
        tipo_epi: primeiro.tipo_epi,
        identificacao_local: primeiro.identificacao_local,
        observacoes: primeiro.observacoes,
        status: primeiro.status,
        created_at: primeiro.created_at,
        updated_at: primeiro.updated_at,
        bombeiros: data.map(b => ({
          id: b.id,
          bombeiro_id: b.bombeiro_id,
          bombeiro_nome: b.bombeiro_nome,
          bombeiro_funcao: b.bombeiro_funcao,
          tempo_calca_bota: b.tempo_calca_bota,
          tempo_tp_completo: b.tempo_tp_completo,
          tempo_epr_tp_completo: b.tempo_epr_tp_completo,
          tempo_epr_sem_tp: b.tempo_epr_sem_tp
        }))
      }
    },
    enabled: !!grupoId,
  })
}

// Hook para criar um novo exercício (agora cria múltiplos registros individuais)
export const useCreateExercicioEPI = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (exercicio: CreateExercicioEPI): Promise<ExercicioEPIIndividual[]> => {
      // Gerar ID único para o grupo
      const grupoId = crypto.randomUUID()
      
      // Criar registros individuais para cada bombeiro
      const registrosIndividuais = exercicio.bombeiros.map(bombeiro => ({
        exercicio_grupo_id: grupoId,
        data: exercicio.data,
        hora: exercicio.hora,
        equipe: exercicio.equipe,
        tipo_epi: exercicio.tipo_epi,
        identificacao_local: exercicio.identificacao_local,
        observacoes: exercicio.observacoes,
        status: exercicio.status,
        bombeiro_nome: bombeiro.bombeiro_nome,
        bombeiro_funcao: bombeiro.bombeiro_funcao,
        tempo_calca_bota: bombeiro.tempo_calca_bota,
        tempo_tp_completo: bombeiro.tempo_tp_completo,
        tempo_epr_tp_completo: bombeiro.tempo_epr_tp_completo,
        tempo_epr_sem_tp: bombeiro.tempo_epr_sem_tp
      }))

      const { data, error } = await supabase
        .from('exercicios_epi')
        .insert(registrosIndividuais)
        .select()

      if (error) {
        console.error('Erro ao criar exercício EPI:', error)
        throw new Error('Erro ao criar exercício EPI')
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercicios-epi-agrupados'] })
      queryClient.invalidateQueries({ queryKey: ['exercicios-epi-individuais'] })
      toast.success('Exercício EPI criado com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao criar exercício EPI: ' + error.message)
    },
  })
}

// Hook para atualizar um exercício (atualiza todos os registros do grupo)
export const useUpdateExercicioEPI = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ grupoId, updates }: { grupoId: string; updates: UpdateExercicioEPI }): Promise<ExercicioEPIIndividual[]> => {
      // Se há bombeiros nos updates, precisamos recriar os registros
      if (updates.bombeiros) {
        // Primeiro, deletar registros existentes
        const { error: deleteError } = await supabase
          .from('exercicios_epi')
          .delete()
          .eq('exercicio_grupo_id', grupoId)

        if (deleteError) {
          console.error('Erro ao deletar registros antigos:', deleteError)
          throw new Error('Erro ao atualizar exercício EPI')
        }

        // Criar novos registros
        const registrosIndividuais = updates.bombeiros.map(bombeiro => ({
          exercicio_grupo_id: grupoId,
          data: updates.data!,
          hora: updates.hora!,
          equipe: updates.equipe!,
          tipo_epi: updates.tipo_epi!,
          identificacao_local: updates.identificacao_local!,
          observacoes: updates.observacoes,
          status: updates.status!,
          bombeiro_nome: bombeiro.bombeiro_nome,
          bombeiro_funcao: bombeiro.bombeiro_funcao,
          tempo_calca_bota: bombeiro.tempo_calca_bota,
          tempo_tp_completo: bombeiro.tempo_tp_completo,
          tempo_epr_tp_completo: bombeiro.tempo_epr_tp_completo,
          tempo_epr_sem_tp: bombeiro.tempo_epr_sem_tp,
          updated_at: new Date().toISOString()
        }))

        const { data, error } = await supabase
          .from('exercicios_epi')
          .insert(registrosIndividuais)
          .select()

        if (error) {
          console.error('Erro ao criar novos registros:', error)
          throw new Error('Erro ao atualizar exercício EPI')
        }

        return data
      } else {
        // Atualizar apenas campos comuns (sem bombeiros)
        const { bombeiros, ...camposComuns } = updates
        const { data, error } = await supabase
          .from('exercicios_epi')
          .update({ ...camposComuns, updated_at: new Date().toISOString() })
          .eq('exercicio_grupo_id', grupoId)
          .select()

        if (error) {
          console.error('Erro ao atualizar exercício EPI:', error)
          throw new Error('Erro ao atualizar exercício EPI')
        }

        return data
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['exercicios-epi-agrupados'] })
      queryClient.invalidateQueries({ queryKey: ['exercicios-epi-individuais'] })
      if (data.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['exercicio-epi-agrupado', data[0].exercicio_grupo_id] })
      }
      toast.success('Exercício EPI atualizado com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao atualizar exercício EPI: ' + error.message)
    },
  })
}

// Hook para excluir um exercício (exclui todos os registros do grupo)
export const useDeleteExercicioEPI = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (grupoId: string): Promise<void> => {
      const { error } = await supabase
        .from('exercicios_epi')
        .delete()
        .eq('exercicio_grupo_id', grupoId)

      if (error) {
        console.error('Erro ao excluir exercício EPI:', error)
        throw new Error('Erro ao excluir exercício EPI')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercicios-epi-agrupados'] })
      queryClient.invalidateQueries({ queryKey: ['exercicios-epi-individuais'] })
      toast.success('Exercício EPI excluído com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao excluir exercício EPI: ' + error.message)
    },
  })
}

// Hook para estatísticas dos exercícios
export const useExerciciosEPIStats = () => {
  return useQuery({
    queryKey: ['exercicios-epi-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercicios_epi')
        .select('exercicio_grupo_id, status, tipo_epi, tempo_calca_bota, tempo_tp_completo, tempo_epr_tp_completo, tempo_epr_sem_tp')

      if (error) {
        console.error('Erro ao buscar estatísticas:', error)
        throw new Error('Erro ao carregar estatísticas')
      }

      // Agrupar por exercicio_grupo_id para contar exercícios únicos
      const grupos = new Set(data.map(item => item.exercicio_grupo_id))
      const totalExercicios = grupos.size
      
      // Contar status por grupo
      const statusPorGrupo = new Map<string, string>()
      data.forEach(item => {
        if (!statusPorGrupo.has(item.exercicio_grupo_id)) {
          statusPorGrupo.set(item.exercicio_grupo_id, item.status)
        }
      })
      
      const concluidos = Array.from(statusPorGrupo.values()).filter(status => status === 'Concluído').length
      const pendentes = Array.from(statusPorGrupo.values()).filter(status => status === 'Pendente').length
      
      // Calcular tempo médio baseado nos tempos individuais
      const temposValidos = data.filter(item => 
        item.tempo_calca_bota > 0 || item.tempo_tp_completo > 0 || item.tempo_epr_tp_completo > 0 || item.tempo_epr_sem_tp > 0
      )
      
      const tempoMedio = temposValidos.length > 0 
        ? Math.round(
            temposValidos.reduce((acc, item) => {
              const tempoTotal = (item.tempo_calca_bota || 0) + (item.tempo_tp_completo || 0) + 
                               (item.tempo_epr_tp_completo || 0) + (item.tempo_epr_sem_tp || 0)
              return acc + tempoTotal
            }, 0) / temposValidos.length
          )
        : 0

      return {
        total: totalExercicios,
        concluidos,
        pendentes,
        tempoMedio,
        totalBombeiros: data.length
      }
    },
  })
}