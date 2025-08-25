
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendIndicatorProps {
  valor: number;
  unidade?: string;
  tendencia: 'positiva' | 'negativa' | 'neutra';
  descricao?: string;
  tamanho?: 'sm' | 'md' | 'lg';
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  valor,
  unidade = '',
  tendencia,
  descricao,
  tamanho = 'md'
}) => {
  const getIcon = () => {
    switch (tendencia) {
      case 'positiva':
        return TrendingUp;
      case 'negativa':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const getCores = () => {
    switch (tendencia) {
      case 'positiva':
        return 'text-green-600 bg-green-100';
      case 'negativa':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTamanhos = () => {
    switch (tamanho) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'lg':
        return 'text-base px-4 py-2';
      default:
        return 'text-sm px-3 py-1.5';
    }
  };

  const Icon = getIcon();
  
  return (
    <div className={`inline-flex items-center gap-1 rounded-full ${getCores()} ${getTamanhos()}`}>
      <Icon className={`${tamanho === 'sm' ? 'h-3 w-3' : tamanho === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />
      <span className="font-medium">
        {Math.abs(valor)}{unidade}
      </span>
      {descricao && (
        <span className="opacity-80">
          {descricao}
        </span>
      )}
    </div>
  );
};
