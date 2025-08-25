
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  Calendar,
  Truck,
  Archive
} from "lucide-react";
import { useEstoqueAlmoxarifado } from "@/hooks/useEstoqueAlmoxarifado";

export const EstoqueDashboard = () => {
  const { estoque, alertas, isLoading } = useEstoqueAlmoxarifado();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalItens = estoque.reduce((acc, item) => acc + item.quantidade_disponivel, 0);
  const categorias = [...new Set(estoque.map(item => item.materiais?.categoria))].length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(totalItens)}</div>
          <p className="text-xs text-muted-foreground">
            {estoque.length} tipos de materiais
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">
            {alertas.estoqueBaixo.length}
          </div>
          <p className="text-xs text-muted-foreground">
            Materiais abaixo do mínimo
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vencimento Próximo</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {alertas.vencimentoProximo.length}
          </div>
          <p className="text-xs text-muted-foreground">
            Próximos 30 dias
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {alertas.vencidos.length}
          </div>
          <p className="text-xs text-muted-foreground">
            Requerem atenção
          </p>
        </CardContent>
      </Card>

      {(alertas.estoqueBaixo.length > 0 || alertas.vencimentoProximo.length > 0 || alertas.vencidos.length > 0) && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Alertas do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {alertas.vencidos.length > 0 && (
              <div>
                <h4 className="font-medium text-destructive mb-2">Materiais Vencidos</h4>
                <div className="flex flex-wrap gap-2">
                  {alertas.vencidos.slice(0, 5).map((item) => (
                    <Badge key={item.id} variant="destructive">
                      {item.materiais?.nome} - {item.materiais?.codigo_material}
                    </Badge>
                  ))}
                  {alertas.vencidos.length > 5 && (
                    <Badge variant="outline">+{alertas.vencidos.length - 5} mais</Badge>
                  )}
                </div>
              </div>
            )}

            {alertas.vencimentoProximo.length > 0 && (
              <div>
                <h4 className="font-medium text-orange-600 mb-2">Vencimento Próximo</h4>
                <div className="flex flex-wrap gap-2">
                  {alertas.vencimentoProximo.slice(0, 5).map((item) => (
                    <Badge key={item.id} className="bg-orange-100 text-orange-800">
                      {item.materiais?.nome} - {item.data_validade}
                    </Badge>
                  ))}
                  {alertas.vencimentoProximo.length > 5 && (
                    <Badge variant="outline">+{alertas.vencimentoProximo.length - 5} mais</Badge>
                  )}
                </div>
              </div>
            )}

            {alertas.estoqueBaixo.length > 0 && (
              <div>
                <h4 className="font-medium text-amber-600 mb-2">Estoque Baixo</h4>
                <div className="flex flex-wrap gap-2">
                  {alertas.estoqueBaixo.slice(0, 5).map((item) => (
                    <Badge key={item.id} className="bg-amber-100 text-amber-800">
                      {item.materiais?.nome} - {item.quantidade_disponivel}{item.materiais?.unidade_medida}
                    </Badge>
                  ))}
                  {alertas.estoqueBaixo.length > 5 && (
                    <Badge variant="outline">+{alertas.estoqueBaixo.length - 5} mais</Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
