
import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparklineChartProps {
  dados: Array<{ value: number }>;
  cor?: string;
  altura?: number;
  largura?: number;
}

export const SparklineChart: React.FC<SparklineChartProps> = ({
  dados,
  cor = '#3b82f6',
  altura = 40,
  largura = 80
}) => {
  return (
    <div style={{ width: largura, height: altura }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dados}>
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={cor} 
            strokeWidth={2}
            dot={false}
            animationDuration={500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
