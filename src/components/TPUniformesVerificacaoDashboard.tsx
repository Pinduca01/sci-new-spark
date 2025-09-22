import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Label } from './ui/label';
import { 
  SearchIcon, 
  EyeIcon, 
  EditIcon, 
  TrashIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  BarChart3Icon
} from 'lucide-react';
import { useTPVerificacoesUniformes, useTPVerificacoesUniformesEstatisticas, useDeleteTPVerificacaoUniformes, TPVerificacaoUniformes } from '../hooks/useTPVerificacoesUniformes';
import TPUniformesVerificacaoForm from './TPUniformesVerificacaoForm';
import { toast } from 'sonner';
import { formatarHora, formatarData } from '@/lib/utils';

interface TPUniformesVerificacaoDashboardProps {
  onNovaVerificacao?: () => void;
}

const TPUniformesVerificacaoDashboard: React.FC<TPUniformesVerificacaoDashboardProps> = ({
  onNovaVerificacao
}) => {
  const { data: verificacoes = [], isLoading, error } = useTPVerificacoesUniformes();
  const deleteVerificacao = useDeleteTPVerificacaoUniformes();
  const { data: estatisticas, isLoading: isLoadingEstatisticas } = useTPVerificacoesUniformesEstatisticas();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [verificacaoSelecionada, setVerificacaoSelecionada] = useState<TPVerificacaoUniformes | null>(null);
  const [verificacaoParaEdicao, setVerificacaoParaEdicao] = useState<TPVerificacaoUniformes | null>(null);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [showEdicaoModal, setShowEdicaoModal] = useState(false);

  // Filtrar verificações baseado no termo de busca
  const verificacoesFiltradas = verificacoes.filter(verificacao =>
    verificacao.local.toLowerCase().includes(searchTerm.toLowerCase()) ||
    verificacao.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    verificacao.equipe.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExcluirVerificacao = async (id: string) => {
    try {
      await deleteVerificacao.mutateAsync(id);
    } catch (error) {
      console.error('Erro ao excluir verificação:', error);
    }
  };

  const handleEditarVerificacao = (verificacao: TPVerificacaoUniformes) => {
    setVerificacaoParaEdicao(verificacao);
    setShowEdicaoModal(true);
  };

  const handleVerDetalhes = (verificacao: TPVerificacaoUniformes) => {
    setVerificacaoSelecionada(verificacao);
    setShowDetalhesModal(true);
  };

  const itensVerificacao = [
    { key: 'possui_2_gandolas_bombeiro', label: '2 Gandolas de Bombeiro' },
    { key: 'possui_2_calcas_bombeiro', label: '2 Calças de Bombeiro' },
    { key: 'possui_1_cinto_bombeiro', label: '1 Cinto de Bombeiro' },
    { key: 'possui_bota_seguranca', label: 'Bota de Segurança' },
    { key: 'possui_4_camisas_bombeiro', label: '4 Camisas de Bombeiro' },
    { key: 'possui_2_bermudas_bombeiro', label: '2 Bermudas de Bombeiro' },
    { key: 'possui_tarjeta_identificacao', label: 'Tarjeta de Identificação' },
    { key: 'possui_oculos_protetor_auricular', label: 'Óculos/Protetor Auricular' }
  ];

  if (isLoading && verificacoes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando verificações...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Erro ao carregar verificações: {error.message}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{estatisticas?.totalVerificacoes || 0}</p>
              </div>
              <BarChart3Icon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">{estatisticas?.verificacoesConcluidas || 0}</p>
              </div>
              <TrendingUpIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-orange-600">{estatisticas?.verificacoesEmAndamento || 0}</p>
              </div>
              <TrendingDownIcon className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conformidade Média</p>
                <p className="text-2xl font-bold text-blue-600">{estatisticas?.conformidadeMedia || 0}%</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Verificações de Uniformes</CardTitle>
          <CardDescription>
            Gerencie e visualize todas as verificações de uniformes realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por colaborador, verificador ou função..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={onNovaVerificacao} className="bg-blue-600 hover:bg-blue-700">
              Nova Verificação
            </Button>
          </div>

          {/* Tabela de Verificações */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Local</TableHead>
                  <TableHead>Equipe</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verificacoesFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-gray-500">
                        {searchTerm ? 'Nenhuma verificação encontrada com os filtros aplicados.' : 'Nenhuma verificação encontrada.'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  verificacoesFiltradas.map((verificacao) => (
                    <TableRow key={verificacao.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          {verificacao.local}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{verificacao.equipe}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          {formatarData(verificacao.data_verificacao)}
                        </div>
                      </TableCell>
                      <TableCell>{verificacao.responsavel}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={verificacao.status === 'concluida' ? 'default' : 
                                 verificacao.status === 'em_andamento' ? 'secondary' : 'destructive'}
                        >
                          {verificacao.status === 'concluida' ? 'Concluída' : 
                           verificacao.status === 'em_andamento' ? 'Em Andamento' : 'Cancelada'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVerDetalhes(verificacao)}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditarVerificacao(verificacao)}
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a verificação de {verificacao.responsavel}? 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleExcluirVerificacao(verificacao.id!)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog open={showDetalhesModal} onOpenChange={setShowDetalhesModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Verificação</DialogTitle>
            <DialogDescription>
              Informações completas da verificação de uniformes
            </DialogDescription>
          </DialogHeader>
          
          {verificacaoSelecionada && (
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Local</Label>
                  <p className="text-sm">{verificacaoSelecionada.local}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Equipe</Label>
                  <p className="text-sm">{verificacaoSelecionada.equipe}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Data</Label>
                  <p className="text-sm">{formatarData(verificacaoSelecionada.data_verificacao)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Hora</Label>
                   <p className="text-sm">{formatarHora(verificacaoSelecionada.hora_verificacao)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Responsável</Label>
                  <p className="text-sm">{verificacaoSelecionada.responsavel}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <div className="mt-1">
                    <Badge 
                      variant={verificacaoSelecionada.status === 'concluida' ? 'default' : 
                             verificacaoSelecionada.status === 'em_andamento' ? 'secondary' : 'destructive'}
                    >
                      {verificacaoSelecionada.status === 'concluida' ? 'Concluída' : 
                       verificacaoSelecionada.status === 'em_andamento' ? 'Em Andamento' : 'Cancelada'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div>
                <Label className="text-sm font-medium text-gray-600 mb-3 block">Checklist de Uniformes</Label>
                <div className="space-y-2">
                  {itensVerificacao.map((item, index) => {
                    const possui = Boolean(verificacaoSelecionada[item.key as keyof TPVerificacaoUniformes]);
                    return (
                      <div key={item.key} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{index + 1}. {item.label}</span>
                        <div className="flex items-center gap-2">
                          {possui ? (
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircleIcon className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`text-xs font-medium ${
                            possui ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {possui ? 'SIM' : 'NÃO'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Observações */}
              {verificacaoSelecionada.observacoes && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Observações</Label>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded">
                    {verificacaoSelecionada.observacoes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={showEdicaoModal} onOpenChange={setShowEdicaoModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Verificação</DialogTitle>
            <DialogDescription>
              Edite as informações da verificação de uniformes
            </DialogDescription>
          </DialogHeader>
          
          {verificacaoParaEdicao && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Local</Label>
                <Input 
                  value={verificacaoParaEdicao.local || ''} 
                  onChange={(e) => setVerificacaoParaEdicao(prev => 
                    prev ? {...prev, local: e.target.value} : null
                  )}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Equipe</Label>
                <select 
                  className="w-full p-2 border rounded"
                  value={verificacaoParaEdicao.equipe || ''} 
                   onChange={(e) => setVerificacaoParaEdicao(prev => 
                     prev ? {...prev, equipe: e.target.value as 'Alfa' | 'Bravo' | 'Charlie' | 'Delta'} : null
                   )}
                >
                  <option value="">Selecione uma equipe</option>
                  <option value="Alfa">Alfa</option>
                  <option value="Bravo">Bravo</option>
                  <option value="Charlie">Charlie</option>
                  <option value="Delta">Delta</option>
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium">Responsável</Label>
                <Input 
                  value={verificacaoParaEdicao.responsavel || ''} 
                  onChange={(e) => setVerificacaoParaEdicao(prev => 
                    prev ? {...prev, responsavel: e.target.value} : null
                  )}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Observações</Label>
                <Input 
                  value={verificacaoParaEdicao.observacoes || ''} 
                  onChange={(e) => setVerificacaoParaEdicao(prev => 
                    prev ? {...prev, observacoes: e.target.value} : null
                  )}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEdicaoModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => {
                  // Implementar lógica de atualização
                  setShowEdicaoModal(false)
                }}>
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};



export default TPUniformesVerificacaoDashboard;