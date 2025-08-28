import { MapPin, Plus, Crosshair, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import ExercicioPosicionamentoModal from "@/components/ExercicioPosicionamentoModal";
import { useToast } from "@/hooks/use-toast";

const ExercicioPosicionamento = () => {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  
  // Mock data para demonstração
  const exercicios = [
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
  ];

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
      
      <ExercicioPosicionamentoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={(formulario) => {
          console.log('Formulário salvo:', formulario);
          toast({
            title: "Sucesso",
            description: "Exercício de posicionamento criado com sucesso!"
          });
        }}
      />
    </div>
  );
};

export default ExercicioPosicionamento;