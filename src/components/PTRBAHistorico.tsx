
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History, Clock, User, Download, Calendar, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PTRBAHistoricoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface HistoricoBombeiro {
  id: string;
  nome: string;
  funcao: string;
  totalHoras: number;
  totalInstrucoes: number;
  ultimaInstrucao: string;
  tiposMaisFrequentes: string[];
}

export const PTRBAHistorico: React.FC<PTRBAHistoricoProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const [periodoInicio, setPeriodoInicio] = useState('2024-01-01');
  const [periodoFim, setPeriodoFim] = useState('2024-12-31');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroBombeiro, setFiltroBombeiro] = useState('todos');

  // Dados mockados - depois virão do Supabase
  const historicoBombeiros: HistoricoBombeiro[] = [
    {
      id: '1',
      nome: 'João Silva',
      funcao: 'BA-CE',
      totalHoras: 24,
      totalInstrucoes: 12,
      ultimaInstrucao: '2024-08-25',
      tiposMaisFrequentes: ['Procedimentos de Emergência', 'Combate a Incêndio']
    },
    {
      id: '2',
      nome: 'Maria Santos',
      funcao: 'BA-LR',
      totalHoras: 20,
      totalInstrucoes: 10,
      ultimaInstrucao: '2024-08-24',
      tiposMaisFrequentes: ['Primeiros Socorros', 'Resgate em Altura']
    },
    {
      id: '3',
      nome: 'Carlos Oliveira',
      funcao: 'BA-MC',
      totalHoras: 18,
      totalInstrucoes: 9,
      ultimaInstrucao: '2024-08-23',
      tiposMaisFrequentes: ['Manuseio de Equipamentos', 'Procedimentos de Emergência']
    },
    {
      id: '4',
      nome: 'Ana Costa',
      funcao: 'BA-2',
      totalHoras: 22,
      totalInstrucoes: 11,
      ultimaInstrucao: '2024-08-25',
      tiposMaisFrequentes: ['Combate a Incêndio', 'Salvamento Aquático']
    }
  ];

  const estatisticasGerais = {
    totalBombeiros: historicoBombeiros.length,
    totalHoras: historicoBombeiros.reduce((acc, b) => acc + b.totalHoras, 0),
    totalInstrucoes: historicoBombeiros.reduce((acc, b) => acc + b.totalInstrucoes, 0),
    mediaTreinamentoPorBombeiro: Math.round(
      historicoBombeiros.reduce((acc, b) => acc + b.totalHoras, 0) / historicoBombeiros.length
    )
  };

  const exportarRelatorio = () => {
    // Implementar exportação
    toast({
      title: "Exportando Relatório",
      description: "O download será iniciado em breve.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <History className="w-5 h-5" />
            <span>Histórico Completo de PTRs</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros de Consulta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Período - Início</Label>
                  <Input
                    type="date"
                    value={periodoInicio}
                    onChange={(e) => setPeriodoInicio(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Período - Fim</Label>
                  <Input
                    type="date"
                    value={periodoFim}
                    onChange={(e) => setPeriodoFim(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Tema da Instrução</Label>
                  <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Tipos</SelectItem>
                      <SelectItem value="procedimentos">Procedimentos de Emergência</SelectItem>
                      <SelectItem value="combate">Combate a Incêndio</SelectItem>
                      <SelectItem value="primeiros-socorros">Primeiros Socorros</SelectItem>
                      <SelectItem value="equipamentos">Manuseio de Equipamentos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bombeiro</Label>
                  <Select value={filtroBombeiro} onValueChange={setFiltroBombeiro}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Bombeiros</SelectItem>
                      {historicoBombeiros.map((bombeiro) => (
                        <SelectItem key={bombeiro.id} value={bombeiro.id}>
                          {bombeiro.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas Gerais */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{estatisticasGerais.totalBombeiros}</p>
                    <p className="text-sm text-muted-foreground">Bombeiros Ativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{estatisticasGerais.totalHoras}h</p>
                    <p className="text-sm text-muted-foreground">Horas Totais</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{estatisticasGerais.totalInstrucoes}</p>
                    <p className="text-sm text-muted-foreground">Instruções Dadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{estatisticasGerais.mediaTreinamentoPorBombeiro}h</p>
                    <p className="text-sm text-muted-foreground">Média por Bombeiro</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Histórico */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico Detalhado por Bombeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bombeiro</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead className="text-center">Total de Horas</TableHead>
                    <TableHead className="text-center">Nº Instruções</TableHead>
                    <TableHead className="text-center">Última Instrução</TableHead>
                    <TableHead>Tipos Mais Frequentes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historicoBombeiros.map((bombeiro) => (
                    <TableRow key={bombeiro.id}>
                      <TableCell className="font-medium">{bombeiro.nome}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{bombeiro.funcao}</Badge>
                      </TableCell>
                      <TableCell className="text-center font-bold text-green-600">
                        {bombeiro.totalHoras}h
                      </TableCell>
                      <TableCell className="text-center">{bombeiro.totalInstrucoes}</TableCell>
                      <TableCell className="text-center">
                        {new Date(bombeiro.ultimaInstrucao).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {bombeiro.tiposMaisFrequentes.map((tipo, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tipo}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            <Button onClick={exportarRelatorio} className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Exportar Relatório Completo</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
