
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit2, Trash2, Search, Package, AlertTriangle, CheckCircle, Plus } from 'lucide-react';
import { useEstoqueAlmoxarifado } from '@/hooks/useEstoqueAlmoxarifado';
import { EstoqueEditModal } from './EstoqueEditModal';
import { EstoqueCreateModal } from './EstoqueCreateModal';

export const EstoqueTable = () => {
  const { estoque, isLoading, deleteEstoque } = useEstoqueAlmoxarifado();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [selectedItem, setSelectedItem] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const getStatusInfo = (item: any) => {
    const hoje = new Date();
    const dataValidade = item.data_validade ? new Date(item.data_validade) : null;
    const diasParaVencimento = dataValidade 
      ? Math.ceil((dataValidade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    if (item.quantidade_disponivel <= item.quantidade_minima) {
      return { status: 'baixo', label: 'Estoque Baixo', color: 'destructive', icon: AlertTriangle };
    }
    
    if (diasParaVencimento !== null) {
      if (diasParaVencimento < 0) {
        return { status: 'vencido', label: 'Vencido', color: 'destructive', icon: AlertTriangle };
      }
      if (diasParaVencimento <= 30) {
        return { status: 'vencendo', label: 'Vencendo em Breve', color: 'secondary', icon: AlertTriangle };
      }
    }
    
    return { status: 'normal', label: 'Normal', color: 'default', icon: CheckCircle };
  };

  const filteredEstoque = estoque.filter(item => {
    const matchesSearch = 
      item.materiais?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.materiais?.codigo_material.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lote?.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'todos') return matchesSearch;
    
    const statusInfo = getStatusInfo(item);
    return matchesSearch && statusInfo.status === statusFilter;
  });

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEstoque.mutateAsync(id);
    } catch (error) {
      console.error('Erro ao excluir item:', error);
    }
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
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Gerenciar Itens do Estoque
            </CardTitle>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Novo Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, código ou lote..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="baixo">Estoque Baixo</SelectItem>
                <SelectItem value="vencendo">Vencendo</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEstoque.map((item) => {
                  const statusInfo = getStatusInfo(item);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{item.materiais?.nome}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.materiais?.categoria}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.materiais?.codigo_material}</TableCell>
                      <TableCell>{item.lote || '-'}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {item.quantidade_disponivel} {item.materiais?.unidade_medida}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Mín: {item.quantidade_minima}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.localizacao_fisica || '-'}</TableCell>
                      <TableCell>
                        {item.data_validade 
                          ? new Date(item.data_validade).toLocaleDateString('pt-BR')
                          : '-'
                        }
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
                            onClick={() => handleEdit(item)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o item "{item.materiais?.nome}" do estoque? 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(item.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {deleteEstoque.isPending ? 'Excluindo...' : 'Excluir'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredEstoque.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium">Nenhum item encontrado</p>
              <p className="text-sm">
                {estoque.length === 0 
                  ? "Clique em 'Adicionar Novo Item' para começar a gerenciar seu estoque"
                  : "Tente ajustar os filtros para encontrar os itens desejados"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedItem && (
        <EstoqueEditModal
          item={selectedItem}
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedItem(null);
          }}
        />
      )}

      <EstoqueCreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
};
