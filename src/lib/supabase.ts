import { createClient } from '@supabase/supabase-js';

// Read Supabase credentials from Vite env vars
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) ?? '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

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