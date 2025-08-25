
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp } from "lucide-react";
import { useTrocasEstatisticas } from "@/hooks/useTrocasEstatisticas";

interface TrocasEstatisticasTableProps {
  mes: number;
  ano: number;
}

const TrocasEstatisticasTable = ({ mes, ano }: TrocasEstatisticasTableProps) => {
  const { estatisticas, isLoading } = useTrocasEstatisticas(mes, ano);

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Controle de Trocas por Equipe - {meses[mes - 1]} {ano}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalGeral = estatisticas.reduce((sum, est) => sum + est.total_trocas, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Controle de Trocas por Equipe - {meses[mes - 1]} {ano}
          </div>
          <Badge variant="outline" className="text-lg px-3 py-1">
            <TrendingUp className="h-4 w-4 mr-1" />
            Total: {totalGeral}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {estatisticas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma troca registrada para este período
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Equipe</th>
                  <th className="text-center py-3 px-4 font-semibold">Total</th>
                  <th className="text-center py-3 px-4 font-semibold">Pendentes</th>
                  <th className="text-center py-3 px-4 font-semibold">Aprovadas</th>
                  <th className="text-center py-3 px-4 font-semibold">Rejeitadas</th>
                  <th className="text-center py-3 px-4 font-semibold">Concluídas</th>
                </tr>
              </thead>
              <tbody>
                {estatisticas.map((estatistica) => (
                  <tr key={estatistica.equipe_id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{estatistica.equipe_nome}</td>
                    <td className="text-center py-3 px-4">
                      <Badge variant="outline" className="font-bold">
                        {estatistica.total_trocas}
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        {estatistica.trocas_pendentes}
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {estatistica.trocas_aprovadas}
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        {estatistica.trocas_rejeitadas}
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {estatistica.trocas_concluidas}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrocasEstatisticasTable;
