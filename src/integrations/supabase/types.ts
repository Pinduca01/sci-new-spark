export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      bombeiros: {
        Row: {
          avatar: string
          created_at: string
          cve: string | null
          data_admissao: string
          data_aso: string | null
          data_curso_habilitacao: string | null
          data_vencimento_credenciamento: string | null
          data_vencimento_cve: string | null
          disponivel_para_substituicao: boolean | null
          documentos_certificados: string[] | null
          eh_ferista: boolean | null
          email: string
          equipe: string | null
          equipe_id: string | null
          ferista: boolean | null
          funcao: string
          funcao_completa: string
          id: string
          matricula: string | null
          nome: string
          proxima_atualizacao: string | null
          status: string
          telefone: string
          telefone_sos: string | null
          turno: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar: string
          created_at?: string
          cve?: string | null
          data_admissao: string
          data_aso?: string | null
          data_curso_habilitacao?: string | null
          data_vencimento_credenciamento?: string | null
          data_vencimento_cve?: string | null
          disponivel_para_substituicao?: boolean | null
          documentos_certificados?: string[] | null
          eh_ferista?: boolean | null
          email: string
          equipe?: string | null
          equipe_id?: string | null
          ferista?: boolean | null
          funcao: string
          funcao_completa: string
          id?: string
          matricula?: string | null
          nome: string
          proxima_atualizacao?: string | null
          status?: string
          telefone: string
          telefone_sos?: string | null
          turno: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar?: string
          created_at?: string
          cve?: string | null
          data_admissao?: string
          data_aso?: string | null
          data_curso_habilitacao?: string | null
          data_vencimento_credenciamento?: string | null
          data_vencimento_cve?: string | null
          disponivel_para_substituicao?: boolean | null
          documentos_certificados?: string[] | null
          eh_ferista?: boolean | null
          email?: string
          equipe?: string | null
          equipe_id?: string | null
          ferista?: boolean | null
          funcao?: string
          funcao_completa?: string
          id?: string
          matricula?: string | null
          nome?: string
          proxima_atualizacao?: string | null
          status?: string
          telefone?: string
          telefone_sos?: string | null
          turno?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bombeiros_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
        ]
      }
      checklists_viaturas: {
        Row: {
          bombeiro_responsavel: string
          created_at: string
          data_checklist: string
          hora_checklist: string
          id: string
          itens_checklist: Json
          observacoes_gerais: string | null
          status_geral: string
          tipo_checklist: string
          updated_at: string
          viatura_id: string
        }
        Insert: {
          bombeiro_responsavel: string
          created_at?: string
          data_checklist?: string
          hora_checklist?: string
          id?: string
          itens_checklist?: Json
          observacoes_gerais?: string | null
          status_geral?: string
          tipo_checklist: string
          updated_at?: string
          viatura_id: string
        }
        Update: {
          bombeiro_responsavel?: string
          created_at?: string
          data_checklist?: string
          hora_checklist?: string
          id?: string
          itens_checklist?: Json
          observacoes_gerais?: string | null
          status_geral?: string
          tipo_checklist?: string
          updated_at?: string
          viatura_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklists_viaturas_viatura_id_fkey"
            columns: ["viatura_id"]
            isOneToOne: false
            referencedRelation: "viaturas"
            referencedColumns: ["id"]
          },
        ]
      }
      equipes: {
        Row: {
          ativa: boolean
          cor_identificacao: string
          created_at: string
          id: string
          nome_equipe: string
          updated_at: string
        }
        Insert: {
          ativa?: boolean
          cor_identificacao: string
          created_at?: string
          id?: string
          nome_equipe: string
          updated_at?: string
        }
        Update: {
          ativa?: boolean
          cor_identificacao?: string
          created_at?: string
          id?: string
          nome_equipe?: string
          updated_at?: string
        }
        Relationships: []
      }
      escalas_geradas: {
        Row: {
          ano_referencia: number
          created_at: string
          data: string
          equipe_id: string
          id: string
          mes_referencia: number
          regime_plantao: string
          updated_at: string
        }
        Insert: {
          ano_referencia: number
          created_at?: string
          data: string
          equipe_id: string
          id?: string
          mes_referencia: number
          regime_plantao: string
          updated_at?: string
        }
        Update: {
          ano_referencia?: number
          created_at?: string
          data?: string
          equipe_id?: string
          id?: string
          mes_referencia?: number
          regime_plantao?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escalas_geradas_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
        ]
      }
      feristas_escalas: {
        Row: {
          ano_referencia: number
          bombeiro_ferista_id: string
          bombeiro_substituido_id: string
          created_at: string
          equipe_anterior_id: string | null
          equipe_atual_id: string
          id: string
          mes_referencia: number
          periodo_descanso_ate: string | null
          updated_at: string
        }
        Insert: {
          ano_referencia: number
          bombeiro_ferista_id: string
          bombeiro_substituido_id: string
          created_at?: string
          equipe_anterior_id?: string | null
          equipe_atual_id: string
          id?: string
          mes_referencia: number
          periodo_descanso_ate?: string | null
          updated_at?: string
        }
        Update: {
          ano_referencia?: number
          bombeiro_ferista_id?: string
          bombeiro_substituido_id?: string
          created_at?: string
          equipe_anterior_id?: string | null
          equipe_atual_id?: string
          id?: string
          mes_referencia?: number
          periodo_descanso_ate?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feristas_escalas_bombeiro_ferista_id_fkey"
            columns: ["bombeiro_ferista_id"]
            isOneToOne: false
            referencedRelation: "bombeiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feristas_escalas_bombeiro_substituido_id_fkey"
            columns: ["bombeiro_substituido_id"]
            isOneToOne: false
            referencedRelation: "bombeiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feristas_escalas_equipe_anterior_id_fkey"
            columns: ["equipe_anterior_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feristas_escalas_equipe_atual_id_fkey"
            columns: ["equipe_atual_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
        ]
      }
      ocorrencias: {
        Row: {
          bombeiros_envolvidos: string[] | null
          created_at: string
          data_ocorrencia: string
          descricao_detalhada: string | null
          descricao_inicial: string | null
          equipamentos: string | null
          equipe: string
          hora_acionamento: string
          hora_chegada_local: string | null
          hora_termino: string | null
          id: string
          latitude: number | null
          local_mapa_grade: string | null
          longitude: number | null
          quantidade_bombeiros: number | null
          quantidade_obitos: number | null
          quantidade_vitimas: number | null
          status: string | null
          tempo_gasto_minutos: number | null
          tipo_ocorrencia: string
          updated_at: string
          user_id: string
          viaturas: string | null
        }
        Insert: {
          bombeiros_envolvidos?: string[] | null
          created_at?: string
          data_ocorrencia: string
          descricao_detalhada?: string | null
          descricao_inicial?: string | null
          equipamentos?: string | null
          equipe: string
          hora_acionamento: string
          hora_chegada_local?: string | null
          hora_termino?: string | null
          id?: string
          latitude?: number | null
          local_mapa_grade?: string | null
          longitude?: number | null
          quantidade_bombeiros?: number | null
          quantidade_obitos?: number | null
          quantidade_vitimas?: number | null
          status?: string | null
          tempo_gasto_minutos?: number | null
          tipo_ocorrencia: string
          updated_at?: string
          user_id: string
          viaturas?: string | null
        }
        Update: {
          bombeiros_envolvidos?: string[] | null
          created_at?: string
          data_ocorrencia?: string
          descricao_detalhada?: string | null
          descricao_inicial?: string | null
          equipamentos?: string | null
          equipe?: string
          hora_acionamento?: string
          hora_chegada_local?: string | null
          hora_termino?: string | null
          id?: string
          latitude?: number | null
          local_mapa_grade?: string | null
          longitude?: number | null
          quantidade_bombeiros?: number | null
          quantidade_obitos?: number | null
          quantidade_vitimas?: number | null
          status?: string | null
          tempo_gasto_minutos?: number | null
          tipo_ocorrencia?: string
          updated_at?: string
          user_id?: string
          viaturas?: string | null
        }
        Relationships: []
      }
      ordens_servico: {
        Row: {
          bombeiro_solicitante: string
          created_at: string
          custo_total: number | null
          data_abertura: string
          data_conclusao: string | null
          descricao_problema: string
          id: string
          materiais_utilizados: string | null
          numero_os: string
          observacoes: string | null
          prioridade: string
          responsavel_manutencao: string | null
          status: string
          tipo_servico: string
          updated_at: string
          viatura_id: string
        }
        Insert: {
          bombeiro_solicitante: string
          created_at?: string
          custo_total?: number | null
          data_abertura?: string
          data_conclusao?: string | null
          descricao_problema: string
          id?: string
          materiais_utilizados?: string | null
          numero_os: string
          observacoes?: string | null
          prioridade?: string
          responsavel_manutencao?: string | null
          status?: string
          tipo_servico: string
          updated_at?: string
          viatura_id: string
        }
        Update: {
          bombeiro_solicitante?: string
          created_at?: string
          custo_total?: number | null
          data_abertura?: string
          data_conclusao?: string | null
          descricao_problema?: string
          id?: string
          materiais_utilizados?: string | null
          numero_os?: string
          observacoes?: string | null
          prioridade?: string
          responsavel_manutencao?: string | null
          status?: string
          tipo_servico?: string
          updated_at?: string
          viatura_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ordens_servico_viatura_id_fkey"
            columns: ["viatura_id"]
            isOneToOne: false
            referencedRelation: "viaturas"
            referencedColumns: ["id"]
          },
        ]
      }
      periodos_ferias: {
        Row: {
          ano_referencia: number
          bombeiro_id: string
          created_at: string
          data_fim: string
          data_inicio: string
          id: string
          mes_referencia: number
          updated_at: string
        }
        Insert: {
          ano_referencia: number
          bombeiro_id: string
          created_at?: string
          data_fim: string
          data_inicio: string
          id?: string
          mes_referencia: number
          updated_at?: string
        }
        Update: {
          ano_referencia?: number
          bombeiro_id?: string
          created_at?: string
          data_fim?: string
          data_inicio?: string
          id?: string
          mes_referencia?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "periodos_ferias_bombeiro_id_fkey"
            columns: ["bombeiro_id"]
            isOneToOne: false
            referencedRelation: "bombeiros"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      viaturas: {
        Row: {
          ano: number
          created_at: string
          data_ultima_revisao: string | null
          id: string
          km_atual: number | null
          modelo: string
          observacoes: string | null
          placa: string
          prefixo: string
          proxima_revisao: string | null
          status: string
          tipo: string
          updated_at: string
        }
        Insert: {
          ano: number
          created_at?: string
          data_ultima_revisao?: string | null
          id?: string
          km_atual?: number | null
          modelo: string
          observacoes?: string | null
          placa: string
          prefixo: string
          proxima_revisao?: string | null
          status?: string
          tipo?: string
          updated_at?: string
        }
        Update: {
          ano?: number
          created_at?: string
          data_ultima_revisao?: string | null
          id?: string
          km_atual?: number | null
          modelo?: string
          observacoes?: string | null
          placa?: string
          prefixo?: string
          proxima_revisao?: string | null
          status?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      nextval: {
        Args: { sequence_name: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
