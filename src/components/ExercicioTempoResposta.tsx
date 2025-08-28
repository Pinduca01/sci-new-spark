import { Timer, Plus, Zap, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import TempoRespostaFormModal from "@/components/TempoRespostaFormModal";

const ExercicioTempoResposta = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [formularios, setFormularios] = useState<any[]>([]);

  // Carregar formulários do localStorage ao inicializar
  useEffect(() => {
    const formulariosStorage = localStorage.getItem('formularios-tempo-resposta');
    if (formulariosStorage) {
      try {
        setFormularios(JSON.parse(formulariosStorage));
      } catch (error) {
        console.error('Erro ao carregar formulários do localStorage:', error);
      }
    }
  }, []);

  // Salvar formulários no localStorage sempre que a lista mudar
  useEffect(() => {
    if (formularios.length > 0) {
      localStorage.setItem('formularios-tempo-resposta', JSON.stringify(formularios));
    }
  }, [formularios]);

  const handleSaveFormulario = (formulario: any) => {
    setFormularios(prev => {
      const novosFormularios = [...prev, formulario];
      return novosFormularios;
    });
  };

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

  // Calcular estatísticas dos formulários
  const totalFormularios = formularios.length;
  const tempoMedio = formularios.length > 0 
    ? formularios.reduce((acc, form) => {
        const tempoTotal = form.viaturas.reduce((vAcc: number, viatura: any) => {
          const tempo = viatura.tempo;
          if (tempo) {
            const match = tempo.match(/(\d+)min(\d+)seg/);
            if (match) {
              return vAcc + (parseInt(match[1]) * 60 + parseInt(match[2]));
            }
          }
          return vAcc;
        }, 0);
        return acc + (tempoTotal / form.viaturas.length || 0);
      }, 0) / formularios.length
    : 0;
  
  const formatarTempoMedio = (segundos: number) => {
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min}:${seg.toString().padStart(2, '0')}`;
  };

  const equipesUnicas = new Set(formularios.map(f => f.equipe)).size;
  const performanceSatisfatoria = formularios.filter(f => 
    f.viaturas.some((v: any) => v.performance === 'Satisfatório')
  ).length;

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
            <div className="text-2xl font-bold text-primary">{totalFormularios}</div>
            <p className="text-xs text-muted-foreground">
              Total registrado
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{formatarTempoMedio(tempoMedio)}</div>
            <p className="text-xs text-muted-foreground">
              Tempo médio
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipes Avaliadas</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{equipesUnicas}</div>
            <p className="text-xs text-muted-foreground">
              Equipes diferentes
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Melhoria</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{performanceSatisfatoria}</div>
            <p className="text-xs text-muted-foreground">
              Performance satisfatória
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
        <Button 
          className="flex items-center gap-2"
          onClick={() => setModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Novo Exercício
        </Button>
      </div>

      {/* Histórico */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Histórico de Simulações (Dados Anteriores)</CardTitle>
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
                <TableHead>Tempo Resposta</TableHead>
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

      <TempoRespostaFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSaveFormulario}
      />
    </div>
  );
};

export default ExercicioTempoResposta;