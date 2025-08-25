
import React from 'react';
import Chart from 'react-apexcharts';

interface ApexGaugeChartProps {
  valor: number;
  maximo: number;
  titulo: string;
  unidade?: string;
  cor?: string;
}

export const ApexGaugeChart: React.FC<ApexGaugeChartProps> = ({
  valor,
  maximo,
  titulo,
  unidade = '',
  cor = '#ea580c'
}) => {
  const porcentagem = Math.min((valor / maximo) * 100, 100);

  const getCorPorcentagem = (pct: number) => {
    if (pct >= 80) return '#10b981';
    if (pct >= 60) return '#ea580c';
    if (pct >= 40) return '#f59e0b';
    return '#dc2626';
  };

  const corFinal = getCorPorcentagem(porcentagem);

  const options: any = {
    chart: {
      type: 'radialBar',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        }
      }
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          size: '60%',
          background: 'transparent'
        },
        track: {
          background: '#e5e7eb',
          strokeWidth: '100%',
          margin: 5
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: '14px',
            fontWeight: 500,
            color: '#374151',
            offsetY: -10
          },
          value: {
            show: true,
            fontSize: '18px',
            fontWeight: 600,
            color: '#111827',
            offsetY: 5,
            formatter: function () {
              return `${valor}${unidade}`;
            }
          }
        }
      }
    },
    colors: [corFinal],
    labels: [titulo],
    stroke: {
      lineCap: 'round'
    }
  };

  const series = [porcentagem];

  return (
    <div className="flex flex-col items-center">
      <Chart
        options={options}
        series={series}
        type="radialBar"
        height={200}
        width={200}
      />
      <div className="text-xs text-gray-600 mt-2 text-center">
        {porcentagem.toFixed(0)}% do máximo ({maximo}{unidade})
      </div>
    </div>
  );
};
