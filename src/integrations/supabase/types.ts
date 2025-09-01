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
          nome_completo: string | null
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
          nome_completo?: string | null
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
          nome_completo?: string | null
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
          hora_checklist: string
          id: string
          itens_checklist: Json
          observacoes_gerais: string | null
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
          created_at: string | null
          data_teste: string
          faixa_etaria: string
          flexoes_realizadas: number
          id: string
          idade_na_data: number
          observacoes: string | null
          polichinelos_realizados: number
          tempo_limite_minutos: number
          tempo_total_segundos: number
          updated_at: string | null
        }
        Insert: {
          abdominais_realizadas?: number
          aprovado?: boolean
          avaliador_nome: string
          bombeiro_id: string
          created_at?: string | null
          data_teste?: string
          faixa_etaria: string
          flexoes_realizadas?: number
          id?: string
          idade_na_data: number
          observacoes?: string | null
          polichinelos_realizados?: number
          tempo_limite_minutos: number
          tempo_total_segundos: number
          updated_at?: string | null
        }
        Update: {
          abdominais_realizadas?: number
          aprovado?: boolean
          avaliador_nome?: string
          bombeiro_id?: string
          created_at?: string | null
          data_teste?: string
          faixa_etaria?: string
          flexoes_realizadas?: number
          id?: string
          idade_na_data?: number
          observacoes?: string | null
          polichinelos_realizados?: number
          tempo_limite_minutos?: number
          tempo_total_segundos?: number
          updated_at?: string | null
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
          base: string
          created_at: string | null
          data_verificacao: string
          equipe_id: string | null
          id: string
          mes_referencia: number
          observacoes: string | null
          responsavel_id: string | null
          responsavel_nome: string
          total_verificados: number
          tp_conformes: number
          tp_nao_conformes: number
          updated_at: string | null
        }
        Insert: {
          ano_referencia: number
          base: string
          created_at?: string | null
          data_verificacao?: string
          equipe_id?: string | null
          id?: string
          mes_referencia: number
          observacoes?: string | null
          responsavel_id?: string | null
          responsavel_nome: string
          total_verificados?: number
          tp_conformes?: number
          tp_nao_conformes?: number
          updated_at?: string | null
        }
        Update: {
          ano_referencia?: number
          base?: string
          created_at?: string | null
          data_verificacao?: string
          equipe_id?: string | null
          id?: string
          mes_referencia?: number
          observacoes?: string | null
          responsavel_id?: string | null
          responsavel_nome?: string
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
      viaturas: {
        Row: {
          created_at: string
          id: string
          modelo: string
          nome_viatura: string
          observacoes: string | null
          prefixo: string
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
