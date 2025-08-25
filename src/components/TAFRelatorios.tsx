
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Users, Calendar } from "lucide-react";
import { useTAF } from "@/hooks/useTAF";
import { useBombeiros } from "@/hooks/useBombeiros";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TAFRelatorios = () => {
  const { avaliacoes, estatisticas } = useTAF();
  const { bombeiros } = useBombeiros();
  const { toast } = useToast();

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [bombeiroSelecionado, setBombeiroSelecionado] = useState("");
  const [tipoRelatorio, setTipoRelatorio] = useState("geral");

  const gerarRelatorioGeral = () => {
    const dados = avaliacoes.filter(av => {
      const dataAvaliacao = new Date(av.data_teste);
      const inicio = dataInicio ? new Date(dataInicio) : new Date('2020-01-01');
      const fim = dataFim ? new Date(dataFim) : new Date();
      
      return dataAvaliacao >= inicio && dataAvaliacao <= fim;
    });

    const conteudoRelatorio = `
RELATÓRIO TAF - GERAL
Período: ${dataInicio || 'Início'} até ${dataFim || 'Hoje'}
Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}

ESTATÍSTICAS GERAIS:
- Total de Avaliações: ${dados.length}
- Taxa de Aprovação: ${dados.length > 0 ? ((dados.filter(av => av.aprovado).length / dados.length) * 100).toFixed(1) : 0}%
- Bombeiros Pendentes: ${estatisticas?.bombeiros_pendentes || 0}

PERFORMANCE MÉDIA:
- Flexões: ${dados.length > 0 ? (dados.reduce((sum, av) => sum + av.flexoes_realizadas, 0) / dados.length).toFixed(1) : 0}
- Abdominais: ${dados.length > 0 ? (dados.reduce((sum, av) => sum + av.abdominais_realizadas, 0) / dados.length).toFixed(1) : 0}  
- Polichinelos: ${dados.length > 0 ? (dados.reduce((sum, av) => sum + av.polichinelos_realizados, 0) / dados.length).toFixed(1) : 0}

DETALHAMENTO POR BOMBEIRO:
${dados.map(av => 
  `${av.bombeiros?.nome} - ${format(parseISO(av.data_teste), 'dd/MM/yyyy')} - ${av.aprovado ? 'APROVADO' : 'REPROVADO'}`
).join('\n')}
    `;

    // Criar e fazer download do arquivo
    const blob = new Blob([conteudoRelatorio], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_taf_geral_${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Sucesso",
      description: "Relatório geral gerado com sucesso!",
    });
  };

  const gerarRelatorioIndividual = () => {
    if (!bombeiroSelecionado) {
      toast({
        title: "Erro",
        description: "Selecione um bombeiro para gerar o relatório individual.",
        variant: "destructive",
      });
      return;
    }

    const bombeiro = bombeiros.find(b => b.id === bombeiroSelecionado);
    const avaliacoesBombeiro = avaliacoes.filter(av => av.bombeiro_id === bombeiroSelecionado);

    const conteudoRelatorio = `
RELATÓRIO TAF - INDIVIDUAL
Bombeiro: ${bombeiro?.nome}
Função: ${bombeiro?.funcao}
Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}

HISTÓRICO DE AVALIAÇÕES:
${avaliacoesBombeiro.length > 0 ? 
  avaliacoesBombeiro.map(av => `
Data: ${format(parseISO(av.data_teste), 'dd/MM/yyyy')}
Resultado: ${av.aprovado ? 'APROVADO' : 'REPROVADO'}
Flexões: ${av.flexoes_realizadas} (Meta: 30)
Abdominais: ${av.abdominais_realizadas} (Meta: 45)
Polichinelos: ${av.polichinelos_realizados} (Meta: 45)
Tempo: ${Math.floor(av.tempo_total_segundos / 60)}:${(av.tempo_total_segundos % 60).toString().padStart(2, '0')}
Avaliador: ${av.avaliador_nome}
${av.observacoes ? `Observações: ${av.observacoes}` : ''}
---
  `).join('') :
  'Nenhuma avaliação encontrada para este bombeiro.'
}

ESTATÍSTICAS:
- Total de Avaliações: ${avaliacoesBombeiro.length}
- Taxa de Aprovação: ${avaliacoesBombeiro.length > 0 ? ((avaliacoesBombeiro.filter(av => av.aprovado).length / avaliacoesBombeiro.length) * 100).toFixed(1) : 0}%
- Última Avaliação: ${avaliacoesBombeiro.length > 0 ? format(parseISO(avaliacoesBombeiro[0].data_teste), 'dd/MM/yyyy') : 'N/A'}
    `;

    // Criar e fazer download do arquivo
    const blob = new Blob([conteudoRelatorio], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_taf_${bombeiro?.nome.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Sucesso",
      description: "Relatório individual gerado com sucesso!",
    });
  };

  const gerarRelatorioPendentes = () => {
    // Bombeiros que não fizeram TAF nos últimos 6 meses ou reprovaram
    const bombeirosAtivos = bombeiros.filter(b => b.status === 'ativo');
    const bombeirosPendentes = bombeirosAtivos.filter(bombeiro => {
      const ultimaAvaliacao = avaliacoes
        .filter(av => av.bombeiro_id === bombeiro.id)
        .sort((a, b) => new Date(b.data_teste).getTime() - new Date(a.data_teste).getTime())[0];

      if (!ultimaAvaliacao) return true; // Nunca fez TAF

      const seiseMesesAtras = new Date();
      seiseMesesAtras.setMonth(seiseMesesAtras.getMonth() - 6);
      
      return !ultimaAvaliacao.aprovado || new Date(ultimaAvaliacao.data_teste) < seiseMesesAtras;
    });

    const conteudoRelatorio = `
RELATÓRIO TAF - BOMBEIROS PENDENTES
Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}

CRITÉRIOS:
- Bombeiros que não fizeram TAF nos últimos 6 meses
- Bombeiros que reprovaram no último teste

BOMBEIROS PENDENTES (${bombeirosPendentes.length}):
${bombeirosPendentes.map(bombeiro => {
  const ultimaAvaliacao = avaliacoes
    .filter(av => av.bombeiro_id === bombeiro.id)
    .sort((a, b) => new Date(b.data_teste).getTime() - new Date(a.data_teste).getTime())[0];

  return `
${bombeiro.nome} - ${bombeiro.funcao}
${ultimaAvaliacao ? 
  `Última Avaliação: ${format(parseISO(ultimaAvaliacao.data_teste), 'dd/MM/yyyy')} - ${ultimaAvaliacao.aprovado ? 'APROVADO' : 'REPROVADO'}` :
  'Nunca fez TAF'
}`;
}).join('\n')}

RESUMO:
- Total de Bombeiros Ativos: ${bombeirosAtivos.length}
- Bombeiros Pendentes: ${bombeirosPendentes.length}
- Percentual de Pendências: ${bombeirosAtivos.length > 0 ? ((bombeirosPendentes.length / bombeirosAtivos.length) * 100).toFixed(1) : 0}%
    `;

    // Criar e fazer download do arquivo
    const blob = new Blob([conteudoRelatorio], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_taf_pendentes_${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Sucesso",
      description: "Relatório de pendências gerado com sucesso!",
    });
  };

  return (
    <div className="space-y-6">
      {/* Opções de Relatório */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setTipoRelatorio("geral")}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Relatório Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Estatísticas gerais e resumo de todas as avaliações
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setTipoRelatorio("individual")}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Relatório Individual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Histórico completo de um bombeiro específico
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setTipoRelatorio("pendentes")}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Bombeiros Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Lista dos bombeiros que precisam fazer/refazer TAF
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Configurações do Relatório */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Relatório</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tipoRelatorio === "geral" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data Início</Label>
                <Input 
                  id="dataInicio"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataFim">Data Fim</Label>
                <Input 
                  id="dataFim"
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>
            </div>
          )}

          {tipoRelatorio === "individual" && (
            <div className="space-y-2">
              <Label htmlFor="bombeiro">Bombeiro</Label>
              <Select value={bombeiroSelecionado} onValueChange={setBombeiroSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um bombeiro" />
                </SelectTrigger>
                <SelectContent>
                  {bombeiros.map((bombeiro) => (
                    <SelectItem key={bombeiro.id} value={bombeiro.id}>
                      {bombeiro.nome} - {bombeiro.funcao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-4">
            {tipoRelatorio === "geral" && (
              <Button onClick={gerarRelatorioGeral} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Gerar Relatório Geral
              </Button>
            )}

            {tipoRelatorio === "individual" && (
              <Button onClick={gerarRelatorioIndividual} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Gerar Relatório Individual
              </Button>
            )}

            {tipoRelatorio === "pendentes" && (
              <Button onClick={gerarRelatorioPendentes} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Gerar Lista de Pendentes
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview das Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle>Preview das Estatísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{avaliacoes.length}</div>
              <div className="text-sm text-muted-foreground">Total de Testes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {avaliacoes.filter(av => av.aprovado).length}
              </div>
              <div className="text-sm text-muted-foreground">Aprovados</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {avaliacoes.filter(av => !av.aprovado).length}
              </div>
              <div className="text-sm text-muted-foreground">Reprovados</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {estatisticas?.bombeiros_pendentes || 0}
              </div>
              <div className="text-sm text-muted-foreground">Pendentes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TAFRelatorios;
