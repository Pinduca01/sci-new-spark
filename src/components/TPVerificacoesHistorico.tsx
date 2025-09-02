import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, FileText, Calendar, User, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useTPVerificacoes, type TPVerificacao } from '@/hooks/useTPVerificacoes';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import TPVerificacaoDetailsModal from './TPVerificacaoDetailsModal';

const TPVerificacoesHistorico = () => {
  const { data: verificacoes = [], isLoading } = useTPVerificacoes();
  const [filtroBase, setFiltroBase] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroAno, setFiltroAno] = useState('');
  const [verificacaoSelecionada, setVerificacaoSelecionada] = useState<TPVerificacao | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  // Filtrar verificações
  const verificacoesFiltradas = verificacoes.filter((verificacao) => {
    const matchBase = !filtroBase || verificacao.base.toLowerCase().includes(filtroBase.toLowerCase());
    const matchStatus = !filtroStatus || filtroStatus === 'todos' || verificacao.status_assinatura === filtroStatus;
    const matchMes = !filtroMes || filtroMes === 'todos' || verificacao.mes_referencia.toString() === filtroMes;
    const matchAno = !filtroAno || filtroAno === 'todos' || verificacao.ano_referencia.toString() === filtroAno;
    
    return matchBase && matchStatus && matchMes && matchAno;
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'assinado':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Assinado</Badge>;
      case 'enviado':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Enviado</Badge>;
      case 'rascunho':
      default:
        return <Badge variant="outline"><FileText className="w-3 h-3 mr-1" />Rascunho</Badge>;
    }
  };

  const getConformidadeBadge = (conformes: number, naoConformes: number) => {
    const total = conformes + naoConformes;
    const percentualConformidade = total > 0 ? (conformes / total) * 100 : 0;
    
    if (percentualConformidade >= 90) {
      return <Badge variant="default" className="bg-green-500">Excelente</Badge>;
    } else if (percentualConformidade >= 70) {
      return <Badge variant="secondary" className="bg-yellow-500">Bom</Badge>;
    } else {
      return <Badge variant="destructive">Atenção</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Verificações TP</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Carregando verificações...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Histórico de Verificações TP
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Input
            placeholder="Filtrar por base..."
            value={filtroBase}
            onChange={(e) => setFiltroBase(e.target.value)}
          />
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status da assinatura" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="rascunho">Rascunho</SelectItem>
              <SelectItem value="enviado">Enviado</SelectItem>
              <SelectItem value="assinado">Assinado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filtroMes} onValueChange={setFiltroMes}>
            <SelectTrigger>
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os meses</SelectItem>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {format(new Date(2024, i, 1), 'MMMM', { locale: ptBR })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filtroAno} onValueChange={setFiltroAno}>
            <SelectTrigger>
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os anos</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabela de verificações */}
        {verificacoesFiltradas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma verificação encontrada</p>
            <p className="text-sm">Tente ajustar os filtros ou criar uma nova verificação</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Base</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Data Verificação</TableHead>
                  <TableHead>Conformidade</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Status Assinatura</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verificacoesFiltradas.map((verificacao) => (
                  <TableRow key={verificacao.id}>
                    <TableCell className="font-medium">{verificacao.base}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(2024, verificacao.mes_referencia - 1, 1), 'MMM/yyyy', { locale: ptBR })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(verificacao.data_verificacao), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getConformidadeBadge(verificacao.tp_conformes, verificacao.tp_nao_conformes)}
                        <div className="text-xs text-muted-foreground">
                          {verificacao.tp_conformes}C / {verificacao.tp_nao_conformes}NC
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {verificacao.responsavel_nome}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(verificacao.status_assinatura)}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setVerificacaoSelecionada(verificacao);
                          setModalAberto(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Visualizar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Resumo */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{verificacoesFiltradas.length}</div>
              <div className="text-sm text-muted-foreground">Total de Verificações</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {verificacoesFiltradas.filter(v => v.status_assinatura === 'assinado').length}
              </div>
              <div className="text-sm text-muted-foreground">Assinadas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {verificacoesFiltradas.filter(v => v.status_assinatura === 'enviado').length}
              </div>
              <div className="text-sm text-muted-foreground">Pendentes</div>
            </CardContent>
          </Card>
        </div>
      </CardContent>

      {/* Modal de Detalhes */}
      <TPVerificacaoDetailsModal
        verificacao={verificacaoSelecionada}
        open={modalAberto}
        onOpenChange={setModalAberto}
      />
    </Card>
  );
};

export default TPVerificacoesHistorico;