import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  CheckCircle, 
  XCircle, 
  Calendar,
  User,
  Activity,
  MoreHorizontal,
  AlertTriangle,
  FileText,
  Users,
  CircleCheckBig,
  CircleX
} from "lucide-react";
import { useTAFAvaliacoes } from '@/hooks/useTAFAvaliacoes';
import { useBombeiros } from '@/hooks/useBombeiros';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import TAFDetailsModal from './TAFDetailsModal';
import TAFEditModal from './TAFEditModal';

interface TAFHistoricoProps {
  onEditAvaliacao?: (avaliacaoId: string) => void;
  onViewDetails?: (avaliacaoId: string) => void;
}

const TAFHistorico: React.FC<TAFHistoricoProps> = ({ onEditAvaliacao, onViewDetails }) => {
  const [tipoHistorico, setTipoHistorico] = useState<'individual' | 'equipe'>('equipe');
  const [filtros, setFiltros] = useState({
    busca: '',
    status: 'todos', // todos, aprovado, reprovado
    faixaEtaria: 'todas', // todas, abaixo_40, acima_40
    periodo: 'todos', // todos, ultimo_mes, ultimos_3_meses, ultimo_ano
    bombeiro: 'todos'
  });
  
  const [paginacao, setPaginacao] = useState({
    pagina: 1,
    itensPorPagina: 10
  });

  const [avaliacaoParaExcluir, setAvaliacaoParaExcluir] = useState<string | null>(null);
  const [avaliacaoParaVisualizar, setAvaliacaoParaVisualizar] = useState<string | null>(null);
  const [avaliacaoParaEditar, setAvaliacaoParaEditar] = useState<string | null>(null);
  const [itensPorPagina, setItensPorPagina] = useState(10);
  
  // Estados específicos para histórico por equipe
  const [equipeParaVer, setEquipeParaVer] = useState<any>(null)
  const [equipeParaEditar, setEquipeParaEditar] = useState<any>(null)
  const [equipeParaExcluir, setEquipeParaExcluir] = useState<any>(null)
  const [dadosEdicaoEquipe, setDadosEdicaoEquipe] = useState<any[]>([])
  const [salvandoEquipe, setSalvandoEquipe] = useState(false)
  const [excluindoEquipe, setExcluindoEquipe] = useState(false)

  const { avaliacoes, isLoading, excluirAvaliacao, atualizarAvaliacao } = useTAFAvaliacoes();
  const { bombeiros } = useBombeiros();

  // Função para calcular aprovação baseada nos critérios TAF
  const calcularAprovacao = (avaliacao: any) => {
    const { flexoes_realizadas, abdominais_realizadas, polichinelos_realizados, tempo_total_segundos, faixa_etaria } = avaliacao;
    
    // Critérios mínimos por faixa etária (exemplo - ajustar conforme necessário)
    const criterios = {
      'abaixo_40': {
        flexoes_min: 20,
        abdominais_min: 30,
        polichinelos_min: 40,
        tempo_max: 720 // 12 minutos
      },
      'acima_40': {
        flexoes_min: 15,
        abdominais_min: 25,
        polichinelos_min: 35,
        tempo_max: 780 // 13 minutos
      }
    };
    
    const criterio = criterios[faixa_etaria as keyof typeof criterios] || criterios['abaixo_40'];
    
    return (
      flexoes_realizadas >= criterio.flexoes_min &&
      abdominais_realizadas >= criterio.abdominais_min &&
      polichinelos_realizados >= criterio.polichinelos_min &&
      tempo_total_segundos <= criterio.tempo_max
    );
  };

  // Função para agrupar avaliações por equipe e data
  const avaliacoesAgrupadas = useMemo(() => {
    const grupos: { [key: string]: {
      equipe: string
      data: string
      participantes: any[]
      status: 'aprovado' | 'reprovado' | 'parcial'
    }} = {}

    console.log('🔍 Agrupando avaliações:', avaliacoes?.length || 0, 'total')
    
    avaliacoes
      ?.filter(avaliacao => avaliacao.equipe && avaliacao.tipo_avaliacao === 'equipe')
      .forEach(avaliacao => {
        const chave = `${avaliacao.equipe}-${avaliacao.data_teste}`
        
        console.log('📊 Processando avaliação:', {
          id: avaliacao.id,
          bombeiro_id: avaliacao.bombeiro_id,
          equipe: avaliacao.equipe,
          data_teste: avaliacao.data_teste,
          chave
        })
        
        if (!grupos[chave]) {
          grupos[chave] = {
            equipe: avaliacao.equipe,
            data: avaliacao.data_teste,
            participantes: [],
            status: 'aprovado'
          }
          console.log('✨ Novo grupo criado:', chave)
        }
        
        // Garantir que cada participante mantenha o data_teste original
        const participanteComDataTeste = {
          ...avaliacao,
          data_teste: avaliacao.data_teste // Preservar explicitamente o data_teste original
        }
        
        grupos[chave].participantes.push(participanteComDataTeste)
      })

    // Calcular status geral de cada grupo
    Object.values(grupos).forEach(grupo => {
      const aprovados = grupo.participantes.filter(p => p.aprovado).length
      const total = grupo.participantes.length
      
      if (aprovados === total) {
        grupo.status = 'aprovado'
      } else if (aprovados === 0) {
        grupo.status = 'reprovado'
      } else {
        grupo.status = 'parcial'
      }
    })

    const gruposFinais = Object.values(grupos).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    
    console.log('🎯 Grupos finais criados:', gruposFinais.map(g => ({
      equipe: g.equipe,
      data: g.data,
      participantes: g.participantes.length,
      chave: `${g.equipe}-${g.data}`
    })))
    
    return gruposFinais
  }, [avaliacoes]);

  // Filtrar e paginar dados
  const dadosFiltrados = useMemo(() => {
    if (!avaliacoes) return [];

    let resultado = [...avaliacoes];

    // Filtro por busca (nome do bombeiro ou matrícula)
    if (filtros.busca) {
      resultado = resultado.filter(avaliacao => {
        const bombeiro = bombeiros?.find(b => b.id === avaliacao.bombeiro_id);
        const termoBusca = filtros.busca.toLowerCase();
        return (
          (bombeiro?.nome_completo || bombeiro?.nome || '').toLowerCase().includes(termoBusca) ||
          (bombeiro?.matricula || '').toLowerCase().includes(termoBusca)
        );
      });
    }

    // Filtro por status
    if (filtros.status !== 'todos') {
      const statusFiltro = filtros.status === 'aprovado';
      resultado = resultado.filter(avaliacao => avaliacao.aprovado === statusFiltro);
    }

    // Filtro por faixa etária
    if (filtros.faixaEtaria !== 'todas') {
      resultado = resultado.filter(avaliacao => avaliacao.faixa_etaria === filtros.faixaEtaria);
    }

    // Filtro por bombeiro específico
    if (filtros.bombeiro !== 'todos') {
      resultado = resultado.filter(avaliacao => avaliacao.bombeiro_id === filtros.bombeiro);
    }

    // Filtro por período
    if (filtros.periodo !== 'todos') {
      const agora = new Date();
      let dataLimite = new Date();
      
      switch (filtros.periodo) {
        case 'ultimo_mes':
          dataLimite.setMonth(agora.getMonth() - 1);
          break;
        case 'ultimos_3_meses':
          dataLimite.setMonth(agora.getMonth() - 3);
          break;
        case 'ultimo_ano':
          dataLimite.setFullYear(agora.getFullYear() - 1);
          break;
      }
      
      resultado = resultado.filter(avaliacao => 
        new Date(avaliacao.data_teste) >= dataLimite
      );
    }

    // Ordenar por data mais recente
    resultado.sort((a, b) => new Date(b.data_teste).getTime() - new Date(a.data_teste).getTime());

    return resultado;
  }, [avaliacoes, bombeiros, filtros]);

  // Paginação
  const totalPaginas = Math.ceil(dadosFiltrados.length / paginacao.itensPorPagina);
  const indiceInicio = (paginacao.pagina - 1) * paginacao.itensPorPagina;
  const indiceFim = indiceInicio + paginacao.itensPorPagina;
  const dadosPaginados = dadosFiltrados.slice(indiceInicio, indiceFim);

  const handleConfirmarExclusao = async () => {
    if (!avaliacaoParaExcluir) return;
    
    try {
      await excluirAvaliacao.mutateAsync(avaliacaoParaExcluir);
      toast.success('Avaliação excluída com sucesso!');
      setAvaliacaoParaExcluir(null);
    } catch (error) {
      console.error('Erro ao excluir avaliação:', error);
      toast.error('Erro ao excluir avaliação');
    }
  };

  const handleViewDetails = (avaliacaoId: string) => {
    if (onViewDetails) {
      onViewDetails(avaliacaoId);
    } else {
      setAvaliacaoParaVisualizar(avaliacaoId);
    }
  };

  const handleEdit = (avaliacaoId: string) => {
    if (onEditAvaliacao) {
      onEditAvaliacao(avaliacaoId);
    } else {
      setAvaliacaoParaEditar(avaliacaoId);
    }
  };

  const formatarTempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
  };

  const exportarDados = () => {
    // Implementar exportação para CSV/Excel
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Bombeiro,Matrícula,Data,Faixa Etária,Flexões,Abdominais,Polichinelos,Tempo,Status\n" +
      dadosFiltrados.map(avaliacao => {
        const bombeiro = bombeiros?.find(b => b.id === avaliacao.bombeiro_id);
        return [
          bombeiro?.nome_completo || bombeiro?.nome || '',
          bombeiro?.matricula || '',
          format(new Date(avaliacao.data_teste), 'dd/MM/yyyy'),
          avaliacao.faixa_etaria === 'abaixo_40' ? 'Abaixo de 40' : 'Acima de 40',
          avaliacao.flexoes_realizadas,
          avaliacao.abdominais_realizadas,
          avaliacao.polichinelos_realizados,
          formatarTempo(avaliacao.tempo_total_segundos),
          avaliacao.aprovado ? 'Aprovado' : 'Reprovado'
        ].join(',');
      }).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `historico_taf_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Dados exportados com sucesso!');
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Histórico de Avaliações TAF</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Histórico de Avaliações TAF
          </div>
          <Button onClick={exportarDados} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={tipoHistorico} onValueChange={(value) => setTipoHistorico(value as 'individual' | 'equipe')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="equipe" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Histórico por Equipe
            </TabsTrigger>
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Histórico Individual
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="individual" className="space-y-6 mt-6">
        {/* Filtros */}
        <div className="space-y-4 mb-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou matrícula..."
                value={filtros.busca}
                onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                className="pl-10"
              />
            </div>

            {/* Status */}
            <Select 
              value={filtros.status} 
              onValueChange={(value) => setFiltros(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="aprovado">Aprovados</SelectItem>
                <SelectItem value="reprovado">Reprovados</SelectItem>
              </SelectContent>
            </Select>

            {/* Faixa Etária */}
            <Select 
              value={filtros.faixaEtaria} 
              onValueChange={(value) => setFiltros(prev => ({ ...prev, faixaEtaria: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Faixa etária" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as faixas</SelectItem>
                <SelectItem value="abaixo_40">Abaixo de 40 anos</SelectItem>
                <SelectItem value="acima_40">Acima de 40 anos</SelectItem>
              </SelectContent>
            </Select>

            {/* Período */}
            <Select 
              value={filtros.periodo} 
              onValueChange={(value) => setFiltros(prev => ({ ...prev, periodo: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os períodos</SelectItem>
                <SelectItem value="ultimo_mes">Último mês</SelectItem>
                <SelectItem value="ultimos_3_meses">Últimos 3 meses</SelectItem>
                <SelectItem value="ultimo_ano">Último ano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Bombeiro */}
          <div className="md:w-1/3">
            <Select 
              value={filtros.bombeiro} 
              onValueChange={(value) => setFiltros(prev => ({ ...prev, bombeiro: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por bombeiro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os bombeiros</SelectItem>
                {bombeiros?.map((bombeiro) => (
                  <SelectItem key={bombeiro.id} value={bombeiro.id}>
                    {bombeiro.nome_completo || bombeiro.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resumo dos Resultados */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {dadosPaginados.length} de {dadosFiltrados.length} avaliações
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Itens por página:</span>
            <Select 
              value={paginacao.itensPorPagina.toString()} 
              onValueChange={(value) => setPaginacao(prev => ({ ...prev, itensPorPagina: parseInt(value), pagina: 1 }))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabela */}
        {dadosPaginados.length === 0 ? (
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              Nenhuma avaliação encontrada com os filtros aplicados.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bombeiro</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Faixa Etária</TableHead>
                  <TableHead className="text-center">Flexões</TableHead>
                  <TableHead className="text-center">Abdominais</TableHead>
                  <TableHead className="text-center">Polichinelos</TableHead>
                  <TableHead className="text-center">Tempo</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dadosPaginados.map((avaliacao) => {
                  const bombeiro = bombeiros?.find(b => b.id === avaliacao.bombeiro_id);
                  return (
                    <TableRow key={avaliacao.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{bombeiro?.nome_completo || bombeiro?.nome}</div>
                            <div className="text-sm text-muted-foreground">{bombeiro?.matricula}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {format(new Date(avaliacao.data_teste), 'dd/MM/yyyy', { locale: ptBR })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {avaliacao.faixa_etaria === 'abaixo_40' ? 'Abaixo de 40' : 'Acima de 40'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {avaliacao.flexoes_realizadas}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {avaliacao.abdominais_realizadas}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {avaliacao.polichinelos_realizados}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {formatarTempo(avaliacao.tempo_total_segundos)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={avaliacao.aprovado ? "default" : "destructive"}
                          className={`flex items-center gap-1 w-fit mx-auto ${
                            avaliacao.aprovado ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                          }`}
                        >
                          {avaliacao.aprovado ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {avaliacao.aprovado ? 'Aprovado' : 'Reprovado'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleViewDetails(avaliacao.id)}
                              className="cursor-pointer hover:bg-accent"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleEdit(avaliacao.id)}
                              className="cursor-pointer hover:bg-accent"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => setAvaliacaoParaExcluir(avaliacao.id)}
                              className="text-destructive cursor-pointer hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Página {paginacao.pagina} de {totalPaginas}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginacao(prev => ({ ...prev, pagina: prev.pagina - 1 }))}
                disabled={paginacao.pagina === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginacao(prev => ({ ...prev, pagina: prev.pagina + 1 }))}
                disabled={paginacao.pagina === totalPaginas}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
            </TabsContent>
            
            <TabsContent value="equipe" className="space-y-6 mt-6">
              {/* Filtros para equipe */}
              <div className="space-y-4 mb-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por equipe..."
                      value={filtros.busca}
                      onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                      className="pl-10 h-12 rounded-lg border-input bg-white hover:bg-white focus:bg-white backdrop-blur-sm transition-all duration-300"
                    />
                  </div>
                  <Select value={filtros.status} onValueChange={(value) => setFiltros(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os status</SelectItem>
                      <SelectItem value="aprovado">Aprovado</SelectItem>
                      <SelectItem value="reprovado">Reprovado</SelectItem>
                      <SelectItem value="parcial">Parcial</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filtros.periodo} onValueChange={(value) => setFiltros(prev => ({ ...prev, periodo: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os períodos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os períodos</SelectItem>
                      <SelectItem value="ultima-semana">Última semana</SelectItem>
                      <SelectItem value="ultimo-mes">Último mês</SelectItem>
                      <SelectItem value="ultimos-3-meses">Últimos 3 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Resumo dos resultados para equipe */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Mostrando {avaliacoesAgrupadas.length} registros de equipe
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Itens por página:</span>
                  <Select value={itensPorPagina.toString()} onValueChange={(value) => setItensPorPagina(Number(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tabela de histórico por equipe */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipe</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Participantes</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {avaliacoesAgrupadas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">Nenhum registro de equipe encontrado</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      avaliacoesAgrupadas.map((grupo, index) => (
                        <TableRow key={`${grupo.equipe}-${grupo.data}-${index}`}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{grupo.equipe}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              {new Date(grupo.data).toLocaleDateString('pt-BR')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {grupo.participantes.length} bombeiro{grupo.participantes.length !== 1 ? 's' : ''}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant={grupo.status === 'aprovado' ? 'default' : grupo.status === 'reprovado' ? 'destructive' : 'secondary'}
                              className={`flex items-center gap-1 w-fit mx-auto ${
                                grupo.status === 'aprovado' ? 'bg-green-500 text-white' :
                                grupo.status === 'reprovado' ? 'bg-red-500 text-white' :
                                'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {grupo.status === 'aprovado' ? (
                                <CircleCheckBig className="w-3 h-3" />
                              ) : grupo.status === 'reprovado' ? (
                                <CircleX className="w-3 h-3" />
                              ) : (
                                <AlertTriangle className="w-3 h-3" />
                              )}
                              {grupo.status === 'aprovado' ? 'Aprovado' : 
                               grupo.status === 'reprovado' ? 'Reprovado' : 'Parcial'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-9 w-9 p-0">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEquipeParaVer(grupo)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setEquipeParaEditar(grupo)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => setEquipeParaExcluir(grupo)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* AlertDialog para confirmação de exclusão */}
      <AlertDialog open={!!avaliacaoParaExcluir} onOpenChange={() => setAvaliacaoParaExcluir(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Confirmar Exclusão
          </AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir esta avaliação TAF? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={() => setAvaliacaoParaExcluir(null)}
            className="hover:bg-accent"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirmarExclusao}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Detalhes */}
      {avaliacaoParaVisualizar && (
        <TAFDetailsModal
          avaliacaoId={avaliacaoParaVisualizar}
          open={!!avaliacaoParaVisualizar}
          onClose={() => setAvaliacaoParaVisualizar(null)}
        />
      )}

      {/* Modal de Edição */}
      {avaliacaoParaEditar && (
        <TAFEditModal
          avaliacaoId={avaliacaoParaEditar}
          open={!!avaliacaoParaEditar}
          onClose={() => setAvaliacaoParaEditar(null)}
          onSuccess={() => {
            setAvaliacaoParaEditar(null);
            toast.success('Avaliação atualizada com sucesso!');
          }}
        />
      )}

      {/* Modal de visualização detalhada da equipe */}
      <Dialog open={!!equipeParaVer} onOpenChange={() => setEquipeParaVer(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Relatório Detalhado - Equipe {equipeParaVer?.equipe}
            </DialogTitle>
            <DialogDescription>
              Avaliação realizada em {equipeParaVer && new Date(equipeParaVer.data).toLocaleDateString('pt-BR')}
            </DialogDescription>
          </DialogHeader>
          
          {equipeParaVer && (
            <div className="space-y-6">
              {/* Resumo da equipe */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Equipe</div>
                  <div className="text-lg font-semibold">{equipeParaVer.equipe}</div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Participantes</div>
                  <div className="text-lg font-semibold">{equipeParaVer.participantes.length}</div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Status Geral</div>
                  <Badge 
                    variant={equipeParaVer.status === 'aprovado' ? 'default' : equipeParaVer.status === 'reprovado' ? 'destructive' : 'secondary'}
                    className={`${
                      equipeParaVer.status === 'aprovado' ? 'bg-green-500 text-white' :
                      equipeParaVer.status === 'reprovado' ? 'bg-red-500 text-white' :
                      'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {equipeParaVer.status === 'aprovado' ? 'Aprovado' : 
                     equipeParaVer.status === 'reprovado' ? 'Reprovado' : 'Parcial'}
                  </Badge>
                </div>
              </div>

              {/* Lista de participantes e resultados */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Participantes e Resultados</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bombeiro</TableHead>
                        <TableHead>Flexão</TableHead>
                        <TableHead>Abdominal</TableHead>
                        <TableHead>Polichinelos</TableHead>
                        <TableHead>Tempo</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {equipeParaVer.participantes.map((participante: any, index: number) => {
                        // Buscar dados do bombeiro usando o bombeiro_id
                        const bombeiro = bombeiros?.find(b => b.id === participante.bombeiro_id);
                        
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">{bombeiro?.nome_completo || bombeiro?.nome || 'Nome não encontrado'}</div>
                                  <div className="text-sm text-muted-foreground">{bombeiro?.matricula || 'Matrícula não encontrada'}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{participante.flexoes_realizadas || 0} repetições</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{participante.abdominais_realizadas || 0} repetições</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{participante.polichinelos_realizados || 0} repetições</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="text-muted-foreground">{formatarTempo(participante.tempo_total_segundos || 0)}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge 
                                variant={participante.aprovado ? 'default' : 'destructive'}
                                className={participante.aprovado ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
                              >
                                {participante.aprovado ? 'Aprovado' : 'Reprovado'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de edição da equipe */}
      <Dialog open={!!equipeParaEditar} onOpenChange={() => {
        setEquipeParaEditar(null);
        setDadosEdicaoEquipe([]);
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Editar Registro - Equipe {equipeParaEditar?.equipe}
            </DialogTitle>
            <DialogDescription>
              Modifique os dados dos participantes da equipe
            </DialogDescription>
          </DialogHeader>
          
          {equipeParaEditar && (
            <div className="space-y-6">
              {/* Informações da equipe */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Equipe</div>
                    <div className="text-lg font-semibold">{equipeParaEditar.equipe}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Data da Avaliação</div>
                    <div className="text-lg font-semibold">{new Date(equipeParaEditar.data).toLocaleDateString('pt-BR')}</div>
                  </div>
                </div>
              </div>

              {/* Formulário de edição dos participantes */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Editar Participantes</h3>
                <div className="space-y-4">
                  {(dadosEdicaoEquipe.length > 0 ? dadosEdicaoEquipe : equipeParaEditar.participantes).map((participante: any, index: number) => {
                    const bombeiro = bombeiros?.find(b => b.id === participante.bombeiro_id);
                    const dadosParticipante = dadosEdicaoEquipe[index] || participante;
                    
                    return (
                      <div key={participante.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center gap-2 mb-3">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{bombeiro?.nome_completo || bombeiro?.nome || 'Nome não encontrado'}</div>
                            <div className="text-sm text-muted-foreground">{bombeiro?.matricula || 'Matrícula não encontrada'}</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="text-sm font-medium">Flexões</label>
                            <Input
                              type="number"
                              min="0"
                              value={dadosParticipante.flexoes_realizadas || 0}
                              onChange={(e) => {
                                const novosDados = [...(dadosEdicaoEquipe.length > 0 ? dadosEdicaoEquipe : equipeParaEditar.participantes)];
                                novosDados[index] = {
                                  ...novosDados[index],
                                  flexoes_realizadas: parseInt(e.target.value) || 0
                                };
                                setDadosEdicaoEquipe(novosDados);
                              }}
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Abdominais</label>
                            <Input
                              type="number"
                              min="0"
                              value={dadosParticipante.abdominais_realizadas || 0}
                              onChange={(e) => {
                                const novosDados = [...(dadosEdicaoEquipe.length > 0 ? dadosEdicaoEquipe : equipeParaEditar.participantes)];
                                novosDados[index] = {
                                  ...novosDados[index],
                                  abdominais_realizadas: parseInt(e.target.value) || 0
                                };
                                setDadosEdicaoEquipe(novosDados);
                              }}
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Polichinelos</label>
                            <Input
                              type="number"
                              min="0"
                              value={dadosParticipante.polichinelos_realizados || 0}
                              onChange={(e) => {
                                const novosDados = [...(dadosEdicaoEquipe.length > 0 ? dadosEdicaoEquipe : equipeParaEditar.participantes)];
                                novosDados[index] = {
                                  ...novosDados[index],
                                  polichinelos_realizados: parseInt(e.target.value) || 0
                                };
                                setDadosEdicaoEquipe(novosDados);
                              }}
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Tempo (segundos)</label>
                            <Input
                              type="number"
                              min="0"
                              value={dadosParticipante.tempo_total_segundos || 0}
                              onChange={(e) => {
                                const novosDados = [...(dadosEdicaoEquipe.length > 0 ? dadosEdicaoEquipe : equipeParaEditar.participantes)];
                                novosDados[index] = {
                                  ...novosDados[index],
                                  tempo_total_segundos: parseInt(e.target.value) || 0
                                };
                                setDadosEdicaoEquipe(novosDados);
                              }}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Observações</label>
                          <Input
                            value={dadosParticipante.observacoes || ''}
                            onChange={(e) => {
                              const novosDados = [...(dadosEdicaoEquipe.length > 0 ? dadosEdicaoEquipe : equipeParaEditar.participantes)];
                              novosDados[index] = {
                                ...novosDados[index],
                                observacoes: e.target.value
                              };
                              setDadosEdicaoEquipe(novosDados);
                            }}
                            placeholder="Observações sobre a avaliação..."
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setEquipeParaEditar(null);
                setDadosEdicaoEquipe([]);
              }}
              disabled={salvandoEquipe}
            >
              Cancelar
            </Button>
            <Button 
              onClick={async () => {
                if (!equipeParaEditar || dadosEdicaoEquipe.length === 0) return;
                
                setSalvandoEquipe(true);
                try {
                  // Atualizar cada participante da equipe
                  console.log('🔄 Iniciando atualização da equipe:', equipeParaEditar.equipe)
                  console.log('📝 Dados para atualização:', dadosEdicaoEquipe.map(p => ({
                    id: p.id,
                    bombeiro_id: p.bombeiro_id,
                    equipe: p.equipe,
                    data_teste: p.data_teste
                  })))
                  
                  const promises = dadosEdicaoEquipe.map(async (participante) => {
                    // Calcular se foi aprovado baseado nos critérios TAF
                    const aprovado = calcularAprovacao(participante);
                    
                    // CRÍTICO: Garantir que a data_teste NUNCA seja alterada
                    const dataTesteOriginal = participante.data_teste || equipeParaEditar.data;
                    
                    const dadosAtualizacao = {
                      flexoes_realizadas: participante.flexoes_realizadas,
                      abdominais_realizadas: participante.abdominais_realizadas,
                      polichinelos_realizados: participante.polichinelos_realizados,
                      tempo_total_segundos: participante.tempo_total_segundos,
                      observacoes: participante.observacoes,
                      aprovado,
                      // Preservar campos essenciais para manter a pessoa na mesma equipe e data
                      equipe: participante.equipe,
                      data_teste: dataTesteOriginal, // USAR SEMPRE A DATA ORIGINAL
                      bombeiro_id: participante.bombeiro_id
                    }
                    
                    console.log('💾 Atualizando participante:', {
                      id: participante.id,
                      dados: dadosAtualizacao
                    })
                    
                    return atualizarAvaliacao.mutateAsync({
                      id: participante.id,
                      dados: dadosAtualizacao
                    });
                  });
                  
                  await Promise.all(promises);
                  
                  toast.success('Equipe atualizada com sucesso!');
                  setEquipeParaEditar(null);
                  setDadosEdicaoEquipe([]);
                } catch (error) {
                  console.error('Erro ao atualizar equipe:', error);
                  toast.error('Erro ao atualizar equipe');
                } finally {
                  setSalvandoEquipe(false);
                }
              }}
              disabled={salvandoEquipe || dadosEdicaoEquipe.length === 0}
            >
              {salvandoEquipe ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de exclusão da equipe */}
      <AlertDialog open={!!equipeParaExcluir} onOpenChange={() => setEquipeParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o registro da equipe <strong>{equipeParaExcluir?.equipe}</strong> 
              realizado em <strong>{equipeParaExcluir && new Date(equipeParaExcluir.data).toLocaleDateString('pt-BR')}</strong>?
              <br /><br />
              Esta ação irá remover todos os dados dos {equipeParaExcluir?.participantes.length} participantes 
              desta avaliação e não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEquipeParaExcluir(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={async () => {
                if (!equipeParaExcluir) return;
                
                setExcluindoEquipe(true);
                try {
                  // Buscar todas as avaliações da equipe
                  const avaliacoesEquipe = avaliacoes.filter(
                    av => av.equipe === equipeParaExcluir.equipe && 
                         av.data_teste === equipeParaExcluir.data
                  );
                  
                  // Excluir todas as avaliações da equipe
                  for (const avaliacao of avaliacoesEquipe) {
                    await excluirAvaliacao.mutateAsync(avaliacao.id);
                  }
                  
                  toast.success(`Equipe ${equipeParaExcluir.equipe} excluída com sucesso!`);
                  setEquipeParaExcluir(null);
                } catch (error) {
                  console.error('Erro ao excluir equipe:', error);
                  toast.error('Erro ao excluir equipe. Tente novamente.');
                } finally {
                  setExcluindoEquipe(false);
                }
              }}
              disabled={excluindoEquipe}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {excluindoEquipe ? 'Excluindo...' : 'Excluir Registro'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TAFHistorico;