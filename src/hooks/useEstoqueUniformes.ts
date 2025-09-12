import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// Interface para estoque de uniformes
export interface EstoqueUniforme {
  id: string
  material_id: string
  codigo_material: string
  nome_item: string
  categoria: 'vestimenta' | 'equipamento' | 'identificacao'
  quantidade_disponivel: number
  quantidade_minima: number
  tamanhos_disponiveis: string[]
  localizacao_fisica?: string
  data_validade?: string
  lote?: string
  observacoes?: string
  created_at: string
  updated_at: string
}

// Interface para validação de disponibilidade
export interface ValidacaoEstoque {
  item: string
  disponivel: boolean
  quantidade_atual: number
  quantidade_minima: number
  status: 'disponivel' | 'estoque_baixo' | 'indisponivel' | 'vencido'
  observacoes?: string
}

// Mapeamento dos itens de uniforme para códigos de material
const ITENS_UNIFORME_CODIGOS = {
  gandolas_bombeiro: 'UNI-GAND-001',
  calcas_bombeiro: 'UNI-CALC-001', 
  cinto_bombeiro: 'UNI-CINT-001',
  bota_seguranca: 'UNI-BOOT-001',
  camisas_bombeiro: 'UNI-CAM-001',
  bermudas_bombeiro: 'UNI-BERM-001',
  tarjeta_identificacao: 'UNI-TARJ-001',
  oculos_protetor: 'EPI-OCUL-001'
}

// Hook para buscar estoque de uniformes (simulado baseado em dados reais)
export function useEstoqueUniformes() {
  return useQuery({
    queryKey: ['estoque-uniformes'],
    queryFn: async () => {
      // Como não há estoque de almoxarifado, vamos simular baseado nos dados reais
      const estoqueSimulado: EstoqueUniforme[] = [
        {
          id: '1',
          material_id: 'mat-1',
          codigo_material: 'UNI-GAND-001',
          nome_item: 'Gandolas de Bombeiro',
          categoria: 'vestimenta',
          quantidade_disponivel: 45,
          quantidade_minima: 20,
          tamanhos_disponiveis: ['P', 'M', 'G', 'GG'],
          localizacao_fisica: 'Almoxarifado Central',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          material_id: 'mat-2',
          codigo_material: 'UNI-CALC-001',
          nome_item: 'Calças de Bombeiro',
          categoria: 'vestimenta',
          quantidade_disponivel: 38,
          quantidade_minima: 15,
          tamanhos_disponiveis: ['P', 'M', 'G', 'GG'],
          localizacao_fisica: 'Almoxarifado Central',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          material_id: 'mat-3',
          codigo_material: 'UNI-CINT-001',
          nome_item: 'Cinto de Bombeiro',
          categoria: 'equipamento',
          quantidade_disponivel: 52,
          quantidade_minima: 25,
          tamanhos_disponiveis: ['P', 'M', 'G'],
          localizacao_fisica: 'Almoxarifado Central',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          material_id: 'mat-4',
          codigo_material: 'UNI-BOOT-001',
          nome_item: 'Bota de Segurança',
          categoria: 'equipamento',
          quantidade_disponivel: 28,
          quantidade_minima: 20,
          tamanhos_disponiveis: ['38', '39', '40', '41', '42', '43', '44'],
          localizacao_fisica: 'Almoxarifado Central',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '5',
          material_id: 'mat-5',
          codigo_material: 'UNI-CAM-001',
          nome_item: 'Camisas de Bombeiro',
          categoria: 'vestimenta',
          quantidade_disponivel: 15,
          quantidade_minima: 30,
          tamanhos_disponiveis: ['P', 'M', 'G', 'GG'],
          localizacao_fisica: 'Almoxarifado Central',
          observacoes: 'Estoque baixo - necessário reposição',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '6',
          material_id: 'mat-6',
          codigo_material: 'UNI-BERM-001',
          nome_item: 'Bermudas de Bombeiro',
          categoria: 'vestimenta',
          quantidade_disponivel: 42,
          quantidade_minima: 20,
          tamanhos_disponiveis: ['P', 'M', 'G', 'GG'],
          localizacao_fisica: 'Almoxarifado Central',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '7',
          material_id: 'mat-7',
          codigo_material: 'UNI-TARJ-001',
          nome_item: 'Tarjeta de Identificação',
          categoria: 'identificacao',
          quantidade_disponivel: 8,
          quantidade_minima: 15,
          tamanhos_disponiveis: ['Único'],
          localizacao_fisica: 'Almoxarifado Central',
          observacoes: 'Estoque crítico - reposição urgente',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '8',
          material_id: 'mat-8',
          codigo_material: 'EPI-OCUL-001',
          nome_item: 'Óculos de Proteção/Protetor Auricular',
          categoria: 'equipamento',
          quantidade_disponivel: 35,
          quantidade_minima: 25,
          tamanhos_disponiveis: ['Único'],
          localizacao_fisica: 'Almoxarifado Central',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      
      return estoqueSimulado
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
    staleTime: 10000 // Considera dados obsoletos após 10 segundos
  })
}

// Hook para validar disponibilidade de uniformes em tempo real
export function useValidacaoEstoqueUniformes(itensNecessarios: string[]) {
  const { data: estoque, isLoading } = useEstoqueUniformes()
  
  return useQuery({
    queryKey: ['validacao-estoque-uniformes', itensNecessarios],
    queryFn: async () => {
      if (!estoque || !itensNecessarios.length) return []
      
      const validacoes: ValidacaoEstoque[] = []
      const dataAtual = new Date()
      
      for (const item of itensNecessarios) {
        const codigoMaterial = ITENS_UNIFORME_CODIGOS[item as keyof typeof ITENS_UNIFORME_CODIGOS]
        const itemEstoque = estoque.find(e => e.codigo_material === codigoMaterial)
        
        if (!itemEstoque) {
          validacoes.push({
            item,
            disponivel: false,
            quantidade_atual: 0,
            quantidade_minima: 0,
            status: 'indisponivel',
            observacoes: 'Item não encontrado no estoque'
          })
          continue
        }
        
        // Verificar se está vencido
        const isVencido = itemEstoque.data_validade && 
          new Date(itemEstoque.data_validade) < dataAtual
        
        let status: ValidacaoEstoque['status'] = 'disponivel'
        let observacoes = ''
        
        if (isVencido) {
          status = 'vencido'
          observacoes = 'Item vencido'
        } else if (itemEstoque.quantidade_disponivel <= 0) {
          status = 'indisponivel'
          observacoes = 'Sem estoque disponível'
        } else if (itemEstoque.quantidade_disponivel <= itemEstoque.quantidade_minima) {
          status = 'estoque_baixo'
          observacoes = 'Estoque abaixo do mínimo'
        }
        
        validacoes.push({
          item,
          disponivel: status === 'disponivel' || status === 'estoque_baixo',
          quantidade_atual: itemEstoque.quantidade_disponivel,
          quantidade_minima: itemEstoque.quantidade_minima,
          status,
          observacoes
        })
      }
      
      return validacoes
    },
    enabled: !!estoque && !isLoading && itensNecessarios.length > 0,
    refetchInterval: 30000
  })
}

// Hook para alertas de estoque de uniformes
export function useAlertasEstoqueUniformes() {
  const { data: estoque } = useEstoqueUniformes()
  
  return useQuery({
    queryKey: ['alertas-estoque-uniformes'],
    queryFn: async () => {
      if (!estoque) return { estoqueBaixo: [], vencimentoProximo: [], vencidos: [] }
      
      const dataAtual = new Date()
      const data30Dias = new Date()
      data30Dias.setDate(dataAtual.getDate() + 30)
      
      const alertas = {
        estoqueBaixo: estoque.filter(item => 
          item.quantidade_disponivel <= item.quantidade_minima
        ),
        vencimentoProximo: estoque.filter(item => {
          if (!item.data_validade) return false
          const dataVencimento = new Date(item.data_validade)
          return dataVencimento <= data30Dias && dataVencimento >= dataAtual
        }),
        vencidos: estoque.filter(item => {
          if (!item.data_validade) return false
          return new Date(item.data_validade) < dataAtual
        })
      }
      
      return alertas
    },
    enabled: !!estoque,
    refetchInterval: 60000 // Atualiza a cada minuto
  })
}

// Hook para histórico de distribuição de uniformes por bombeiro
export function useHistoricoDistribuicaoUniformes(bombeiroNome: string) {
  return useQuery({
    queryKey: ['historico-distribuicao-uniformes', bombeiroNome],
    queryFn: async () => {
      if (!bombeiroNome) return []
      
      const { data, error } = await supabase
        .from('epis_uniformes_distribuicao')
        .select(`
          *,
          materiais:material_id (
            codigo_material,
            nome,
            categoria
          )
        `)
        .eq('bombeiro_nome', bombeiroNome)
        .order('data_distribuicao', { ascending: false })
      
      if (error) {
        console.error('Erro ao buscar histórico de distribuição:', error)
        throw error
      }
      
      return data || []
    },
    enabled: !!bombeiroNome
  })
}