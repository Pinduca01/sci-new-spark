export interface ChecklistAgente {
  id: string;
  agente_id: string;
  data_checklist: string;
  conforme: boolean;
  observacoes?: string;
  usuario_id: string;
  created_at: string;
}