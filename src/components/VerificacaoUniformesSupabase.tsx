import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import BombeiroSelector from '@/components/BombeiroSelector'
import { BombeiroWithDetails } from '@/hooks/useBombeirosSearch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, XCircle, AlertTriangle, Clock, Shield, Users, BarChart3, Search, Plus, Eye } from 'lucide-react'
import { 
  useUniformesVerificacoes, 
  useCreateUniformeVerificacao, 
  useUniformesEstatisticas,
  useValidacaoUniformesBombeiro,
  useUniformesVerificacoesPorBombeiro,
  NovaVerificacaoUniforme,
  UniformeVerificacao
} from '@/hooks/useUniformesSupabase'
import { useToast } from '@/hooks/use-toast'
import { useBombeiros } from '@/hooks/useBombeiros'
import { useEquipes } from '@/hooks/useEquipes'
import { useBases } from '@/hooks/useBases'


// Constantes para equipes
const EQUIPES_PADRAO = ['Alfa', 'Bravo', 'Charlie', 'Delta']

// Interface para os itens de verificação
interface ItemVerificacao {
  key: keyof NovaVerificacaoUniforme
  label: string
  descricao: string
  obrigatorio: boolean
  categoria: 'vestimenta' | 'equipamento' | 'identificacao'
}

// Definição dos 8 itens obrigatórios
const ITENS_VERIFICACAO: ItemVerificacao[] = [
  {
    key: 'gandolas_bombeiro',
    label: '2 Gandolas de Bombeiro de Aeródromo',
    descricao: 'Gandolas em bom estado, sem rasgos ou manchas',
    obrigatorio: true,
    categoria: 'vestimenta'
  },
  {
    key: 'calcas_bombeiro',
    label: '2 Calças de Bombeiro de Aeródromo', 
    descricao: 'Calças em perfeito estado de conservação',
    obrigatorio: true,
    categoria: 'vestimenta'
  },
  {
    key: 'cinto_bombeiro',
    label: '1 Cinto de Bombeiro de Aeródromo',
    descricao: 'Cinto com fivela funcional e em bom estado',
    obrigatorio: true,
    categoria: 'vestimenta'
  },
  {
    key: 'bota_seguranca',
    label: 'Bota de Segurança de Bombeiro de Aeródromo',
    descricao: 'Botas com solado antiderrapante e bico de aço',
    obrigatorio: true,
    categoria: 'equipamento'
  },
  {
    key: 'camisas_bombeiro',
    label: '4 Camisas de Bombeiro de Aeródromo',
    descricao: 'Camisas limpas e em bom estado',
    obrigatorio: true,
    categoria: 'vestimenta'
  },
  {
    key: 'bermudas_bombeiro',
    label: '2 Bermudas de Bombeiro de Aeródromo',
    descricao: 'Bermudas em perfeito estado',
    obrigatorio: true,
    categoria: 'vestimenta'
  },
  {
    key: 'tarjeta_identificacao',
    label: 'Tarjeta de Nome/Função/Numeração',
    descricao: 'Tarjeta legível com informações atualizadas',
    obrigatorio: true,
    categoria: 'identificacao'
  },
  {
    key: 'oculos_protetor',
    label: 'Óculos de Proteção/Protetor Auricular',
    descricao: 'EPIs em perfeito funcionamento',
    obrigatorio: true,
    categoria: 'equipamento'
  }
]

export default function VerificacaoUniformesSupabase() {
  // Hooks para dados reais
  const { bombeiros, bombeirosAtivos, isLoading: loadingBombeiros } = useBombeiros()
  const { data: equipes, isLoading: loadingEquipes } = useEquipes()
  const { data: bases, isLoading: loadingBases } = useBases()
  
  const [abaSelecionada, setAbaSelecionada] = useState('nova-verificacao')
  const [bombeiroSelecionado, setBombeiroSelecionado] = useState('')
  const [buscarBombeiro, setBuscarBombeiro] = useState('')
  const [verificacaoSelecionada, setVerificacaoSelecionada] = useState<UniformeVerificacao | null>(null)
  const [responsavelSelecionado, setResponsavelSelecionado] = useState<BombeiroWithDetails | null>(null)
  
  // Estado do formulário de nova verificação
  const [novaVerificacao, setNovaVerificacao] = useState<NovaVerificacaoUniforme>({
    bombeiro_nome: '',
    base: '',
    mes_referencia: new Date().getMonth() + 1,
    ano_referencia: new Date().getFullYear(),
    responsavel_nome: '',
    equipe_selecionada: '',
    gandolas_bombeiro: 'CONFORME',
    calcas_bombeiro: 'CONFORME',
    cinto_bombeiro: 'CONFORME',
    bota_seguranca: 'CONFORME',
    camisas_bombeiro: 'CONFORME',
    bermudas_bombeiro: 'CONFORME',
    tarjeta_identificacao: 'CONFORME',
    oculos_protetor: 'CONFORME',
    observacoes_gerais: ''
  })
  
  // Hooks do Supabase
  const { data: verificacoes, isLoading: carregandoVerificacoes } = useUniformesVerificacoes()
  const { data: estatisticas, isLoading: carregandoEstatisticas } = useUniformesEstatisticas()
  const { data: validacaoBombeiro } = useValidacaoUniformesBombeiro(bombeiroSelecionado)
  const { data: historicoVerificacoes } = useUniformesVerificacoesPorBombeiro(buscarBombeiro)
  const criarVerificacao = useCreateUniformeVerificacao()
  const { toast } = useToast()
  
  // Calcular progresso da verificação atual
  const calcularProgresso = () => {
    const itensConformes = ITENS_VERIFICACAO.filter(item => 
      novaVerificacao[item.key] === 'CONFORME'
    ).length
    return Math.round((itensConformes / ITENS_VERIFICACAO.length) * 100)
  }
  
  // Atualizar item de verificação
  const atualizarItem = (key: keyof NovaVerificacaoUniforme, valor: any) => {
    setNovaVerificacao(prev => ({
      ...prev,
      [key]: valor
    }))
  }
  
  // Submeter nova verificação
  const submeterVerificacao = async () => {
    if (!novaVerificacao.bombeiro_nome || !novaVerificacao.base || !novaVerificacao.responsavel_nome) {
      toast({
        title: 'Erro de Validação',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive'
      })
      return
    }
    
    try {
      await criarVerificacao.mutateAsync(novaVerificacao)
      
      // Reset do formulário
      setNovaVerificacao({
        bombeiro_nome: '',
        base: '',
        mes_referencia: new Date().getMonth() + 1,
        ano_referencia: new Date().getFullYear(),
        responsavel_nome: '',
        gandolas_bombeiro: 'CONFORME',
        calcas_bombeiro: 'CONFORME',
        cinto_bombeiro: 'CONFORME',
        bota_seguranca: 'CONFORME',
        camisas_bombeiro: 'CONFORME',
        bermudas_bombeiro: 'CONFORME',
        tarjeta_identificacao: 'CONFORME',
        oculos_protetor: 'CONFORME',
        observacoes_gerais: ''
      })
      
      setAbaSelecionada('dashboard')
    } catch (error) {
      console.error('Erro ao criar verificação:', error)
    }
  }
  
  // Renderizar badge de status
  const renderStatusBadge = (status: string) => {
    const configs = {
      'APROVADO': { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      'REPROVADO': { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      'PENDENTE': { variant: 'secondary' as const, icon: AlertTriangle, color: 'text-yellow-600' }
    }
    
    const config = configs[status as keyof typeof configs] || configs.PENDENTE
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status}
      </Badge>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header com estatísticas em tempo real */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Verificações</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas?.totalVerificacoes || 0}</div>
            <p className="text-xs text-muted-foreground">Dados em tempo real</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Aprovação</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{estatisticas?.percentualAprovacao || 0}%</div>
            <p className="text-xs text-muted-foreground">{estatisticas?.aprovadas || 0} aprovadas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conformidade Média</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{estatisticas?.conformidadeMedia || 0}%</div>
            <p className="text-xs text-muted-foreground">Média geral</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens Não Conformes</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{estatisticas?.totalItensNaoConformes || 0}</div>
            <p className="text-xs text-muted-foreground">Requerem atenção</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs principais */}
      <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="nova-verificacao" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Verificação
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="validacao" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Validação
          </TabsTrigger>
          <TabsTrigger value="historico" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>
        
        {/* Aba Nova Verificação */}
        <TabsContent value="nova-verificacao" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Nova Verificação de Uniformes
              </CardTitle>
              <CardDescription>
                Realize uma nova verificação de uniformes com dados em tempo real do Supabase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informações básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bombeiro-nome">Nome do Bombeiro *</Label>
                  <Select value={novaVerificacao.bombeiro_nome} onValueChange={(value) => atualizarItem('bombeiro_nome', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingBombeiros ? "Carregando..." : "Selecione o bombeiro"} />
                    </SelectTrigger>
                    <SelectContent>
                      {bombeirosAtivos.map((bombeiro) => (
                        <SelectItem key={bombeiro.id} value={bombeiro.nome}>
                          {bombeiro.nome} - {bombeiro.equipe} - {bombeiro.funcao_completa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="base">Base *</Label>
                  <Select value={novaVerificacao.base} onValueChange={(value) => atualizarItem('base', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingBases ? "Carregando..." : "Selecione a base"} />
                    </SelectTrigger>
                    <SelectContent>
                      {bases?.filter(b => b.ativa).map(base => (
                        <SelectItem key={base.id} value={base.nome}>{base.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="responsavel">Responsável pela Verificação *</Label>
                  <BombeiroSelector
                    value={responsavelSelecionado}
                    onChange={(bombeiro) => {
                      setResponsavelSelecionado(bombeiro)
                      atualizarItem('responsavel_nome', bombeiro?.nome || '')
                    }}
                    placeholder="Busque e selecione o responsável..."
                    showEquipeFilter={true}
                    showFuncaoFilter={true}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="equipe">Equipe</Label>
                  <Select value={novaVerificacao.equipe_selecionada} onValueChange={(value) => atualizarItem('equipe_selecionada', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingEquipes ? "Carregando..." : "Selecione a equipe"} />
                    </SelectTrigger>
                    <SelectContent>
                      {equipes?.map((equipe) => (
                        <SelectItem key={equipe.id} value={equipe.nome_equipe}>
                          Equipe {equipe.nome_equipe}
                        </SelectItem>
                      )) || EQUIPES_PADRAO.map((equipe) => (
                        <SelectItem key={equipe} value={equipe}>
                          Equipe {equipe}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Período de Referência</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={novaVerificacao.mes_referencia.toString()} 
                      onValueChange={(value) => atualizarItem('mes_referencia', parseInt(value))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 12}, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {new Date(0, i).toLocaleDateString('pt-BR', { month: 'long' })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={novaVerificacao.ano_referencia.toString()} 
                      onValueChange={(value) => atualizarItem('ano_referencia', parseInt(value))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 5}, (_, i) => {
                          const ano = new Date().getFullYear() - 2 + i
                          return (
                            <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Progresso da verificação */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Progresso da Verificação</Label>
                  <span className="text-sm font-medium">{calcularProgresso()}%</span>
                </div>
                <Progress value={calcularProgresso()} className="w-full" />
              </div>
              
              <Separator />
              
              {/* Itens de verificação */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Itens Obrigatórios (8 itens)</h3>
                
                {ITENS_VERIFICACAO.map((item, index) => {
                  const observacaoKey = `${item.key.replace('_bombeiro', '').replace('_seguranca', '').replace('_identificacao', '').replace('_protetor', '')}_observacoes` as keyof NovaVerificacaoUniforme
                  
                  return (
                    <Card key={item.key} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">{item.label}</h4>
                            <p className="text-sm text-muted-foreground">{item.descricao}</p>
                            <Badge variant="outline" className="text-xs">
                              {item.categoria.charAt(0).toUpperCase() + item.categoria.slice(1)}
                            </Badge>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant={novaVerificacao[item.key] === 'CONFORME' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => atualizarItem(item.key, 'CONFORME')}
                              className="flex items-center gap-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Conforme
                            </Button>
                            <Button
                              variant={novaVerificacao[item.key] === 'NAO_CONFORME' ? 'destructive' : 'outline'}
                              size="sm"
                              onClick={() => atualizarItem(item.key, 'NAO_CONFORME')}
                              className="flex items-center gap-1"
                            >
                              <XCircle className="h-3 w-3" />
                              Não Conforme
                            </Button>
                          </div>
                        </div>
                        
                        {novaVerificacao[item.key] === 'NAO_CONFORME' && (
                          <div className="space-y-2">
                            <Label htmlFor={`obs-${item.key}`}>Observações da Não Conformidade</Label>
                            <Textarea
                              id={`obs-${item.key}`}
                              value={(novaVerificacao[observacaoKey] as string) || ''}
                              onChange={(e) => atualizarItem(observacaoKey, e.target.value)}
                              placeholder="Descreva o problema encontrado..."
                              rows={2}
                            />
                          </div>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
              
              <Separator />
              
              {/* Observações gerais */}
              <div className="space-y-2">
                <Label htmlFor="observacoes-gerais">Observações Gerais</Label>
                <Textarea
                  id="observacoes-gerais"
                  value={novaVerificacao.observacoes_gerais || ''}
                  onChange={(e) => atualizarItem('observacoes_gerais', e.target.value)}
                  placeholder="Observações adicionais sobre a verificação..."
                  rows={3}
                />
              </div>
              
              {/* Botões de ação */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={submeterVerificacao}
                  disabled={criarVerificacao.isPending}
                  className="flex-1"
                >
                  {criarVerificacao.isPending ? 'Salvando...' : 'Salvar Verificação'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setNovaVerificacao({
                      bombeiro_nome: '',
                      base: '',
                      mes_referencia: new Date().getMonth() + 1,
                      ano_referencia: new Date().getFullYear(),
                      responsavel_nome: '',
                      gandolas_bombeiro: 'CONFORME',
                      calcas_bombeiro: 'CONFORME',
                      cinto_bombeiro: 'CONFORME',
                      bota_seguranca: 'CONFORME',
                      camisas_bombeiro: 'CONFORME',
                      bermudas_bombeiro: 'CONFORME',
                      tarjeta_identificacao: 'CONFORME',
                      oculos_protetor: 'CONFORME',
                      observacoes_gerais: ''
                    })
                  }}
                >
                  Limpar Formulário
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard de Verificações</CardTitle>
              <CardDescription>Visualização em tempo real das verificações de uniformes</CardDescription>
            </CardHeader>
            <CardContent>
              {carregandoVerificacoes ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground">Carregando verificações...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {verificacoes && verificacoes.length > 0 ? (
                    verificacoes.slice(0, 10).map((verificacao) => (
                      <Card key={verificacao.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">{verificacao.bombeiro_nome}</h4>
                            <p className="text-sm text-muted-foreground">
                              {verificacao.base} • {verificacao.responsavel_nome}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(verificacao.data_verificacao).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {verificacao.itens_conformes}/8 itens conformes
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {Math.round((verificacao.itens_conformes / 8) * 100)}% conformidade
                              </p>
                            </div>
                            {renderStatusBadge(verificacao.status)}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setVerificacaoSelecionada(verificacao)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Nenhuma verificação encontrada</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba Validação */}
        <TabsContent value="validacao" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Validação em Tempo Real</CardTitle>
              <CardDescription>Consulte o status atual de uniformes por bombeiro</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Bombeiro</Label>
                <Select value={bombeiroSelecionado} onValueChange={setBombeiroSelecionado}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingBombeiros ? "Carregando..." : "Selecione o bombeiro"} />
                  </SelectTrigger>
                  <SelectContent>
                    {bombeirosAtivos.map(bombeiro => (
                      <SelectItem key={bombeiro.id} value={bombeiro.nome}>
                        {bombeiro.nome} - {bombeiro.equipe} - {bombeiro.funcao_completa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {bombeiroSelecionado && validacaoBombeiro && (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p><strong>Status:</strong> {renderStatusBadge(validacaoBombeiro.statusAtual)}</p>
                      <p><strong>Conformidade:</strong> {validacaoBombeiro.conformidadeAtual}%</p>
                      <p><strong>Itens não conformes:</strong> {validacaoBombeiro.itensNaoConformes}</p>
                      <p><strong>Verificação atual:</strong> {validacaoBombeiro.temVerificacaoAtual ? 'Sim' : 'Não'}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba Histórico */}
        <TabsContent value="historico" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Verificações</CardTitle>
              <CardDescription>Consulte o histórico completo por bombeiro</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="buscar-bombeiro">Buscar por Bombeiro</Label>
                <Input
                  id="buscar-bombeiro"
                  value={buscarBombeiro}
                  onChange={(e) => setBuscarBombeiro(e.target.value)}
                  placeholder="Digite o nome para ver o histórico"
                />
              </div>
              
              {buscarBombeiro && historicoVerificacoes && (
                <div className="space-y-3">
                  <h4 className="font-medium">Histórico de {buscarBombeiro}</h4>
                  {historicoVerificacoes.length > 0 ? (
                    historicoVerificacoes.map((verificacao) => (
                      <Card key={verificacao.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">
                              {new Date(verificacao.data_verificacao).toLocaleDateString('pt-BR')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {verificacao.base} • {verificacao.responsavel_nome}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{verificacao.itens_conformes}/8</span>
                            {renderStatusBadge(verificacao.status)}
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma verificação encontrada</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Modal de detalhes da verificação */}
      {verificacaoSelecionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Detalhes da Verificação</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setVerificacaoSelecionada(null)}
                className="absolute top-4 right-4"
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Bombeiro</Label>
                  <p className="font-medium">{verificacaoSelecionada.bombeiro_nome}</p>
                </div>
                <div>
                  <Label>Base</Label>
                  <p className="font-medium">{verificacaoSelecionada.base}</p>
                </div>
                <div>
                  <Label>Data</Label>
                  <p className="font-medium">
                    {new Date(verificacaoSelecionada.data_verificacao).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  {renderStatusBadge(verificacaoSelecionada.status)}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <h4 className="font-medium">Itens Verificados</h4>
                {ITENS_VERIFICACAO.map((item) => {
                  const status = verificacaoSelecionada[item.key] as 'CONFORME' | 'NAO_CONFORME'
                  const observacaoKey = `${item.key.replace('_bombeiro', '').replace('_seguranca', '').replace('_identificacao', '').replace('_protetor', '')}_observacoes` as keyof UniformeVerificacao
                  const observacao = verificacaoSelecionada[observacaoKey] as string
                  
                  return (
                    <div key={item.key} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        {observacao && (
                          <p className="text-xs text-muted-foreground">{observacao}</p>
                        )}
                      </div>
                      {status === 'CONFORME' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  )
                })}
              </div>
              
              {verificacaoSelecionada.observacoes_gerais && (
                <div>
                  <Label>Observações Gerais</Label>
                  <p className="text-sm mt-1">{verificacaoSelecionada.observacoes_gerais}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}