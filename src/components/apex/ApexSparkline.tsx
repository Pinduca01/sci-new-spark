
import React from 'react';
import Chart from 'react-apexcharts';

interface ApexSparklineProps {
  dados: Array<{ value: number }>;
  cor?: string;
  altura?: number;
  largura?: number;
}

export const ApexSparkline: React.FC<ApexSparklineProps> = ({
  dados,
  cor = '#ea580c',
  altura = 40,
  largura = 80
}) => {
  const series = [{
    data: dados.map(item => item.value)
  }];

  const options: any = {
    chart: {
      type: 'line',
      sparkline: {
        enabled: true
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 400
      }
    },
    colors: [cor],
    stroke: {
      curve: 'smooth',
      width: 2
    },
    tooltip: {
      enabled: true,
      fixed: {
        enabled: false
      },
      x: {
        show: false
      },
      y: {
        title: {
          formatter: () => ''
        },
        formatter: function (val: number) {
          return val.toLocaleString();
        }
      },
      marker: {
        show: false
      }
    }
  };

  return (
    <div style={{ width: largura, height: altura }}>
      <Chart
        options={options}
        series={series}
        type="line"
        height={altura}
        width={largura}
      />
    </div>
  );
};
