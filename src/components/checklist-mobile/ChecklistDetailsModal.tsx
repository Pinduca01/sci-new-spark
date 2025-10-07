import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Calendar, Clock, User, AlertCircle, CheckCircle, XCircle, FileText, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface ChecklistDetailsModalProps {
  checklistId: string;
  onClose: () => void;
}

interface ChecklistDetails {
  id: string;
  viatura_prefixo: string;
  tipo_checklist: string;
  data_checklist: string;
  hora_checklist: string;
  bombeiro_responsavel: string;
  equipe: string;
  status_geral: string;
  observacoes_gerais?: string;
  itens_checklist: Array<{
    nome: string;
    status: string;
    categoria?: string;
    observacoes?: string;
  }>;
  nao_conformidades?: Array<{
    id: string;
    item_nome: string;
    descricao: string;
    foto_url?: string;
  }>;
  timeline?: Array<{
    id: string;
    operacao: string;
    descricao?: string;
    usuario_nome: string;
    created_at: string;
  }>;
}

export default function ChecklistDetailsModal({ checklistId, onClose }: ChecklistDetailsModalProps) {
  const [checklist, setChecklist] = useState<ChecklistDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadChecklistDetails();
  }, [checklistId]);

  const loadChecklistDetails = async () => {
    try {
      setLoading(true);
      
      // @ts-ignore - Ignorar inferência de tipos para evitar recursão
      const checklistResult = await supabase
        .from("checklists_viaturas")
        .select("*")
        .eq("id", checklistId)
        .single();
      
      if (checklistResult.error) throw checklistResult.error;
      const checklistData = checklistResult.data;

      // Buscar viatura separadamente
      let viaturaData = null;
      if (checklistData.viatura_id) {
        // @ts-ignore
        const viaturaResult = await supabase
          .from("viaturas")
          .select("prefixo")
          .eq("id", checklistData.viatura_id)
          .single();
        viaturaData = viaturaResult.data;
      }

      // @ts-ignore - Ignorar inferência de tipos
      const ncsResult = await supabase
        .from("nao_conformidades")
        .select("id, item_nome, descricao, imagem_url")
        .eq("checklist_id", checklistId)
        .eq("checklist_tipo", "viatura");
      
      const ncsData = (ncsResult.data || []).map((nc: any) => ({
        id: nc.id,
        item_nome: nc.item_nome,
        descricao: nc.descricao,
        foto_url: nc.imagem_url,
      }));

      // @ts-ignore - Ignorar inferência de tipos
      const timelineResult = await supabase
        .from("checklist_timeline")
        .select("id, operacao, descricao, usuario_nome, created_at")
        .eq("checklist_id", checklistId)
        .eq("checklist_tipo", "viatura")
        .order("created_at", { ascending: true });
      
      const timelineData = timelineResult.data || [];

      const rawItens = checklistData.itens_checklist;
      let itensArray = [];
      try {
        itensArray = Array.isArray(rawItens) ? rawItens :
          typeof rawItens === 'string' ? JSON.parse(rawItens) : [];
      } catch {
        itensArray = [];
      }

      setChecklist({
        id: checklistData.id,
        viatura_prefixo: viaturaData?.prefixo || "N/A",
        tipo_checklist: checklistData.tipo_checklist,
        data_checklist: checklistData.data_checklist,
        hora_checklist: checklistData.hora_checklist,
        bombeiro_responsavel: checklistData.bombeiro_responsavel,
        equipe: checklistData.equipe,
        status_geral: checklistData.status_geral,
        observacoes_gerais: checklistData.observacoes_gerais,
        itens_checklist: itensArray,
        nao_conformidades: ncsData,
        timeline: timelineData,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao carregar detalhes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFORME":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "NAO_CONFORME":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "NAO_SE_APLICA":
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      CONFORME: "bg-green-500/10 text-green-700 dark:text-green-500",
      NAO_CONFORME: "bg-red-500/10 text-red-700 dark:text-red-500",
      NAO_SE_APLICA: "bg-gray-500/10 text-gray-700 dark:text-gray-500",
    };
    return variants[status] || "";
  };

  // Agrupar itens por categoria
  const groupedItems = checklist?.itens_checklist.reduce((acc: any, item: any) => {
    const categoria = item.categoria || "Outros";
    if (!acc[categoria]) acc[categoria] = [];
    acc[categoria].push(item);
    return acc;
  }, {}) || {};

  if (loading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!checklist) return null;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{checklist.viatura_prefixo}</DialogTitle>
              <p className="text-sm text-muted-foreground">{checklist.tipo_checklist}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-140px)] px-6">
          {/* Informações Gerais */}
          <Card className="p-4 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(checklist.data_checklist), "dd/MM/yyyy", { locale: ptBR })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{checklist.hora_checklist}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{checklist.bombeiro_responsavel}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{checklist.equipe}</Badge>
              </div>
            </div>
            {checklist.observacoes_gerais && (
              <>
                <Separator className="my-3" />
                <div>
                  <p className="text-sm font-medium mb-1">Observações Gerais:</p>
                  <p className="text-sm text-muted-foreground">{checklist.observacoes_gerais}</p>
                </div>
              </>
            )}
          </Card>

          {/* Não Conformidades */}
          {checklist.nao_conformidades && checklist.nao_conformidades.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Não Conformidades ({checklist.nao_conformidades.length})
              </h3>
              <div className="space-y-3">
                {checklist.nao_conformidades.map((nc: any) => (
                  <Card key={nc.id} className="p-4 border-l-4 border-l-red-500">
                    <h4 className="font-medium mb-2">{nc.item_nome}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{nc.descricao}</p>
                    {nc.foto_url && (
                      <img
                        src={nc.foto_url}
                        alt="Foto da não conformidade"
                        className="w-full max-w-md rounded-lg mt-2"
                      />
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Itens do Checklist por Categoria */}
          <div className="mb-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Itens Verificados
            </h3>
            <div className="space-y-4">
              {Object.entries(groupedItems).map(([categoria, items]: [string, any]) => (
                <Card key={categoria} className="p-4">
                  <h4 className="font-medium mb-3 text-primary">{categoria}</h4>
                  <div className="space-y-2">
                    {items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-2 flex-1">
                          {getStatusIcon(item.status)}
                          <span className="text-sm">{item.nome}</span>
                        </div>
                        <Badge className={getStatusBadge(item.status)}>
                          {item.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Timeline */}
          {checklist.timeline && checklist.timeline.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-3">Timeline de Ações</h3>
              <Card className="p-4">
                <div className="space-y-3">
                  {checklist.timeline.map((evento: any) => (
                    <div key={evento.id} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium">{evento.operacao}</p>
                        <p className="text-muted-foreground">{evento.descricao}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(evento.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} - {evento.usuario_nome}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </ScrollArea>

        <div className="p-6 pt-4 border-t flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Fechar
          </Button>
          <Button className="flex-1" disabled>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
