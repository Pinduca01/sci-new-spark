export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      agentes_extintores: {
        Row: {
          created_at: string | null
          data_fabricacao: string
          data_modificacao: string | null
          data_teste_hidrostatico: string | null
          data_validade: string | null
          fabricante: string
          id: string
          lote: string | null
          proximo_teste_hidrostatico: string | null
          quantidade: number
          situacao: string
          tipo: string
          unidade: string
          updated_at: string | null
          validade_ensaio: string | null
        }
        Insert: {
          created_at?: string | null
          data_fabricacao: string
          data_modificacao?: string | null
          data_teste_hidrostatico?: string | null
          data_validade?: string | null
          fabricante: string
          id?: string
          lote?: string | null
          proximo_teste_hidrostatico?: string | null
          quantidade?: number
          situacao: string
          tipo: string
          unidade: string
          updated_at?: string | null
          validade_ensaio?: string | null
        }
        Update: {
          created_at?: string | null
          data_fabricacao?: string
          data_modificacao?: string | null
          data_teste_hidrostatico?: string | null
          data_validade?: string | null
          fabricante?: string
          id?: string
          lote?: string | null
          proximo_teste_hidrostatico?: string | null
          quantidade?: number
          situacao?: string
          tipo?: string
          unidade?: string
          updated_at?: string | null
          validade_ensaio?: string | null
        }
        Relationships: []
      }
      agentes_extintores_controle: {
        Row: {
          capacidade: number
          created_at: string
          custo_unitario: number | null
          data_fabricacao: string
          data_ultima_recarga: string | null
          data_vencimento: string
          fornecedor: string | null
          id: string
          localizacao_fisica: string | null
          lote: string
          material_id: string
          numero_recargas: number | null
          numero_serie: string | null
          observacoes: string | null
          proxima_recarga: string | null
          qr_code: string | null
          status_uso: string
          tipo_agente: string
          unidade_capacidade: string
          updated_at: string
          viatura_id: string | null
        }
        Insert: {
          capacidade: number
          created_at?: string
          custo_unitario?: number | null
          data_fabricacao: string
          data_ultima_recarga?: string | null
          data_vencimento: string
          fornecedor?: string | null
          id?: string
          localizacao_fisica?: string | null
          lote: string
          material_id: string
          numero_recargas?: number | null
          numero_serie?: string | null
          observacoes?: string | null
          proxima_recarga?: string | null
          qr_code?: string | null
          status_uso?: string
          tipo_agente: string
          unidade_capacidade?: string
          updated_at?: string
          viatura_id?: string | null
        }
        Update: {
          capacidade?: number
          created_at?: string
          custo_unitario?: number | null
          data_fabricacao?: string
          data_ultima_recarga?: string | null
          data_vencimento?: string
          fornecedor?: string | null
          id?: string
          localizacao_fisica?: string | null
          lote?: string
          material_id?: string
          numero_recargas?: number | null
          numero_serie?: string | null
          observacoes?: string | null
          proxima_recarga?: string | null
          qr_code?: string | null
          status_uso?: string
          tipo_agente?: string
          unidade_capacidade?: string
          updated_at?: string
          viatura_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agentes_extintores_controle_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais"
            referencedColumns: ["id"]
          },
        ]
      }
      bases: {
        Row: {
          ativa: boolean | null
          created_at: string | null
          endereco: string
          id: string
          nome: string
          telefone: string | null
          turno_config: string
          updated_at: string | null
        }
        Insert: {
          ativa?: boolean | null
          created_at?: string | null
          endereco: string
          id?: string
          nome: string
          telefone?: string | null
          turno_config?: string
          updated_at?: string | null
        }
        Update: {
          ativa?: boolean | null
          created_at?: string | null
          endereco?: string
          id?: string
          nome?: string
          telefone?: string | null
          turno_config?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bombeiros: {
        Row: {
          ativo: boolean | null
          avatar: string
          base_id: string
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
          push_token: string | null
          status: string
          telefone: string
          telefone_sos: string | null
          turno: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          avatar: string
          base_id: string
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
          push_token?: string | null
          status?: string
          telefone: string
          telefone_sos?: string | null
          turno: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          avatar?: string
          base_id?: string
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
          push_token?: string | null
          status?: string
          telefone?: string
          telefone_sos?: string | null
          turno?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bombeiros_base_id_fkey"
            columns: ["base_id"]
            isOneToOne: false
            referencedRelation: "bases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bombeiros_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_agentes: {
        Row: {
          agente_id: string
          conforme: boolean
          created_at: string | null
          data_checklist: string
          id: string
          observacoes: string | null
          usuario_id: string
        }
        Insert: {
          agente_id: string
          conforme?: boolean
          created_at?: string | null
          data_checklist: string
          id?: string
          observacoes?: string | null
          usuario_id: string
        }
        Update: {
          agente_id?: string
          conforme?: boolean
          created_at?: string | null
          data_checklist?: string
          id?: string
          observacoes?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_agentes_agente_id_fkey"
            columns: ["agente_id"]
            isOneToOne: false
            referencedRelation: "agentes_extintores"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          checklist_id: string
          created_at: string | null
          foto_url: string | null
          id: string
          observacoes: string | null
          status: string | null
          template_item_id: string
          updated_at: string | null
          verificado_em: string | null
        }
        Insert: {
          checklist_id: string
          created_at?: string | null
          foto_url?: string | null
          id?: string
          observacoes?: string | null
          status?: string | null
          template_item_id: string
          updated_at?: string | null
          verificado_em?: string | null
        }
        Update: {
          checklist_id?: string
          created_at?: string | null
          foto_url?: string | null
          id?: string
          observacoes?: string | null
          status?: string | null
          template_item_id?: string
          updated_at?: string | null
          verificado_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_template_item_id_fkey"
            columns: ["template_item_id"]
            isOneToOne: false
            referencedRelation: "template_checklist"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_templates: {
        Row: {
          ativo: boolean
          categoria: string
          created_at: string
          id: string
          itens: Json
          nome: string
          tipo_viatura: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          categoria?: string
          created_at?: string
          id?: string
          itens?: Json
          nome: string
          tipo_viatura: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          categoria?: string
          created_at?: string
          id?: string
          itens?: Json
          nome?: string
          tipo_viatura?: string
          updated_at?: string
        }
        Relationships: []
      }
      checklist_timeline: {
        Row: {
          checklist_id: string
          checklist_tipo: string
          created_at: string
          dados_alterados: Json | null
          descricao: string | null
          id: string
          operacao: string
          usuario_id: string | null
          usuario_nome: string
          usuario_role: string | null
        }
        Insert: {
          checklist_id: string
          checklist_tipo: string
          created_at?: string
          dados_alterados?: Json | null
          descricao?: string | null
          id?: string
          operacao: string
          usuario_id?: string | null
          usuario_nome: string
          usuario_role?: string | null
        }
        Update: {
          checklist_id?: string
          checklist_tipo?: string
          created_at?: string
          dados_alterados?: Json | null
          descricao?: string | null
          id?: string
          operacao?: string
          usuario_id?: string | null
          usuario_nome?: string
          usuario_role?: string | null
        }
        Relationships: []
      }
      checklists: {
        Row: {
          base_id: string
          created_at: string | null
          data_conclusao: string | null
          data_inicio: string | null
          funcionario_id: string
          id: string
          km_final: number | null
          km_inicial: number | null
          observacoes: string | null
          status: string | null
          tipo_checklist_id: string
          turno: string | null
          updated_at: string | null
          viatura_id: string | null
        }
        Insert: {
          base_id: string
          created_at?: string | null
          data_conclusao?: string | null
          data_inicio?: string | null
          funcionario_id: string
          id?: string
          km_final?: number | null
          km_inicial?: number | null
          observacoes?: string | null
          status?: string | null
          tipo_checklist_id: string
          turno?: string | null
          updated_at?: string | null
          viatura_id?: string | null
        }
        Update: {
          base_id?: string
          created_at?: string | null
          data_conclusao?: string | null
          data_inicio?: string | null
          funcionario_id?: string
          id?: string
          km_final?: number | null
          km_inicial?: number | null
          observacoes?: string | null
          status?: string | null
          tipo_checklist_id?: string
          turno?: string | null
          updated_at?: string | null
          viatura_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklists_base_id_fkey"
            columns: ["base_id"]
            isOneToOne: false
            referencedRelation: "bases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklists_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklists_tipo_checklist_id_fkey"
            columns: ["tipo_checklist_id"]
            isOneToOne: false
            referencedRelation: "tipos_checklist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklists_viatura_id_fkey"
            columns: ["viatura_id"]
            isOneToOne: false
            referencedRelation: "viaturas"
            referencedColumns: ["id"]
          },
        ]
      }
      checklists_almoxarifado: {
        Row: {
          assinatura_digital: string | null
          bombeiro_responsavel_id: string
          bombeiro_responsavel_nome: string
          created_at: string
          data_checklist: string
          hora_checklist: string
          id: string
          itens_checklist: Json
          itens_conformes: number | null
          itens_divergentes: number | null
          observacoes_gerais: string | null
          status_geral: string
          total_itens: number | null
          updated_at: string
        }
        Insert: {
          assinatura_digital?: string | null
          bombeiro_responsavel_id: string
          bombeiro_responsavel_nome: string
          created_at?: string
          data_checklist?: string
          hora_checklist?: string
          id?: string
          itens_checklist?: Json
          itens_conformes?: number | null
          itens_divergentes?: number | null
          observacoes_gerais?: string | null
          status_geral?: string
          total_itens?: number | null
          updated_at?: string
        }
        Update: {
          assinatura_digital?: string | null
          bombeiro_responsavel_id?: string
          bombeiro_responsavel_nome?: string
          created_at?: string
          data_checklist?: string
          hora_checklist?: string
          id?: string
          itens_checklist?: Json
          itens_conformes?: number | null
          itens_divergentes?: number | null
          observacoes_gerais?: string | null
          status_geral?: string
          total_itens?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      checklists_viaturas: {
        Row: {
          bombeiro_responsavel: string
          created_at: string
          data_checklist: string
          equipe: string | null
          hora_checklist: string
          id: string
          itens_checklist: Json
          observacoes_gerais: string | null
          status_geral: string
          timestamp_conclusao: string | null
          tipo_checklist: string
          updated_at: string
          viatura_id: string
        }
        Insert: {
          bombeiro_responsavel: string
          created_at?: string
          data_checklist?: string
          equipe?: string | null
          hora_checklist?: string
          id?: string
          itens_checklist?: Json
          observacoes_gerais?: string | null
          status_geral?: string
          timestamp_conclusao?: string | null
          tipo_checklist: string
          updated_at?: string
          viatura_id: string
        }
        Update: {
          bombeiro_responsavel?: string
          created_at?: string
          data_checklist?: string
          equipe?: string | null
          hora_checklist?: string
          id?: string
          itens_checklist?: Json
          observacoes_gerais?: string | null
          status_geral?: string
          timestamp_conclusao?: string | null
          tipo_checklist?: string
          updated_at?: string
          viatura_id?: string
        }
        Relationships: []
      }
      document_templates: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          type: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          type: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          type?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: []
      }
      epis_uniformes_distribuicao: {
        Row: {
          ano_referencia: number
          bombeiro_id: string | null
          bombeiro_nome: string
          created_at: string | null
          data_entrega: string | null
          equipe_id: string | null
          id: string
          item_descricao: string
          mes_referencia: number
          observacoes: string | null
          quantidade_entregue: number
          quantidade_prevista: number
          responsavel_entrega_id: string | null
          responsavel_entrega_nome: string | null
          tipo_item: string
          updated_at: string | null
        }
        Insert: {
          ano_referencia: number
          bombeiro_id?: string | null
          bombeiro_nome: string
          created_at?: string | null
          data_entrega?: string | null
          equipe_id?: string | null
          id?: string
          item_descricao: string
          mes_referencia: number
          observacoes?: string | null
          quantidade_entregue?: number
          quantidade_prevista?: number
          responsavel_entrega_id?: string | null
          responsavel_entrega_nome?: string | null
          tipo_item: string
          updated_at?: string | null
        }
        Update: {
          ano_referencia?: number
          bombeiro_id?: string | null
          bombeiro_nome?: string
          created_at?: string | null
          data_entrega?: string | null
          equipe_id?: string | null
          id?: string
          item_descricao?: string
          mes_referencia?: number
          observacoes?: string | null
          quantidade_entregue?: number
          quantidade_prevista?: number
          responsavel_entrega_id?: string | null
          responsavel_entrega_nome?: string | null
          tipo_item?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "epis_uniformes_distribuicao_bombeiro_id_fkey"
            columns: ["bombeiro_id"]
            isOneToOne: false
            referencedRelation: "bombeiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "epis_uniformes_distribuicao_bombeiro_id_fkey"
            columns: ["bombeiro_id"]
            isOneToOne: false
            referencedRelation: "bombeiros_publico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "epis_uniformes_distribuicao_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "epis_uniformes_distribuicao_responsavel_entrega_id_fkey"
            columns: ["responsavel_entrega_id"]
            isOneToOne: false
            referencedRelation: "bombeiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "epis_uniformes_distribuicao_responsavel_entrega_id_fkey"
            columns: ["responsavel_entrega_id"]
            isOneToOne: false
            referencedRelation: "bombeiros_publico"
            referencedColumns: ["id"]
          },
        ]
      }
      equipamentos_estoque: {
        Row: {
          codigo_equipamento: string
          created_at: string
          data_aquisicao: string | null
          data_instalacao: string | null
          fornecedor: string | null
          fotos: Json | null
          garantia_ate: string | null
          id: string
          localizacao_fisica: string | null
          material_id: string
          numero_serie: string | null
          observacoes: string | null
          proxima_manutencao: string | null
          qr_code: string | null
          responsavel_id: string | null
          status: string
          ultima_manutencao: string | null
          updated_at: string
          valor_aquisicao: number | null
          viatura_id: string | null
        }
        Insert: {
          codigo_equipamento: string
          created_at?: string
          data_aquisicao?: string | null
          data_instalacao?: string | null
          fornecedor?: string | null
          fotos?: Json | null
          garantia_ate?: string | null
          id?: string
          localizacao_fisica?: string | null
          material_id: string
          numero_serie?: string | null
          observacoes?: string | null
          proxima_manutencao?: string | null
          qr_code?: string | null
          responsavel_id?: string | null
          status?: string
          ultima_manutencao?: string | null
          updated_at?: string
          valor_aquisicao?: number | null
          viatura_id?: string | null
        }
        Update: {
          codigo_equipamento?: string
          created_at?: string
          data_aquisicao?: string | null
          data_instalacao?: string | null
          fornecedor?: string | null
          fotos?: Json | null
          garantia_ate?: string | null
          id?: string
          localizacao_fisica?: string | null
          material_id?: string
          numero_serie?: string | null
          observacoes?: string | null
          proxima_manutencao?: string | null
          qr_code?: string | null
          responsavel_id?: string | null
          status?: string
          ultima_manutencao?: string | null
          updated_at?: string
          valor_aquisicao?: number | null
          viatura_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipamentos_estoque_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais"
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
          observacoes: string | null
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
          observacoes?: string | null
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
          observacoes?: string | null
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
      estoque_almoxarifado: {
        Row: {
          created_at: string
          data_fabricacao: string | null
          data_validade: string | null
          id: string
          localizacao_fisica: string | null
          lote: string | null
          material_id: string
          observacoes: string | null
          quantidade_disponivel: number
          quantidade_minima: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_fabricacao?: string | null
          data_validade?: string | null
          id?: string
          localizacao_fisica?: string | null
          lote?: string | null
          material_id: string
          observacoes?: string | null
          quantidade_disponivel?: number
          quantidade_minima?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_fabricacao?: string | null
          data_validade?: string | null
          id?: string
          localizacao_fisica?: string | null
          lote?: string | null
          material_id?: string
          observacoes?: string | null
          quantidade_disponivel?: number
          quantidade_minima?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estoque_almoxarifado_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais"
            referencedColumns: ["id"]
          },
        ]
      }
      exercicios_epi: {
        Row: {
          bombeiro_funcao: string
          bombeiro_id: string | null
          bombeiro_nome: string
          chefe_equipe: string | null
          created_at: string | null
          data: string
          equipe: string
          exercicio_grupo_id: string | null
          hora: string | null
          id: string
          identificacao_local: string | null
          observacoes: string | null
          status: string
          tempo_calca_bota: number | null
          tempo_epr_sem_tp: number | null
          tempo_epr_tp_completo: number | null
          tempo_tp_completo: number | null
          tipo_epi: string
          updated_at: string | null
        }
        Insert: {
          bombeiro_funcao: string
          bombeiro_id?: string | null
          bombeiro_nome: string
          chefe_equipe?: string | null
          created_at?: string | null
          data: string
          equipe: string
          exercicio_grupo_id?: string | null
          hora?: string | null
          id?: string
          identificacao_local?: string | null
          observacoes?: string | null
          status?: string
          tempo_calca_bota?: number | null
          tempo_epr_sem_tp?: number | null
          tempo_epr_tp_completo?: number | null
          tempo_tp_completo?: number | null
          tipo_epi: string
          updated_at?: string | null
        }
        Update: {
          bombeiro_funcao?: string
          bombeiro_id?: string | null
          bombeiro_nome?: string
          chefe_equipe?: string | null
          created_at?: string | null
          data?: string
          equipe?: string
          exercicio_grupo_id?: string | null
          hora?: string | null
          id?: string
          identificacao_local?: string | null
          observacoes?: string | null
          status?: string
          tempo_calca_bota?: number | null
          tempo_epr_sem_tp?: number | null
          tempo_epr_tp_completo?: number | null
          tempo_tp_completo?: number | null
          tipo_epi?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      exercicios_epi_backup: {
        Row: {
          bombeiros: string[] | null
          chefe_equipe: string | null
          created_at: string | null
          data: string | null
          equipe: string | null
          id: string | null
          observacoes: string | null
          status: string | null
          tempo_vestimento: number | null
          tipo_epi: string | null
          updated_at: string | null
        }
        Insert: {
          bombeiros?: string[] | null
          chefe_equipe?: string | null
          created_at?: string | null
          data?: string | null
          equipe?: string | null
          id?: string | null
          observacoes?: string | null
          status?: string | null
          tempo_vestimento?: number | null
          tipo_epi?: string | null
          updated_at?: string | null
        }
        Update: {
          bombeiros?: string[] | null
          chefe_equipe?: string | null
          created_at?: string | null
          data?: string | null
          equipe?: string | null
          id?: string | null
          observacoes?: string | null
          status?: string | null
          tempo_vestimento?: number | null
          tipo_epi?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      extintores_aeroporto: {
        Row: {
          capacidade: number
          codigo_extintor: string
          created_at: string
          data_fabricacao: string | null
          data_instalacao: string
          fabricante: string | null
          id: string
          localizacao_detalhada: string
          observacoes: string | null
          proxima_recarga: string | null
          proximo_teste_hidrostatico: string | null
          qr_code: string | null
          quadrante_id: string
          status: string
          tipo_extintor: string
          ultima_recarga: string | null
          ultimo_teste_hidrostatico: string | null
          unidade_capacidade: string
          updated_at: string
        }
        Insert: {
          capacidade: number
          codigo_extintor: string
          created_at?: string
          data_fabricacao?: string | null
          data_instalacao: string
          fabricante?: string | null
          id?: string
          localizacao_detalhada: string
          observacoes?: string | null
          proxima_recarga?: string | null
          proximo_teste_hidrostatico?: string | null
          qr_code?: string | null
          quadrante_id: string
          status?: string
          tipo_extintor: string
          ultima_recarga?: string | null
          ultimo_teste_hidrostatico?: string | null
          unidade_capacidade?: string
          updated_at?: string
        }
        Update: {
          capacidade?: number
          codigo_extintor?: string
          created_at?: string
          data_fabricacao?: string | null
          data_instalacao?: string
          fabricante?: string | null
          id?: string
          localizacao_detalhada?: string
          observacoes?: string | null
          proxima_recarga?: string | null
          proximo_teste_hidrostatico?: string | null
          qr_code?: string | null
          quadrante_id?: string
          status?: string
          tipo_extintor?: string
          ultima_recarga?: string | null
          ultimo_teste_hidrostatico?: string | null
          unidade_capacidade?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "extintores_aeroporto_quadrante_id_fkey"
            columns: ["quadrante_id"]
            isOneToOne: false
            referencedRelation: "quadrantes_aeroporto"
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
            foreignKeyName: "feristas_escalas_bombeiro_ferista_id_fkey"
            columns: ["bombeiro_ferista_id"]
            isOneToOne: false
            referencedRelation: "bombeiros_publico"
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
            foreignKeyName: "feristas_escalas_bombeiro_substituido_id_fkey"
            columns: ["bombeiro_substituido_id"]
            isOneToOne: false
            referencedRelation: "bombeiros_publico"
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
      funcionarios: {
        Row: {
          ativo: boolean
          base_id: string | null
          cargo: string | null
          created_at: string
          email: string
          id: string
          nome: string
          push_token: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ativo?: boolean
          base_id?: string | null
          cargo?: string | null
          created_at?: string
          email: string
          id?: string
          nome: string
          push_token?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ativo?: boolean
          base_id?: string | null
          cargo?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string
          push_token?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      historico_manutencoes_equipamentos: {
        Row: {
          certificado_url: string | null
          created_at: string
          custo: number | null
          data_manutencao: string
          descricao: string
          empresa_responsavel: string | null
          equipamento_id: string
          fotos: Json | null
          id: string
          materiais_utilizados: string | null
          observacoes: string | null
          proxima_manutencao: string | null
          responsavel_id: string | null
          responsavel_nome: string
          tipo_manutencao: string
        }
        Insert: {
          certificado_url?: string | null
          created_at?: string
          custo?: number | null
          data_manutencao?: string
          descricao: string
          empresa_responsavel?: string | null
          equipamento_id: string
          fotos?: Json | null
          id?: string
          materiais_utilizados?: string | null
          observacoes?: string | null
          proxima_manutencao?: string | null
          responsavel_id?: string | null
          responsavel_nome: string
          tipo_manutencao: string
        }
        Update: {
          certificado_url?: string | null
          created_at?: string
          custo?: number | null
          data_manutencao?: string
          descricao?: string
          empresa_responsavel?: string | null
          equipamento_id?: string
          fotos?: Json | null
          id?: string
          materiais_utilizados?: string | null
          observacoes?: string | null
          proxima_manutencao?: string | null
          responsavel_id?: string | null
          responsavel_nome?: string
          tipo_manutencao?: string
        }
        Relationships: [
          {
            foreignKeyName: "historico_manutencoes_equipamentos_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "equipamentos_estoque"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_recargas_agentes: {
        Row: {
          agente_extintor_id: string
          certificado_url: string | null
          created_at: string
          custo: number | null
          data_recarga: string
          empresa_responsavel: string | null
          id: string
          observacoes: string | null
          proxima_manutencao: string | null
          responsavel_id: string | null
          responsavel_nome: string
          tipo_manutencao: string
          viatura_id: string | null
        }
        Insert: {
          agente_extintor_id: string
          certificado_url?: string | null
          created_at?: string
          custo?: number | null
          data_recarga: string
          empresa_responsavel?: string | null
          id?: string
          observacoes?: string | null
          proxima_manutencao?: string | null
          responsavel_id?: string | null
          responsavel_nome: string
          tipo_manutencao: string
          viatura_id?: string | null
        }
        Update: {
          agente_extintor_id?: string
          certificado_url?: string | null
          created_at?: string
          custo?: number | null
          data_recarga?: string
          empresa_responsavel?: string | null
          id?: string
          observacoes?: string | null
          proxima_manutencao?: string | null
          responsavel_id?: string | null
          responsavel_nome?: string
          tipo_manutencao?: string
          viatura_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_recargas_agentes_agente_extintor_id_fkey"
            columns: ["agente_extintor_id"]
            isOneToOne: false
            referencedRelation: "agentes_extintores_controle"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_recargas_agentes_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "bombeiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_recargas_agentes_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "bombeiros_publico"
            referencedColumns: ["id"]
          },
        ]
      }
      inspecoes_extintores: {
        Row: {
          assinatura_digital: string | null
          bombeiro_inspetor_id: string
          created_at: string
          data_inspecao: string
          extintor_id: string
          fotos: Json | null
          hora_inspecao: string
          id: string
          itens_verificados: Json
          observacoes: string | null
          proxima_inspecao: string | null
          status_extintor: string
          tipo_inspecao: string
          updated_at: string
        }
        Insert: {
          assinatura_digital?: string | null
          bombeiro_inspetor_id: string
          created_at?: string
          data_inspecao?: string
          extintor_id: string
          fotos?: Json | null
          hora_inspecao?: string
          id?: string
          itens_verificados?: Json
          observacoes?: string | null
          proxima_inspecao?: string | null
          status_extintor?: string
          tipo_inspecao?: string
          updated_at?: string
        }
        Update: {
          assinatura_digital?: string | null
          bombeiro_inspetor_id?: string
          created_at?: string
          data_inspecao?: string
          extintor_id?: string
          fotos?: Json | null
          hora_inspecao?: string
          id?: string
          itens_verificados?: Json
          observacoes?: string | null
          proxima_inspecao?: string | null
          status_extintor?: string
          tipo_inspecao?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspecoes_extintores_bombeiro_inspetor_id_fkey"
            columns: ["bombeiro_inspetor_id"]
            isOneToOne: false
            referencedRelation: "bombeiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspecoes_extintores_bombeiro_inspetor_id_fkey"
            columns: ["bombeiro_inspetor_id"]
            isOneToOne: false
            referencedRelation: "bombeiros_publico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspecoes_extintores_extintor_id_fkey"
            columns: ["extintor_id"]
            isOneToOne: false
            referencedRelation: "extintores_aeroporto"
            referencedColumns: ["id"]
          },
        ]
      }
      materiais: {
        Row: {
          ativo: boolean
          categoria: string
          codigo_material: string
          created_at: string
          descricao: string | null
          especificacoes_tecnicas: Json | null
          fabricante: string | null
          id: string
          nome: string
          tipo_unidade: string
          unidade_medida: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          categoria: string
          codigo_material: string
          created_at?: string
          descricao?: string | null
          especificacoes_tecnicas?: Json | null
          fabricante?: string | null
          id?: string
          nome: string
          tipo_unidade: string
          unidade_medida: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          categoria?: string
          codigo_material?: string
          created_at?: string
          descricao?: string | null
          especificacoes_tecnicas?: Json | null
          fabricante?: string | null
          id?: string
          nome?: string
          tipo_unidade?: string
          unidade_medida?: string
          updated_at?: string
        }
        Relationships: []
      }
      materiais_guardados: {
        Row: {
          created_at: string
          data_guarda: string
          id: string
          material_id: string
          motivo_guarda: string
          observacoes: string | null
          previsao_liberacao: string | null
          quantidade: number
          responsavel_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_guarda?: string
          id?: string
          material_id: string
          motivo_guarda: string
          observacoes?: string | null
          previsao_liberacao?: string | null
          quantidade: number
          responsavel_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_guarda?: string
          id?: string
          material_id?: string
          motivo_guarda?: string
          observacoes?: string | null
          previsao_liberacao?: string | null
          quantidade?: number
          responsavel_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "materiais_guardados_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materiais_guardados_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "bombeiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materiais_guardados_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "bombeiros_publico"
            referencedColumns: ["id"]
          },
        ]
      }
      materiais_viaturas: {
        Row: {
          created_at: string
          data_alocacao: string
          id: string
          material_id: string
          observacoes: string | null
          quantidade_alocada: number
          status: string
          updated_at: string
          viatura_id: string
        }
        Insert: {
          created_at?: string
          data_alocacao?: string
          id?: string
          material_id: string
          observacoes?: string | null
          quantidade_alocada?: number
          status?: string
          updated_at?: string
          viatura_id: string
        }
        Update: {
          created_at?: string
          data_alocacao?: string
          id?: string
          material_id?: string
          observacoes?: string | null
          quantidade_alocada?: number
          status?: string
          updated_at?: string
          viatura_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "materiais_viaturas_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais"
            referencedColumns: ["id"]
          },
        ]
      }
      movimentacoes: {
        Row: {
          agente_id: string
          created_at: string | null
          data_movimentacao: string
          equipe: string | null
          id: string
          observacoes: string | null
          quantidade: number
          tipo_movimentacao: string
          usuario_id: string
        }
        Insert: {
          agente_id: string
          created_at?: string | null
          data_movimentacao?: string
          equipe?: string | null
          id?: string
          observacoes?: string | null
          quantidade: number
          tipo_movimentacao: string
          usuario_id: string
        }
        Update: {
          agente_id?: string
          created_at?: string | null
          data_movimentacao?: string
          equipe?: string | null
          id?: string
          observacoes?: string | null
          quantidade?: number
          tipo_movimentacao?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_agente_id_fkey"
            columns: ["agente_id"]
            isOneToOne: false
            referencedRelation: "agentes_extintores"
            referencedColumns: ["id"]
          },
        ]
      }
      movimentacoes_estoque: {
        Row: {
          created_at: string
          data_movimentacao: string
          destino: string | null
          id: string
          material_id: string
          motivo: string
          observacoes: string | null
          origem: string | null
          quantidade: number
          responsavel_id: string
          tipo_movimentacao: string
        }
        Insert: {
          created_at?: string
          data_movimentacao?: string
          destino?: string | null
          id?: string
          material_id: string
          motivo: string
          observacoes?: string | null
          origem?: string | null
          quantidade: number
          responsavel_id: string
          tipo_movimentacao: string
        }
        Update: {
          created_at?: string
          data_movimentacao?: string
          destino?: string | null
          id?: string
          material_id?: string
          motivo?: string
          observacoes?: string | null
          origem?: string | null
          quantidade?: number
          responsavel_id?: string
          tipo_movimentacao?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_estoque_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_estoque_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "bombeiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_estoque_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "bombeiros_publico"
            referencedColumns: ["id"]
          },
        ]
      }
      nao_conformidades: {
        Row: {
          bombeiro_responsavel: string
          checklist_id: string
          created_at: string | null
          data_registro: string | null
          descricao: string
          id: string
          imagem_nome: string | null
          imagem_url: string | null
          item_id: string
          item_nome: string
          secao: string
          updated_at: string | null
        }
        Insert: {
          bombeiro_responsavel: string
          checklist_id: string
          created_at?: string | null
          data_registro?: string | null
          descricao: string
          id?: string
          imagem_nome?: string | null
          imagem_url?: string | null
          item_id: string
          item_nome: string
          secao: string
          updated_at?: string | null
        }
        Update: {
          bombeiro_responsavel?: string
          checklist_id?: string
          created_at?: string | null
          data_registro?: string | null
          descricao?: string
          id?: string
          imagem_nome?: string | null
          imagem_url?: string | null
          item_id?: string
          item_nome?: string
          secao?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nao_conformidades_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists_viaturas"
            referencedColumns: ["id"]
          },
        ]
      }
      ocorrencias: {
        Row: {
          bombeiros_envolvidos: string[] | null
          contador_ocorrencia: number | null
          created_at: string
          data_ocorrencia: string
          descricao_detalhada: string | null
          descricao_inicial: string | null
          equipamentos: string | null
          equipe: string
          hora_acionamento: string
          hora_chegada_local: string | null
          hora_ocorrencia: string | null
          hora_retorno_sci: string | null
          hora_termino: string | null
          id: string
          identificacao_aeroporto: string | null
          latitude: number | null
          local_mapa_grade: string | null
          longitude: number | null
          numero_bombeiros_envolvidos: number | null
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
          contador_ocorrencia?: number | null
          created_at?: string
          data_ocorrencia: string
          descricao_detalhada?: string | null
          descricao_inicial?: string | null
          equipamentos?: string | null
          equipe: string
          hora_acionamento: string
          hora_chegada_local?: string | null
          hora_ocorrencia?: string | null
          hora_retorno_sci?: string | null
          hora_termino?: string | null
          id?: string
          identificacao_aeroporto?: string | null
          latitude?: number | null
          local_mapa_grade?: string | null
          longitude?: number | null
          numero_bombeiros_envolvidos?: number | null
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
          contador_ocorrencia?: number | null
          created_at?: string
          data_ocorrencia?: string
          descricao_detalhada?: string | null
          descricao_inicial?: string | null
          equipamentos?: string | null
          equipe?: string
          hora_acionamento?: string
          hora_chegada_local?: string | null
          hora_ocorrencia?: string | null
          hora_retorno_sci?: string | null
          hora_termino?: string | null
          id?: string
          identificacao_aeroporto?: string | null
          latitude?: number | null
          local_mapa_grade?: string | null
          longitude?: number | null
          numero_bombeiros_envolvidos?: number | null
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
        Relationships: []
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
          {
            foreignKeyName: "periodos_ferias_bombeiro_id_fkey"
            columns: ["bombeiro_id"]
            isOneToOne: false
            referencedRelation: "bombeiros_publico"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ativo: boolean | null
          avatar_url: string | null
          base_id: string
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          avatar_url?: string | null
          base_id: string
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          avatar_url?: string | null
          base_id?: string
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_base_id_fkey"
            columns: ["base_id"]
            isOneToOne: false
            referencedRelation: "bases"
            referencedColumns: ["id"]
          },
        ]
      }
      ptr_fotos: {
        Row: {
          created_at: string
          descricao: string | null
          foto_url: string
          id: string
          ordem: number | null
          ptr_instrucao_id: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          foto_url: string
          id?: string
          ordem?: number | null
          ptr_instrucao_id: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          foto_url?: string
          id?: string
          ordem?: number | null
          ptr_instrucao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ptr_fotos_ptr_instrucao_id_fkey"
            columns: ["ptr_instrucao_id"]
            isOneToOne: false
            referencedRelation: "ptr_instrucoes"
            referencedColumns: ["id"]
          },
        ]
      }
      ptr_instrucoes: {
        Row: {
          created_at: string
          data: string
          hora: string
          hora_fim: string | null
          id: string
          instrutor_id: string | null
          observacoes: string | null
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: string
          hora: string
          hora_fim?: string | null
          id?: string
          instrutor_id?: string | null
          observacoes?: string | null
          tipo: string
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: string
          hora?: string
          hora_fim?: string | null
          id?: string
          instrutor_id?: string | null
          observacoes?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ptr_instrucoes_instrutor_id_fkey"
            columns: ["instrutor_id"]
            isOneToOne: false
            referencedRelation: "bombeiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ptr_instrucoes_instrutor_id_fkey"
            columns: ["instrutor_id"]
            isOneToOne: false
            referencedRelation: "bombeiros_publico"
            referencedColumns: ["id"]
          },
        ]
      }
      ptr_participantes: {
        Row: {
          bombeiro_id: string
          created_at: string
          id: string
          observacoes: string | null
          presente: boolean | null
          ptr_instrucao_id: string
          situacao_ba: string | null
          updated_at: string
        }
        Insert: {
          bombeiro_id: string
          created_at?: string
          id?: string
          observacoes?: string | null
          presente?: boolean | null
          ptr_instrucao_id: string
          situacao_ba?: string | null
          updated_at?: string
        }
        Update: {
          bombeiro_id?: string
          created_at?: string
          id?: string
          observacoes?: string | null
          presente?: boolean | null
          ptr_instrucao_id?: string
          situacao_ba?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ptr_participantes_bombeiro_id_fkey"
            columns: ["bombeiro_id"]
            isOneToOne: false
            referencedRelation: "bombeiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ptr_participantes_bombeiro_id_fkey"
            columns: ["bombeiro_id"]
            isOneToOne: false
            referencedRelation: "bombeiros_publico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ptr_participantes_ptr_instrucao_id_fkey"
            columns: ["ptr_instrucao_id"]
            isOneToOne: false
            referencedRelation: "ptr_instrucoes"
            referencedColumns: ["id"]
          },
        ]
      }
      ptr_relatorios: {
        Row: {
          created_at: string
          created_by: string | null
          data: string
          id: string
          pdf_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data: string
          id?: string
          pdf_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: string
          id?: string
          pdf_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ptr_relatorios_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      qr_checklists: {
        Row: {
          assinatura_digital: string | null
          bombeiro_id: string
          bombeiro_nome: string
          created_at: string
          data_checklist: string
          fotos: Json | null
          hora_conclusao: string | null
          hora_inicio: string
          id: string
          itens_checklist: Json
          localizacao: Json | null
          observacoes_gerais: string | null
          qr_code: string
          status: string
          template_id: string
          updated_at: string
          viatura_id: string
        }
        Insert: {
          assinatura_digital?: string | null
          bombeiro_id: string
          bombeiro_nome: string
          created_at?: string
          data_checklist?: string
          fotos?: Json | null
          hora_conclusao?: string | null
          hora_inicio?: string
          id?: string
          itens_checklist?: Json
          localizacao?: Json | null
          observacoes_gerais?: string | null
          qr_code: string
          status?: string
          template_id: string
          updated_at?: string
          viatura_id: string
        }
        Update: {
          assinatura_digital?: string | null
          bombeiro_id?: string
          bombeiro_nome?: string
          created_at?: string
          data_checklist?: string
          fotos?: Json | null
          hora_conclusao?: string | null
          hora_inicio?: string
          id?: string
          itens_checklist?: Json
          localizacao?: Json | null
          observacoes_gerais?: string | null
          qr_code?: string
          status?: string
          template_id?: string
          updated_at?: string
          viatura_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_checklists_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      quadrantes_aeroporto: {
        Row: {
          ativo: boolean
          cor_identificacao: string
          created_at: string
          descricao: string | null
          equipe_responsavel_id: string | null
          id: string
          nome_quadrante: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cor_identificacao: string
          created_at?: string
          descricao?: string | null
          equipe_responsavel_id?: string | null
          id?: string
          nome_quadrante: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cor_identificacao?: string
          created_at?: string
          descricao?: string | null
          equipe_responsavel_id?: string | null
          id?: string
          nome_quadrante?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quadrantes_aeroporto_equipe_responsavel_id_fkey"
            columns: ["equipe_responsavel_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
        ]
      }
      taf_avaliacoes: {
        Row: {
          abdominais_realizadas: number
          aprovado: boolean
          avaliador_nome: string
          bombeiro_id: string
          created_at: string
          data_teste: string
          equipe: string | null
          faixa_etaria: string
          flexoes_realizadas: number
          id: string
          idade_na_data: number
          observacoes: string | null
          polichinelos_realizados: number
          tempo_limite_minutos: number
          tempo_total_segundos: number
          tipo_avaliacao: string
          updated_at: string
        }
        Insert: {
          abdominais_realizadas: number
          aprovado?: boolean
          avaliador_nome?: string
          bombeiro_id: string
          created_at?: string
          data_teste?: string
          equipe?: string | null
          faixa_etaria?: string
          flexoes_realizadas: number
          id?: string
          idade_na_data?: number
          observacoes?: string | null
          polichinelos_realizados: number
          tempo_limite_minutos?: number
          tempo_total_segundos?: number
          tipo_avaliacao?: string
          updated_at?: string
        }
        Update: {
          abdominais_realizadas?: number
          aprovado?: boolean
          avaliador_nome?: string
          bombeiro_id?: string
          created_at?: string
          data_teste?: string
          equipe?: string | null
          faixa_etaria?: string
          flexoes_realizadas?: number
          id?: string
          idade_na_data?: number
          observacoes?: string | null
          polichinelos_realizados?: number
          tempo_limite_minutos?: number
          tempo_total_segundos?: number
          tipo_avaliacao?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "taf_avaliacoes_bombeiro_id_fkey"
            columns: ["bombeiro_id"]
            isOneToOne: false
            referencedRelation: "bombeiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "taf_avaliacoes_bombeiro_id_fkey"
            columns: ["bombeiro_id"]
            isOneToOne: false
            referencedRelation: "bombeiros_publico"
            referencedColumns: ["id"]
          },
        ]
      }
      taf_avaliacoes_historico: {
        Row: {
          campos_alterados: string[] | null
          dados_anteriores: Json | null
          dados_novos: Json
          id: string
          ip_address: unknown | null
          observacoes_historico: string | null
          operacao: string
          taf_avaliacao_id: string
          timestamp_operacao: string
          user_agent: string | null
          usuario_nome: string | null
          usuario_responsavel: string | null
          usuario_role: string | null
        }
        Insert: {
          campos_alterados?: string[] | null
          dados_anteriores?: Json | null
          dados_novos: Json
          id?: string
          ip_address?: unknown | null
          observacoes_historico?: string | null
          operacao: string
          taf_avaliacao_id: string
          timestamp_operacao?: string
          user_agent?: string | null
          usuario_nome?: string | null
          usuario_responsavel?: string | null
          usuario_role?: string | null
        }
        Update: {
          campos_alterados?: string[] | null
          dados_anteriores?: Json | null
          dados_novos?: Json
          id?: string
          ip_address?: unknown | null
          observacoes_historico?: string | null
          operacao?: string
          taf_avaliacao_id?: string
          timestamp_operacao?: string
          user_agent?: string | null
          usuario_nome?: string | null
          usuario_responsavel?: string | null
          usuario_role?: string | null
        }
        Relationships: []
      }
      taf_metas: {
        Row: {
          created_at: string | null
          faixa_etaria: string
          id: string
          meta_abdominais: number
          meta_flexoes: number
          meta_polichinelos: number
          tempo_limite_minutos: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          faixa_etaria: string
          id?: string
          meta_abdominais: number
          meta_flexoes: number
          meta_polichinelos: number
          tempo_limite_minutos: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          faixa_etaria?: string
          id?: string
          meta_abdominais?: number
          meta_flexoes?: number
          meta_polichinelos?: number
          tempo_limite_minutos?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      template_checklist: {
        Row: {
          categoria: string
          created_at: string | null
          id: string
          item: string
          obrigatorio: boolean | null
          ordem: number | null
          permite_foto: boolean | null
          tipo_checklist_id: string
          updated_at: string | null
        }
        Insert: {
          categoria: string
          created_at?: string | null
          id?: string
          item: string
          obrigatorio?: boolean | null
          ordem?: number | null
          permite_foto?: boolean | null
          tipo_checklist_id: string
          updated_at?: string | null
        }
        Update: {
          categoria?: string
          created_at?: string | null
          id?: string
          item?: string
          obrigatorio?: boolean | null
          ordem?: number | null
          permite_foto?: boolean | null
          tipo_checklist_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_checklist_tipo_checklist_id_fkey"
            columns: ["tipo_checklist_id"]
            isOneToOne: false
            referencedRelation: "tipos_checklist"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_checklist: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tp_configuracoes: {
        Row: {
          ano_referencia: number
          base: string
          created_at: string | null
          equipe_id: string | null
          id: string
          mes_referencia: number
          quantidade_tp_prevista: number
          quantidade_uniforme_prevista: number
          updated_at: string | null
        }
        Insert: {
          ano_referencia: number
          base: string
          created_at?: string | null
          equipe_id?: string | null
          id?: string
          mes_referencia: number
          quantidade_tp_prevista?: number
          quantidade_uniforme_prevista?: number
          updated_at?: string | null
        }
        Update: {
          ano_referencia?: number
          base?: string
          created_at?: string | null
          equipe_id?: string | null
          id?: string
          mes_referencia?: number
          quantidade_tp_prevista?: number
          quantidade_uniforme_prevista?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tp_configuracoes_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
        ]
      }
      tp_higienizacoes: {
        Row: {
          ano_referencia: number
          base: string
          created_at: string | null
          data_higienizacao: string
          equipe_id: string | null
          id: string
          mes_referencia: number
          observacoes: string | null
          quantidade_higienizada: number
          quantidade_total: number
          responsavel_id: string | null
          responsavel_nome: string
          tipo_higienizacao: string
          updated_at: string | null
        }
        Insert: {
          ano_referencia: number
          base: string
          created_at?: string | null
          data_higienizacao?: string
          equipe_id?: string | null
          id?: string
          mes_referencia: number
          observacoes?: string | null
          quantidade_higienizada?: number
          quantidade_total?: number
          responsavel_id?: string | null
          responsavel_nome: string
          tipo_higienizacao?: string
          updated_at?: string | null
        }
        Update: {
          ano_referencia?: number
          base?: string
          created_at?: string | null
          data_higienizacao?: string
          equipe_id?: string | null
          id?: string
          mes_referencia?: number
          observacoes?: string | null
          quantidade_higienizada?: number
          quantidade_total?: number
          responsavel_id?: string | null
          responsavel_nome?: string
          tipo_higienizacao?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tp_higienizacoes_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tp_higienizacoes_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "bombeiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tp_higienizacoes_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "bombeiros_publico"
            referencedColumns: ["id"]
          },
        ]
      }
      tp_verificacoes: {
        Row: {
          cat1_ca_membros: string[] | null
          cat1_ca_observacoes: string | null
          cat1_ca_valido: string | null
          cat1_etiquetas_membros: string[] | null
          cat1_etiquetas_observacoes: string | null
          cat1_etiquetas_visiveis: string | null
          cat2_capacetes_integros: string | null
          cat2_capacetes_membros: string[] | null
          cat2_capacetes_observacoes: string | null
          cat3_barreira_membros: string[] | null
          cat3_barreira_observacoes: string | null
          cat3_barreira_umidade: string | null
          cat3_bolsos_dispositivos: string | null
          cat3_bolsos_membros: string[] | null
          cat3_bolsos_observacoes: string | null
          cat3_bom_estado: string | null
          cat3_bom_estado_membros: string[] | null
          cat3_bom_estado_observacoes: string | null
          cat3_costuras_integras: string | null
          cat3_costuras_membros: string[] | null
          cat3_costuras_observacoes: string | null
          cat3_costuras_seladas: string | null
          cat3_faixas_membros: string[] | null
          cat3_faixas_observacoes: string | null
          cat3_faixas_reflexivas: string | null
          cat3_fechos_membros: string[] | null
          cat3_fechos_observacoes: string | null
          cat3_limpeza_membros: string[] | null
          cat3_limpeza_observacoes: string | null
          cat3_modificacoes_membros: string[] | null
          cat3_modificacoes_observacoes: string | null
          cat3_punhos_elasticidade: string | null
          cat3_punhos_membros: string[] | null
          cat3_punhos_observacoes: string | null
          cat3_refletivos_membros: string[] | null
          cat3_refletivos_observacoes: string | null
          cat3_seladas_membros: string[] | null
          cat3_seladas_observacoes: string | null
          cat3_tamanho_membros: string[] | null
          cat3_tamanho_observacoes: string | null
          cat3_vestimentas_integras: string | null
          cat3_vestimentas_membros: string[] | null
          cat3_vestimentas_observacoes: string | null
          cat4_botas_bom_estado: string | null
          cat4_botas_membros: string[] | null
          cat4_botas_observacoes: string | null
          cat4_solas_integras: string | null
          cat4_solas_membros: string[] | null
          cat4_solas_observacoes: string | null
          cat5_costuras_luvas: string | null
          cat5_costuras_membros: string[] | null
          cat5_costuras_observacoes: string | null
          cat5_luvas_bom_estado: string | null
          cat5_luvas_membros: string[] | null
          cat5_luvas_observacoes: string | null
          cat6_capuzes_bom_estado: string | null
          cat6_capuzes_membros: string[] | null
          cat6_capuzes_observacoes: string | null
          created_at: string | null
          data_verificacao: string | null
          equipe: string
          etapa_atual: number | null
          id: string
          local: string
          membros_equipe: string[] | null
          percentual_conformidade: number | null
          responsavel: string
          status: string | null
          total_conformes: number | null
          total_nao_conformes: number | null
          total_nao_verificados: number | null
          updated_at: string | null
        }
        Insert: {
          cat1_ca_membros?: string[] | null
          cat1_ca_observacoes?: string | null
          cat1_ca_valido?: string | null
          cat1_etiquetas_membros?: string[] | null
          cat1_etiquetas_observacoes?: string | null
          cat1_etiquetas_visiveis?: string | null
          cat2_capacetes_integros?: string | null
          cat2_capacetes_membros?: string[] | null
          cat2_capacetes_observacoes?: string | null
          cat3_barreira_membros?: string[] | null
          cat3_barreira_observacoes?: string | null
          cat3_barreira_umidade?: string | null
          cat3_bolsos_dispositivos?: string | null
          cat3_bolsos_membros?: string[] | null
          cat3_bolsos_observacoes?: string | null
          cat3_bom_estado?: string | null
          cat3_bom_estado_membros?: string[] | null
          cat3_bom_estado_observacoes?: string | null
          cat3_costuras_integras?: string | null
          cat3_costuras_membros?: string[] | null
          cat3_costuras_observacoes?: string | null
          cat3_costuras_seladas?: string | null
          cat3_faixas_membros?: string[] | null
          cat3_faixas_observacoes?: string | null
          cat3_faixas_reflexivas?: string | null
          cat3_fechos_membros?: string[] | null
          cat3_fechos_observacoes?: string | null
          cat3_limpeza_membros?: string[] | null
          cat3_limpeza_observacoes?: string | null
          cat3_modificacoes_membros?: string[] | null
          cat3_modificacoes_observacoes?: string | null
          cat3_punhos_elasticidade?: string | null
          cat3_punhos_membros?: string[] | null
          cat3_punhos_observacoes?: string | null
          cat3_refletivos_membros?: string[] | null
          cat3_refletivos_observacoes?: string | null
          cat3_seladas_membros?: string[] | null
          cat3_seladas_observacoes?: string | null
          cat3_tamanho_membros?: string[] | null
          cat3_tamanho_observacoes?: string | null
          cat3_vestimentas_integras?: string | null
          cat3_vestimentas_membros?: string[] | null
          cat3_vestimentas_observacoes?: string | null
          cat4_botas_bom_estado?: string | null
          cat4_botas_membros?: string[] | null
          cat4_botas_observacoes?: string | null
          cat4_solas_integras?: string | null
          cat4_solas_membros?: string[] | null
          cat4_solas_observacoes?: string | null
          cat5_costuras_luvas?: string | null
          cat5_costuras_membros?: string[] | null
          cat5_costuras_observacoes?: string | null
          cat5_luvas_bom_estado?: string | null
          cat5_luvas_membros?: string[] | null
          cat5_luvas_observacoes?: string | null
          cat6_capuzes_bom_estado?: string | null
          cat6_capuzes_membros?: string[] | null
          cat6_capuzes_observacoes?: string | null
          created_at?: string | null
          data_verificacao?: string | null
          equipe: string
          etapa_atual?: number | null
          id?: string
          local: string
          membros_equipe?: string[] | null
          percentual_conformidade?: number | null
          responsavel: string
          status?: string | null
          total_conformes?: number | null
          total_nao_conformes?: number | null
          total_nao_verificados?: number | null
          updated_at?: string | null
        }
        Update: {
          cat1_ca_membros?: string[] | null
          cat1_ca_observacoes?: string | null
          cat1_ca_valido?: string | null
          cat1_etiquetas_membros?: string[] | null
          cat1_etiquetas_observacoes?: string | null
          cat1_etiquetas_visiveis?: string | null
          cat2_capacetes_integros?: string | null
          cat2_capacetes_membros?: string[] | null
          cat2_capacetes_observacoes?: string | null
          cat3_barreira_membros?: string[] | null
          cat3_barreira_observacoes?: string | null
          cat3_barreira_umidade?: string | null
          cat3_bolsos_dispositivos?: string | null
          cat3_bolsos_membros?: string[] | null
          cat3_bolsos_observacoes?: string | null
          cat3_bom_estado?: string | null
          cat3_bom_estado_membros?: string[] | null
          cat3_bom_estado_observacoes?: string | null
          cat3_costuras_integras?: string | null
          cat3_costuras_membros?: string[] | null
          cat3_costuras_observacoes?: string | null
          cat3_costuras_seladas?: string | null
          cat3_faixas_membros?: string[] | null
          cat3_faixas_observacoes?: string | null
          cat3_faixas_reflexivas?: string | null
          cat3_fechos_membros?: string[] | null
          cat3_fechos_observacoes?: string | null
          cat3_limpeza_membros?: string[] | null
          cat3_limpeza_observacoes?: string | null
          cat3_modificacoes_membros?: string[] | null
          cat3_modificacoes_observacoes?: string | null
          cat3_punhos_elasticidade?: string | null
          cat3_punhos_membros?: string[] | null
          cat3_punhos_observacoes?: string | null
          cat3_refletivos_membros?: string[] | null
          cat3_refletivos_observacoes?: string | null
          cat3_seladas_membros?: string[] | null
          cat3_seladas_observacoes?: string | null
          cat3_tamanho_membros?: string[] | null
          cat3_tamanho_observacoes?: string | null
          cat3_vestimentas_integras?: string | null
          cat3_vestimentas_membros?: string[] | null
          cat3_vestimentas_observacoes?: string | null
          cat4_botas_bom_estado?: string | null
          cat4_botas_membros?: string[] | null
          cat4_botas_observacoes?: string | null
          cat4_solas_integras?: string | null
          cat4_solas_membros?: string[] | null
          cat4_solas_observacoes?: string | null
          cat5_costuras_luvas?: string | null
          cat5_costuras_membros?: string[] | null
          cat5_costuras_observacoes?: string | null
          cat5_luvas_bom_estado?: string | null
          cat5_luvas_membros?: string[] | null
          cat5_luvas_observacoes?: string | null
          cat6_capuzes_bom_estado?: string | null
          cat6_capuzes_membros?: string[] | null
          cat6_capuzes_observacoes?: string | null
          created_at?: string | null
          data_verificacao?: string | null
          equipe?: string
          etapa_atual?: number | null
          id?: string
          local?: string
          membros_equipe?: string[] | null
          percentual_conformidade?: number | null
          responsavel?: string
          status?: string | null
          total_conformes?: number | null
          total_nao_conformes?: number | null
          total_nao_verificados?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tp_verificacoes_uniformes: {
        Row: {
          cat1_bermudas: string | null
          cat1_bermudas_membros: string[] | null
          cat1_bermudas_observacoes: string | null
          cat1_bota: string | null
          cat1_bota_membros: string[] | null
          cat1_bota_observacoes: string | null
          cat1_calcas: string | null
          cat1_calcas_membros: string[] | null
          cat1_calcas_observacoes: string | null
          cat1_camisas: string | null
          cat1_camisas_membros: string[] | null
          cat1_camisas_observacoes: string | null
          cat1_cinto: string | null
          cat1_cinto_membros: string[] | null
          cat1_cinto_observacoes: string | null
          cat1_gandolas: string | null
          cat1_gandolas_membros: string[] | null
          cat1_gandolas_observacoes: string | null
          cat1_oculos: string | null
          cat1_oculos_membros: string[] | null
          cat1_oculos_observacoes: string | null
          cat1_tarjeta: string | null
          cat1_tarjeta_membros: string[] | null
          cat1_tarjeta_observacoes: string | null
          created_at: string | null
          data_verificacao: string
          equipe: string | null
          etapa_atual: number | null
          id: string
          local: string | null
          membros_equipe: string[] | null
          percentual_conformidade: number | null
          responsavel: string | null
          status: string | null
          total_conformes: number | null
          total_nao_conformes: number | null
          total_nao_verificados: number | null
          updated_at: string | null
        }
        Insert: {
          cat1_bermudas?: string | null
          cat1_bermudas_membros?: string[] | null
          cat1_bermudas_observacoes?: string | null
          cat1_bota?: string | null
          cat1_bota_membros?: string[] | null
          cat1_bota_observacoes?: string | null
          cat1_calcas?: string | null
          cat1_calcas_membros?: string[] | null
          cat1_calcas_observacoes?: string | null
          cat1_camisas?: string | null
          cat1_camisas_membros?: string[] | null
          cat1_camisas_observacoes?: string | null
          cat1_cinto?: string | null
          cat1_cinto_membros?: string[] | null
          cat1_cinto_observacoes?: string | null
          cat1_gandolas?: string | null
          cat1_gandolas_membros?: string[] | null
          cat1_gandolas_observacoes?: string | null
          cat1_oculos?: string | null
          cat1_oculos_membros?: string[] | null
          cat1_oculos_observacoes?: string | null
          cat1_tarjeta?: string | null
          cat1_tarjeta_membros?: string[] | null
          cat1_tarjeta_observacoes?: string | null
          created_at?: string | null
          data_verificacao?: string
          equipe?: string | null
          etapa_atual?: number | null
          id?: string
          local?: string | null
          membros_equipe?: string[] | null
          percentual_conformidade?: number | null
          responsavel?: string | null
          status?: string | null
          total_conformes?: number | null
          total_nao_conformes?: number | null
          total_nao_verificados?: number | null
          updated_at?: string | null
        }
        Update: {
          cat1_bermudas?: string | null
          cat1_bermudas_membros?: string[] | null
          cat1_bermudas_observacoes?: string | null
          cat1_bota?: string | null
          cat1_bota_membros?: string[] | null
          cat1_bota_observacoes?: string | null
          cat1_calcas?: string | null
          cat1_calcas_membros?: string[] | null
          cat1_calcas_observacoes?: string | null
          cat1_camisas?: string | null
          cat1_camisas_membros?: string[] | null
          cat1_camisas_observacoes?: string | null
          cat1_cinto?: string | null
          cat1_cinto_membros?: string[] | null
          cat1_cinto_observacoes?: string | null
          cat1_gandolas?: string | null
          cat1_gandolas_membros?: string[] | null
          cat1_gandolas_observacoes?: string | null
          cat1_oculos?: string | null
          cat1_oculos_membros?: string[] | null
          cat1_oculos_observacoes?: string | null
          cat1_tarjeta?: string | null
          cat1_tarjeta_membros?: string[] | null
          cat1_tarjeta_observacoes?: string | null
          created_at?: string | null
          data_verificacao?: string
          equipe?: string | null
          etapa_atual?: number | null
          id?: string
          local?: string | null
          membros_equipe?: string[] | null
          percentual_conformidade?: number | null
          responsavel?: string | null
          status?: string | null
          total_conformes?: number | null
          total_nao_conformes?: number | null
          total_nao_verificados?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      trocas_plantao: {
        Row: {
          ano_referencia: number
          base: string
          bombeiro_substituido_id: string
          bombeiro_substituto_id: string
          created_at: string
          data_servico_pagamento: string
          data_servico_trocado: string
          equipe_id: string
          id: string
          mes_referencia: number
          observacoes: string | null
          solicitante_id: string
          status: string
          updated_at: string
        }
        Insert: {
          ano_referencia: number
          base?: string
          bombeiro_substituido_id: string
          bombeiro_substituto_id: string
          created_at?: string
          data_servico_pagamento: string
          data_servico_trocado: string
          equipe_id: string
          id?: string
          mes_referencia: number
          observacoes?: string | null
          solicitante_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          ano_referencia?: number
          base?: string
          bombeiro_substituido_id?: string
          bombeiro_substituto_id?: string
          created_at?: string
          data_servico_pagamento?: string
          data_servico_trocado?: string
          equipe_id?: string
          id?: string
          mes_referencia?: number
          observacoes?: string | null
          solicitante_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trocas_plantao_bombeiro_substituido_id_fkey"
            columns: ["bombeiro_substituido_id"]
            isOneToOne: false
            referencedRelation: "bombeiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trocas_plantao_bombeiro_substituido_id_fkey"
            columns: ["bombeiro_substituido_id"]
            isOneToOne: false
            referencedRelation: "bombeiros_publico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trocas_plantao_bombeiro_substituto_id_fkey"
            columns: ["bombeiro_substituto_id"]
            isOneToOne: false
            referencedRelation: "bombeiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trocas_plantao_bombeiro_substituto_id_fkey"
            columns: ["bombeiro_substituto_id"]
            isOneToOne: false
            referencedRelation: "bombeiros_publico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trocas_plantao_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trocas_plantao_solicitante_id_fkey"
            columns: ["solicitante_id"]
            isOneToOne: false
            referencedRelation: "bombeiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trocas_plantao_solicitante_id_fkey"
            columns: ["solicitante_id"]
            isOneToOne: false
            referencedRelation: "bombeiros_publico"
            referencedColumns: ["id"]
          },
        ]
      }
      uniformes: {
        Row: {
          ano_referencia: number
          base: string
          bermudas_bombeiro: string
          bermudas_imagem_url: string | null
          bermudas_observacoes: string | null
          bombeiro_id: string | null
          bombeiro_nome: string
          bota_imagem_url: string | null
          bota_observacoes: string | null
          bota_seguranca: string
          calcas_bombeiro: string
          calcas_imagem_url: string | null
          calcas_observacoes: string | null
          camisas_bombeiro: string
          camisas_imagem_url: string | null
          camisas_observacoes: string | null
          cinto_bombeiro: string
          cinto_imagem_url: string | null
          cinto_observacoes: string | null
          created_at: string | null
          data_verificacao: string
          equipe_id: string | null
          gandolas_bombeiro: string
          gandolas_imagem_url: string | null
          gandolas_observacoes: string | null
          id: string
          itens_conformes: number
          itens_nao_conformes: number
          mes_referencia: number
          observacoes_gerais: string | null
          oculos_imagem_url: string | null
          oculos_observacoes: string | null
          oculos_protetor: string
          percentual_conformidade: number | null
          responsavel_id: string | null
          responsavel_nome: string
          status: string
          tarjeta_identificacao: string
          tarjeta_imagem_url: string | null
          tarjeta_observacoes: string | null
          total_itens_verificados: number
          updated_at: string | null
        }
        Insert: {
          ano_referencia: number
          base: string
          bermudas_bombeiro?: string
          bermudas_imagem_url?: string | null
          bermudas_observacoes?: string | null
          bombeiro_id?: string | null
          bombeiro_nome: string
          bota_imagem_url?: string | null
          bota_observacoes?: string | null
          bota_seguranca?: string
          calcas_bombeiro?: string
          calcas_imagem_url?: string | null
          calcas_observacoes?: string | null
          camisas_bombeiro?: string
          camisas_imagem_url?: string | null
          camisas_observacoes?: string | null
          cinto_bombeiro?: string
          cinto_imagem_url?: string | null
          cinto_observacoes?: string | null
          created_at?: string | null
          data_verificacao?: string
          equipe_id?: string | null
          gandolas_bombeiro?: string
          gandolas_imagem_url?: string | null
          gandolas_observacoes?: string | null
          id?: string
          itens_conformes?: number
          itens_nao_conformes?: number
          mes_referencia: number
          observacoes_gerais?: string | null
          oculos_imagem_url?: string | null
          oculos_observacoes?: string | null
          oculos_protetor?: string
          percentual_conformidade?: number | null
          responsavel_id?: string | null
          responsavel_nome: string
          status?: string
          tarjeta_identificacao?: string
          tarjeta_imagem_url?: string | null
          tarjeta_observacoes?: string | null
          total_itens_verificados?: number
          updated_at?: string | null
        }
        Update: {
          ano_referencia?: number
          base?: string
          bermudas_bombeiro?: string
          bermudas_imagem_url?: string | null
          bermudas_observacoes?: string | null
          bombeiro_id?: string | null
          bombeiro_nome?: string
          bota_imagem_url?: string | null
          bota_observacoes?: string | null
          bota_seguranca?: string
          calcas_bombeiro?: string
          calcas_imagem_url?: string | null
          calcas_observacoes?: string | null
          camisas_bombeiro?: string
          camisas_imagem_url?: string | null
          camisas_observacoes?: string | null
          cinto_bombeiro?: string
          cinto_imagem_url?: string | null
          cinto_observacoes?: string | null
          created_at?: string | null
          data_verificacao?: string
          equipe_id?: string | null
          gandolas_bombeiro?: string
          gandolas_imagem_url?: string | null
          gandolas_observacoes?: string | null
          id?: string
          itens_conformes?: number
          itens_nao_conformes?: number
          mes_referencia?: number
          observacoes_gerais?: string | null
          oculos_imagem_url?: string | null
          oculos_observacoes?: string | null
          oculos_protetor?: string
          percentual_conformidade?: number | null
          responsavel_id?: string | null
          responsavel_nome?: string
          status?: string
          tarjeta_identificacao?: string
          tarjeta_imagem_url?: string | null
          tarjeta_observacoes?: string | null
          total_itens_verificados?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uniformes_bombeiro_id_fkey"
            columns: ["bombeiro_id"]
            isOneToOne: false
            referencedRelation: "bombeiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uniformes_bombeiro_id_fkey"
            columns: ["bombeiro_id"]
            isOneToOne: false
            referencedRelation: "bombeiros_publico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uniformes_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uniformes_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "bombeiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uniformes_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "bombeiros_publico"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      usuarios_autorizados: {
        Row: {
          ativo: boolean | null
          base_id: string
          cargo: string
          created_at: string | null
          email: string
          equipe: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          base_id: string
          cargo: string
          created_at?: string | null
          email: string
          equipe?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          base_id?: string
          cargo?: string
          created_at?: string | null
          email?: string
          equipe?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_autorizados_base_id_fkey"
            columns: ["base_id"]
            isOneToOne: false
            referencedRelation: "bases"
            referencedColumns: ["id"]
          },
        ]
      }
      viaturas: {
        Row: {
          ano: number | null
          ativa: boolean
          base_id: string | null
          created_at: string | null
          id: string
          modelo: string
          nome_viatura: string | null
          observacoes: string | null
          placa: string
          prefixo: string | null
          status: string | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          ano?: number | null
          ativa?: boolean
          base_id?: string | null
          created_at?: string | null
          id?: string
          modelo: string
          nome_viatura?: string | null
          observacoes?: string | null
          placa: string
          prefixo?: string | null
          status?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          ano?: number | null
          ativa?: boolean
          base_id?: string | null
          created_at?: string | null
          id?: string
          modelo?: string
          nome_viatura?: string | null
          observacoes?: string | null
          placa?: string
          prefixo?: string | null
          status?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "viaturas_base_id_fkey"
            columns: ["base_id"]
            isOneToOne: false
            referencedRelation: "bases"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      bombeiros_publico: {
        Row: {
          avatar: string | null
          created_at: string | null
          data_admissao: string | null
          equipe: string | null
          funcao: string | null
          funcao_completa: string | null
          id: string | null
          nome: string | null
          status: string | null
          turno: string | null
          updated_at: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          data_admissao?: string | null
          equipe?: string | null
          funcao?: string | null
          funcao_completa?: string | null
          id?: string | null
          nome?: string | null
          status?: string | null
          turno?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          data_admissao?: string | null
          equipe?: string | null
          funcao?: string | null
          funcao_completa?: string | null
          id?: string | null
          nome?: string | null
          status?: string | null
          turno?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vw_uniformes_estatisticas_mensais: {
        Row: {
          ano_referencia: number | null
          aprovados: number | null
          base: string | null
          media_conformidade: number | null
          mes_referencia: number | null
          pendentes: number | null
          reprovados: number | null
          total_conformes: number | null
          total_nao_conformes: number | null
          total_verificacoes: number | null
        }
        Relationships: []
      }
      vw_uniformes_itens_problematicos: {
        Row: {
          bombeiro_id: string | null
          bombeiro_nome: string | null
          data_verificacao: string | null
          item_tipo: string | null
          status_item: string | null
        }
        Relationships: []
      }
      vw_uniformes_problemas_frequentes: {
        Row: {
          item: string | null
          nao_conformes: number | null
          percentual_problemas: number | null
          total: number | null
        }
        Relationships: []
      }
      vw_uniformes_ranking_bombeiros: {
        Row: {
          aprovacoes: number | null
          bombeiro_id: string | null
          bombeiro_nome: string | null
          media_conformidade: number | null
          reprovacoes: number | null
          total_conformes: number | null
          total_verificacoes: number | null
        }
        Relationships: [
          {
            foreignKeyName: "uniformes_bombeiro_id_fkey"
            columns: ["bombeiro_id"]
            isOneToOne: false
            referencedRelation: "bombeiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uniformes_bombeiro_id_fkey"
            columns: ["bombeiro_id"]
            isOneToOne: false
            referencedRelation: "bombeiros_publico"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      bombeiro_can_access_checklist: {
        Args: { checklist_bombeiro_id: string }
        Returns: boolean
      }
      can_access_checklist: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      can_access_main_system: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      can_access_sci_core: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      can_view_base_data: {
        Args: { target_base_id: string }
        Returns: boolean
      }
      can_view_equipe_data: {
        Args: { target_equipe: string }
        Returns: boolean
      }
      fn_create_taf_avaliacao: {
        Args: {
          p_abdominais_realizadas: number
          p_aprovado: boolean
          p_avaliador_nome?: string
          p_bombeiro_id: string
          p_data_teste?: string
          p_faixa_etaria: string
          p_flexoes_realizadas: number
          p_idade_na_data: number
          p_observacoes?: string
          p_polichinelos_realizados: number
          p_tempo_limite_minutos?: number
          p_tempo_total_segundos: number
        }
        Returns: string
      }
      fn_delete_taf_avaliacao: {
        Args: { p_id: string; p_motivo_exclusao?: string }
        Returns: boolean
      }
      fn_read_taf_avaliacoes: {
        Args: {
          p_aprovado?: boolean
          p_bombeiro_id?: string
          p_data_fim?: string
          p_data_inicio?: string
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          abdominais_realizadas: number
          aprovado: boolean
          avaliador_nome: string
          bombeiro_id: string
          created_at: string
          data_teste: string
          faixa_etaria: string
          flexoes_realizadas: number
          id: string
          idade_na_data: number
          observacoes: string
          polichinelos_realizados: number
          tempo_limite_minutos: number
          tempo_total_segundos: number
          updated_at: string
        }[]
      }
      fn_update_taf_avaliacao: {
        Args: {
          p_abdominais_realizadas?: number
          p_aprovado?: boolean
          p_flexoes_realizadas?: number
          p_id: string
          p_observacoes?: string
          p_polichinelos_realizados?: number
          p_tempo_total_segundos?: number
        }
        Returns: boolean
      }
      get_alertas_vencimento_agentes: {
        Args: Record<PropertyKey, never>
        Returns: {
          data_vencimento: string
          dias_para_vencimento: number
          lote: string
          nivel_alerta: string
          quantidade: number
          tipo_agente: string
        }[]
      }
      get_bombeiros_por_base: {
        Args: { base_uuid: string }
        Returns: {
          base_nome: string
          email: string
          equipe: string
          funcao: string
          id: string
          nome: string
          status: string
        }[]
      }
      get_current_bombeiro_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_base_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_cargo: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_equipe: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_estatisticas_base: {
        Args: { base_uuid: string }
        Returns: {
          por_equipe: Json
          por_funcao: Json
          por_status: Json
          total_bombeiros: number
        }[]
      }
      get_proximo_lote_recomendado: {
        Args: { p_tipo_agente: string }
        Returns: {
          data_vencimento: string
          dias_para_vencimento: number
          lote: string
          quantidade_disponivel: number
        }[]
      }
      get_taf_estatisticas: {
        Args: Record<PropertyKey, never>
        Returns: {
          bombeiros_pendentes: number
          media_abdominais: number
          media_flexoes: number
          media_polichinelos: number
          taxa_aprovacao: number
          total_avaliacoes: number
        }[]
      }
      get_taf_estatisticas_completas: {
        Args: { p_data_fim?: string; p_data_inicio?: string }
        Returns: {
          bombeiros_pendentes: number
          evolucao_mensal: Json
          media_abdominais: number
          media_flexoes: number
          media_polichinelos: number
          media_tempo_segundos: number
          taxa_aprovacao: number
          total_avaliacoes: number
        }[]
      }
      get_taf_estatisticas_por_equipe: {
        Args: { p_equipe?: string }
        Returns: {
          bombeiros_pendentes: number
          equipe_filtro: string
          media_abdominais: number
          media_flexoes: number
          media_polichinelos: number
          taxa_aprovacao: number
          total_avaliacoes: number
        }[]
      }
      get_taf_historico: {
        Args:
          | { p_bombeiro_id: string }
          | { p_bombeiro_id: string; p_limite?: number }
        Returns: {
          abdominais_realizadas: number
          aprovado: boolean
          avaliador_nome: string
          created_at: string
          data_teste: string
          faixa_etaria: string
          flexoes_realizadas: number
          id: string
          idade_na_data: number
          observacoes: string
          polichinelos_realizados: number
          tempo_limite_minutos: number
          tempo_total_segundos: number
        }[]
      }
      get_user_access_level: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_base_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_primary_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      is_authorized_user: {
        Args: { user_email: string }
        Returns: {
          authorized: boolean
          base_id: string
          cargo: string
          equipe: string
        }[]
      }
      is_user_active: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      is_user_gerente: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      nextval: {
        Args: { sequence_name: string }
        Returns: number
      }
      registrar_timeline_checklist: {
        Args: {
          p_checklist_id: string
          p_checklist_tipo: string
          p_dados_alterados?: Json
          p_descricao?: string
          p_operacao: string
        }
        Returns: string
      }
      user_can_access_base: {
        Args: { _base_id: string }
        Returns: boolean
      }
      user_has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      validate_checklist_itens: {
        Args: { itens_json: Json }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "gs_base" | "ba_ce" | "ba_lr" | "ba_mc" | "ba_2"
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
    Enums: {
      app_role: ["admin", "gs_base", "ba_ce", "ba_lr", "ba_mc", "ba_2"],
    },
  },
} as const
