
import React from 'react';
import Chart from 'react-apexcharts';

interface ApexLineChartProps {
  dados: Array<{
    name: string;
    value: number;
  }>;
  titulo?: string;
  cor?: string;
  enableZoom?: boolean;
  smooth?: boolean;
}

export const ApexLineChart: React.FC<ApexLineChartProps> = ({
  dados,
  titulo,
  cor = '#ea580c',
  enableZoom = true,
  smooth = true
}) => {
  const series = [{
    name: 'Valor',
    data: dados.map(item => item.value)
  }];

  const options: any = {
    chart: {
      type: 'line',
      zoom: {
        enabled: enableZoom
      },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: enableZoom,
          zoom: enableZoom,
          zoomin: enableZoom,
          zoomout: enableZoom,
          pan: enableZoom,
          reset: enableZoom
        }
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    colors: [cor],
    stroke: {
      curve: smooth ? 'smooth' : 'straight',
      width: 3
    },
    markers: {
      size: 6,
      strokeColors: cor,
      strokeWidth: 2,
      fillColors: ['#fff'],
      hover: {
        sizeOffset: 3
      }
    },
    xaxis: {
      categories: dados.map(item => item.name),
      labels: {
        style: {
          fontSize: '12px',
          colors: '#6b7280'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: function (val: number) {
          return val.toLocaleString();
        },
        style: {
          fontSize: '12px',
          colors: '#6b7280'
        }
      }
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 3
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val.toLocaleString();
        }
      },
      style: {
        fontSize: '12px'
      }
    }
  };

  return (
    <div className="w-full">
      {titulo && <h3 className="text-sm font-medium text-center mb-4 text-foreground">{titulo}</h3>}
      <Chart
        options={options}
        series={series}
        type="line"
        height={300}
      />
    </div>
  );
};
