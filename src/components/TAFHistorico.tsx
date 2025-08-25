
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Search, 
  Download, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Filter
} from 'lucide-react';
import { useTAFAvaliacoes } from '@/hooks/useTAFAvaliacoes';
import { useBombeiros } from '@/hooks/useBombeiros';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TAFHistorico = () => {
  const { avaliacoes, isLoading } = useTAFAvaliacoes();
  const { bombeiros } = useBombeiros();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [faixaEtariaFilter, setFaixaEtariaFilter] = useState('todos');
  const [periodoFilter, setPeriodoFilter] = useState('todos');

  const avaliacoesComBombeiros = useMemo(() => {
    return avaliacoes.map(avaliacao => {
      const bombeiro = bombeiros.find(b => b.id === avaliacao.bombeiro_id);
      return {
        ...avaliacao,
        bombeiro_nome: bombeiro?.nome || 'Bombeiro não encontrado',
        bombeiro_funcao: bombeiro?.funcao || '',
        bombeiro_equipe: bombeiro?.equipe || ''
      };
    });
  }, [avaliacoes, bombeiros]);

  const avaliacoesFiltradas = useMemo(() => {
    return avaliacoesComBombeiros.filter(avaliacao => {
      const matchesSearch = avaliacao.bombeiro_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           avaliacao.avaliador_nome.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'todos' || 
                           (statusFilter === 'aprovado' && avaliacao.aprovado) ||
                           (statusFilter === 'reprovado' && !avaliacao.aprovado);
      
      const matchesFaixaEtaria = faixaEtariaFilter === 'todos' || 
                                avaliacao.faixa_etaria === faixaEtariaFilter;

      let matchesPeriodo = true;
      if (periodoFilter !== 'todos') {
        const dataAvaliacao = new Date(avaliacao.data_teste);
        const hoje = new Date();
        
        switch (periodoFilter) {
          case '30dias':
            matchesPeriodo = (hoje.getTime() - dataAvaliacao.getTime()) <= (30 * 24 * 60 * 60 * 1000);
            break;
          case '90dias':
            matchesPeriodo = (hoje.getTime() - dataAvaliacao.getTime()) <= (90 * 24 * 60 * 60 * 1000);
            break;
          case '6meses':
            matchesPeriodo = (hoje.getTime() - dataAvaliacao.getTime()) <= (180 * 24 * 60 * 60 * 1000);
            break;
          case '1ano':
            matchesPeriodo = (hoje.getTime() - dataAvaliacao.getTime()) <= (365 * 24 * 60 * 60 * 1000);
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesFaixaEtaria && matchesPeriodo;
    });
  }, [avaliacoesComBombeiros, searchTerm, statusFilter, faixaEtariaFilter, periodoFilter]);

  const formatarTempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${minutos}:${secs.toString().padStart(2, '0')}`;
  };

  const exportarCSV = () => {
    const headers = [
      'Data',
      'Bombeiro',
      'Função',
      'Equipe', 
      'Idade',
      'Flexões',
      'Abdominais',
      'Polichinelos',
      'Tempo',
      'Status',
      'Avaliador'
    ];

    const csvContent = [
      headers.join(','),
      ...avaliacoesFiltradas.map(avaliacao => [
        format(new Date(avaliacao.data_teste), 'dd/MM/yyyy'),
        avaliacao.bombeiro_nome,
        avaliacao.bombeiro_funcao,
        avaliacao.bombeiro_equipe,
        avaliacao.idade_na_data,
        avaliacao.flexoes_realizadas,
        avaliacao.abdominais_realizadas,
        avaliacao.polichinelos_realizados,
        formatarTempo(avaliacao.tempo_total_segundos),
        avaliacao.aprovado ? 'APROVADO' : 'REPROVADO',
        avaliacao.avaliador_nome
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `taf_historico_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Histórico de Avaliações TAF
          </CardTitle>
          <Button onClick={exportarCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por bombeiro ou avaliador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="reprovado">Reprovado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={faixaEtariaFilter} onValueChange={setFaixaEtariaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Faixa Etária" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as Idades</SelectItem>
                <SelectItem value="menor_40">Menor que 40 anos</SelectItem>
                <SelectItem value="maior_igual_40">40 anos ou mais</SelectItem>
              </SelectContent>
            </Select>

            <Select value={periodoFilter} onValueChange={setPeriodoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todo o Período</SelectItem>
                <SelectItem value="30dias">Últimos 30 dias</SelectItem>
                <SelectItem value="90dias">Últimos 90 dias</SelectItem>
                <SelectItem value="6meses">Últimos 6 meses</SelectItem>
                <SelectItem value="1ano">Último ano</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {avaliacoesFiltradas.length} resultado(s)
              </span>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Bombeiro</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead className="text-center">Flexões</TableHead>
                  <TableHead className="text-center">Abdominais</TableHead>
                  <TableHead className="text-center">Polichinelos</TableHead>
                  <TableHead className="text-center">Tempo</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Avaliador</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {avaliacoesFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Nenhuma avaliação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  avaliacoesFiltradas.map((avaliacao) => (
                    <TableRow key={avaliacao.id}>
                      <TableCell>
                        {format(new Date(avaliacao.data_teste), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{avaliacao.bombeiro_nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {avaliacao.bombeiro_funcao} - {avaliacao.bombeiro_equipe}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{avaliacao.idade_na_data} anos</TableCell>
                      <TableCell className="text-center">{avaliacao.flexoes_realizadas}</TableCell>
                      <TableCell className="text-center">{avaliacao.abdominais_realizadas}</TableCell>
                      <TableCell className="text-center">{avaliacao.polichinelos_realizados}</TableCell>
                      <TableCell className="text-center">{formatarTempo(avaliacao.tempo_total_segundos)}</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={avaliacao.aprovado ? "default" : "destructive"}
                          className="flex items-center gap-1 w-fit mx-auto"
                        >
                          {avaliacao.aprovado ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {avaliacao.aprovado ? 'APROVADO' : 'REPROVADO'}
                        </Badge>
                      </TableCell>
                      <TableCell>{avaliacao.avaliador_nome}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TAFHistorico;
