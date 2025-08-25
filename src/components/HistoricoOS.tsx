
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Search, Wrench, Calendar, User, Eye, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface OrdemServico {
  id: string;
  numero_os: string;
  tipo_servico: string;
  descricao_problema: string;
  prioridade: string;
  status: string;
  data_abertura: string;
  data_conclusao: string | null;
  bombeiro_solicitante: string;
  responsavel_manutencao: string | null;
  observacoes: string | null;
  custo_total: number;
}

interface HistoricoOSProps {
  viaturaId?: string;
}

export const HistoricoOS = ({ viaturaId }: HistoricoOSProps) => {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrdens, setFilteredOrdens] = useState<OrdemServico[]>([]);

  useEffect(() => {
    fetchOrdens();
  }, [viaturaId]);

  useEffect(() => {
    const filtered = ordens.filter(ordem =>
      ordem.numero_os.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.bombeiro_solicitante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.descricao_problema.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOrdens(filtered);
  }, [ordens, searchTerm]);

  const fetchOrdens = async () => {
    try {
      let query = supabase
        .from('ordens_servico')
        .select('*');

      if (viaturaId) {
        query = query.eq('viatura_id', viaturaId);
      }

      const { data, error } = await query.order('data_abertura', { ascending: false });

      if (error) throw error;
      setOrdens(data || []);
    } catch (error) {
      console.error('Erro ao buscar ordens de serviço:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico de ordens de serviço.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'aberta': return 'destructive';
      case 'em_andamento': return 'secondary';
      case 'concluida': return 'default';
      case 'cancelada': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'aberta': return 'Aberta';
      case 'em_andamento': return 'Em Andamento';
      case 'concluida': return 'Concluída';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'text-red-500';
      case 'media': return 'text-yellow-500';
      case 'baixa': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getPrioridadeText = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'Alta';
      case 'media': return 'Média';
      case 'baixa': return 'Baixa';
      default: return prioridade;
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
          <Wrench className="h-5 w-5" />
          Histórico de Ordens de Serviço
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número, solicitante ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredOrdens.length === 0 ? (
          <div className="text-center py-8">
            <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {ordens.length === 0 
                ? "Nenhuma ordem de serviço criada ainda." 
                : "Nenhuma ordem de serviço encontrada com os filtros aplicados."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrdens.map((ordem) => (
              <div
                key={ordem.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono font-medium">
                      {ordem.numero_os}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(ordem.status)}>
                      {getStatusText(ordem.status)}
                    </Badge>
                    <div className={`flex items-center gap-1 ${getPrioridadeColor(ordem.prioridade)}`}>
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">{getPrioridadeText(ordem.prioridade)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {ordem.bombeiro_solicitante}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(ordem.data_abertura).toLocaleDateString('pt-BR')}
                    </div>
                    {ordem.data_conclusao && (
                      <div className="flex items-center gap-1">
                        <span>Concluída em:</span>
                        {new Date(ordem.data_conclusao).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-foreground line-clamp-2">
                    <strong>Tipo:</strong> {ordem.tipo_servico} • <strong>Problema:</strong> {ordem.descricao_problema}
                  </p>

                  {ordem.responsavel_manutencao && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Responsável:</strong> {ordem.responsavel_manutencao}
                    </p>
                  )}

                  {ordem.custo_total > 0 && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Custo:</strong> R$ {ordem.custo_total.toFixed(2)}
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
