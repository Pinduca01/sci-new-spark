import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rfgmqogwhlnfrhifsbbg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZ21xb2d3aGxuZnJoaWZzYmJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMTExOTIsImV4cCI6MjA3MDY4NzE5Mn0.LHBul7ZS-hRmOoeVtY5wJkdBsfWtGnRhp48tZRHTNR4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para as tabelas do banco
export interface AgenteExtintor {
  id: string;
  tipo: 'LGE' | 'PO_QUIMICO' | 'NITROGENIO';
  codigo: string;
  localizacao: string;
  unidade: string;
  quantidade_atual: number;
  quantidade_minima: number;
  data_validade: string;
  data_ultima_recarga: string;
  status: 'ATIVO' | 'INATIVO' | 'MANUTENCAO';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface Movimentacao {
  id: string;
  agente_id: string;
  tipo_movimentacao: 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA' | 'RECARGA';
  quantidade: number;
  data_movimentacao: string;
  responsavel: string;
  destino?: string;
  observacoes?: string;
  created_at: string;
}

export interface ChecklistAgente {
  id: string;
  agente_id: string;
  data_checklist: string;
  responsavel: string;
  pressao_ok: boolean;
  valvula_ok: boolean;
  mangueira_ok: boolean;
  gatilho_ok: boolean;
  manometro_ok: boolean;
  lacre_ok: boolean;
  sinalizacao_ok: boolean;
  acesso_ok: boolean;
  observacoes?: string;
  status_geral: 'APROVADO' | 'REPROVADO' | 'ATENCAO';
  created_at: string;
}