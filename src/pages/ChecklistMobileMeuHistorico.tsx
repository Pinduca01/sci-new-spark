import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, AlertCircle, CheckCircle, FileText, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ChecklistDetailsModal from "@/components/checklist-mobile/ChecklistDetailsModal";

interface ChecklistHistorico {
  id: string;
  data_checklist: string;
  hora_checklist: string;
  viatura_id: string;
  tipo_checklist: string;
  status_geral: string;
  bombeiro_responsavel: string;
  itens_checklist: any[];
  viatura?: {
    prefixo: string;
    placa: string;
  };
}

export default function ChecklistMobileMeuHistorico() {
  const navigate = useNavigate();
  const [checklists, setChecklists] = useState<ChecklistHistorico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);

  useEffect(() => {
    loadMeusChecklists();
  }, []);

  const loadMeusChecklists = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/checklist-mobile/login');
        return;
      }

      // Buscar bombeiro_id do usuário logado
      const { data: bombeiroData } = await supabase
        .from('bombeiros')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!bombeiroData) {
        toast.error('Usuário não vinculado a um bombeiro');
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('checklists_viaturas')
        .select(`
          id,
          data_checklist,
          hora_checklist,
          viatura_id,
          tipo_checklist,
          status_geral,
          bombeiro_responsavel,
          itens_checklist
        `)
        .eq('bombeiro_responsavel_id', bombeiroData.id)
        .order('data_checklist', { ascending: false })
        .order('hora_checklist', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Buscar informações das viaturas separadamente
      const viaturasIds = [...new Set(data?.map(c => c.viatura_id).filter(Boolean))];
      const { data: viaturasData } = await supabase
        .from('viaturas')
        .select('id, prefixo, placa')
        .in('id', viaturasIds);

      const viaturasMap = new Map(viaturasData?.map(v => [v.id, v]) || []);

      // Combinar os dados
      const checklistsComViatura = data?.map(c => ({
        ...c,
        viatura: viaturasMap.get(c.viatura_id),
        itens_checklist: (c.itens_checklist as any) || []
      })) || [];
      
      setChecklists(checklistsComViatura as any);
    } catch (error: any) {
      console.error('Erro ao carregar histórico:', error);
      toast.error('Erro ao carregar histórico de checklists');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (statusGeral: string, itens: any[]) => {
    const naoConformidades = itens?.filter(
      (item: any) => item.status === 'nao_conforme'
    ).length || 0;

    let statusColor = "";
    let statusText = "";

    if (statusGeral === "aprovado" || statusGeral === "CONCLUIDO") {
      if (naoConformidades > 0) {
        statusColor = "bg-yellow-500/10 text-yellow-700 dark:text-yellow-500";
        statusText = "Concluído com NC";
      } else {
        statusColor = "bg-green-500/10 text-green-700 dark:text-green-500";
        statusText = "Aprovado";
      }
    } else if (statusGeral === "pendente" || statusGeral === "EM_ANDAMENTO") {
      statusColor = "bg-blue-500/10 text-blue-700 dark:text-blue-500";
      statusText = "Em andamento";
    } else {
      statusColor = "bg-gray-500/10 text-gray-700 dark:text-gray-500";
      statusText = statusGeral;
    }

    return { statusColor, statusText, naoConformidades };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando seu histórico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/checklist-mobile/viaturas")}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Meu Histórico</h1>
            <p className="text-sm text-primary-foreground/80">
              {checklists.length} checklist{checklists.length !== 1 ? 's' : ''} realizado{checklists.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Checklists */}
      <div className="p-4 space-y-3 max-w-2xl mx-auto">
        {checklists.length === 0 ? (
          <Card className="p-8 text-center border-none shadow-lg">
            <CardContent className="pt-6">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Nenhum checklist ainda</h3>
              <p className="text-sm text-muted-foreground">
                Realize seu primeiro checklist para vê-lo aqui.
              </p>
            </CardContent>
          </Card>
        ) : (
          checklists.map((checklist) => {
            const { statusColor, statusText, naoConformidades } = getStatusInfo(
              checklist.status_geral,
              checklist.itens_checklist
            );

            const conformes = checklist.itens_checklist?.filter(
              (item: any) => item.status === 'conforme'
            ).length || 0;

            return (
              <Card
                key={checklist.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-all border-none shadow-md"
                onClick={() => setSelectedChecklistId(checklist.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Truck className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-lg">
                          {checklist.viatura?.prefixo || 'Viatura'}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {checklist.viatura?.placa || 'Sem placa'}
                      </p>
                    </div>
                    <Badge className={statusColor}>
                      {statusText}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(checklist.data_checklist), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{checklist.hora_checklist}</span>
                    </div>
                  </div>

                  {/* Tipo de checklist */}
                  <div className="mb-3">
                    <Badge variant="outline" className="text-xs">
                      {checklist.tipo_checklist}
                    </Badge>
                  </div>

                  {/* Resumo de Status */}
                  <div className="pt-3 border-t flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{conformes}</span>
                      <span className="text-muted-foreground">conformes</span>
                    </div>
                    {naoConformidades > 0 && (
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <span className="font-medium text-amber-600">{naoConformidades}</span>
                        <span className="text-muted-foreground">NC</span>
                      </div>
                    )}
                  </div>
                </CardContent>
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
