import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabase";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Droplets,
  Flame,
  Wind,
  Minus,
  Plus,
  AlertTriangle,
  Loader2,
  History,
  Clock,
  Trash2
} from "lucide-react";
import { useAgentesExtintores } from "@/hooks/useAgentesExtintores";
import { AgenteExtintor, Movimentacao } from "@/hooks/useAgentesExtintores";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AgentesExtintoresMovimentacaoForm = () => {
  const { agentes, movimentacoes, loading, registrarMovimentacao, deleteMovimentacao } = useAgentesExtintores();
  // Estados removidos do formulário principal - mantendo apenas remoção rápida

  // Estados para remoção rápida
  const [quickRemovalAgente, setQuickRemovalAgente] = useState<string>("");
  const [quickRemovalQuantity, setQuickRemovalQuantity] = useState<number>(0);
  const [quickRemovalReason, setQuickRemovalReason] = useState("");
  const [quickRemovalResponsible, setQuickRemovalResponsible] = useState("");
  const [quickRemovalEquipe, setQuickRemovalEquipe] = useState<string>("");
  const [isQuickRemoving, setIsQuickRemoving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [movimentacaoToDelete, setMovimentacaoToDelete] = useState<string | null>(null);

  const agentesAtivos = agentes.filter(a => a.situacao === "ESTOQUE");
  const quickRemovalAgenteSelected = agentesAtivos.find(a => a.id === quickRemovalAgente);

  // Filtrar e processar movimentações de remoção
  const remocoes = movimentacoes
    .filter(mov => mov.tipo_movimentacao === 'SAIDA')
    .slice(0, 20)
    .sort((a, b) => new Date(b.data_movimentacao).getTime() - new Date(a.data_movimentacao).getTime());

  // Parser para extrair informações das observações
  const parseObservacoes = (observacoes: string | undefined) => {
    if (!observacoes) return { motivo: 'Não informado', responsavel: 'Não informado' };
    
    // Formato esperado: "Remoção rápida de estoque - [MOTIVO] | Responsável: [NOME]"
    const motivoMatch = observacoes.match(/Remoção rápida de estoque - (.+?) \|/);
    const responsavelMatch = observacoes.match(/Responsável: (.+)$/);
    
    return {
      motivo: motivoMatch ? motivoMatch[1].trim() : observacoes.split('|')[0]?.trim() || 'Não informado',
      responsavel: responsavelMatch ? responsavelMatch[1].trim() : 'Não informado'
    };
  };

  // Função para confirmar exclusão de movimentação
  const handleDeleteMovimentacao = (movimentacaoId: string) => {
    setMovimentacaoToDelete(movimentacaoId);
    setShowDeleteModal(true);
  };

  // Função para executar a exclusão
  const confirmDeleteMovimentacao = async () => {
    if (movimentacaoToDelete) {
      try {
        await deleteMovimentacao(movimentacaoToDelete);
        setShowDeleteModal(false);
        setMovimentacaoToDelete(null);
        toast.success("Movimentação removida com sucesso!");
      } catch (error) {
        console.error('Erro ao excluir movimentação:', error);
        toast.error("Erro ao remover movimentação");
      }
    }
  };

  // Formatação de data em pt-BR
  const formatarDataHora = (dataISO: string) => {
    const data = new Date(dataISO);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para obter badge da equipe
  const getEquipeBadge = (equipe: string) => {
    const cores = {
      'Alfa': 'bg-blue-100 text-blue-800',
      'Bravo': 'bg-green-100 text-green-800', 
      'Charlie': 'bg-yellow-100 text-yellow-800',
      'Delta': 'bg-purple-100 text-purple-800'
    };
    
    return (
      <Badge className={cores[equipe as keyof typeof cores] || 'bg-gray-100 text-gray-800'}>
        {equipe}
      </Badge>
    );
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "LGE": return <Droplets className="h-4 w-4 text-blue-600" />;
      case "PO_QUIMICO": return <Flame className="h-4 w-4 text-red-600" />;
      case "NITROGENIO": return <Wind className="h-4 w-4 text-green-600" />;
      default: return null;
    }
  };

  const getTipoMovimentacaoBadge = (tipo: string) => {
    switch (tipo) {
      case "SAIDA_OCORRENCIA":
        return <Badge className="bg-red-100 text-red-800">Saída - Ocorrência</Badge>;
      case "SAIDA_TREINAMENTO":
        return <Badge className="bg-blue-100 text-blue-800">Saída - Treinamento</Badge>;
      case "SAIDA_MANUTENCAO":
        return <Badge className="bg-amber-100 text-amber-800">Saída - Manutenção</Badge>;
      case "ENTRADA_COMPRA":
        return <Badge className="bg-green-100 text-green-800">Entrada - Compra</Badge>;
      case "ENTRADA_DEVOLUCAO":
        return <Badge className="bg-purple-100 text-purple-800">Entrada - Devolução</Badge>;
      case "TRANSFERENCIA":
        return <Badge variant="outline">Transferência</Badge>;
      default:
        return <Badge variant="secondary">{tipo}</Badge>;
    }
  };

  // Função handleSubmit removida - não mais necessária

  // Função para remoção rápida
  const handleQuickRemoval = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quickRemovalAgente || !quickRemovalQuantity || !quickRemovalReason.trim() || !quickRemovalResponsible.trim() || !quickRemovalEquipe) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (quickRemovalQuantity <= 0) {
      toast.error("A quantidade deve ser maior que zero");
      return;
    }

    // Verificar se há estoque suficiente
    if (quickRemovalAgenteSelected && quickRemovalQuantity > quickRemovalAgenteSelected.quantidade) {
      toast.error(`Quantidade insuficiente em estoque. Disponível: ${quickRemovalAgenteSelected.quantidade} ${quickRemovalAgenteSelected.unidade}`);
      return;
    }

    setIsQuickRemoving(true);
    
    try {
      const observacoesCompletas = `Remoção rápida de estoque - ${quickRemovalReason} | Responsável: ${quickRemovalResponsible}`;
      
      // Obter usuário autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast.error("Usuário não autenticado. Faça login para continuar.");
        return;
      }

      const movimentacaoData = {
        agente_id: quickRemovalAgente,
        usuario_id: user.id,
        tipo_movimentacao: "SAIDA",
        quantidade: quickRemovalQuantity,
        equipe: quickRemovalEquipe as 'Alfa' | 'Bravo' | 'Charlie' | 'Delta',
        observacoes: observacoesCompletas,
        data_movimentacao: new Date().toISOString()
      };

      await registrarMovimentacao(movimentacaoData);
      
      // Reset form
      setQuickRemovalAgente("");
      setQuickRemovalQuantity(0);
      setQuickRemovalReason("");
      setQuickRemovalResponsible("");
      setQuickRemovalEquipe("");
      
      toast.success("Remoção registrada com sucesso!");
    } catch (error) {
      console.error("Erro ao registrar remoção:", error);
      toast.error("Erro ao registrar remoção");
    } finally {
      setIsQuickRemoving(false);
    }
  };

  // Filtro de movimentações removido - não mais necessário

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card de Remoção Rápida */}
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Minus className="h-5 w-5" />
            Remoção Rápida de Estoque
          </CardTitle>
          <p className="text-sm text-red-600">Interface simplificada para remoção de itens do estoque</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleQuickRemoval} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Seleção do Agente */}
              <div className="space-y-2">
                <Label htmlFor="quick-agente">Agente Extintor *</Label>
                <Select value={quickRemovalAgente} onValueChange={setQuickRemovalAgente}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o agente" />
                  </SelectTrigger>
                  <SelectContent>
                    {agentesAtivos.map((agente) => (
                      <SelectItem key={agente.id} value={agente.id}>
                        <div className="flex items-center gap-2">
                          {getTipoIcon(agente.tipo)}
                          <span>{agente.tipo} - {agente.lote}</span>
                          <Badge variant="outline" className="ml-auto">
                            {agente.quantidade} {agente.unidade}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantidade */}
              <div className="space-y-2">
                <Label htmlFor="quick-quantidade">Quantidade a Remover *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="quick-quantidade"
                    type="number"
                    min="1"
                    max={quickRemovalAgenteSelected?.quantidade || 0}
                    value={quickRemovalQuantity || ""}
                    onChange={(e) => setQuickRemovalQuantity(Number(e.target.value))}
                    placeholder="0"
                    className="flex-1"
                  />
                  {quickRemovalAgenteSelected && (
                    <span className="text-sm text-gray-500">
                      / {quickRemovalAgenteSelected.quantidade} {quickRemovalAgenteSelected.unidade}
                    </span>
                  )}
                </div>
                {quickRemovalAgenteSelected && quickRemovalQuantity > quickRemovalAgenteSelected.quantidade && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    Quantidade maior que o disponível em estoque
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Motivo da Remoção */}
              <div className="space-y-2">
                <Label htmlFor="quick-motivo">Motivo da Remoção *</Label>
                <Input
                  id="quick-motivo"
                  value={quickRemovalReason}
                  onChange={(e) => setQuickRemovalReason(e.target.value)}
                  placeholder="Ex: Utilizado em ocorrência, Vencimento, Defeito..."
                />
              </div>

              {/* Responsável */}
              <div className="space-y-2">
                <Label htmlFor="quick-responsavel">Responsável *</Label>
                <Input
                  id="quick-responsavel"
                  value={quickRemovalResponsible}
                  onChange={(e) => setQuickRemovalResponsible(e.target.value)}
                  placeholder="Nome do responsável"
                />
              </div>

              {/* Equipe Responsável */}
              <div className="space-y-2">
                <Label htmlFor="quick-equipe">Equipe Responsável *</Label>
                <Select value={quickRemovalEquipe} onValueChange={setQuickRemovalEquipe}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a equipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alfa">Alfa</SelectItem>
                    <SelectItem value="Bravo">Bravo</SelectItem>
                    <SelectItem value="Charlie">Charlie</SelectItem>
                    <SelectItem value="Delta">Delta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Informações do Agente Selecionado */}
            {quickRemovalAgenteSelected && (
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  {getTipoIcon(quickRemovalAgenteSelected.tipo)}
                  Informações do Agente
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Tipo:</span>
                    <p className="font-medium">{quickRemovalAgenteSelected.tipo}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Lote:</span>
                    <p className="font-medium">{quickRemovalAgenteSelected.lote}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Estoque Atual:</span>
                    <p className="font-medium">{quickRemovalAgenteSelected.quantidade} {quickRemovalAgenteSelected.unidade}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Após Remoção:</span>
                    <p className="font-medium text-red-600">
                      {Math.max(0, quickRemovalAgenteSelected.quantidade - (quickRemovalQuantity || 0))} {quickRemovalAgenteSelected.unidade}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setQuickRemovalAgente("");
                  setQuickRemovalQuantity(0);
                  setQuickRemovalReason("");
                  setQuickRemovalResponsible("");
                }}
                disabled={isQuickRemoving}
              >
                Limpar
              </Button>
              <Button
                type="submit"
                disabled={isQuickRemoving || !quickRemovalAgente || !quickRemovalQuantity || !quickRemovalReason.trim() || !quickRemovalResponsible.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                {isQuickRemoving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Removendo...
                  </>
                ) : (
                  <>
                    <Minus className="h-4 w-4 mr-2" />
                    Remover do Estoque
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Formulário principal removido - mantendo apenas remoção rápida */}

      {/* Card do Histórico de Remoções */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Remoções
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Registro completo de todas as remoções realizadas no estoque
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : remocoes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma remoção registrada ainda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Agente Extintor</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Equipe</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {remocoes.map((remocao) => {
                    const agente = agentes.find(a => a.id === remocao.agente_id);
                    const { motivo, responsavel } = parseObservacoes(remocao.observacoes);
                    
                    return (
                      <TableRow key={remocao.id}>
                        <TableCell className="font-medium">
                          {formatarDataHora(remocao.data_movimentacao)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {agente && getTipoIcon(agente.tipo)}
                            <div>
                              <div className="font-medium">{agente?.tipo || 'N/A'}</div>
                              <div className="text-sm text-muted-foreground">
                                {agente?.numero_serie || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">
                            -{remocao.quantidade}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{motivo}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{responsavel}</span>
                        </TableCell>
                        <TableCell>
                          {remocao.equipe ? getEquipeBadge(remocao.equipe) : (
                            <Badge variant="outline">N/A</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMovimentacao(remocao.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Remover movimentação"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de confirmação para exclusão */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta movimentação? Esta ação não pode ser desfeita e a quantidade será revertida no estoque do agente extintor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteMovimentacao}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AgentesExtintoresMovimentacaoForm;