export interface ChecklistAgente {
  id: string;
  agente_id: string;
  data_checklist: string;
  responsavel: string;
  integridade_embalagem: boolean;
  validade_verificada: boolean;
  quantidade_conferida: boolean;
  conforme: boolean;
  observacoes?: string;
  usuario_id: string;
  created_at: string;
}