
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TAFAvaliacao } from "@/hooks/useTAF";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TAFChartsProps {
  avaliacoes: TAFAvaliacao[];
}

const TAFCharts = ({ avaliacoes }: TAFChartsProps) => {
  // Dados para gráfico de evolução mensal
  const dadosEvolucao = avaliacoes.reduce((acc: any[], avaliacao) => {
    const mes = format(parseISO(avaliacao.data_teste), 'MMM/yyyy', { locale: ptBR });
    const existente = acc.find(item => item.mes === mes);
    
    if (existente) {
      existente.aprovados += avaliacao.aprovado ? 1 : 0;
      existente.total += 1;
      existente.taxa = (existente.aprovados / existente.total) * 100;
    } else {
      acc.push({
        mes,
        aprovados: avaliacao.aprovado ? 1 : 0,
        total: 1,
        taxa: avaliacao.aprovado ? 100 : 0
      });
    }
    
    return acc;
  }, []).slice(-6); // Últimos 6 meses

  // Dados para gráfico de performance por exercício
  const dadosPerformance = [
    {
      exercicio: 'Flexões',
      meta_abaixo_40: 30,
      meta_acima_40: 30,
      media_atual: avaliacoes.reduce((sum, av) => sum + av.flexoes_realizadas, 0) / avaliacoes.length || 0
    },
    {
      exercicio: 'Abdominais',
      meta_abaixo_40: 45,
      meta_acima_40: 45,
      media_atual: avaliacoes.reduce((sum, av) => sum + av.abdominais_realizadas, 0) / avaliacoes.length || 0
    },
    {
      exercicio: 'Polichinelos',
      meta_abaixo_40: 45,
      meta_acima_40: 45,
      media_atual: avaliacoes.reduce((sum, av) => sum + av.polichinelos_realizados, 0) / avaliacoes.length || 0
    }
  ];

  // Dados para gráfico de distribuição por faixa etária
  const dadosFaixaEtaria = avaliacoes.reduce((acc: any[], avaliacao) => {
    const faixa = avaliacao.faixa_etaria === 'abaixo_40' ? 'Abaixo de 40' : 'Acima de 40';
    const existente = acc.find(item => item.faixa === faixa);
    
    if (existente) {
      existente.aprovados += avaliacao.aprovado ? 1 : 0;
      existente.reprovados += !avaliacao.aprovado ? 1 : 0;
      existente.total += 1;
    } else {
      acc.push({
        faixa,
        aprovados: avaliacao.aprovado ? 1 : 0,
        reprovados: !avaliacao.aprovado ? 1 : 0,
        total: 1
      });
    }
    
    return acc;
  }, []);

  const COLORS = ['#10B981', '#EF4444'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Evolução da Taxa de Aprovação */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução da Taxa de Aprovação</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosEvolucao}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Taxa de Aprovação']} />
              <Line type="monotone" dataKey="taxa" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance vs Metas */}
      <Card>
        <CardHeader>
          <CardTitle>Performance vs Metas</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="exercicio" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="meta_abaixo_40" fill="#94A3B8" name="Meta <40 anos" />
              <Bar dataKey="media_atual" fill="#10B981" name="Média Atual" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribuição por Faixa Etária */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Faixa Etária</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosFaixaEtaria}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="faixa" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="aprovados" fill="#10B981" name="Aprovados" />
              <Bar dataKey="reprovados" fill="#EF4444" name="Reprovados" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Resultados Gerais */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Aprovados', value: avaliacoes.filter(av => av.aprovado).length },
                  { name: 'Reprovados', value: avaliacoes.filter(av => !av.aprovado).length }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {[{ name: 'Aprovados' }, { name: 'Reprovados' }].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default TAFCharts;
