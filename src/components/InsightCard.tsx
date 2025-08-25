
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';

interface InsightCardProps {
  tipo: 'comparativo' | 'alerta' | 'recomendacao' | 'sucesso';
  titulo: string;
  descricao: string;
  valor?: string;
  tendencia?: 'positiva' | 'negativa' | 'neutra';
  prioridade?: 'alta' | 'media' | 'baixa';
}

export const InsightCard: React.FC<InsightCardProps> = ({
  tipo,
  titulo,
  descricao,
  valor,
  tendencia,
  prioridade = 'media'
}) => {
  const getIcon = () => {
    switch (tipo) {
      case 'comparativo':
        return tendencia === 'positiva' ? TrendingUp : tendencia === 'negativa' ? TrendingDown : AlertTriangle;
      case 'alerta':
        return AlertTriangle;
      case 'recomendacao':
        return Lightbulb;
      case 'sucesso':
        return CheckCircle;
      default:
        return AlertTriangle;
    }
  };

  const getColors = () => {
    switch (tipo) {
      case 'comparativo':
        return tendencia === 'positiva' 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : tendencia === 'negativa' 
          ? 'bg-red-50 border-red-200 text-red-800'
          : 'bg-blue-50 border-blue-200 text-blue-800';
      case 'alerta':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'recomendacao':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'sucesso':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getBadgeVariant = () => {
    switch (prioridade) {
      case 'alta':
        return 'destructive';
      case 'media':
        return 'default';
      case 'baixa':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const Icon = getIcon();

  return (
    <Card className={`${getColors()} border-l-4 hover:shadow-md transition-shadow duration-200`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-sm">{titulo}</h4>
              {prioridade !== 'media' && (
                <Badge variant={getBadgeVariant()} className="text-xs">
                  {prioridade === 'alta' ? 'Urgente' : 'Baixa'}
                </Badge>
              )}
            </div>
            <p className="text-sm opacity-80 leading-relaxed">{descricao}</p>
            {valor && (
              <div className="mt-2">
                <span className="font-semibold text-base">{valor}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
