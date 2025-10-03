import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  X,
  Truck
} from 'lucide-react';
import { ChecklistDetalhado, TimelineItem, useChecklistsHistorico } from '@/hooks/useChecklistsHistorico';
import { generateChecklistPDF } from '@/utils/checklistPdfGenerator';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ChecklistDetailsModalProps {
  checklist: ChecklistDetalhado | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allChecklists: ChecklistDetalhado[];
  canEdit?: boolean;
  canDelete?: boolean;
}

export const ChecklistDetailsModal = ({
  checklist,
  open,
  onOpenChange,
  allChecklists,
  canEdit = false,
  canDelete = false
}: ChecklistDetailsModalProps) => {
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { getTimeline, deleteChecklist, registrarExportacao } = useChecklistsHistorico();

  const currentIndex = allChecklists.findIndex(c => c.id === checklist?.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allChecklists.length - 1;

  useEffect(() => {
    if (checklist && open) {
      loadTimeline();
    }
  }, [checklist?.id, open]);

  const loadTimeline = async () => {
    if (!checklist) return;
    const data = await getTimeline(checklist.id, checklist.tipo);
    setTimeline(data);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < allChecklists.length) {
      onOpenChange(false);
      setTimeout(() => {
        const event = new CustomEvent('navigate-checklist', { detail: allChecklists[newIndex] });
        window.dispatchEvent(event);
      }, 100);
    }
  };

  const handleExportPDF = () => {
    if (!checklist) return;
    
    generateChecklistPDF(checklist);
    registrarExportacao(checklist.id, checklist.tipo);
    
    toast({
      title: "PDF Exportado",
      description: "O relatório foi gerado com sucesso!",
    });
  };

  const handleDelete = async () => {
    if (!checklist) return;

    try {
      await deleteChecklist.mutateAsync({ id: checklist.id, tipo: checklist.tipo });
      setShowDeleteDialog(false);
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (!checklist) return null;

  const statusColor = checklist.status === 'conforme' ? 'default' : 
                      checklist.status === 'nao_conforme' ? 'destructive' : 'secondary';

  const conformidadeRate = checklist.total_itens > 0 
    ? Math.round((checklist.itens_conformes / checklist.total_itens) * 100) 
    : 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                Detalhes do Checklist
                <Badge variant="outline">{checklist.tipo_detalhe}</Badge>
                <Badge variant={statusColor}>
                  {checklist.status === 'conforme' ? 'Conforme' : 
                   checklist.status === 'nao_conforme' ? 'Não Conforme' : 'Em Andamento'}
                </Badge>
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigate('prev')}
                  disabled={!hasPrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentIndex + 1} / {allChecklists.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigate('next')}
                  disabled={!hasNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Informações Gerais */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Data
                    </div>
                    <p className="font-medium">{new Date(checklist.data).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Hora
                    </div>
                    <p className="font-medium">{checklist.hora}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      Responsável
                    </div>
                    <p className="font-medium">{checklist.responsavel}</p>
                  </div>
                  {checklist.equipe && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        Equipe
                      </div>
                      <p className="font-medium">{checklist.equipe}</p>
                    </div>
                  )}
                  {checklist.viatura_placa && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Truck className="h-4 w-4" />
                        Viatura
                      </div>
                      <p className="font-medium">{checklist.viatura_placa}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Itens</p>
                      <p className="text-2xl font-bold">{checklist.total_itens}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Conformes</p>
                      <p className="text-2xl font-bold text-green-600">{checklist.itens_conformes}</p>
                      <p className="text-xs text-muted-foreground">{conformidadeRate}%</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Não Conformes</p>
                      <p className="text-2xl font-bold text-red-600">{checklist.itens_nao_conformes}</p>
                      <p className="text-xs text-muted-foreground">{100 - conformidadeRate}%</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">N/A</p>
                      <p className="text-2xl font-bold">{checklist.total_itens - checklist.itens_conformes - checklist.itens_nao_conformes}</p>
                    </div>
                    <X className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Itens */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Itens Verificados</h3>
                <div className="space-y-3">
                  {checklist.itens.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {item.status === 'conforme' ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : item.status === 'nao_conforme' ? (
                              <AlertCircle className="h-5 w-5 text-red-600" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground" />
                            )}
                            <span className="font-medium">{item.nome}</span>
                          </div>
                          {item.justificativa && (
                            <p className="text-sm text-muted-foreground ml-7">{item.justificativa}</p>
                          )}
                        </div>
                        {item.status === 'nao_conforme' && item.fotos && item.fotos.length > 0 && (
                          <div className="flex gap-2 ml-4">
                            {item.fotos.map((foto, fotoIndex) => (
                              <img
                                key={fotoIndex}
                                src={foto}
                                alt={`Evidência ${fotoIndex + 1}`}
                                className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80"
                                onClick={() => window.open(foto, '_blank')}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            {timeline.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Linha do Tempo</h3>
                  <div className="space-y-3">
                    {timeline.map((item) => (
                      <div key={item.id} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {item.operacao === 'criacao' ? '🟢 Criado' :
                             item.operacao === 'edicao' ? '🔵 Editado' :
                             item.operacao === 'conclusao' ? '✅ Concluído' :
                             item.operacao === 'exclusao' ? '🔴 Excluído' :
                             item.operacao === 'exportacao_pdf' ? '📄 PDF Exportado' : item.operacao}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.created_at).toLocaleString('pt-BR')} por {item.usuario_nome}
                          </p>
                          {item.descricao && (
                            <p className="text-sm text-muted-foreground mt-1">{item.descricao}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Observações */}
            {checklist.observacoes && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Observações Gerais</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{checklist.observacoes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <Separator />

          <DialogFooter className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {canEdit && (
                <Button variant="outline" disabled>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
              {canDelete && (
                <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este checklist? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
