import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Eye, Edit, CheckCircle, Clock, AlertCircle, XCircle, Plus, RotateCcw } from 'lucide-react';
import { TipoOS, StatusOS, OrdemServico } from '@/types/ordem-servico';
import { mockOrdemServico } from '@/data/mock-ordem-servico';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface OSListProps {
  osData: OrdemServico[];
  tipoFiltro?: TipoOS;
  onViewOS?: (os: OrdemServico) => void;
  onCreateOS?: () => void;
  onUpdateOS?: (os: OrdemServico) => void;
}

const OSList: React.FC<OSListProps> = ({ osData, tipoFiltro, onViewOS, onCreateOS, onUpdateOS }) => {
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroSolicitante, setFiltroSolicitante] = useState('');

  // Função para obter ícone do status
  const getStatusIcon = (status: StatusOS) => {
    switch (status) {
      case 'Pendente':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'Em Andamento':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Concluído':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Cancelado':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  // Função para obter cor do badge do status
  const getStatusBadgeVariant = (status: StatusOS) => {
    switch (status) {
      case 'Pendente':
        return 'destructive';
      case 'Em Andamento':
        return 'secondary';
      case 'Concluído':
        return 'default';
      case 'Cancelado':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Filtrar e buscar OS
  const osFiltradas = useMemo(() => {
    let resultado = osData;

    // Filtrar por tipo se especificado
    if (tipoFiltro) {
      resultado = resultado.filter(os => os.tipo_chamado === tipoFiltro);
    }

    // Filtrar por status
    if (filtroStatus !== 'todos') {
      if (filtroStatus === 'abertas') {
        resultado = resultado.filter(os => os.status === 'Pendente' || os.status === 'Em Andamento' || os.status === 'Aberta');
      } else if (filtroStatus === 'finalizadas') {
        resultado = resultado.filter(os => os.status === 'Concluído' || os.status === 'Concluída' || os.status === 'Cancelado');
      } else {
        resultado = resultado.filter(os => os.status === filtroStatus);
      }
    }

    // Filtrar por solicitante
    if (filtroSolicitante) {
      resultado = resultado.filter(os => 
        os.nome_solicitante.toLowerCase().includes(filtroSolicitante.toLowerCase())
      );
    }

    // Busca geral
    if (buscaTexto) {
      const busca = buscaTexto.toLowerCase();
      resultado = resultado.filter(os => 
        os.numero_chamado.toLowerCase().includes(busca) ||
        os.nome_solicitante.toLowerCase().includes(busca) ||
        os.descricao.toLowerCase().includes(busca) ||
        (os.tipo_chamado === 'Viatura' && 'veiculo_identificacao' in os && os.veiculo_identificacao.toLowerCase().includes(busca)) ||
        (os.tipo_chamado === 'Equipamento' && 'equipamento_identificacao' in os && os.equipamento_identificacao.toLowerCase().includes(busca)) ||
        (os.tipo_chamado === 'Estrutural' && 'local_instalacao' in os && os.local_instalacao.toLowerCase().includes(busca))
      );
    }

    // Ordenar por data de solicitação (mais recente primeiro)
    return resultado.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [osData, tipoFiltro, filtroStatus, buscaTexto, filtroSolicitante]);

  // Obter informação específica baseada no tipo
  const getInfoEspecifica = (os: OrdemServico) => {
    switch (os.tipo_chamado) {
      case 'Viatura':
        return 'veiculo_identificacao' in os ? os.veiculo_identificacao : '';
      case 'Equipamento':
        return 'equipamento_identificacao' in os ? os.equipamento_identificacao : '';
      case 'Estrutural':
        return 'local_instalacao' in os ? os.local_instalacao : '';
      case 'Combustível':
        return 'veiculo_identificacao' in os ? os.veiculo_identificacao : '';
      case 'Materiais':
        return 'lista_materiais' in os ? `${os.lista_materiais.length} itens` : '';
      default:
        return '';
    }
  };

  const handleViewOS = (os: OrdemServico) => {
    if (onViewOS) {
      onViewOS(os);
    } else {
      console.log('Visualizar OS:', os);
    }
  };

  const handleEditOS = (os: OrdemServico) => {
    if (onViewOS) {
      onViewOS(os);
    } else {
      console.log('Editar OS:', os);
    }
  };

  const marcarComoConcluida = async (os: OrdemServico) => {
    try {
      // Atualizar no estado local primeiro
      const osAtualizada = {
        ...os,
        status: 'Concluída' as StatusOS,
        data_conclusao: new Date().toLocaleDateString('pt-BR'),
        updated_at: new Date().toISOString()
      };

      if (onUpdateOS) {
        onUpdateOS(osAtualizada);
      }

      toast({
        title: "Sucesso",
        description: "Ordem de serviço marcada como concluída.",
      });
    } catch (error) {
      console.error('Erro ao marcar OS como concluída:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar a OS como concluída.",
        variant: "destructive",
      });
    }
  };

  const desfazerConclusao = async (os: OrdemServico) => {
    try {
      // Atualizar no estado local primeiro
      const osAtualizada = {
        ...os,
        status: 'Aberta' as StatusOS,
        data_conclusao: undefined,
        updated_at: new Date().toISOString()
      };

      if (onUpdateOS) {
        onUpdateOS(osAtualizada);
      }

      toast({
        title: "Sucesso",
        description: "Marcação de conclusão desfeita. OS reaberta.",
      });
    } catch (error) {
      console.error('Erro ao desfazer conclusão da OS:', error);
      toast({
        title: "Erro",
        description: "Não foi possível desfazer a conclusão da OS.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca Geral */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar OS..."
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por Status */}
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="abertas">Abertas</SelectItem>
                <SelectItem value="finalizadas">Concluídas</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por Solicitante */}
            <Input
              placeholder="Filtrar por solicitante..."
              value={filtroSolicitante}
              onChange={(e) => setFiltroSolicitante(e.target.value)}
            />

            {/* Botão Limpar Filtros */}
            <Button 
              variant="outline" 
              onClick={() => {
                setFiltroStatus('todos');
                setBuscaTexto('');
                setFiltroSolicitante('');
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de OS */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {tipoFiltro ? `OS - ${tipoFiltro}` : 'Todas as Ordens de Serviço'}
              <Badge variant="outline" className="ml-2">
                {osFiltradas.length} {osFiltradas.length === 1 ? 'item' : 'itens'}
              </Badge>
            </CardTitle>
            {onCreateOS && (
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={onCreateOS}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova OS
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>COD_ID</TableHead>
                  <TableHead>Data Solicitação</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nome Solicitante</TableHead>
                  <TableHead>Nº do Chamado</TableHead>
                  <TableHead>Veículo/Equipamento/Local</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Item Operacional</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {osFiltradas.map((os) => (
                  <TableRow key={os.cod_id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{os.cod_id}</TableCell>
                    <TableCell>{os.data_solicitacao}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{os.tipo_chamado}</Badge>
                    </TableCell>
                    <TableCell>{os.nome_solicitante}</TableCell>
                    <TableCell className="font-mono text-sm">{os.numero_chamado}</TableCell>
                    <TableCell>{getInfoEspecifica(os)}</TableCell>
                    <TableCell className="max-w-xs truncate" title={os.descricao}>
                      {os.descricao}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(os.status)}
                        <Badge variant={getStatusBadgeVariant(os.status)}>
                          {os.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={os.item_operacional === 'SIM' ? 'default' : 'destructive'}
                        className={os.item_operacional === 'SIM' ? 'bg-green-600' : ''}
                      >
                        {os.item_operacional}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {os.status !== 'Concluída' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => marcarComoConcluida(os)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 hover:border-green-300 transition-all duration-200"
                            title="Marcar como concluída"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => desfazerConclusao(os)}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200 hover:border-orange-300 transition-all duration-200"
                            title="Desfazer conclusão"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewOS(os)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditOS(os)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {osFiltradas.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma ordem de serviço encontrada com os filtros aplicados.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OSList;