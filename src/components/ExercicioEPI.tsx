import { useState } from "react";
import { Shield, Plus, Clock, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import ExercicioEPIModal from "./ExercicioEPIModal";
import ExercicioEPIVisualizacao from "./ExercicioEPIVisualizacao";

const ExercicioEPI = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [visualizacaoOpen, setVisualizacaoOpen] = useState(false);
  const [exercicioSelecionado, setExercicioSelecionado] = useState(null);
  const [exercicios, setExercicios] = useState([
    {
      id: 1,
      data: "2024-01-15",
      equipe: "Alfa",
      chefeEquipe: "Sgt. Santos",
      tipoEPI: "Conjunto Completo",
      tempoVestimento: "3:45",
      status: "Concluído"
    },
    {
      id: 2,
      data: "2024-01-10", 
      equipe: "Bravo",
      chefeEquipe: "Cb. Silva",
      tipoEPI: "EPR + Capacete",
      tempoVestimento: "2:30",
      status: "Concluído"
    },
    {
      id: 3,
      data: "2024-01-08",
      equipe: "Charlie",
      chefeEquipe: "3º Sgt. Costa",
      tipoEPI: "Vestimenta Química",
      tempoVestimento: "4:15",
      status: "Em Revisão"
    }
  ]);

  const handleSaveExercicio = (novoExercicio: any) => {
    setExercicios([novoExercicio, ...exercicios]);
  };

  const handleViewExercicio = (exercicio: any) => {
    setExercicioSelecionado(exercicio);
    setVisualizacaoOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Exercícios</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">28</div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">3:12</div>
            <p className="text-xs text-muted-foreground">
              Vestimento EPI
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipes Treinadas</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">8</div>
            <p className="text-xs text-muted-foreground">
              De 10 equipes
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
            <Award className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">94%</div>
            <p className="text-xs text-muted-foreground">
              Exercícios aprovados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Exercícios de EPI/EPR</h3>
          <p className="text-sm text-muted-foreground">
            Treinamentos de equipamentos de proteção individual e respiratória
          </p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Novo Exercício
        </Button>
      </div>

      {/* Histórico Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Histórico de Exercícios</CardTitle>
          <CardDescription>
            Registro completo dos treinamentos realizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Equipe</TableHead>
                <TableHead>Chefe de Equipe</TableHead>
                <TableHead>Tipo EPI</TableHead>
                <TableHead>Tempo</TableHead>
                <TableHead>Status</TableHead>
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
                  <TableCell>{exercicio.tipoEPI}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {exercicio.tempoVestimento}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={exercicio.status === "Concluído" ? "default" : "secondary"}
                    >
                      {exercicio.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewExercicio(exercicio)}
                      >
                        Ver
                      </Button>
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

      <ExercicioEPIModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSaveExercicio}
      />

      <ExercicioEPIVisualizacao
        open={visualizacaoOpen}
        onOpenChange={setVisualizacaoOpen}
        exercicio={exercicioSelecionado}
      />
    </div>
  );
};

export default ExercicioEPI;