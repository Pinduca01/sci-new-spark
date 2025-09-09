
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { Search, ClipboardCheck, Calendar, User, Eye, Edit, Trash2, Filter, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ChecklistHistorico {
  id: string;
  tipo_checklist: string;
  bombeiro_responsavel: string;
  data_checklist: string;
  itens_checklist: any[];
  created_at: string;
  timestamp_conclusao?: string;
}

interface HistoricoChecklistsProps {
  viaturaId?: string;
  tipoFiltro?: string;
}

export const HistoricoChecklists = ({ viaturaId, tipoFiltro }: HistoricoChecklistsProps) => {
  const [checklists, setChecklists] = useState<ChecklistHistorico[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [operadorFilter, setOperadorFilter] = useState("all");
  const [dataInicioFilter, setDataInicioFilter] = useState("");
  const [dataFimFilter, setDataFimFilter] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<ChecklistHistorico | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<ChecklistHistorico | null>(null);

  useEffect(() => {
    fetchChecklists();
  }, [viaturaId, tipoFiltro]);

  const fetchChecklists = async () => {
    try {
      let query = supabase
        .from("checklists_viaturas")
        .select("*")
        .order("created_at", { ascending: false });

      if (viaturaId) {
        query = query.eq("viatura_id", viaturaId);
      }

      if (tipoFiltro) {
        query = query.eq("tipo_checklist", tipoFiltro);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Erro ao buscar checklists:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o histórico de checklists.",
          variant: "destructive",
        });
        return;
      }

      setChecklists((data || []) as any);
    } catch (error) {
      console.error("Erro ao buscar checklists:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChecklists = checklists.filter((checklist) => {
    // Filtro de busca geral
    const matchesSearch = searchTerm === "" || 
      checklist.bombeiro_responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checklist.tipo_checklist.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por operador específico
    const matchesOperador = operadorFilter === "" || operadorFilter === "all" || 
      checklist.bombeiro_responsavel.toLowerCase().includes(operadorFilter.toLowerCase());
    
    // Filtro por intervalo de datas
    const checklistDate = new Date(checklist.data_checklist);
    const matchesDataInicio = dataInicioFilter === "" || 
      checklistDate >= new Date(dataInicioFilter + "T00:00:00");
    const matchesDataFim = dataFimFilter === "" || 
      checklistDate <= new Date(dataFimFilter + "T23:59:59");
    
    return matchesSearch && matchesOperador && matchesDataInicio && matchesDataFim;
  });

  const getStatusText = (status: string) => {
    switch (status) {
      case "conforme":
        return "Conforme";
      case "nao_conforme":
        return "Não Conforme";
      default:
        return status;
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setOperadorFilter("all");
    setDataInicioFilter("");
    setDataFimFilter("");
  };

  const uniqueOperadores = Array.from(
    new Set(checklists.map(checklist => checklist.bombeiro_responsavel))
  ).sort();

  const hasActiveFilters = searchTerm || (operadorFilter && operadorFilter !== "all") || dataInicioFilter || dataFimFilter;

  const handleViewDetails = (checklist: ChecklistHistorico) => {
    setSelectedChecklist(checklist);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (checklist: ChecklistHistorico) => {
    setEditingChecklist({ ...checklist });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingChecklist) return;

    try {
      const { error } = await supabase
        .from("checklists_viaturas")
        .update({
          tipo_checklist: editingChecklist.tipo_checklist,
          bombeiro_responsavel: editingChecklist.bombeiro_responsavel,
          data_checklist: editingChecklist.data_checklist,
          itens_checklist: editingChecklist.itens_checklist,
        })
        .eq("id", editingChecklist.id);

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível salvar as alterações.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Checklist atualizado com sucesso!",
      });

      setIsEditModalOpen(false);
      setEditingChecklist(null);
      fetchChecklists();
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
      toast({
        title: "Erro",
        description: "Erro interno do servidor.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("checklists_viaturas")
        .delete()
        .eq("id", id);

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o checklist.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Checklist excluído com sucesso!",
      });

      fetchChecklists();
    } catch (error) {
      console.error("Erro ao excluir checklist:", error);
      toast({
        title: "Erro",
        description: "Erro interno do servidor.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando histórico...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Histórico de Checklists
          </CardTitle>
          <div className="space-y-4">
            {/* Busca principal */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por bombeiro ou tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                  Limpar
                </Button>
              )}
            </div>
            
            {/* Filtros avançados */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="operador-filter" className="text-sm font-medium">
                    Operador
                  </Label>
                  <Select value={operadorFilter} onValueChange={setOperadorFilter}>
                    <SelectTrigger id="operador-filter">
                      <SelectValue placeholder="Todos os operadores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os operadores</SelectItem>
                      {uniqueOperadores.map((operador) => (
                        <SelectItem key={operador} value={operador}>
                          {operador}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="data-inicio" className="text-sm font-medium">
                    Data Início
                  </Label>
                  <Input
                    id="data-inicio"
                    type="date"
                    value={dataInicioFilter}
                    onChange={(e) => setDataInicioFilter(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="data-fim" className="text-sm font-medium">
                    Data Fim
                  </Label>
                  <Input
                    id="data-fim"
                    type="date"
                    value={dataFimFilter}
                    onChange={(e) => setDataFimFilter(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredChecklists.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "Nenhum checklist encontrado." : "Nenhum checklist realizado ainda."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredChecklists.map((checklist) => (
                <div key={checklist.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{checklist.tipo_checklist}</Badge>
                        <Badge
                          variant={checklist.itens_checklist?.some((item: any) => item.status === "nao_conforme") ? "destructive" : "default"}
                        >
                          {checklist.itens_checklist?.some((item: any) => item.status === "nao_conforme") ? "Não Conforme" : "Conforme"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {checklist.bombeiro_responsavel}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {checklist.timestamp_conclusao ? (
                            <>
                              <span className="text-green-600 font-medium">Concluído em:</span>
                              {new Date(checklist.timestamp_conclusao).toLocaleDateString("pt-BR")}
                              {" às "}
                              {new Date(checklist.timestamp_conclusao).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </>
                          ) : (
                            <>
                              {new Date(checklist.data_checklist).toLocaleDateString("pt-BR")}
                              {" às "}
                              {new Date(checklist.data_checklist).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(checklist)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detalhes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(checklist)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este checklist? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(checklist.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Checklist</DialogTitle>
            <DialogDescription>
              Visualização completa do checklist realizado
            </DialogDescription>
          </DialogHeader>
          
          {selectedChecklist && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Tipo de Checklist</Label>
                  <p className="text-sm text-muted-foreground">{selectedChecklist.tipo_checklist}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Responsável</Label>
                  <p className="text-sm text-muted-foreground">{selectedChecklist.bombeiro_responsavel}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Data do Checklist</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedChecklist.data_checklist).toLocaleDateString("pt-BR")}
                    {" às "}
                    {new Date(selectedChecklist.data_checklist).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {selectedChecklist.timestamp_conclusao && (
                  <div>
                    <Label className="text-sm font-medium text-green-600">Data de Conclusão</Label>
                    <p className="text-sm text-green-600 font-medium">
                      {new Date(selectedChecklist.timestamp_conclusao).toLocaleDateString("pt-BR")}
                      {" às "}
                      {new Date(selectedChecklist.timestamp_conclusao).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-3 block">Itens do Checklist</Label>
                <div className="space-y-2">
                  {selectedChecklist.itens_checklist?.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">{item.item || item.nome}</span>
                      <Badge variant={item.status === "conforme" ? "default" : "destructive"}>
                        {getStatusText(item.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Checklist</DialogTitle>
            <DialogDescription>
              Modifique os dados do checklist conforme necessário
            </DialogDescription>
          </DialogHeader>
          
          {editingChecklist && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo">Tipo de Checklist</Label>
                  <Input
                    id="tipo"
                    value={editingChecklist.tipo_checklist}
                    onChange={(e) => setEditingChecklist({
                      ...editingChecklist,
                      tipo_checklist: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input
                    id="responsavel"
                    value={editingChecklist.bombeiro_responsavel}
                    onChange={(e) => setEditingChecklist({
                      ...editingChecklist,
                      bombeiro_responsavel: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="data">Data e Hora</Label>
                  <Input
                    id="data"
                    type="datetime-local"
                    value={new Date(editingChecklist.data_checklist).toISOString().slice(0, 16)}
                    onChange={(e) => setEditingChecklist({
                      ...editingChecklist,
                      data_checklist: e.target.value
                    })}
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-3 block">Itens do Checklist</Label>
                <div className="space-y-3">
                  {editingChecklist.itens_checklist?.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm flex-1">{item.item || item.nome}</span>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={item.status === "conforme"}
                          onCheckedChange={(checked) => {
                            const newItens = [...editingChecklist.itens_checklist];
                            newItens[index] = {
                              ...newItens[index],
                              status: checked ? "conforme" : "nao_conforme"
                            };
                            setEditingChecklist({
                              ...editingChecklist,
                              itens_checklist: newItens
                            });
                          }}
                        />
                        <Label className="text-sm">
                          {item.status === "conforme" ? "Conforme" : "Não Conforme"}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {editingChecklist.itens_checklist?.some((item: any) => item.observacoes) && (
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={editingChecklist.itens_checklist.find((item: any) => item.observacoes)?.observacoes || ""}
                    onChange={(e) => {
                      const newItens = editingChecklist.itens_checklist.map((item: any) => 
                        item.observacoes ? { ...item, observacoes: e.target.value } : item
                      );
                      setEditingChecklist({
                        ...editingChecklist,
                        itens_checklist: newItens
                      });
                    }}
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
