import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { CheckCircle, XCircle, Clock, ArrowLeft, ArrowRight, Users, FileText, AlertTriangle } from 'lucide-react'
import { useCreateTPVerificacaoUniformes, useUpdateTPVerificacaoUniformes, type TPVerificacaoUniformes } from '@/hooks/useTPVerificacoesUniformes'
import { toast } from 'sonner'

type VerificacaoStatus = 'conforme' | 'nao_conforme' | 'nao_verificado'

interface FormData {
  data_verificacao: string
  local: string
  responsavel: string
  equipe: 'Alfa' | 'Bravo' | 'Charlie' | 'Delta' | ''
}

interface CategoriaVerificacao {
  id: string
  nome: string
  perguntas: {
    id: string
    texto: string
    status: VerificacaoStatus
    membrosAfetados: string[]
    observacoes: string
  }[]
}

interface HistoricoVerificacao {
  id: string
  data: string
  equipe: string
  responsavel: string
  status: string
  percentualConformidade: number
  totalConformes: number
  totalNaoConformes: number
  totalNaoVerificados: number
}

interface TPUniformesVerificacaoFormProps {
  verificacaoExistente?: TPVerificacaoUniformes
  onSalvar?: (verificacao: TPVerificacaoUniformes) => void
}

const EQUIPES = {
  Alfa: ['João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa'],
  Bravo: ['Carlos Lima', 'Lucia Ferreira', 'Roberto Alves', 'Fernanda Souza'],
  Charlie: ['Marcos Pereira', 'Julia Rodrigues', 'Antonio Barbosa', 'Camila Martins'],
  Delta: ['Rafael Gomes', 'Beatriz Carvalho', 'Eduardo Nascimento', 'Patrícia Dias']
}

const RESPONSAVEIS = [
  { nome: 'João Silva', cargo: 'Supervisor de Operações' },
  { nome: 'Maria Santos', cargo: 'Coordenadora de Segurança' },
  { nome: 'Pedro Oliveira', cargo: 'Chefe de Equipe' },
  { nome: 'Ana Costa', cargo: 'Inspetora de Qualidade' }
]

function TPUniformesVerificacaoForm({ verificacaoExistente, onSalvar }: TPUniformesVerificacaoFormProps) {
  const [etapaAtual, setEtapaAtual] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [membrosEquipeSelecionada, setMembrosEquipeSelecionada] = useState<string[]>([])
  const [modalNaoConformidade, setModalNaoConformidade] = useState<{
    aberto: boolean
    perguntaId: string
    categoriaId: string
  }>({ aberto: false, perguntaId: '', categoriaId: '' })
  
  const createMutation = useCreateTPVerificacaoUniformes()
  const updateMutation = useUpdateTPVerificacaoUniformes()
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      data_verificacao: new Date().toISOString().split('T')[0],
      local: 'Santa Genoveva - GYN',
      responsavel: '',
      equipe: ''
    }
  })
  
  const equipeSelecionada = watch('equipe')
  
  const [categorias, setCategorias] = useState<CategoriaVerificacao[]>([
    {
      id: 'uniformes',
      nome: 'Uniformes',
      perguntas: [
        {
          id: 'gandolas',
          texto: 'COLABORADOR POSSUI 2 GANDOLAS DE BOMBEIRO DE AERODROMO',
          status: 'nao_verificado',
          membrosAfetados: [],
          observacoes: ''
        },
        {
          id: 'calcas',
          texto: 'COLABORADOR POSSUI 2 CALÇAS DE BOMBEIRO DE AERODROMO',
          status: 'nao_verificado',
          membrosAfetados: [],
          observacoes: ''
        },
        {
          id: 'cinto',
          texto: 'COLABORADOR POSSUI 1 CINTO DE BOMBEIRO DE AERODROMO',
          status: 'nao_verificado',
          membrosAfetados: [],
          observacoes: ''
        },
        {
          id: 'bota',
          texto: 'COLABORADOR POSSUI BOTA DE SEGURANÇA DE BOMBEIRO DE AERODROMO',
          status: 'nao_verificado',
          membrosAfetados: [],
          observacoes: ''
        },
        {
          id: 'camisas',
          texto: 'COLABORADOR POSSUI 4 CAMISAS DE BOMBEIRO DE AERODROMO',
          status: 'nao_verificado',
          membrosAfetados: [],
          observacoes: ''
        },
        {
          id: 'bermudas',
          texto: 'COLABORADOR POSSUI 2 BERMUDAS DE BOMBEIRO DE AERODROMO',
          status: 'nao_verificado',
          membrosAfetados: [],
          observacoes: ''
        },
        {
          id: 'tarjeta',
          texto: 'COLABORADOR POSSUI TARJETA DE NOME/FUNÇÃO/NUMERAÇÃO FRENTE E COSTAS',
          status: 'nao_verificado',
          membrosAfetados: [],
          observacoes: ''
        },
        {
          id: 'oculos',
          texto: 'COLABORADOR POSSUI ÓCULOS DE PROTEÇÃO/PROTETOR AURICULAR',
          status: 'nao_verificado',
          membrosAfetados: [],
          observacoes: ''
        }
      ]
    }
  ])
  
  // Atualizar membros da equipe quando equipe for selecionada
  useEffect(() => {
    if (equipeSelecionada && equipeSelecionada !== '') {
      setMembrosEquipeSelecionada(EQUIPES[equipeSelecionada] || [])
    } else {
      setMembrosEquipeSelecionada([])
    }
  }, [equipeSelecionada])
  
  // Carregar dados da verificação existente
  useEffect(() => {
    if (verificacaoExistente) {
      setValue('data_verificacao', verificacaoExistente.data_verificacao.split('T')[0])
      setValue('local', verificacaoExistente.local)
      setValue('responsavel', verificacaoExistente.responsavel)
      setValue('equipe', verificacaoExistente.equipe)
      setEtapaAtual(verificacaoExistente.etapa_atual)
      
      // Carregar status das perguntas
      const novasCategorias = [...categorias]
      const categoria = novasCategorias[0]
      
      categoria.perguntas[0].status = verificacaoExistente.cat1_gandolas || 'nao_verificado'
      categoria.perguntas[0].membrosAfetados = verificacaoExistente.cat1_gandolas_membros || []
      categoria.perguntas[0].observacoes = verificacaoExistente.cat1_gandolas_observacoes || ''
      
      categoria.perguntas[1].status = verificacaoExistente.cat1_calcas || 'nao_verificado'
      categoria.perguntas[1].membrosAfetados = verificacaoExistente.cat1_calcas_membros || []
      categoria.perguntas[1].observacoes = verificacaoExistente.cat1_calcas_observacoes || ''
      
      categoria.perguntas[2].status = verificacaoExistente.cat1_cinto || 'nao_verificado'
      categoria.perguntas[2].membrosAfetados = verificacaoExistente.cat1_cinto_membros || []
      categoria.perguntas[2].observacoes = verificacaoExistente.cat1_cinto_observacoes || ''
      
      categoria.perguntas[3].status = verificacaoExistente.cat1_bota || 'nao_verificado'
      categoria.perguntas[3].membrosAfetados = verificacaoExistente.cat1_bota_membros || []
      categoria.perguntas[3].observacoes = verificacaoExistente.cat1_bota_observacoes || ''
      
      categoria.perguntas[4].status = verificacaoExistente.cat1_camisas || 'nao_verificado'
      categoria.perguntas[4].membrosAfetados = verificacaoExistente.cat1_camisas_membros || []
      categoria.perguntas[4].observacoes = verificacaoExistente.cat1_camisas_observacoes || ''
      
      categoria.perguntas[5].status = verificacaoExistente.cat1_bermudas || 'nao_verificado'
      categoria.perguntas[5].membrosAfetados = verificacaoExistente.cat1_bermudas_membros || []
      categoria.perguntas[5].observacoes = verificacaoExistente.cat1_bermudas_observacoes || ''
      
      categoria.perguntas[6].status = verificacaoExistente.cat1_tarjeta || 'nao_verificado'
      categoria.perguntas[6].membrosAfetados = verificacaoExistente.cat1_tarjeta_membros || []
      categoria.perguntas[6].observacoes = verificacaoExistente.cat1_tarjeta_observacoes || ''
      
      categoria.perguntas[7].status = verificacaoExistente.cat1_oculos || 'nao_verificado'
      categoria.perguntas[7].membrosAfetados = verificacaoExistente.cat1_oculos_membros || []
      categoria.perguntas[7].observacoes = verificacaoExistente.cat1_oculos_observacoes || ''
      
      setCategorias(novasCategorias)
    }
  }, [verificacaoExistente])
  
  const marcarResposta = (categoriaId: string, perguntaId: string, status: VerificacaoStatus) => {
    if (status === 'nao_conforme') {
      setModalNaoConformidade({ aberto: true, perguntaId, categoriaId })
      return
    }
    
    setCategorias(prev => prev.map(categoria => {
      if (categoria.id === categoriaId) {
        return {
          ...categoria,
          perguntas: categoria.perguntas.map(pergunta => {
            if (pergunta.id === perguntaId) {
              return {
                ...pergunta,
                status,
                membrosAfetados: status === 'conforme' ? [] : pergunta.membrosAfetados,
                observacoes: status === 'conforme' ? '' : pergunta.observacoes
              }
            }
            return pergunta
          })
        }
      }
      return categoria
    }))
  }
  
  const confirmarNaoConformidade = (membrosAfetados: string[], observacoes: string) => {
    const { categoriaId, perguntaId } = modalNaoConformidade
    
    setCategorias(prev => prev.map(categoria => {
      if (categoria.id === categoriaId) {
        return {
          ...categoria,
          perguntas: categoria.perguntas.map(pergunta => {
            if (pergunta.id === perguntaId) {
              return {
                ...pergunta,
                status: 'nao_conforme' as VerificacaoStatus,
                membrosAfetados,
                observacoes
              }
            }
            return pergunta
          })
        }
      }
      return categoria
    }))
    
    setModalNaoConformidade({ aberto: false, perguntaId: '', categoriaId: '' })
  }
  
  const calcularEstatisticas = () => {
    const todasPerguntas = categorias.flatMap(cat => cat.perguntas)
    const conformes = todasPerguntas.filter(p => p.status === 'conforme').length
    const naoConformes = todasPerguntas.filter(p => p.status === 'nao_conforme').length
    const naoVerificados = todasPerguntas.filter(p => p.status === 'nao_verificado').length
    const percentual = todasPerguntas.length > 0 ? (conformes / todasPerguntas.length) * 100 : 0
    
    return { conformes, naoConformes, naoVerificados, percentual }
  }
  
  const resetFormulario = () => {
    setEtapaAtual(1)
    setValue('data_verificacao', new Date().toISOString().split('T')[0])
    setValue('local', 'Santa Genoveva - GYN')
    setValue('responsavel', '')
    setValue('equipe', '')
    setMembrosEquipeSelecionada([])
    
    setCategorias(prev => prev.map(categoria => ({
      ...categoria,
      perguntas: categoria.perguntas.map(pergunta => ({
        ...pergunta,
        status: 'nao_verificado' as VerificacaoStatus,
        membrosAfetados: [],
        observacoes: ''
      }))
    })))
  }
  
  const salvarVerificacao = async (formData: FormData) => {
    if (!formData.equipe || !formData.responsavel) {
      toast.error('Por favor, preencha todos os campos obrigatórios')
      return
    }
    
    setIsSaving(true)
    
    try {
      const stats = calcularEstatisticas()
      const categoria = categorias[0]
      
      const dadosVerificacao = {
        data_verificacao: formData.data_verificacao,
        local: formData.local,
        responsavel: formData.responsavel,
        equipe: formData.equipe,
        membros_equipe: membrosEquipeSelecionada,
        status: 'concluida' as const,
        etapa_atual: etapaAtual,
        total_conformes: stats.conformes,
        total_nao_conformes: stats.naoConformes,
        total_nao_verificados: stats.naoVerificados,
        percentual_conformidade: stats.percentual,
        
        // Mapear perguntas para colunas da tabela
        cat1_gandolas: categoria.perguntas[0].status,
        cat1_gandolas_membros: categoria.perguntas[0].membrosAfetados,
        cat1_gandolas_observacoes: categoria.perguntas[0].observacoes,
        
        cat1_calcas: categoria.perguntas[1].status,
        cat1_calcas_membros: categoria.perguntas[1].membrosAfetados,
        cat1_calcas_observacoes: categoria.perguntas[1].observacoes,
        
        cat1_cinto: categoria.perguntas[2].status,
        cat1_cinto_membros: categoria.perguntas[2].membrosAfetados,
        cat1_cinto_observacoes: categoria.perguntas[2].observacoes,
        
        cat1_bota: categoria.perguntas[3].status,
        cat1_bota_membros: categoria.perguntas[3].membrosAfetados,
        cat1_bota_observacoes: categoria.perguntas[3].observacoes,
        
        cat1_camisas: categoria.perguntas[4].status,
        cat1_camisas_membros: categoria.perguntas[4].membrosAfetados,
        cat1_camisas_observacoes: categoria.perguntas[4].observacoes,
        
        cat1_bermudas: categoria.perguntas[5].status,
        cat1_bermudas_membros: categoria.perguntas[5].membrosAfetados,
        cat1_bermudas_observacoes: categoria.perguntas[5].observacoes,
        
        cat1_tarjeta: categoria.perguntas[6].status,
        cat1_tarjeta_membros: categoria.perguntas[6].membrosAfetados,
        cat1_tarjeta_observacoes: categoria.perguntas[6].observacoes,
        
        cat1_oculos: categoria.perguntas[7].status,
        cat1_oculos_membros: categoria.perguntas[7].membrosAfetados,
        cat1_oculos_observacoes: categoria.perguntas[7].observacoes
      }
      
      if (verificacaoExistente) {
        const resultado = await updateMutation.mutateAsync({
          id: verificacaoExistente.id,
          ...dadosVerificacao
        })
        onSalvar?.(resultado)
      } else {
        const resultado = await createMutation.mutateAsync(dadosVerificacao)
        onSalvar?.(resultado)
      }
      
      toast.success('Verificação de uniformes salva com sucesso!')
      resetFormulario()
      
    } catch (error) {
      console.error('Erro ao salvar verificação:', error)
      toast.error('Erro ao salvar verificação de uniformes')
    } finally {
      setIsSaving(false)
    }
  }
  
  const stats = calcularEstatisticas()
  const progressoGeral = (stats.conformes + stats.naoConformes) / (stats.conformes + stats.naoConformes + stats.naoVerificados) * 100
  
  return (
    <div className="space-y-6">
      {/* Cabeçalho com Progresso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Verificação de Uniformes</span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  etapaAtual >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>1</div>
                <div className={`w-12 h-1 ${
                  etapaAtual >= 2 ? 'bg-blue-500' : 'bg-gray-200'
                }`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  etapaAtual >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>2</div>
                <div className={`w-12 h-1 ${
                  etapaAtual >= 3 ? 'bg-blue-500' : 'bg-gray-200'
                }`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  etapaAtual >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>3</div>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>
      
      {/* Etapa 1: Informações Básicas */}
      {etapaAtual === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Informações Básicas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_verificacao">Data da Verificação</Label>
                <Input
                  id="data_verificacao"
                  type="date"
                  {...register('data_verificacao', { required: 'Data é obrigatória' })}
                />
                {errors.data_verificacao && (
                  <p className="text-sm text-red-500 mt-1">{errors.data_verificacao.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="local">Local</Label>
                <Input
                  id="local"
                  {...register('local', { required: 'Local é obrigatório' })}
                />
                {errors.local && (
                  <p className="text-sm text-red-500 mt-1">{errors.local.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="responsavel">Responsável</Label>
              <Select onValueChange={(value) => setValue('responsavel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {RESPONSAVEIS.map((resp) => (
                    <SelectItem key={resp.nome} value={resp.nome}>
                      {resp.nome} - {resp.cargo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.responsavel && (
                <p className="text-sm text-red-500 mt-1">{errors.responsavel.message}</p>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={() => setEtapaAtual(2)}
                disabled={!watch('responsavel')}
                className="flex items-center space-x-2"
              >
                <span>Iniciar Verificação</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Etapa 2: Seleção de Equipe */}
      {etapaAtual === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Seleção de Equipe</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.keys(EQUIPES).map((equipe) => (
                <Card 
                  key={equipe}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    equipeSelecionada === equipe ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setValue('equipe', equipe as any)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-lg font-bold text-blue-600">{equipe}</div>
                    <div className="text-sm text-gray-500">
                      {EQUIPES[equipe as keyof typeof EQUIPES].length} membros
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {equipeSelecionada && membrosEquipeSelecionada.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Membros da Equipe {equipeSelecionada}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {membrosEquipeSelecionada.map((membro) => (
                    <div key={membro} className="bg-gray-100 p-3 rounded-lg text-center">
                      <div className="font-medium">{membro}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setEtapaAtual(1)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </Button>
              
              <Button 
                onClick={() => setEtapaAtual(3)}
                disabled={!equipeSelecionada}
                className="flex items-center space-x-2"
              >
                <span>Continuar</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Etapa 3: Verificação por Categorias */}
      {etapaAtual === 3 && (
        <div className="space-y-6">
          {/* Painel de Estatísticas */}
          <Card>
            <CardHeader>
              <CardTitle>Progresso da Verificação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.conformes}</div>
                  <div className="text-sm text-gray-500">Conformes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.naoConformes}</div>
                  <div className="text-sm text-gray-500">Não Conformes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{stats.naoVerificados}</div>
                  <div className="text-sm text-gray-500">Não Verificados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.percentual.toFixed(1)}%</div>
                  <div className="text-sm text-gray-500">Conformidade</div>
                </div>
              </div>
              <Progress value={progressoGeral} className="h-2" />
            </CardContent>
          </Card>
          
          {/* Cards de Verificação */}
          {categorias.map((categoria) => (
            <Card key={categoria.id}>
              <CardHeader>
                <CardTitle>{categoria.nome}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoria.perguntas.map((pergunta) => (
                  <div key={pergunta.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-medium">{pergunta.texto}</p>
                        {pergunta.status === 'nao_conforme' && pergunta.membrosAfetados.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">Membros afetados:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {pergunta.membrosAfetados.map((membro) => (
                                <Badge key={membro} variant="destructive" className="text-xs">
                                  {membro}
                                </Badge>
                              ))}
                            </div>
                            {pergunta.observacoes && (
                              <p className="text-sm text-gray-600 mt-2">
                                <strong>Observações:</strong> {pergunta.observacoes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {pergunta.status === 'conforme' && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {pergunta.status === 'nao_conforme' && <XCircle className="h-5 w-5 text-red-500" />}
                        {pergunta.status === 'nao_verificado' && <Clock className="h-5 w-5 text-gray-400" />}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant={pergunta.status === 'conforme' ? 'default' : 'outline'}
                        onClick={() => marcarResposta(categoria.id, pergunta.id, 'conforme')}
                        className={`flex items-center space-x-1 ${
                          pergunta.status === 'conforme' ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50'
                        }`}
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>CONFORME</span>
                      </Button>
                      
                      <Button
                        size="sm"
                        variant={pergunta.status === 'nao_conforme' ? 'destructive' : 'outline'}
                        onClick={() => marcarResposta(categoria.id, pergunta.id, 'nao_conforme')}
                        className="flex items-center space-x-1"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>NÃO CONFORME</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
          
          {/* Botões de Navegação */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setEtapaAtual(2)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
            
            <Button 
              onClick={handleSubmit(salvarVerificacao)}
              disabled={isSaving || stats.naoVerificados > 0}
              className="flex items-center space-x-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Finalizar Verificação</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
      
      {/* Modal de Não Conformidade */}
      <ModalNaoConformidade
        aberto={modalNaoConformidade.aberto}
        membrosEquipe={membrosEquipeSelecionada}
        onConfirmar={confirmarNaoConformidade}
        onCancelar={() => setModalNaoConformidade({ aberto: false, perguntaId: '', categoriaId: '' })}
      />
    </div>
  )
}

export default TPUniformesVerificacaoForm

// Componente Modal de Não Conformidade
interface ModalNaoConformidadeProps {
  aberto: boolean
  membrosEquipe: string[]
  onConfirmar: (membrosAfetados: string[], observacoes: string) => void
  onCancelar: () => void
}

function ModalNaoConformidade({ aberto, membrosEquipe, onConfirmar, onCancelar }: ModalNaoConformidadeProps) {
  const [membrosAfetados, setMembrosAfetados] = useState<string[]>([])
  const [observacoes, setObservacoes] = useState('')
  
  const handleConfirmar = () => {
    onConfirmar(membrosAfetados, observacoes)
    setMembrosAfetados([])
    setObservacoes('')
  }
  
  const handleCancelar = () => {
    onCancelar()
    setMembrosAfetados([])
    setObservacoes('')
  }
  
  const toggleMembro = (membro: string) => {
    setMembrosAfetados(prev => 
      prev.includes(membro) 
        ? prev.filter(m => m !== membro)
        : [...prev, membro]
    )
  }
  
  return (
    <Dialog open={aberto} onOpenChange={handleCancelar}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>Registrar Não Conformidade</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Membros Afetados (opcional)</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {membrosEquipe.map((membro) => (
                <div key={membro} className="flex items-center space-x-2">
                  <Checkbox
                    id={membro}
                    checked={membrosAfetados.includes(membro)}
                    onCheckedChange={() => toggleMembro(membro)}
                  />
                  <Label htmlFor={membro} className="text-sm">{membro}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <Label htmlFor="observacoes" className="text-sm font-medium">Observações (opcional)</Label>
            <Textarea
              id="observacoes"
              placeholder="Descreva o problema encontrado..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancelar}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmar} className="bg-red-600 hover:bg-red-700">
              Confirmar Não Conformidade
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}