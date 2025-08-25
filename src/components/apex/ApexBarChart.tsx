
import React from 'react';
import Chart from 'react-apexcharts';

interface ApexBarChartProps {
  dados: Array<{
    name: string;
    value: number;
  }>;
  titulo?: string;
  horizontal?: boolean;
  showDataLabels?: boolean;
  cor?: string;
}

export const ApexBarChart: React.FC<ApexBarChartProps> = ({
  dados,
  titulo,
  horizontal = false,
  showDataLabels = true,
  cor = '#ea580c'
}) => {
  const series = [{
    name: 'Quantidade',
    data: dados.map(item => item.value)
  }];

  const options: any = {
    chart: {
      type: 'bar',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false
        }
      },
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
      bar: {
        horizontal: horizontal,
        columnWidth: '55%',
        borderRadius: 4,
        dataLabels: {
          position: horizontal ? 'center' : 'top'
        }
      }
    },
    colors: [cor],
    dataLabels: {
      enabled: showDataLabels,
      formatter: function (val: number) {
        return val.toLocaleString();
      },
      style: {
        fontSize: '12px',
        fontWeight: 'bold',
        colors: [horizontal ? '#fff' : '#374151']
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
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
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
        type="bar"
        height={300}
      />
    </div>
  );
};
