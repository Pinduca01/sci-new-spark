// Estrutura individual (cada registro representa um bombeiro)
export interface ExercicioEPIIndividual {
  id: string;
  exercicio_grupo_id: string; // Agrupa bombeiros do mesmo exercício
  data: string;
  hora?: string;
  identificacao_local?: string;
  equipe: 'Alfa' | 'Bravo' | 'Charlie' | 'Delta';
  chefe_equipe: string;
  tipo_epi: 'EPI' | 'EPR';
  status: 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado';
  observacoes?: string;
  // Dados do bombeiro
  bombeiro_id?: string;
  bombeiro_nome: string;
  bombeiro_funcao: string;
  tempo_calca_bota?: number;
  tempo_tp_completo?: number;
  tempo_epr_tp_completo?: number;
  tempo_epr_sem_tp?: number;
  created_at: string;
  updated_at: string;
}

// Interface agrupada para visualização
export interface ExercicioEPIAgrupado {
  exercicio_grupo_id: string;
  data: string;
  hora?: string;
  identificacao_local?: string;
  equipe: 'Alfa' | 'Bravo' | 'Charlie' | 'Delta';
  chefe_equipe: string;
  tipo_epi: 'EPI' | 'EPR';
  status: 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado';
  observacoes?: string;
  bombeiros: {
    id: string;
    bombeiro_id?: string;
    bombeiro_nome: string;
    bombeiro_funcao: string;
    tempo_calca_bota?: number;
    tempo_tp_completo?: number;
    tempo_epr_tp_completo?: number;
    tempo_epr_sem_tp?: number;
  }[];
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
  bombeiros: {
    bombeiro_id?: string;
    bombeiro_nome: string;
    bombeiro_funcao: string;
    tempo_calca_bota?: number;
    tempo_tp_completo?: number;
    tempo_epr_tp_completo?: number;
    tempo_epr_sem_tp?: number;
  }[];
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
  bombeiros?: {
    bombeiro_id?: string;
    bombeiro_nome: string;
    bombeiro_funcao: string;
    tempo_calca_bota?: number;
    tempo_tp_completo?: number;
    tempo_epr_tp_completo?: number;
    tempo_epr_sem_tp?: number;
  }[];
}

// Manter compatibilidade com código existente (deprecated)
export interface ExercicioEPI extends ExercicioEPIAgrupado {}

// Funções utilitárias para conversão de tempo
export const timeToSeconds = (timeString: string): number => {
  if (!timeString || timeString === '00:00') return 0;
  const [minutes, seconds] = timeString.split(':').map(Number);
  return (minutes * 60) + seconds;
};

export const secondsToTime = (seconds?: number): string => {
  if (!seconds || seconds === 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};