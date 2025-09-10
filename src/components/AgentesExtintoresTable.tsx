import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Droplets, 
  Flame, 
  Wind,
  AlertTriangle,
  MoreVertical,
  Eye
} from "lucide-react";
import { useAgentesExtintores } from "@/hooks/useAgentesExtintores";
import { AgenteExtintor } from "@/hooks/useAgentesExtintores";
import { Skeleton } from "@/components/ui/skeleton";

const AgentesExtintoresTable = () => {
  const { agentes, loading, createAgente, updateAgente, deleteAgente } = useAgentesExtintores();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgente, setEditingAgente] = useState<AgenteExtintor | null>(null);
  const [viewingAgente, setViewingAgente] = useState<AgenteExtintor | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<AgenteExtintor | null>(null);
  const [formData, setFormData] = useState({
    lote: '',
    situacao: 'ESTOQUE',
    tipo: 'LGE',
    fabricante: '',
    quantidade: 0,
    unidade: 'litros',
    data_fabricacao: '',
    data_validade: '',
    data_recarga: '',
    data_teste_hidrostatico: '',
    validade_ensaio: '',
    proximo_teste_hidrostatico: '',
    localizacao: '',
    observacoes: '',
    data_modificacao: new Date().toISOString().split('T')[0]
  });

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "LGE": return <Droplets className="h-4 w-4 text-blue-600" />;
      case "PO_QUIMICO": return <Flame className="h-4 w-4 text-red-600" />;
      case "NITROGENIO": return <Wind className="h-4 w-4 text-green-600" />;
      default: return null;
    }
  };

  const isVencimentoProximo = (dataValidade: string) => {
    const hoje = new Date();
    const validade = new Date(dataValidade);
    const diasRestantes = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diasRestantes <= 30;
  };

  const filteredAgentes = agentes.filter(agente => {
    const matchesSearch = 
      agente.fabricante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agente.tipo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterTipo === "todos" || agente.tipo === filterTipo;
    
    return matchesSearch && matchesFilter;
  });

  // Função para formatar campos de data (converter string vazia para null)
  const formatDateField = (dateValue: string): string | null => {
    return dateValue.trim() === '' ? null : dateValue;
  };

  // Função para formatar data para input (converter null para string vazia)
  const formatDateForInput = (dateValue: string | null): string => {
    return dateValue === null ? '' : dateValue;
  };

  // Função para validar campos de data obrigatórios
  const validateRequiredDateFields = (formData: any, tipo: string, unidade: string): string[] => {
    const errors: string[] = [];
    
    // Data de fabricação é sempre obrigatória
    if (!formData.data_fabricacao || formData.data_fabricacao.trim() === '') {
      errors.push('Data de Fabricação é obrigatória');
    }
    
    // Para Nitrogênio com Cilindros, campos de teste hidrostático são obrigatórios
    if (tipo === 'NITROGENIO' && unidade === 'cilindros') {
      if (!formData.data_teste_hidrostatico || formData.data_teste_hidrostatico.trim() === '') {
        errors.push('Data do Teste Hidrostático é obrigatória para Nitrogênio com Cilindros');
      }
      if (!formData.proximo_teste_hidrostatico || formData.proximo_teste_hidrostatico.trim() === '') {
        errors.push('Data do Próximo Teste Hidrostático é obrigatória para Nitrogênio com Cilindros');
      }
    }
    
    // Para LGE, campos específicos podem ser obrigatórios
    if (tipo === 'LGE') {
      if (!formData.data_validade || formData.data_validade.trim() === '') {
        errors.push('Data de Validade é obrigatória para LGE');
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validar campos de data obrigatórios
      const validationErrors = validateRequiredDateFields(formData, formData.tipo, formData.unidade);
      
      if (validationErrors.length > 0) {
        toast({
          title: "Erro de Validação",
          description: validationErrors.join('. '),
          variant: "destructive",
        });
        return;
      }
      
      const agenteData = {
        tipo: formData.tipo,
        fabricante: formData.fabricante,
        lote: formData.lote || null,
        quantidade: formData.quantidade,
        unidade: formData.unidade,
        data_fabricacao: formatDateField(formData.data_fabricacao),
        data_validade: formatDateField(formData.data_validade),
        data_teste_hidrostatico: formatDateField(formData.data_teste_hidrostatico),
        validade_ensaio: formatDateField(formData.validade_ensaio),
        proximo_teste_hidrostatico: formatDateField(formData.proximo_teste_hidrostatico),
        situacao: formData.situacao,
        data_modificacao: formatDateField(formData.data_modificacao)
      };
      
      if (editingAgente) {
        await updateAgente.mutateAsync({ id: editingAgente.id, updates: agenteData });
      } else {
        await createAgente.mutateAsync(agenteData);
      }
      
      setIsDialogOpen(false);
      setEditingAgente(null);
      setFormData({
        lote: '',
        situacao: 'ESTOQUE',
        tipo: 'LGE',
        fabricante: '',
        quantidade: 0,
        unidade: 'litros',
        data_fabricacao: '',
        data_validade: '',
        data_recarga: '',
        data_teste_hidrostatico: '',
        validade_ensaio: '',
        proximo_teste_hidrostatico: '',
        localizacao: '',
        observacoes: '',
        data_modificacao: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error("Erro ao salvar agente:", error);
    }
  };

  const handleEdit = (agente: AgenteExtintor) => {
    setEditingAgente(agente);
    
    // Função para converter null em string vazia para os inputs
    const formatDateForInput = (dateValue: string | null | undefined) => {
      return dateValue || "";
    };
    
    setFormData({
      tipo: agente.tipo,
      fabricante: agente.fabricante,
      lote: agente.lote || "",
      quantidade: agente.quantidade,
      unidade: agente.unidade,
      data_fabricacao: formatDateForInput(agente.data_fabricacao),
      data_validade: formatDateForInput(agente.data_validade),
      data_recarga: '',
      data_teste_hidrostatico: formatDateForInput(agente.data_teste_hidrostatico),
      validade_ensaio: formatDateForInput(agente.validade_ensaio),
      proximo_teste_hidrostatico: formatDateForInput(agente.proximo_teste_hidrostatico),
      localizacao: '',
      observacoes: '',
      situacao: agente.situacao,
      data_modificacao: new Date().toISOString().split('T')[0]
    });
    setIsDialogOpen(true);
  };

  const handleView = (agente: AgenteExtintor) => {
    setViewingAgente(agente);
    setIsViewDialogOpen(true);
  };

  const handleDeleteClick = (agente: AgenteExtintor) => {
    setAgentToDelete(agente);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (agentToDelete && deleteAgente) {
      try {
        await deleteAgente.mutateAsync(agentToDelete.id);
        setIsDeleteDialogOpen(false);
        setAgentToDelete(null);
      } catch (error) {
        console.error("Erro ao excluir agente:", error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setAgentToDelete(null);
  };

  const getSituacaoLabel = (situacao: string) => {
    switch (situacao) {
      case 'ESTOQUE': return 'Estoque';
      case 'EM_USO': return 'Em Uso';
      case 'MANUTENCAO': return 'Manutenção';
      case 'DESCARTADO': return 'Descartado';
      default: return situacao;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'PO_QUIMICO': return 'Pó Químico';
      case 'LGE': return 'LGE';
      case 'NITROGENIO': return 'Nitrogênio';
      default: return tipo;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gestão de Agentes Extintores</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingAgente(null);
                setFormData({
                  tipo: "LGE",
                  fabricante: "",
                  lote: "",
                  quantidade: 0,
                  unidade: "litros",
                  data_fabricacao: "",
                  data_validade: "",
                  data_recarga: "",
                  data_teste_hidrostatico: "",
                  validade_ensaio: "",
                  proximo_teste_hidrostatico: "",
                  localizacao: "",
                  observacoes: "",
                  situacao: "ESTOQUE",
                  data_modificacao: new Date().toISOString().split('T')[0]
                });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Agente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingAgente ? "Editar Agente Extintor" : "Adicionar Novo Agente Extintor"}
                </DialogTitle>
                <DialogDescription>
                  Preencha as informações do agente extintor.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Campo Data da Modificação */}
                <div>
                  <Label htmlFor="data_modificacao">Data da Modificação*</Label>
                  <Input
                    id="data_modificacao"
                    type="date"
                    value={formData.data_modificacao}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_modificacao: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo">Tipo de Agente*</Label>
                    <Select value={formData.tipo} onValueChange={(value: "LGE" | "PO_QUIMICO" | "NITROGENIO") => setFormData(prev => ({ ...prev, tipo: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LGE">LGE (Líquido Gerador de Espuma)</SelectItem>
                        <SelectItem value="PO_QUIMICO">Pó Químico</SelectItem>
                        <SelectItem value="NITROGENIO">Nitrogênio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="fabricante">Fabricante*</Label>
                    <Input
                      id="fabricante"
                      value={formData.fabricante}
                      onChange={(e) => setFormData(prev => ({ ...prev, fabricante: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lote">Lote</Label>
                    <Input
                      id="lote"
                      value={formData.lote}
                      onChange={(e) => setFormData(prev => ({ ...prev, lote: e.target.value }))}
                      placeholder="Número do lote"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantidade">Quantidade*</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      value={formData.quantidade}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantidade: Number(e.target.value) }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="unidade">Unidade*</Label>
                    <Select value={formData.unidade} onValueChange={(value) => setFormData(prev => ({ ...prev, unidade: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="litros">Litros</SelectItem>
                        <SelectItem value="kg">Quilogramas</SelectItem>
                        <SelectItem value="cilindros">Cilindros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Campo data_fabricacao sempre presente */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="data_fabricacao">Data de Fabricação*</Label>
                    <Input
                      id="data_fabricacao"
                      type="date"
                      value={formData.data_fabricacao}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_fabricacao: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="data_validade">Data de Validade</Label>
                    <Input
                      id="data_validade"
                      type="date"
                      value={formData.data_validade}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_validade: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Campos específicos para Nitrogênio com cilindros */}
                {formData.tipo === 'NITROGENIO' && formData.unidade === 'cilindros' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="data_teste_hidrostatico">Data do Teste Hidrostático*</Label>
                      <Input
                        id="data_teste_hidrostatico"
                        type="date"
                        value={formData.data_teste_hidrostatico}
                        onChange={(e) => setFormData(prev => ({ ...prev, data_teste_hidrostatico: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="proximo_teste_hidrostatico">Data do Próximo Teste Hidrostático*</Label>
                      <Input
                        id="proximo_teste_hidrostatico"
                        type="date"
                        value={formData.proximo_teste_hidrostatico}
                        onChange={(e) => setFormData(prev => ({ ...prev, proximo_teste_hidrostatico: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Campo condicional para LGE */}
                {formData.tipo === 'LGE' && (
                  <div>
                    <Label htmlFor="validade_ensaio">Validade do Ensaio*</Label>
                    <Input
                      id="validade_ensaio"
                      type="date"
                      value={formData.validade_ensaio}
                      onChange={(e) => setFormData(prev => ({ ...prev, validade_ensaio: e.target.value }))}
                      required
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="situacao">Situação*</Label>
                  <Select value={formData.situacao} onValueChange={(value: "ESTOQUE" | "EM_USO" | "MANUTENCAO" | "DESCARTADO") => setFormData(prev => ({ ...prev, situacao: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ESTOQUE">Estoque</SelectItem>
                      <SelectItem value="EM_USO">Em Uso</SelectItem>
                      <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
                      <SelectItem value="DESCARTADO">Descartado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingAgente ? "Atualizar" : "Adicionar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por tipo ou fabricante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="LGE">LGE</SelectItem>
                <SelectItem value="PO_QUIMICO">Pó Químico</SelectItem>
                <SelectItem value="NITROGENIO">Nitrogênio</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fabricante</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Data Fabricação</TableHead>
                  <TableHead>Data Validade</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgentes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      {searchTerm || filterTipo !== "todos" 
                        ? "Nenhum agente encontrado com os filtros aplicados."
                        : "Nenhum agente extintor cadastrado."
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAgentes.map((agente) => (
                    <TableRow key={agente.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTipoIcon(agente.tipo)}
                          <span className="font-medium">
                            {agente.tipo === "PO_QUIMICO" ? "Pó Químico" : agente.tipo}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{agente.fabricante}</TableCell>
                      <TableCell>{agente.lote || 'N/A'}</TableCell>
                      <TableCell>{agente.quantidade}</TableCell>
                      <TableCell>{agente.unidade}</TableCell>
                      <TableCell>{new Date(agente.data_fabricacao + 'T00:00:00').toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {agente.data_validade && isVencimentoProximo(agente.data_validade) && (
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                          )}
                          <span className={agente.data_validade && isVencimentoProximo(agente.data_validade) ? "text-amber-700 font-medium" : ""}>
                            {agente.data_validade ? new Date(agente.data_validade + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={agente.situacao === 'ESTOQUE' ? 'default' : agente.situacao === 'EM_USO' ? 'secondary' : agente.situacao === 'MANUTENCAO' ? 'destructive' : 'outline'}>
                          {agente.situacao}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(agente)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(agente)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClick(agente)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {filteredAgentes.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Mostrando {filteredAgentes.length} de {agentes.length} agentes extintores
            </div>
          )}
        </div>
      </CardContent>

      {/* Modal de Visualização */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Agente Extintor</DialogTitle>
            <DialogDescription>
              Informações completas do agente extintor selecionado.
            </DialogDescription>
          </DialogHeader>
          {viewingAgente && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Tipo</Label>
                <div className="flex items-center gap-2">
                  {getTipoIcon(viewingAgente.tipo)}
                  <span>{getTipoLabel(viewingAgente.tipo)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Fabricante</Label>
                <p>{viewingAgente.fabricante}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Lote</Label>
                <p>{viewingAgente.lote || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Quantidade</Label>
                <p>{viewingAgente.quantidade} {viewingAgente.unidade}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Data de Fabricação</Label>
                <p>{new Date(viewingAgente.data_fabricacao + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Data de Validade</Label>
                <div className="flex items-center gap-2">
                  {viewingAgente.data_validade && isVencimentoProximo(viewingAgente.data_validade) && (
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  )}
                  <span className={viewingAgente.data_validade && isVencimentoProximo(viewingAgente.data_validade) ? "text-amber-700 font-medium" : ""}>
                    {viewingAgente.data_validade ? new Date(viewingAgente.data_validade + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Situação</Label>
                <Badge variant={viewingAgente.situacao === 'ESTOQUE' ? 'default' : viewingAgente.situacao === 'EM_USO' ? 'secondary' : viewingAgente.situacao === 'MANUTENCAO' ? 'destructive' : 'outline'}>
                  {getSituacaoLabel(viewingAgente.situacao)}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O agente extintor será permanentemente removido do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {agentToDelete && (
            <div className="mt-2 p-2 bg-muted rounded">
              <strong>{getTipoLabel(agentToDelete.tipo)}</strong> - {agentToDelete.fabricante}
              {agentToDelete.lote && ` (Lote: ${agentToDelete.lote})`}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default AgentesExtintoresTable;