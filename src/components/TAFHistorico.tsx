
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye } from "lucide-react";
import { useTAF } from "@/hooks/useTAF";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import TAFDetalhesModal from "./TAFDetalhesModal";

const TAFHistorico = () => {
  const { avaliacoes, isLoadingAvaliacoes } = useTAF();
  const [busca, setBusca] = useState("");
  const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  const avaliacoesFiltradas = avaliacoes.filter(avaliacao => 
    avaliacao.bombeiros?.nome.toLowerCase().includes(busca.toLowerCase()) ||
    avaliacao.avaliador_nome.toLowerCase().includes(busca.toLowerCase())
  );

  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const abrirDetalhes = (avaliacao: any) => {
    setAvaliacaoSelecionada(avaliacao);
    setModalAberto(true);
  };

  if (isLoadingAvaliacoes) {
    return <div>Carregando histórico...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por bombeiro ou avaliador..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Histórico */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Avaliações ({avaliacoesFiltradas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bombeiro</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>Flexões</TableHead>
                <TableHead>Abdominais</TableHead>
                <TableHead>Polichinelos</TableHead>
                <TableHead>Tempo</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {avaliacoesFiltradas.map((avaliacao) => (
                <TableRow key={avaliacao.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{avaliacao.bombeiros?.nome}</div>
                      <div className="text-sm text-muted-foreground">{avaliacao.bombeiros?.funcao}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(parseISO(avaliacao.data_teste), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={avaliacao.idade_na_data >= 40 ? "destructive" : "default"}>
                      {avaliacao.idade_na_data} anos
                    </Badge>
                  </TableCell>
                  <TableCell>{avaliacao.flexoes_realizadas}</TableCell>
                  <TableCell>{avaliacao.abdominais_realizadas}</TableCell>
                  <TableCell>{avaliacao.polichinelos_realizados}</TableCell>
                  <TableCell>{formatarTempo(avaliacao.tempo_total_segundos)}</TableCell>
                  <TableCell>
                    <Badge variant={avaliacao.aprovado ? "default" : "destructive"}>
                      {avaliacao.aprovado ? "APROVADO" : "REPROVADO"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => abrirDetalhes(avaliacao)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {avaliacoesFiltradas.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma avaliação encontrada.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <TAFDetalhesModal
        avaliacao={avaliacaoSelecionada}
        aberto={modalAberto}
        onClose={() => {
          setModalAberto(false);
          setAvaliacaoSelecionada(null);
        }}
      />
    </div>
  );
};

export default TAFHistorico;
