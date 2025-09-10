import { MapPin, Plus, Crosshair, Users, Star, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import ExercicioPosicionamentoModal from "@/components/ExercicioPosicionamentoModal";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const ExercicioPosicionamento = () => {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [exercicioParaEdicao, setExercicioParaEdicao] = useState(null);
  const [exercicioParaExclusao, setExercicioParaExclusao] = useState(null);
  const [exercicioParaVisualizacao, setExercicioParaVisualizacao] = useState(null);
  
  // Mock data para demonstração
  const [exercicios, setExercicios] = useState([
    {
      id: 1,
      data: "2024-01-16",
      equipe: "Alfa",
      chefeEquipe: "Sgt. Santos",
      cenario: "Incêndio em Hangar",
      coordenacao: "Excelente",
      posicionamento: "Adequado",
      tempoSetup: "6:30",
      status: "Aprovado"
    },
    {
      id: 2,
      data: "2024-01-13", 
      equipe: "Bravo",
      chefeEquipe: "Cb. Silva",
      cenario: "Emergência Aeronave",
      coordenacao: "Bom",
      posicionamento: "Adequado",
      tempoSetup: "7:45",
      status: "Aprovado"
    },
    {
      id: 3,
      data: "2024-01-09",
      equipe: "Charlie",
      chefeEquipe: "3º Sgt. Costa",
      cenario: "Vazamento Combustível",
      coordenacao: "Regular",
      posicionamento: "Revisar",
      tempoSetup: "9:15",
      status: "Em Revisão"
    }
  ]);

  const handleVerExercicio = (exercicio) => {
    setExercicioParaVisualizacao(exercicio);
  };

  const handleEditarExercicio = (exercicio) => {
    setExercicioParaEdicao(exercicio);
    setModalOpen(true);
  };

  const handleExcluirExercicio = (exercicio) => {
    setExercicioParaExclusao(exercicio);
  };

  const confirmarExclusao = () => {
    if (exercicioParaExclusao) {
      setExercicios(exercicios.filter(ex => ex.id !== exercicioParaExclusao.id));
      setExercicioParaExclusao(null);
      toast({
        title: "Sucesso",
        description: "Exercício excluído com sucesso!"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exercícios Realizados</CardTitle>
            <MapPin className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">35</div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Setup Médio</CardTitle>
            <Crosshair className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">7:12</div>
            <p className="text-xs text-muted-foreground">
              Posicionamento completo
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipes Certificadas</CardTitle>
            <Users className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-500">9</div>
            <p className="text-xs text-muted-foreground">
              De 10 equipes
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nota Média</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">8.7</div>
            <p className="text-xs text-muted-foreground">
              De 10 pontos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Exercícios de Posicionamento</h3>
          <p className="text-sm text-muted-foreground">
            Treinamentos de posicionamento tático e coordenação de equipes
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
          <CardTitle>Histórico de Posicionamentos</CardTitle>
          <CardDescription>
            Registro dos exercícios táticos de posicionamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Equipe</TableHead>
                <TableHead>Chefe de Equipe</TableHead>
                <TableHead>Cenário</TableHead>
                <TableHead>Coordenação</TableHead>
                <TableHead>Posicionamento</TableHead>
                <TableHead>Tempo Setup</TableHead>
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
                  <TableCell>{exercicio.cenario}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        exercicio.coordenacao === "Excelente" ? "default" : 
                        exercicio.coordenacao === "Bom" ? "secondary" : "outline"
                      }
                    >
                      {exercicio.coordenacao}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        exercicio.posicionamento === "Adequado" ? "default" : "destructive"
                      }
                    >
                      {exercicio.posicionamento}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Crosshair className="h-3 w-3 text-muted-foreground" />
                      {exercicio.tempoSetup}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        exercicio.status === "Aprovado" ? "default" : "secondary"
                      }
                    >
                      {exercicio.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleVerExercicio(exercicio)}
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditarExercicio(exercicio)}
                        title="Editar exercício"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleExcluirExercicio(exercicio)}
                        title="Excluir exercício"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <ExercicioPosicionamentoModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setExercicioParaEdicao(null);
          }
        }}
        formularioParaEdicao={exercicioParaEdicao}
        onSave={(formulario) => {
          console.log('Formulário salvo:', formulario);
          toast({
            title: "Sucesso",
            description: exercicioParaEdicao ? "Exercício atualizado com sucesso!" : "Exercício de posicionamento criado com sucesso!"
          });
        }}
      />

      <AlertDialog open={!!exercicioParaExclusao} onOpenChange={() => setExercicioParaExclusao(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o exercício da equipe {exercicioParaExclusao?.equipe}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!exercicioParaVisualizacao} onOpenChange={() => setExercicioParaVisualizacao(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Exercício</DialogTitle>
          </DialogHeader>
          {exercicioParaVisualizacao && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Data:</label>
                  <p>{new Date(exercicioParaVisualizacao.data).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Equipe:</label>
                  <p>{exercicioParaVisualizacao.equipe}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Chefe de Equipe:</label>
                  <p>{exercicioParaVisualizacao.chefeEquipe}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Cenário:</label>
                  <p>{exercicioParaVisualizacao.cenario}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Coordenação:</label>
                  <Badge variant={exercicioParaVisualizacao.coordenacao === "Excelente" ? "default" : exercicioParaVisualizacao.coordenacao === "Bom" ? "secondary" : "outline"}>
                    {exercicioParaVisualizacao.coordenacao}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Posicionamento:</label>
                  <Badge variant={exercicioParaVisualizacao.posicionamento === "Adequado" ? "default" : "destructive"}>
                    {exercicioParaVisualizacao.posicionamento}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Tempo Setup:</label>
                  <p>{exercicioParaVisualizacao.tempoSetup}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status:</label>
                  <Badge variant={exercicioParaVisualizacao.status === "Aprovado" ? "default" : "secondary"}>
                    {exercicioParaVisualizacao.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExercicioPosicionamento;