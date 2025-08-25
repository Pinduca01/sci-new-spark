import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { SparklineChart } from './SparklineChart';

interface MetricasCardProps {
  titulo: string;
  valor: number | string;
  subvalor?: string;
  icone: LucideIcon;
  cor: string;
  tendencia?: number;
  formato?: 'numero' | 'percentual' | 'tempo';
  dadosSparkline?: Array<{ value: number }>;
}

export const MetricasCard: React.FC<MetricasCardProps> = ({
  titulo,
  valor,
  subvalor,
  icone: Icon,
  cor,
  tendencia = 0,
  formato = 'numero',
  dadosSparkline
}) => {
  const formatarValor = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    switch (formato) {
      case 'percentual':
        return `${val}%`;
      case 'tempo':
        return `${val}min`;
      default:
        return val.toLocaleString();
    }
  };

  const getTendenciaIcon = () => {
    if (tendencia > 0) return <TrendingUp className="h-3 w-3" />;
    if (tendencia < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTendenciaCor = () => {
    if (tendencia > 0) return "text-green-600 bg-green-100";
    if (tendencia < 0) return "text-red-600 bg-red-100";
    return "text-gray-600 bg-gray-100";
  };

  const getCorIcone = () => {
    switch (cor) {
      case 'blue':
        return 'text-blue-600';
      case 'green':
        return 'text-green-600';
      case 'purple':
        return 'text-purple-600';
      case 'orange':
        return 'text-orange-600';
      case 'red':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getCorSparkline = () => {
    switch (cor) {
      case 'blue':
        return '#2563eb';
      case 'green':
        return '#059669';
      case 'purple':
        return '#9333ea';
      case 'orange':
        return '#ea580c';
      case 'red':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{titulo}</CardTitle>
        <Icon className={`h-5 w-5 ${getCorIcone()}`} />
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold text-foreground">{formatarValor(valor)}</div>
            
            {subvalor && (
              <p className="text-xs text-muted-foreground mt-1">{subvalor}</p>
            )}
          </div>
          
          {dadosSparkline && dadosSparkline.length > 0 && (
            <div className="ml-2">
              <SparklineChart 
                dados={dadosSparkline} 
                cor={getCorSparkline()}
                altura={32}
                largura={60}
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex-1" />
          {tendencia !== 0 && (
            <Badge variant="outline" className={`text-xs ${getTendenciaCor()} border-0`}>
              {getTendenciaIcon()}
              <span className="ml-1">{Math.abs(tendencia)}</span>
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
