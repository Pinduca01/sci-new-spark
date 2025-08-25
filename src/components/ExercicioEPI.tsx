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
      data: "2024-01-14",
      equipe: "Alfa",
      chefeEquipe: "Ronan",
      tipoEPI: "Conjunto Completo",
      tempoVestimento: "3:45",
      tempoMinutos: 3.75, // 3 minutos e 45 segundos
      status: "Concluído"
    },
    {
      id: 2,
      data: "2024-01-10", 
      equipe: "Bravo",
      chefeEquipe: "Gediael",
      tipoEPI: "EPR + Capacete",
      tempoVestimento: "2:30",
      tempoMinutos: 2.5, // 2 minutos e 30 segundos
      status: "Concluído"
    },
    {
      id: 3,
      data: "2024-01-08",
      equipe: "Charlie",
      chefeEquipe: "Leonardo",
      tipoEPI: "Vestimenta Química",
      tempoVestimento: "4:15",
      tempoMinutos: 4.25, // 4 minutos e 15 segundos
      status: "Concluído"
    },
    {
      id: 4,
      data: "2024-01-12",
      equipe: "Delta",
      chefeEquipe: "Diego",
      tipoEPI: "EPI Básico",
      tempoVestimento: "0:45",
      tempoMinutos: 0.75, // 45 segundos
      status: "Concluído"
    },
    {
      id: 5,
      data: "2024-01-15",
      equipe: "Echo",
      chefeEquipe: "Ronan",
      tipoEPI: "Conjunto Completo",
      tempoVestimento: "1:30",
      tempoMinutos: 1.5, // 1 minuto e 30 segundos
      status: "Concluído"
    }
  ]);

  const handleSaveExercicio = (exercicio: any) => {
    // Mapear os dados do modal para a estrutura esperada
    const exercicioFormatado = {
      id: exercicio.id,
      data: exercicio.data,
      equipe: exercicio.equipe,
      chefeEquipe: exercicio.chefeEquipe,
      tipoEPI: "EPI/EPR", // Valor padrão baseado no tipo do exercício
      tempoVestimento: "N/A", // Será calculado baseado nos bombeiros
      tempoMinutos: 0, // Será calculado baseado nos bombeiros
      status: exercicio.status || "Concluído",
      // Dados adicionais do modal
      identificacaoLocal: exercicio.identificacaoLocal,
      hora: exercicio.hora,
      bombeiros: exercicio.bombeiros,
      observacoes: exercicio.observacoes,
      gerenteSCI: exercicio.gerenteSCI,
      tipo: exercicio.tipo
    };

    if (exercicioSelecionado) {
      // Editando exercício existente
      setExercicios(exercicios.map(ex => ex.id === exercicio.id ? exercicioFormatado : ex));
    } else {
      // Criando novo exercício
      setExercicios([exercicioFormatado, ...exercicios]);
    }
    setExercicioSelecionado(null);
  };

  const handleViewExercicio = (exercicio: any) => {
    setExercicioSelecionado(exercicio);
    setVisualizacaoOpen(true);
  };

  const handleEditExercicio = (exercicio: any) => {
    setExercicioSelecionado(exercicio);
    setModalOpen(true);
  };

  const handleNovoExercicio = () => {
    setExercicioSelecionado(null);
    setModalOpen(true);
  };

  const handleDeleteExercicio = (exercicioId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este exercício?')) {
      setExercicios(exercicios.filter(ex => ex.id !== exercicioId));
    }
  };

  // Cálculos para os cards de estatísticas
  const totalExercicios = exercicios.length;
  
  // Taxa de aprovação baseada no tempo (≤1min = Aprovado, >1min = Reprovado)
  const exerciciosAprovados = exercicios.filter(ex => ex.tempoMinutos <= 1).length;
  const taxaAprovacao = totalExercicios > 0 ? Math.round((exerciciosAprovados / totalExercicios) * 100) : 0;
  
  // Tempo médio de todos os exercícios
  const tempoMedio = totalExercicios > 0 
    ? exercicios.reduce((acc, ex) => acc + ex.tempoMinutos, 0) / totalExercicios 
    : 0;
  const tempoMedioFormatado = `${Math.floor(tempoMedio)}:${String(Math.round((tempoMedio % 1) * 60)).padStart(2, '0')}`;
  
  // Equipes treinadas (baseado nas equipes únicas que fizeram exercícios)
  const equipesUnicas = [...new Set(exercicios.map(ex => ex.equipe))];
  const equipesTrainadas = equipesUnicas.length;
  const totalEquipes = 10; // Valor fixo conforme solicitado

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
            <div className="text-2xl font-bold text-primary">{totalExercicios}</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{tempoMedioFormatado}</div>
            <p className="text-xs text-muted-foreground">Vestimento EPI</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipes Treinadas</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{equipesTrainadas}</div>
            <p className="text-xs text-muted-foreground">De {totalEquipes} equipes</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
            <Award className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{taxaAprovacao}%</div>
            <p className="text-xs text-muted-foreground">Exercícios aprovados (≤1min)</p>
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
          onClick={handleNovoExercicio}
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
                  <TableCell>
                    <Badge variant="default">
                      Concluído
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
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditExercicio(exercicio)}
                      >
                        Editar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteExercicio(exercicio.id)}
                      >
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
        exercicioParaEdicao={exercicioSelecionado}
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