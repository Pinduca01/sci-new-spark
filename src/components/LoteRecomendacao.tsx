
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Calendar, Package, RefreshCw } from "lucide-react";
import { useAgentesExtintores, LoteRecomendado } from "@/hooks/useAgentesExtintores";

export const LoteRecomendacao = () => {
  const [recomendacaoLGE, setRecomendacaoLGE] = useState<LoteRecomendado | null>(null);
  const [recomendacaoPQS, setRecomendacaoPQS] = useState<LoteRecomendado | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { getRecomendacaoLote } = useAgentesExtintores();

  const buscarRecomendacoes = async () => {
    setLoading(true);
    try {
      const [lge, pqs] = await Promise.all([
        getRecomendacaoLote('LGE'),
        getRecomendacaoLote('PQS')
      ]);
      
      setRecomendacaoLGE(lge);
      setRecomendacaoPQS(pqs);
    } catch (error) {
      console.error('Erro ao buscar recomendações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarRecomendacoes();
  }, []);

  const getStatusColor = (dias: number) => {
    if (dias <= 30) return 'text-red-600';
    if (dias <= 60) return 'text-orange-600';
    if (dias <= 90) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusBadge = (dias: number) => {
    if (dias <= 30) return 'destructive';
    if (dias <= 60) return 'secondary';
    if (dias <= 90) return 'outline';
    return 'default';
  };

  const RecomendacaoCard = ({ 
    tipo, 
    recomendacao, 
    cor 
  }: { 
    tipo: string; 
    recomendacao: LoteRecomendado | null; 
    cor: string 
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${cor}`}>
          <Package className="h-5 w-5" />
          Próximo Lote {tipo}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recomendacao ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Lote: {recomendacao.lote}</span>
              <Badge variant={getStatusBadge(recomendacao.dias_para_vencimento) as any}>
                {recomendacao.dias_para_vencimento} dias
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Quantidade</p>
                <p className="font-medium">{recomendacao.quantidade_disponivel} unidades</p>
              </div>
              <div>
                <p className="text-muted-foreground">Vencimento</p>
                <p className={`font-medium ${getStatusColor(recomendacao.dias_para_vencimento)}`}>
                  {new Date(recomendacao.data_vencimento).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                💡 Este é o lote mais antigo disponível seguindo a regra FIFO
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhum lote disponível
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Recomendação de Lotes (FIFO)
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={buscarRecomendacoes}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RecomendacaoCard 
            tipo="LGE" 
            recomendacao={recomendacaoLGE} 
            cor="text-blue-600" 
          />
          <RecomendacaoCard 
            tipo="PQS" 
            recomendacao={recomendacaoPQS} 
            cor="text-purple-600" 
          />
        </div>
        
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Regra FIFO (First In, First Out)</p>
              <p className="text-muted-foreground">
                O sistema recomenda sempre o lote mais antigo disponível para uso,
                garantindo que os agentes extintores sejam utilizados antes do vencimento.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
