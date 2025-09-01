import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  User,
  Calendar,
  Target,
  Activity,
  BarChart3,
  Users
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { useBombeiros } from '@/hooks/useBombeiros';
import { useTAFAvaliacoes } from '@/hooks/useTAFAvaliacoes';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EvolucaoData {
  data: string;
  dataFormatada: string;
  flexoes: number;
  abdominais: number;
  polichinelos: number;
  tempoSegundos: number;
  tempoFormatado: string;
  aprovado: boolean;
  pontuacaoTotal: number;
}

interface EstatisticasEvolucao {
  totalAvaliacoes: number;
  taxaAprovacao: number;
  melhorFlexoes: number;
  melhorAbdominais: number;
  melhorPolichinelos: number;
  melhorTempo: number;
  tendenciaFlexoes: 'subindo' | 'descendo' | 'estavel';
  tendenciaAbdominais: 'subindo' | 'descendo' | 'estavel';
  tendenciaPolichinelos: 'subindo' | 'descendo' | 'estavel';
  tendenciaTempo: 'subindo' | 'descendo' | 'estavel';
}

const TAFEvolucao: React.FC = () => {
  const [bombeiroSelecionado, setBombeiroSelecionado] = useState<string>('');
  const [tipoGrafico, setTipoGrafico] = useState<'linha' | 'barra'>('linha');
  
  const { bombeiros, isLoading: loadingBombeiros } = useBombeiros();
  const { avaliacoes, isLoading: loadingAvaliacoes } = useTAFAvaliacoes();

  // Filtrar avaliações do bombeiro selecionado
  const avaliacoesBombeiro = useMemo(() => {
    if (!bombeiroSelecionado || !avaliacoes) return [];
    
    return avaliacoes
      .filter(av => av.bombeiro_id === bombeiroSelecionado)
      .sort((a, b) => new Date(a.data_teste).getTime() - new Date(b.data_teste).getTime());
  }, [bombeiroSelecionado, avaliacoes]);

  // Processar dados para os gráficos
  const dadosEvolucao: EvolucaoData[] = useMemo(() => {
    return avaliacoesBombeiro.map(av => {
      const minutos = Math.floor(av.tempo_total_segundos / 60);
      const segundos = av.tempo_total_segundos % 60;
      
      // Calcular pontuação total (sistema de pontos simples)
      const pontuacaoTotal = av.flexoes_realizadas + av.abdominais_realizadas + av.polichinelos_realizados;
      
      return {
        data: av.data_teste,
        dataFormatada: format(parseISO(av.data_teste), 'dd/MM/yy', { locale: ptBR }),
        flexoes: av.flexoes_realizadas,
        abdominais: av.abdominais_realizadas,
        polichinelos: av.polichinelos_realizados,
        tempoSegundos: av.tempo_total_segundos,
        tempoFormatado: `${minutos}:${segundos.toString().padStart(2, '0')}`,
        aprovado: av.aprovado,
        pontuacaoTotal
      };
    });
  }, [avaliacoesBombeiro]);

  // Calcular estatísticas de evolução
  const estatisticas: EstatisticasEvolucao | null = useMemo(() => {
    if (dadosEvolucao.length === 0) return null;
    
    const totalAvaliacoes = dadosEvolucao.length;
    const aprovados = dadosEvolucao.filter(d => d.aprovado).length;
    const taxaAprovacao = (aprovados / totalAvaliacoes) * 100;
    
    const melhorFlexoes = Math.max(...dadosEvolucao.map(d => d.flexoes));
    const melhorAbdominais = Math.max(...dadosEvolucao.map(d => d.abdominais));
    const melhorPolichinelos = Math.max(...dadosEvolucao.map(d => d.polichinelos));
    const melhorTempo = Math.min(...dadosEvolucao.map(d => d.tempoSegundos));
    
    // Calcular tendências (comparar últimas 3 avaliações com as 3 anteriores)
    const calcularTendencia = (valores: number[]): 'subindo' | 'descendo' | 'estavel' => {
      if (valores.length < 2) return 'estavel';
      
      const metadeIndex = Math.floor(valores.length / 2);
      const primeiraMetade = valores.slice(0, metadeIndex);
      const segundaMetade = valores.slice(metadeIndex);
      
      const mediaPrimeira = primeiraMetade.reduce((a, b) => a + b, 0) / primeiraMetade.length;
      const mediaSegunda = segundaMetade.reduce((a, b) => a + b, 0) / segundaMetade.length;
      
      const diferenca = mediaSegunda - mediaPrimeira;
      
      if (Math.abs(diferenca) < 1) return 'estavel';
      return diferenca > 0 ? 'subindo' : 'descendo';
    };
    
    const calcularTendenciaTempo = (valores: number[]): 'subindo' | 'descendo' | 'estavel' => {
      const tendencia = calcularTendencia(valores);
      // Para tempo, "subindo" significa pior (mais tempo), então invertemos
      return tendencia === 'subindo' ? 'descendo' : tendencia === 'descendo' ? 'subindo' : 'estavel';
    };
    
    return {
      totalAvaliacoes,
      taxaAprovacao,
      melhorFlexoes,
      melhorAbdominais,
      melhorPolichinelos,
      melhorTempo,
      tendenciaFlexoes: calcularTendencia(dadosEvolucao.map(d => d.flexoes)),
      tendenciaAbdominais: calcularTendencia(dadosEvolucao.map(d => d.abdominais)),
      tendenciaPolichinelos: calcularTendencia(dadosEvolucao.map(d => d.polichinelos)),
      tendenciaTempo: calcularTendenciaTempo(dadosEvolucao.map(d => d.tempoSegundos))
    };
  }, [dadosEvolucao]);

  const bombeiro = bombeiros?.find(b => b.id === bombeiroSelecionado);
  const isLoading = loadingBombeiros || loadingAvaliacoes;

  const getTendenciaIcon = (tendencia: 'subindo' | 'descendo' | 'estavel') => {
    switch (tendencia) {
      case 'subindo':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'descendo':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getTendenciaColor = (tendencia: 'subindo' | 'descendo' | 'estavel') => {
    switch (tendencia) {
      case 'subindo':
        return 'text-green-600';
      case 'descendo':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const formatarTempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Evolução Individual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="grid gap-4 md:grid-cols-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Evolução Individual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Seleção de Bombeiro */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Select value={bombeiroSelecionado} onValueChange={setBombeiroSelecionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um bombeiro para ver sua evolução" />
                  </SelectTrigger>
                  <SelectContent>
                    {bombeiros?.map((bombeiro) => (
                      <SelectItem key={bombeiro.id} value={bombeiro.id}>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {bombeiro.nome_completo || bombeiro.nome}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {bombeiroSelecionado && (
                <div className="flex gap-2">
                  <Button
                    variant={tipoGrafico === 'linha' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTipoGrafico('linha')}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Linha
                  </Button>
                  <Button
                    variant={tipoGrafico === 'barra' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTipoGrafico('barra')}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Barra
                  </Button>
                </div>
              )}
            </div>

            {!bombeiroSelecionado ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecione um Bombeiro</h3>
                <p className="text-muted-foreground">
                  Escolha um bombeiro acima para visualizar sua evolução no TAF
                </p>
              </div>
            ) : dadosEvolucao.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma Avaliação Encontrada</h3>
                <p className="text-muted-foreground">
                  {bombeiro?.nome_completo || bombeiro?.nome} ainda não possui avaliações TAF registradas
                </p>
              </div>
            ) : (
              <>
                {/* Informações do Bombeiro */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{bombeiro?.nome_completo || bombeiro?.nome}</h3>
                        <p className="text-muted-foreground">{bombeiro?.funcao} - {bombeiro?.equipe}</p>
                      </div>
                    </div>
                    
                    {estatisticas && (
                      <div className="grid gap-4 md:grid-cols-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{estatisticas.totalAvaliacoes}</div>
                          <div className="text-sm text-muted-foreground">Avaliações</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{estatisticas.taxaAprovacao.toFixed(1)}%</div>
                          <div className="text-sm text-muted-foreground">Taxa de Aprovação</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{estatisticas.melhorFlexoes}</div>
                          <div className="text-sm text-muted-foreground">Melhor Flexões</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">{formatarTempo(estatisticas.melhorTempo)}</div>
                          <div className="text-sm text-muted-foreground">Melhor Tempo</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Tendências */}
                {estatisticas && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tendências de Desempenho</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-4">
                        <div className="flex items-center gap-3">
                          {getTendenciaIcon(estatisticas.tendenciaFlexoes)}
                          <div>
                            <div className="font-medium">Flexões</div>
                            <div className={`text-sm ${getTendenciaColor(estatisticas.tendenciaFlexoes)}`}>
                              {estatisticas.tendenciaFlexoes === 'subindo' ? 'Melhorando' : 
                               estatisticas.tendenciaFlexoes === 'descendo' ? 'Piorando' : 'Estável'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {getTendenciaIcon(estatisticas.tendenciaAbdominais)}
                          <div>
                            <div className="font-medium">Abdominais</div>
                            <div className={`text-sm ${getTendenciaColor(estatisticas.tendenciaAbdominais)}`}>
                              {estatisticas.tendenciaAbdominais === 'subindo' ? 'Melhorando' : 
                               estatisticas.tendenciaAbdominais === 'descendo' ? 'Piorando' : 'Estável'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {getTendenciaIcon(estatisticas.tendenciaPolichinelos)}
                          <div>
                            <div className="font-medium">Polichinelos</div>
                            <div className={`text-sm ${getTendenciaColor(estatisticas.tendenciaPolichinelos)}`}>
                              {estatisticas.tendenciaPolichinelos === 'subindo' ? 'Melhorando' : 
                               estatisticas.tendenciaPolichinelos === 'descendo' ? 'Piorando' : 'Estável'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {getTendenciaIcon(estatisticas.tendenciaTempo)}
                          <div>
                            <div className="font-medium">Tempo</div>
                            <div className={`text-sm ${getTendenciaColor(estatisticas.tendenciaTempo)}`}>
                              {estatisticas.tendenciaTempo === 'subindo' ? 'Melhorando' : 
                               estatisticas.tendenciaTempo === 'descendo' ? 'Piorando' : 'Estável'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Gráfico de Evolução */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Evolução dos Exercícios</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        {tipoGrafico === 'linha' ? (
                          <LineChart data={dadosEvolucao}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="dataFormatada" />
                            <YAxis />
                            <Tooltip 
                              labelFormatter={(label) => `Data: ${label}`}
                              formatter={(value, name) => {
                                const nomeFormatado = name === 'flexoes' ? 'Flexões' :
                                                    name === 'abdominais' ? 'Abdominais' :
                                                    name === 'polichinelos' ? 'Polichinelos' : name;
                                return [value, nomeFormatado];
                              }}
                            />
                            <Legend 
                              formatter={(value) => {
                                return value === 'flexoes' ? 'Flexões' :
                                       value === 'abdominais' ? 'Abdominais' :
                                       value === 'polichinelos' ? 'Polichinelos' : value;
                              }}
                            />
                            <Line type="monotone" dataKey="flexoes" stroke="#8884d8" strokeWidth={2} />
                            <Line type="monotone" dataKey="abdominais" stroke="#82ca9d" strokeWidth={2} />
                            <Line type="monotone" dataKey="polichinelos" stroke="#ffc658" strokeWidth={2} />
                          </LineChart>
                        ) : (
                          <BarChart data={dadosEvolucao}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="dataFormatada" />
                            <YAxis />
                            <Tooltip 
                              labelFormatter={(label) => `Data: ${label}`}
                              formatter={(value, name) => {
                                const nomeFormatado = name === 'flexoes' ? 'Flexões' :
                                                    name === 'abdominais' ? 'Abdominais' :
                                                    name === 'polichinelos' ? 'Polichinelos' : name;
                                return [value, nomeFormatado];
                              }}
                            />
                            <Legend 
                              formatter={(value) => {
                                return value === 'flexoes' ? 'Flexões' :
                                       value === 'abdominais' ? 'Abdominais' :
                                       value === 'polichinelos' ? 'Polichinelos' : value;
                              }}
                            />
                            <Bar dataKey="flexoes" fill="#8884d8" />
                            <Bar dataKey="abdominais" fill="#82ca9d" />
                            <Bar dataKey="polichinelos" fill="#ffc658" />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Histórico de Avaliações */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Histórico Detalhado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dadosEvolucao.slice().reverse().map((avaliacao, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{avaliacao.dataFormatada}</span>
                            </div>
                            <Badge variant={avaliacao.aprovado ? 'default' : 'destructive'}>
                              {avaliacao.aprovado ? 'Aprovado' : 'Reprovado'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="text-center">
                              <div className="font-medium">{avaliacao.flexoes}</div>
                              <div className="text-muted-foreground">Flexões</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{avaliacao.abdominais}</div>
                              <div className="text-muted-foreground">Abdominais</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{avaliacao.polichinelos}</div>
                              <div className="text-muted-foreground">Polichinelos</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{avaliacao.tempoFormatado}</div>
                              <div className="text-muted-foreground">Tempo</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TAFEvolucao;