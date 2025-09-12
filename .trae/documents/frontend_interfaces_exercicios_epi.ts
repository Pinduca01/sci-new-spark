// =====================================================
// INTERFACES TYPESCRIPT - Exercícios EPI/EPR Individual
// Arquivo: src/types/exercicioEPI.ts
// =====================================================

// Interface principal do exercício (atualizada)
export interface ExercicioEPI {
  id: string;
  data: string; // formato: YYYY-MM-DD
  hora?: string; // formato: HH:MM:SS
  identificacao_local?: string;
  equipe: 'Alfa' | 'Bravo' | 'Charlie' | 'Delta';
  chefe_equipe: string;
  tipo_epi: 'EPI' | 'EPR';
  status: 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado';
  observacoes?: string;
  created_at: string;
  updated_at: string;
  // Relacionamento com bombeiros (carregado via JOIN)
  bombeiros?: ExercicioEPIBombeiro[];
}

// Nova interface para bombeiros individuais
export interface ExercicioEPIBombeiro {
  id: string;
  exercicio_id: string;
  bombeiro_id?: string; // Referência ao bombeiro cadastrado (opcional)
  bombeiro_nome: string;
  bombeiro_funcao: string;
  tempo_calca_bota?: number; // em segundos
  tempo_tp_completo?: number; // em segundos
  tempo_epr_tp_completo?: number; // em segundos
  tempo_epr_sem_tp?: number; // em segundos
  created_at: string;
  updated_at: string;
}

// Interface para criação de exercício
export interface CreateExercicioEPI {
  data: string;
  hora?: string;
  identificacao_local?: string;
  equipe: 'Alfa' | 'Bravo' | 'Charlie' | 'Delta';
  chefe_equipe: string;
  tipo_epi: 'EPI' | 'EPR';
  status?: 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado';
  observacoes?: string;
  bombeiros: CreateExercicioEPIBombeiro[];
}

// Interface para criação de bombeiro no exercício
export interface CreateExercicioEPIBombeiro {
  bombeiro_id?: string;
  bombeiro_nome: string;
  bombeiro_funcao: string;
  tempo_calca_bota?: number;
  tempo_tp_completo?: number;
  tempo_epr_tp_completo?: number;
  tempo_epr_sem_tp?: number;
}

// Interface para atualização de exercício
export interface UpdateExercicioEPI {
  data?: string;
  hora?: string;
  identificacao_local?: string;
  equipe?: 'Alfa' | 'Bravo' | 'Charlie' | 'Delta';
  chefe_equipe?: string;
  tipo_epi?: 'EPI' | 'EPR';
  status?: 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado';
  observacoes?: string;
  bombeiros?: CreateExercicioEPIBombeiro[];
}

// Interface para dados do modal (formato interno)
export interface BombeiroTempo {
  nome: string;
  funcao: string;
  calcaBota: string; // formato MM:SS
  tpCompleto: string; // formato MM:SS
  eprTpCompleto: string; // formato MM:SS
  eprSemTp: string; // formato MM:SS
}

// Interface para bombeiro cadastrado no sistema
export interface BombeiroCadastrado {
  id: string;
  nome: string;
  funcao: string;
  funcao_completa: string;
  equipe?: string;
  status: string;
}

// =====================================================
// FUNÇÕES UTILITÁRIAS
// =====================================================

/**
 * Converte tempo no formato MM:SS para segundos
 * @param timeString - Tempo no formato "MM:SS"
 * @returns Tempo em segundos
 */
export const timeToSeconds = (timeString: string): number => {
  if (!timeString || timeString === '00:00') return 0;
  
  const parts = timeString.split(':');
  if (parts.length !== 2) return 0;
  
  const minutes = parseInt(parts[0], 10) || 0;
  const seconds = parseInt(parts[1], 10) || 0;
  
  return (minutes * 60) + seconds;
};

/**
 * Converte segundos para formato MM:SS
 * @param seconds - Tempo em segundos
 * @returns Tempo no formato "MM:SS"
 */
export const secondsToTime = (seconds?: number): string => {
  if (!seconds || seconds === 0) return '00:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Converte array de BombeiroTempo para CreateExercicioEPIBombeiro
 * @param bombeiros - Array de bombeiros do modal
 * @param bombeirosCadastrados - Array de bombeiros cadastrados
 * @returns Array formatado para inserção no banco
 */
export const formatBombeirosForDatabase = (
  bombeiros: BombeiroTempo[],
  bombeirosCadastrados: BombeiroCadastrado[]
): CreateExercicioEPIBombeiro[] => {
  return bombeiros.map(bombeiro => {
    const bombeiroCadastrado = bombeirosCadastrados.find(
      b => b.nome === bombeiro.nome
    );
    
    return {
      bombeiro_id: bombeiroCadastrado?.id,
      bombeiro_nome: bombeiro.nome,
      bombeiro_funcao: bombeiro.funcao,
      tempo_calca_bota: timeToSeconds(bombeiro.calcaBota),
      tempo_tp_completo: timeToSeconds(bombeiro.tpCompleto),
      tempo_epr_tp_completo: timeToSeconds(bombeiro.eprTpCompleto),
      tempo_epr_sem_tp: timeToSeconds(bombeiro.eprSemTp)
    };
  });
};

/**
 * Converte dados do banco para formato do modal
 * @param exercicio - Exercício com bombeiros do banco
 * @returns Dados formatados para o modal
 */
export const formatExercicioForModal = (exercicio: ExercicioEPI) => {
  const bombeiros: BombeiroTempo[] = exercicio.bombeiros?.map(b => ({
    nome: b.bombeiro_nome,
    funcao: b.bombeiro_funcao,
    calcaBota: secondsToTime(b.tempo_calca_bota),
    tpCompleto: secondsToTime(b.tempo_tp_completo),
    eprTpCompleto: secondsToTime(b.tempo_epr_tp_completo),
    eprSemTp: secondsToTime(b.tempo_epr_sem_tp)
  })) || [];
  
  return {
    id: exercicio.id,
    identificacaoLocal: exercicio.identificacao_local || '',
    data: exercicio.data,
    hora: exercicio.hora || '',
    equipe: exercicio.equipe,
    chefeEquipe: exercicio.chefe_equipe,
    tipoEPI: exercicio.tipo_epi,
    status: exercicio.status,
    observacoes: exercicio.observacoes || '',
    bombeiros
  };
};

// =====================================================
// HOOKS PERSONALIZADOS
// =====================================================

/**
 * Hook para buscar exercícios com bombeiros
 * Arquivo: src/hooks/useExerciciosEPI.ts
 */
/*
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ExercicioEPI } from '@/types/exercicioEPI';

export const useExerciciosEPI = () => {
  return useQuery({
    queryKey: ['exercicios-epi'],
    queryFn: async (): Promise<ExercicioEPI[]> => {
      const { data, error } = await supabase
        .from('exercicios_epi')
        .select(`
          *,
          bombeiros:exercicios_epi_bombeiros(*)
        `)
        .order('data', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });
};
*/

/**
 * Hook para criar exercício com bombeiros
 * Arquivo: src/hooks/useCreateExercicioEPI.ts
 */
/*
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CreateExercicioEPI } from '@/types/exercicioEPI';

export const useCreateExercicioEPI = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (exercicio: CreateExercicioEPI) => {
      // 1. Criar exercício principal
      const { data: novoExercicio, error: exercicioError } = await supabase
        .from('exercicios_epi')
        .insert({
          data: exercicio.data,
          hora: exercicio.hora,
          identificacao_local: exercicio.identificacao_local,
          equipe: exercicio.equipe,
          chefe_equipe: exercicio.chefe_equipe,
          tipo_epi: exercicio.tipo_epi,
          status: exercicio.status || 'Concluído',
          observacoes: exercicio.observacoes
        })
        .select()
        .single();
      
      if (exercicioError) throw exercicioError;
      
      // 2. Criar registros dos bombeiros
      if (exercicio.bombeiros.length > 0) {
        const bombeirosData = exercicio.bombeiros.map(bombeiro => ({
          exercicio_id: novoExercicio.id,
          bombeiro_id: bombeiro.bombeiro_id,
          bombeiro_nome: bombeiro.bombeiro_nome,
          bombeiro_funcao: bombeiro.bombeiro_funcao,
          tempo_calca_bota: bombeiro.tempo_calca_bota,
          tempo_tp_completo: bombeiro.tempo_tp_completo,
          tempo_epr_tp_completo: bombeiro.tempo_epr_tp_completo,
          tempo_epr_sem_tp: bombeiro.tempo_epr_sem_tp
        }));
        
        const { error: bombeirosError } = await supabase
          .from('exercicios_epi_bombeiros')
          .insert(bombeirosData);
        
        if (bombeirosError) throw bombeirosError;
      }
      
      return novoExercicio;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercicios-epi'] });
    }
  });
};
*/

/**
 * Hook para atualizar exercício com bombeiros
 * Arquivo: src/hooks/useUpdateExercicioEPI.ts
 */
/*
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UpdateExercicioEPI } from '@/types/exercicioEPI';

interface UpdateExercicioParams {
  id: string;
  updates: UpdateExercicioEPI;
}

export const useUpdateExercicioEPI = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: UpdateExercicioParams) => {
      // 1. Atualizar exercício principal
      const { error: exercicioError } = await supabase
        .from('exercicios_epi')
        .update({
          data: updates.data,
          hora: updates.hora,
          identificacao_local: updates.identificacao_local,
          equipe: updates.equipe,
          chefe_equipe: updates.chefe_equipe,
          tipo_epi: updates.tipo_epi,
          status: updates.status,
          observacoes: updates.observacoes
        })
        .eq('id', id);
      
      if (exercicioError) throw exercicioError;
      
      // 2. Atualizar bombeiros se fornecidos
      if (updates.bombeiros) {
        // Remover bombeiros existentes
        const { error: deleteError } = await supabase
          .from('exercicios_epi_bombeiros')
          .delete()
          .eq('exercicio_id', id);
        
        if (deleteError) throw deleteError;
        
        // Inserir novos bombeiros
        if (updates.bombeiros.length > 0) {
          const bombeirosData = updates.bombeiros.map(bombeiro => ({
            exercicio_id: id,
            bombeiro_id: bombeiro.bombeiro_id,
            bombeiro_nome: bombeiro.bombeiro_nome,
            bombeiro_funcao: bombeiro.bombeiro_funcao,
            tempo_calca_bota: bombeiro.tempo_calca_bota,
            tempo_tp_completo: bombeiro.tempo_tp_completo,
            tempo_epr_tp_completo: bombeiro.tempo_epr_tp_completo,
            tempo_epr_sem_tp: bombeiro.tempo_epr_sem_tp
          }));
          
          const { error: insertError } = await supabase
            .from('exercicios_epi_bombeiros')
            .insert(bombeirosData);
          
          if (insertError) throw insertError;
        }
      }
      
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercicios-epi'] });
    }
  });
};
*/

// =====================================================
// EXEMPLOS DE USO NO MODAL
// =====================================================

/**
 * Exemplo de função handleSave atualizada para o modal
 * Arquivo: src/components/ExercicioEPIModal.tsx
 */
/*
const handleSave = async () => {
  setLoading(true);
  
  try {
    // Converter bombeiros do formato do modal para o formato do banco
    const bombeirosFormatados = formatBombeirosForDatabase(
      bombeiros, 
      bombeirosCadastrados
    );
    
    const exercicioData: CreateExercicioEPI = {
      data,
      hora,
      identificacao_local: identificacaoLocal,
      equipe,
      chefe_equipe: chefeEquipe,
      tipo_epi: "EPI", // ou "EPR" baseado na seleção
      status: "Concluído",
      observacoes,
      bombeiros: bombeirosFormatados
    };

    if (exercicioParaEdicao) {
      // Atualizar exercício existente
      await updateExercicio({
        id: exercicioParaEdicao.id,
        updates: exercicioData
      });
    } else {
      // Criar novo exercício
      await createExercicio(exercicioData);
    }
    
    toast({
      title: exercicioParaEdicao ? "Exercício atualizado" : "Exercício criado",
      description: "Dados salvos com sucesso.",
    });
    
    onOpenChange(false);
  } catch (error) {
    console.error('Erro ao salvar exercício:', error);
    toast({
      title: "Erro",
      description: "Erro ao salvar exercício.",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};
*/

// =====================================================
// VALIDAÇÕES
// =====================================================

/**
 * Valida dados do exercício antes do salvamento
 */
export const validateExercicioEPI = (exercicio: CreateExercicioEPI): string[] => {
  const errors: string[] = [];
  
  if (!exercicio.data) {
    errors.push('Data é obrigatória');
  }
  
  if (!exercicio.equipe) {
    errors.push('Equipe é obrigatória');
  }
  
  if (!exercicio.chefe_equipe) {
    errors.push('Chefe de equipe é obrigatório');
  }
  
  if (!exercicio.tipo_epi) {
    errors.push('Tipo de EPI é obrigatório');
  }
  
  if (exercicio.bombeiros.length === 0) {
    errors.push('Pelo menos um bombeiro deve ser adicionado');
  }
  
  // Validar bombeiros
  exercicio.bombeiros.forEach((bombeiro, index) => {
    if (!bombeiro.bombeiro_nome) {
      errors.push(`Nome do bombeiro ${index + 1} é obrigatório`);
    }
    
    if (!bombeiro.bombeiro_funcao) {
      errors.push(`Função do bombeiro ${index + 1} é obrigatória`);
    }
  });
  
  return errors;
};

/**
 * Calcula estatísticas do exercício
 */
export const calculateExercicioStats = (bombeiros: ExercicioEPIBombeiro[]) => {
  if (bombeiros.length === 0) {
    return {
      tempoMedioCalcaBota: 0,
      tempoMedioTPCompleto: 0,
      tempoMedioEPRTPCompleto: 0,
      tempoMedioEPRSemTP: 0,
      totalBombeiros: 0
    };
  }
  
  const totals = bombeiros.reduce(
    (acc, bombeiro) => ({
      calcaBota: acc.calcaBota + (bombeiro.tempo_calca_bota || 0),
      tpCompleto: acc.tpCompleto + (bombeiro.tempo_tp_completo || 0),
      eprTpCompleto: acc.eprTpCompleto + (bombeiro.tempo_epr_tp_completo || 0),
      eprSemTp: acc.eprSemTp + (bombeiro.tempo_epr_sem_tp || 0)
    }),
    { calcaBota: 0, tpCompleto: 0, eprTpCompleto: 0, eprSemTp: 0 }
  );
  
  const count = bombeiros.length;
  
  return {
    tempoMedioCalcaBota: Math.round(totals.calcaBota / count),
    tempoMedioTPCompleto: Math.round(totals.tpCompleto / count),
    tempoMedioEPRTPCompleto: Math.round(totals.eprTpCompleto / count),
    tempoMedioEPRSemTP: Math.round(totals.eprSemTp / count),
    totalBombeiros: count
  };
};