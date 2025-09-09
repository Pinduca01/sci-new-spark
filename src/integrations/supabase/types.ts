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
          {
            foreignKeyName: "agentes_extintores_controle_viatura_id_fkey"
            columns: ["viatura_id"]
            isOneToOne: false
            referencedRelation: "viaturas"
            referencedColumns: ["id"]
          },
        ]
      }
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
          {
            foreignKeyName: "equipamentos_estoque_viatura_id_fkey"
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
            foreignKeyName: "historico_recargas_agentes_viatura_id_fkey"
            columns: ["viatura_id"]
            isOneToOne: false
            referencedRelation: "viaturas"
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
          {
            foreignKeyName: "materiais_viaturas_viatura_id_fkey"
            columns: ["viatura_id"]
            isOneToOne: false
            referencedRelation: "viaturas"
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
          updated_at: string
        }
        Insert: {
          bombeiro_id: string
          created_at?: string
          id?: string
          observacoes?: string | null
          presente?: boolean | null
          ptr_instrucao_id: string
          updated_at?: string
        }
        Update: {
          bombeiro_id?: string
          created_at?: string
          id?: string
          observacoes?: string | null
          presente?: boolean | null
          ptr_instrucao_id?: string
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
          {
            foreignKeyName: "qr_checklists_viatura_id_fkey"
            columns: ["viatura_id"]
            isOneToOne: false
            referencedRelation: "viaturas"
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
          faixa_etaria: string
          flexoes_realizadas: number
          id: string
          idade_na_data: number
          observacoes: string | null
          polichinelos_realizados: number
          tempo_limite_minutos: number
          tempo_total_segundos: number
          updated_at: string
        }
        Insert: {
          abdominais_realizadas: number
          aprovado?: boolean
          avaliador_nome?: string
          bombeiro_id: string
          created_at?: string
          data_teste?: string
          faixa_etaria?: string
          flexoes_realizadas: number
          id?: string
          idade_na_data?: number
          observacoes?: string | null
          polichinelos_realizados: number
          tempo_limite_minutos?: number
          tempo_total_segundos?: number
          updated_at?: string
        }
        Update: {
          abdominais_realizadas?: number
          aprovado?: boolean
          avaliador_nome?: string
          bombeiro_id?: string
          created_at?: string
          data_teste?: string
          faixa_etaria?: string
          flexoes_realizadas?: number
          id?: string
          idade_na_data?: number
          observacoes?: string | null
          polichinelos_realizados?: number
          tempo_limite_minutos?: number
          tempo_total_segundos?: number
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
        ]
      }
      tp_verificacoes: {
        Row: {
          ano_referencia: number
          assinatura_digital: Json | null
          base: string
          created_at: string | null
          data_verificacao: string
          documento_enviado: boolean | null
          equipe_id: string | null
          id: string
          mes_referencia: number
          observacoes: string | null
          responsavel_id: string | null
          responsavel_nome: string
          status_assinatura: string | null
          total_verificados: number
          tp_conformes: number
          tp_nao_conformes: number
          updated_at: string | null
        }
        Insert: {
          ano_referencia: number
          assinatura_digital?: Json | null
          base: string
          created_at?: string | null
          data_verificacao?: string
          documento_enviado?: boolean | null
          equipe_id?: string | null
          id?: string
          mes_referencia: number
          observacoes?: string | null
          responsavel_id?: string | null
          responsavel_nome: string
          status_assinatura?: string | null
          total_verificados?: number
          tp_conformes?: number
          tp_nao_conformes?: number
          updated_at?: string | null
        }
        Update: {
          ano_referencia?: number
          assinatura_digital?: Json | null
          base?: string
          created_at?: string | null
          data_verificacao?: string
          documento_enviado?: boolean | null
          equipe_id?: string | null
          id?: string
          mes_referencia?: number
          observacoes?: string | null
          responsavel_id?: string | null
          responsavel_nome?: string
          status_assinatura?: string | null
          total_verificados?: number
          tp_conformes?: number
          tp_nao_conformes?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tp_verificacoes_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tp_verificacoes_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "bombeiros"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "trocas_plantao_bombeiro_substituto_id_fkey"
            columns: ["bombeiro_substituto_id"]
            isOneToOne: false
            referencedRelation: "bombeiros"
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
        ]
      }
      viaturas: {
        Row: {
          created_at: string
          id: string
          modelo: string
          nome_viatura: string
          observacoes: string | null
          prefixo: string
          qr_code: string | null
          status: string
          tipo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          modelo: string
          nome_viatura: string
          observacoes?: string | null
          prefixo: string
          qr_code?: string | null
          status?: string
          tipo?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          modelo?: string
          nome_viatura?: string
          observacoes?: string | null
          prefixo?: string
          qr_code?: string | null
          status?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
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
          item: string | null
          nao_conformes: number | null
          percentual_problemas: number | null
          total: number | null
        }
        Relationships: []
      }
      vw_uniformes_ranking_bombeiros: {
        Row: {
          base: string | null
          bombeiro_id: string | null
          bombeiro_nome: string | null
          media_conformidade: number | null
          total_aprovados: number | null
          total_verificacoes: number | null
          ultima_verificacao: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uniformes_bombeiro_id_fkey"
            columns: ["bombeiro_id"]
            isOneToOne: false
            referencedRelation: "bombeiros"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
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
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
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
      get_taf_historico: {
        Args:
          | { p_bombeiro_id: string }
          | { p_bombeiro_id: string; p_limite?: number }
        Returns: {
          abdominais_realizadas: number
          aprovado: boolean
          created_at: string
          data_teste: string
          flexoes_realizadas: number
          id: string
          observacoes: string
          polichinelos_realizados: number
          tempo_total_segundos: number
        }[]
      }
      nextval: {
        Args: { sequence_name: string }
        Returns: number
      }
      validate_checklist_itens: {
        Args: { itens_json: Json }
        Returns: boolean
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
