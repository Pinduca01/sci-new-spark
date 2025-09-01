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
  FileText
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

  const { avaliacoes, isLoading, excluirAvaliacao } = useTAFAvaliacoes();
  const { bombeiros } = useBombeiros();

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
                          className="flex items-center gap-1 w-fit mx-auto"
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
    </>
  );
};

export default TAFHistorico;