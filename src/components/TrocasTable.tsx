
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, FileText, Trash2 } from "lucide-react";
import { useTrocasPlantao, TrocaPlantao } from "@/hooks/useTrocasPlantao";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TrocasTableProps {
  mes: number;
  ano: number;
}

const TrocasTable = ({ mes, ano }: TrocasTableProps) => {
  const { trocas, isLoading, updateTroca, deleteTroca } = useTrocasPlantao(mes, ano);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'aprovada':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Aprovada</Badge>;
      case 'rejeitada':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejeitada</Badge>;
      case 'concluida':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><FileText className="h-3 w-3 mr-1" />Concluída</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleStatusChange = (troca: TrocaPlantao, novoStatus: string) => {
    updateTroca({
      id: troca.id,
      updates: { status: novoStatus as any }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta troca?')) {
      deleteTroca(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Trocas Registradas ({trocas.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {trocas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma troca registrada para este período
          </div>
        ) : (
          <div className="space-y-4">
            {trocas.map((troca) => (
              <div key={troca.id} className="border rounded-lg p-4 hover:bg-muted/20 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-4">
                      <div className="font-semibold text-primary">
                        {troca.bombeiro_substituido?.nome} → {troca.bombeiro_substituto?.nome}
                      </div>
                      {getStatusBadge(troca.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Serviço Trocado:</span>
                        <div className="font-medium">
                          {format(new Date(troca.data_servico_trocado), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Serviço Pagamento:</span>
                        <div className="font-medium">
                          {format(new Date(troca.data_servico_pagamento), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Equipe:</span>
                        <div className="font-medium">{troca.equipe?.nome_equipe}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Base:</span>
                        <div className="font-medium">{troca.base}</div>
                      </div>
                    </div>

                    {troca.observacoes && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Observações:</span>
                        <div className="mt-1 p-2 bg-muted/50 rounded text-sm">{troca.observacoes}</div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {troca.status === 'pendente' && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-700 border-green-300 hover:bg-green-50"
                          onClick={() => handleStatusChange(troca, 'aprovada')}
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-700 border-red-300 hover:bg-red-50"
                          onClick={() => handleStatusChange(troca, 'rejeitada')}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    
                    {troca.status === 'aprovada' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-700 border-blue-300 hover:bg-blue-50"
                        onClick={() => handleStatusChange(troca, 'concluida')}
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Concluir
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-700 border-red-300 hover:bg-red-50"
                      onClick={() => handleDelete(troca.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrocasTable;
