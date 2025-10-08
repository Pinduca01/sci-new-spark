import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, User, AlertCircle, CheckCircle, FileText } from "lucide-react";
import { useChecklistsHistorico } from "@/hooks/useChecklistsHistorico";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ChecklistDetailsModal from "@/components/checklist-mobile/ChecklistDetailsModal";

export default function ChecklistMobileHistorico() {
  const navigate = useNavigate();
  const { viaturaId } = useParams<{ viaturaId: string }>();
  const { checklists: checklistsData, isLoading } = useChecklistsHistorico();
  const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);

  // Filtrar checklists da viatura específica
  const checklists = checklistsData?.viaturas.filter(c => c.viatura_id === viaturaId) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/checklist-mobile/viaturas")}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Histórico de Checklists</h1>
            <p className="text-sm text-primary-foreground/80">
              {checklists.length} checklist{checklists.length !== 1 ? 's' : ''} encontrado{checklists.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Checklists */}
      <div className="p-4 space-y-3">
        {checklists.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">Nenhum checklist encontrado</h3>
            <p className="text-sm text-muted-foreground">
              Esta viatura ainda não possui checklists realizados.
            </p>
          </Card>
        ) : (
          checklists.map((checklist) => {
            const naoConformidades = checklist.itens_nao_conformes || 0;
            const statusColor = checklist.status === "CONCLUIDO" 
              ? naoConformidades > 0 ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-500" : "bg-green-500/10 text-green-700 dark:text-green-500"
              : "bg-blue-500/10 text-blue-700 dark:text-blue-500";

            return (
              <Card
                key={checklist.id}
                className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedChecklistId(checklist.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{checklist.viatura_placa || checklist.tipo_detalhe}</h3>
                    <p className="text-sm text-muted-foreground">{checklist.tipo_detalhe}</p>
                  </div>
                  <Badge className={statusColor}>
                    {checklist.status}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(checklist.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{checklist.hora}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{checklist.responsavel}</span>
                  </div>
                </div>

                {/* Resumo de Status */}
                <div className="mt-3 pt-3 border-t flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{checklist.itens_conformes} conformes</span>
                  </div>
                  {naoConformidades > 0 && (
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-red-600 font-medium">{naoConformidades} NC</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedChecklistId && (
        <ChecklistDetailsModal
          checklistId={selectedChecklistId}
          onClose={() => setSelectedChecklistId(null)}
        />
      )}
    </div>
  );
}
