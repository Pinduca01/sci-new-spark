
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit2, Trash2, Search, Beaker, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useAgentesExtintores } from '@/hooks/useAgentesExtintores';
import { AgenteExtintorEditModal } from './AgenteExtintorEditModal';

export const AgentesExtintoresTable = () => {
  const { agentes, isLoading, updateAgente } = useAgentesExtintores();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [selectedAgente, setSelectedAgente] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const getStatusInfo = (agente: any) => {
    const hoje = new Date();
    const dataVencimento = new Date(agente.data_vencimento);
    const diasParaVencimento = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    if (agente.status_uso === 'vencido' || diasParaVencimento < 0) {
      return { status: 'vencido', label: 'Vencido', color: 'destructive', icon: AlertTriangle };
    }
    
    if (diasParaVencimento <= 30) {
      return { status: 'vencendo', label: 'Vencendo em Breve', color: 'secondary', icon: Clock };
    }
    
    if (agente.status_uso === 'disponivel') {
      return { status: 'disponivel', label: 'Disponível', color: 'default', icon: CheckCircle };
    }
    
    return { status: agente.status_uso, label: agente.status_uso, color: 'outline', icon: Clock };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponivel': return 'bg-green-500';
      case 'em_uso': return 'bg-blue-500';
      case 'vencido': return 'bg-red-500';
      case 'descartado': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredAgentes = agentes.filter(agente => {
    const matchesSearch = 
      agente.lote.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agente.numero_serie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agente.materiais?.nome.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'todos' || agente.status_uso === statusFilter;
    const matchesTipo = tipoFilter === 'todos' || agente.tipo_agente === tipoFilter;

    return matchesSearch && matchesStatus && matchesTipo;
  });

  const handleEdit = (agente: any) => {
    setSelectedAgente(agente);
    setEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            Gerenciar Agentes Extintores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por lote, série ou material..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="LGE">LGE</SelectItem>
                <SelectItem value="PQS">PQS</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="em_uso">Em Uso</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
                <SelectItem value="descartado">Descartado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo/Lote</TableHead>
                  <TableHead>Capacidade</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Viatura</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Recargas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgentes.map((agente) => {
                  const statusInfo = getStatusInfo(agente);
                  const StatusIcon = statusInfo.icon;
                  const diasParaVencimento = Math.ceil(
                    (new Date(agente.data_vencimento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <TableRow key={agente.id}>
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{agente.tipo_agente}</Badge>
                            <span className="font-medium">Lote {agente.lote}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {agente.numero_serie && `Série: ${agente.numero_serie}`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {agente.capacidade} {agente.unidade_capacidade}
                      </TableCell>
                      <TableCell>{agente.localizacao_fisica || '-'}</TableCell>
                      <TableCell>
                        {agente.viaturas ? (
                          <div>
                            <div className="font-medium">{agente.viaturas.prefixo}</div>
                            <div className="text-sm text-muted-foreground">
                              {agente.viaturas.nome_viatura}
                            </div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{new Date(agente.data_vencimento).toLocaleDateString('pt-BR')}</div>
                          <div className={`text-sm ${diasParaVencimento <= 30 ? 'text-red-600' : 'text-muted-foreground'}`}>
                            {diasParaVencimento > 0 ? `${diasParaVencimento} dias` : 'Vencido'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium">{agente.numero_recargas}</div>
                          <div className="text-sm text-muted-foreground">recargas</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.color as any} className="flex items-center gap-1 w-fit">
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(agente)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredAgentes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Beaker className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium">Nenhum agente encontrado</p>
              <p className="text-sm">Tente ajustar os filtros ou adicione novos agentes</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedAgente && (
        <AgenteExtintorEditModal
          agente={selectedAgente}
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedAgente(null);
          }}
        />
      )}
    </div>
  );
};
