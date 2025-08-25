
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface MetricasCardProps {
  titulo: string;
  valor: number | string;
  subvalor?: string;
  icone: LucideIcon;
  cor: string;
  tendencia?: number;
  formato?: 'numero' | 'percentual' | 'tempo';
}

export const MetricasCard: React.FC<MetricasCardProps> = ({
  titulo,
  valor,
  subvalor,
  icone: Icon,
  cor,
  tendencia = 0,
  formato = 'numero'
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

  return (
    <Card className="glass-card hover:shadow-lg transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{titulo}</CardTitle>
        <Icon className={`h-5 w-5 ${cor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatarValor(valor)}</div>
        
        <div className="flex items-center justify-between mt-2">
          {subvalor && (
            <p className="text-xs text-muted-foreground">{subvalor}</p>
          )}
          
          {tendencia !== 0 && (
            <Badge variant="outline" className={`text-xs ${getTendenciaCor()}`}>
              {getTendenciaIcon()}
              <span className="ml-1">{Math.abs(tendencia)}</span>
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
