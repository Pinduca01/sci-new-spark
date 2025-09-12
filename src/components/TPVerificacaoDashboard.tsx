import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Edit, Trash2, MoreVertical, Search, Filter, Loader2 } from 'lucide-react';
import { useTPVerificacoes, useDeleteTPVerificacao, TPVerificacao } from '@/hooks/useTPVerificacoes';
import TPVerificacaoDetailsModal from './TPVerificacaoDetailsModal';
import TPVerificacaoForm from './TPVerificacaoForm';
import { useToast } from '@/hooks/use-toast';

const TPVerificacaoDashboard = () => {
  const { toast } = useToast();
  const [selectedVerificacao, setSelectedVerificacao] = useState<TPVerificacao | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBase, setFilterBase] = useState('all');

  // Integração com Supabase
  const { data: verificacoes = [], isLoading, error } = useTPVerificacoes();
  const deleteVerificacao = useDeleteTPVerificacao();

  // Mostrar erro se houver
  if (error) {
    toast({
      title: "Erro ao carregar verificações",
      description: "Não foi possível carregar as verificações. Tente novamente.",
      variant: "destructive"
    });
  }

  const handleView = (verificacao: TPVerificacao) => {
    setSelectedVerificacao(verificacao);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (verificacao: TPVerificacao) => {
    setSelectedVerificacao(verificacao);
    setIsEditModalOpen(true);
    toast({
      title: "Editar Verificação",
      description: `Editando verificação da equipe ${verificacao.equipe}`,
    });
  };

  const handleDelete = async (verificacao: TPVerificacao) => {
    if (window.confirm(`Tem certeza que deseja excluir a verificação da equipe ${verificacao.equipe}?`)) {
      try {
        await deleteVerificacao.mutateAsync(verificacao.id);
        toast({
          title: "Verificação Excluída",
          description: `Verificação da equipe ${verificacao.equipe} foi excluída com sucesso`,
        });
      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir a verificação. Tente novamente.",
          variant: "destructive"
        });
      }
    }
  };

  const filteredVerificacoes = useMemo(() => {
    if (!verificacoes) return [];
    return verificacoes.filter(verificacao => {
      const matchesSearch = verificacao.equipe?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           verificacao.responsavel?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterBase === 'all' || verificacao.equipe === filterBase;
      return matchesSearch && matchesFilter;
    });
  }, [verificacoes, searchTerm, filterBase]);

  const getStatusBadge = (conformes: number, naoConformes: number) => {
    const total = conformes + naoConformes;
    const percentual = total > 0 ? (conformes / total) * 100 : 0;
    
    if (percentual >= 90) {
      return <Badge className="bg-green-100 text-green-800">Excelente</Badge>;
    } else if (percentual >= 70) {
      return <Badge className="bg-yellow-100 text-yellow-800">Bom</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Atenção</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Verificações TP</CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por equipe ou responsável..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterBase} onValueChange={setFilterBase}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por equipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as equipes</SelectItem>
                <SelectItem value="Alfa">Alfa</SelectItem>
                <SelectItem value="Bravo">Bravo</SelectItem>
                <SelectItem value="Charlie">Charlie</SelectItem>
                <SelectItem value="Delta">Delta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {/* Indicador de Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Carregando verificações...</span>
            </div>
          )}

          {/* Tabela */}
          {!isLoading && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipe</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Conformes</TableHead>
                  <TableHead>Não Conformes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVerificacoes.map((verificacao) => (
                  <TableRow key={verificacao.id}>
                    <TableCell className="font-medium">{verificacao.equipe}</TableCell>
                    <TableCell>
                      {format(new Date(verificacao.data_verificacao), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>{verificacao.responsavel}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">
                        {verificacao.total_conformes}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-red-100 text-red-800">
                        {verificacao.total_nao_conformes}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(verificacao.total_conformes, verificacao.total_nao_conformes)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            disabled={deleteVerificacao.isPending}
                          >
                            {deleteVerificacao.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreVertical className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(verificacao)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(verificacao)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(verificacao)}
                            className="text-red-600"
                            disabled={deleteVerificacao.isPending}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && filteredVerificacoes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma verificação encontrada.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modais */}
      <TPVerificacaoDetailsModal
        verificacao={selectedVerificacao}
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
      />

      {isEditModalOpen && selectedVerificacao && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Editar Verificação - {selectedVerificacao.equipe}</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditModalOpen(false)}
              >
                ✕
              </Button>
            </div>
            <TPVerificacaoForm />
          </div>
        </div>
      )}
    </div>
  );
};

export default TPVerificacaoDashboard;