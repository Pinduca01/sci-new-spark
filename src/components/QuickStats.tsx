
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface QuickStatProps {
  icone: LucideIcon;
  valor: string | number;
  label: string;
  cor?: string;
}

interface QuickStatsProps {
  stats: QuickStatProps[];
}

export const QuickStats: React.FC<QuickStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4 text-center">
            <stat.icone className={`h-6 w-6 mx-auto mb-2 ${stat.cor || 'text-blue-600'}`} />
            <div className="text-lg font-bold">{stat.valor}</div>
            <div className="text-xs text-gray-600">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
