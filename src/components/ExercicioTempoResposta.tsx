import { Timer, Plus, Zap, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const ExercicioTempoResposta = () => {
  // Mock data para demonstração
  const exercicios = [
    {
      id: 1,
      data: "2024-01-15",
      equipe: "Alfa",
      chefeEquipe: "Sgt. Santos",
      tipoSimulacao: "Incêndio Estrutural",
      tempoResposta: "4:32",
      tempoChegada: "2:15",
      status: "Excelente"
    },
    {
      id: 2,
      data: "2024-01-12", 
      equipe: "Bravo",
      chefeEquipe: "Cb. Silva",
      tipoSimulacao: "Vazamento Químico",
      tempoResposta: "6:18",
      tempoChegada: "3:45",
      status: "Bom"
    },
    {
      id: 3,
      data: "2024-01-08",
      equipe: "Charlie",
      chefeEquipe: "3º Sgt. Costa",
      tipoSimulacao: "Emergência Médica",
      tempoResposta: "3:25",
      tempoChegada: "1:50",
      status: "Excelente"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Simulações Realizadas</CardTitle>
            <Timer className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">42</div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">4:45</div>
            <p className="text-xs text-muted-foreground">
              Resposta completa
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipes Avaliadas</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">10</div>
            <p className="text-xs text-muted-foreground">
              Todas as equipes
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Melhoria</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">-15%</div>
            <p className="text-xs text-muted-foreground">
              Tempo médio reduzido
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Exercícios de Tempo de Resposta</h3>
          <p className="text-sm text-muted-foreground">
            Simulações cronometradas para medir eficiência operacional
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Exercício
        </Button>
      </div>

      {/* Histórico Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Histórico de Simulações</CardTitle>
          <CardDescription>
            Registro cronometrado das simulações de resposta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Equipe</TableHead>
                <TableHead>Chefe de Equipe</TableHead>
                <TableHead>Tipo de Simulação</TableHead>
                <TableHead>Tempo Resposta</TableHead>
                <TableHead>Tempo Chegada</TableHead>
                <TableHead>Avaliação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exercicios.map((exercicio) => (
                <TableRow key={exercicio.id}>
                  <TableCell>{new Date(exercicio.data).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{exercicio.equipe}</Badge>
                  </TableCell>
                  <TableCell>{exercicio.chefeEquipe}</TableCell>
                  <TableCell>{exercicio.tipoSimulacao}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Timer className="h-3 w-3 text-muted-foreground" />
                      {exercicio.tempoResposta}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-muted-foreground" />
                      {exercicio.tempoChegada}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        exercicio.status === "Excelente" ? "default" : 
                        exercicio.status === "Bom" ? "secondary" : "destructive"
                      }
                    >
                      {exercicio.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">Ver</Button>
                      <Button variant="ghost" size="sm">Editar</Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        Excluir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExercicioTempoResposta;