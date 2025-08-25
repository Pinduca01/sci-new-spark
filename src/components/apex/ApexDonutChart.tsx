
import React from 'react';
import Chart from 'react-apexcharts';

interface ApexDonutChartProps {
  dados: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  titulo: string;
  altura?: number;
  showLegend?: boolean;
}

export const ApexDonutChart: React.FC<ApexDonutChartProps> = ({
  dados,
  titulo,
  altura = 250,
  showLegend = true
}) => {
  const series = dados.map(item => item.value);
  const labels = dados.map(item => item.name);
  const colors = dados.map(item => item.color);

  const options: any = {
    chart: {
      type: 'donut',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
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
      }
    },
    colors: colors,
    labels: labels,
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151'
            },
            value: {
              show: true,
              fontSize: '16px',
              fontWeight: 600,
              color: '#111827',
              formatter: function (val: string) {
                return parseInt(val).toLocaleString();
              }
            },
            total: {
              show: true,
              showAlways: false,
              label: 'Total',
              fontSize: '14px',
              fontWeight: 500,
              color: '#6b7280'
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return Math.round(val) + '%';
      },
      style: {
        fontSize: '12px',
        fontWeight: 'bold',
        colors: ['#fff']
      },
      dropShadow: {
        enabled: true,
        blur: 2,
        opacity: 0.8
      }
    },
    legend: {
      show: showLegend,
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '12px',
      fontWeight: 500,
      markers: {
        width: 8,
        height: 8,
        radius: 4
      },
      itemMargin: {
        horizontal: 12,
        vertical: 4
      }
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function (val: number) {
          const total = series.reduce((sum, item) => sum + item, 0);
          const percentage = ((val / total) * 100).toFixed(1);
          return `${val.toLocaleString()} (${percentage}%)`;
        }
      },
      style: {
        fontSize: '12px'
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-center mb-4 text-foreground">{titulo}</h3>
      <Chart
        options={options}
        series={series}
        type="donut"
        height={altura}
      />
    </div>
  );
};
