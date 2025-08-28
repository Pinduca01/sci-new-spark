import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTPVerificacoes } from "@/hooks/useTPVerificacoes";
import { useTPHigienizacoes } from "@/hooks/useTPHigienizacoes";
import { useEPIsDistribuicao } from "@/hooks/useEPIsDistribuicao";
import { ShieldCheck, Droplets, Package, TrendingUp } from "lucide-react";

const TPUniformesDashboard = () => {
  const { data: verificacoes = [] } = useTPVerificacoes();
  const { data: higienizacoes = [] } = useTPHigienizacoes();
  const { data: distribuicoes = [] } = useEPIsDistribuicao();

  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  // Estatísticas do mês atual
  const verificacoesMesAtual = verificacoes.filter(v => 
    v.mes_referencia === mesAtual && v.ano_referencia === anoAtual
  );

  const higienizacoesMesAtual = higienizacoes.filter(h => 
    h.mes_referencia === mesAtual && h.ano_referencia === anoAtual
  );

  const distribuicoesMesAtual = distribuicoes.filter(d => 
    d.mes_referencia === mesAtual && d.ano_referencia === anoAtual
  );

  const totalTPsVerificados = verificacoesMesAtual.reduce((acc, v) => acc + v.total_verificados, 0);
  const totalTPsConformes = verificacoesMesAtual.reduce((acc, v) => acc + v.tp_conformes, 0);
  const totalHigienizados = higienizacoesMesAtual.reduce((acc, h) => acc + h.quantidade_higienizada, 0);
  const totalDistribuidos = distribuicoesMesAtual.reduce((acc, d) => acc + d.quantidade_entregue, 0);

  const percentualConformidade = totalTPsVerificados > 0 ? 
    Math.round((totalTPsConformes / totalTPsVerificados) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">TPs Verificados</CardTitle>
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTPsVerificados}</div>
          <p className="text-xs text-muted-foreground">
            {totalTPsConformes} conformes este mês
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conformidade</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{percentualConformidade}%</div>
          <p className="text-xs text-muted-foreground">
            Índice de conformidade
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">TPs Higienizados</CardTitle>
          <Droplets className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalHigienizados}</div>
          <p className="text-xs text-muted-foreground">
            Total higienizado este mês
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">EPIs Distribuídos</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDistribuidos}</div>
          <p className="text-xs text-muted-foreground">
            Itens entregues este mês
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TPUniformesDashboard;