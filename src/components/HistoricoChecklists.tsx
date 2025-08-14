import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Search, ClipboardCheck, Calendar, User, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ChecklistHistorico {
  id: string;
  tipo_checklist: string;
  bombeiro_responsavel: string;
  data_checklist: string;
  hora_checklist: string;
  status_geral: string;
  observacoes_gerais: string | null;
  created_at: string;
}

interface HistoricoChecklistsProps {
  viaturaId: string;
}

export const HistoricoChecklists = ({ viaturaId }: HistoricoChecklistsProps) => {
  const [checklists, setChecklists] = useState<ChecklistHistorico[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredChecklists, setFilteredChecklists] = useState<ChecklistHistorico[]>([]);

  useEffect(() => {
    fetchChecklists();
  }, [viaturaId]);

  useEffect(() => {
    const filtered = checklists.filter(checklist =>
      checklist.bombeiro_responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checklist.tipo_checklist.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredChecklists(filtered);
  }, [checklists, searchTerm]);

  const fetchChecklists = async () => {
    try {
      const { data, error } = await supabase
        .from('checklists_viaturas')
        .select('*')
        .eq('viatura_id', viaturaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChecklists(data || []);
    } catch (error) {
      console.error('Erro ao buscar checklists:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico de checklists.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'conforme': return 'default';
      case 'nao_conforme': return 'destructive';
      case 'em_andamento': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'conforme': return 'Conforme';
      case 'nao_conforme': return 'Não Conforme';
      case 'em_andamento': return 'Em Andamento';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5" />
          Histórico de Checklists
        </CardTitle>
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
        </div>
      </CardHeader>
      <CardContent>
        {filteredChecklists.length === 0 ? (
          <div className="text-center py-8">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {checklists.length === 0 
                ? "Nenhum checklist realizado ainda." 
                : "Nenhum checklist encontrado com os filtros aplicados."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredChecklists.map((checklist) => (
              <div
                key={checklist.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-medium">
                      {checklist.tipo_checklist}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(checklist.status_geral)}>
                      {getStatusText(checklist.status_geral)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {checklist.bombeiro_responsavel}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(checklist.data_checklist).toLocaleDateString('pt-BR')} às {checklist.hora_checklist}
                    </div>
                  </div>

                  {checklist.observacoes_gerais && (
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong>Obs:</strong> {checklist.observacoes_gerais}
                    </p>
                  )}
                </div>

                <Button variant="outline" size="sm" className="ml-4">
                  <Eye className="h-4 w-4 mr-2" />
                  Detalhes
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};