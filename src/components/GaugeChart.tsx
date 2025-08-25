
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface GaugeChartProps {
  valor: number;
  maximo: number;
  titulo: string;
  unidade?: string;
  cor?: string;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  valor,
  maximo,
  titulo,
  unidade = '',
  cor = '#3b82f6'
}) => {
  const porcentagem = Math.min((valor / maximo) * 100, 100);
  
  const data = [
    { name: 'Filled', value: porcentagem },
    { name: 'Empty', value: 100 - porcentagem }
  ];

  const getCorPorcentagem = (pct: number) => {
    if (pct >= 80) return '#10b981';
    if (pct >= 60) return '#f59e0b';
    if (pct >= 40) return '#ef4444';
    return '#6b7280';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-16">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={40}
              outerRadius={60}
              dataKey="value"
            >
              <Cell fill={getCorPorcentagem(porcentagem)} />
              <Cell fill="#e5e7eb" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-end justify-center pb-2">
          <div className="text-center">
            <div className="text-lg font-bold">{valor}{unidade}</div>
            <div className="text-xs text-gray-600">{porcentagem.toFixed(0)}%</div>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-1">{titulo}</p>
    </div>
  );
};
