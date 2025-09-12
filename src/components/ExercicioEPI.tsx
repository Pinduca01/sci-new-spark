import { useState, useMemo } from "react";
import { Shield, Plus, Clock, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import ExercicioEPIModal from "./ExercicioEPIModal";
import ExercicioEPIVisualizacao from "./ExercicioEPIVisualizacao";
import { useExerciciosEPI, useCreateExercicioEPI, useUpdateExercicioEPI, useDeleteExercicioEPI, useExercicioEPI, useChefeEquipe } from "@/hooks/useExerciciosEPI";
import { ExercicioEPIAgrupado } from "@/types/exercicioEPI";
import { toast } from "sonner";

const ExercicioEPI = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [visualizacaoOpen, setVisualizacaoOpen] = useState(false);
  const [exercicioSelecionado, setExercicioSelecionado] = useState<ExercicioEPIAgrupado | null>(null);
  const [selectedGrupoId, setSelectedGrupoId] = useState<string | null>(null);
  
  // Hooks para gerenciar dados do Supabase
  const { 
    data: exercicios = [], 
    isLoading, 
    error 
  } = useExerciciosEPI();
  const { mutate: criarExercicio } = useCreateExercicioEPI();
  const { mutate: atualizarExercicio } = useUpdateExercicioEPI();
  const { mutate: excluirExercicio } = useDeleteExercicioEPI();
  const { data: exercicioDetalhado } = useExercicioEPI(selectedGrupoId || '');
  
  // Hooks para buscar chefes de equipe - chamados sempre na mesma ordem
  const { data: chefeAlfa } = useChefeEquipe('Alfa');
  const { data: chefeBravo } = useChefeEquipe('Bravo');
  const { data: chefeCharlie } = useChefeEquipe('Charlie');
  const { data: chefeDelta } = useChefeEquipe('Delta');
  
  // Mapeamento de chefes de equipe usando useMemo
  const chefesEquipe = useMemo(() => ({
    'Alfa': chefeAlfa || 'Não informado',
    'Bravo': chefeBravo || 'Não informado',
    'Charlie': chefeCharlie || 'Não informado',
    'Delta': chefeDelta || 'Não informado'
  }), [chefeAlfa, chefeBravo, chefeCharlie, chefeDelta]);
  
  // Função para obter chefe de equipe do mapeamento
  const getChefeEquipe = (equipe: string) => {
    return chefesEquipe[equipe as keyof typeof chefesEquipe] || 'Não informado';
  };
  
  // Dados mockados removidos - agora usando dados reais do banco
  /*const [exercicios, setExercicios] = useState([
    // Dados mockados removidos - usando dados reais do Supabase
  */

  const handleSaveExercicio = (exercicio: any) => {
    // O modal já envia os dados no formato correto para a nova estrutura
    // Não precisamos mais calcular tempo_vestimento aqui
    
    if (exercicioSelecionado) {
      // Editando exercício existente
      atualizarExercicio(
        { grupoId: exercicioSelecionado.exercicio_grupo_id, updates: exercicio },
        {
          onSuccess: () => {
            toast.success("Exercício atualizado com sucesso!");
            setExercicioSelecionado(null);
          },
          onError: (error) => {
            toast.error("Erro ao atualizar exercício: " + error.message);
          }
        }
      );
    } else {
      // Criando novo exercício
      criarExercicio(exercicio, {
        onSuccess: () => {
          toast.success("Exercício criado com sucesso!");
          setExercicioSelecionado(null);
        },
        onError: (error) => {
          toast.error("Erro ao criar exercício: " + error.message);
        }
      });
    }
  };

  const handleViewExercicio = (exercicio: any) => {
    setSelectedGrupoId(exercicio.exercicio_grupo_id);
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

  const handleDeleteExercicio = (exercicioGrupoId: string) => {
    // Validar se o ID existe antes de tentar excluir
    if (!exercicioGrupoId || exercicioGrupoId === 'undefined') {
      toast.error("Erro: ID do exercício não encontrado. Não é possível excluir.");
      return;
    }

    excluirExercicio(exercicioGrupoId, {
      onSuccess: () => {
        toast.success("Exercício excluído com sucesso!");
      },
      onError: (error) => {
        toast.error("Erro ao excluir exercício: " + error.message);
      }
    });
  };

  // Tratamento de loading e error
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Carregando exercícios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-2">Erro ao carregar exercícios</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  // Cálculos para os cards de estatísticas usando dados reais
  const totalExercicios = exercicios.length;
  
  // Função para converter tempo (string HH:MM ou number em segundos) para minutos
  const tempoParaMinutos = (tempo: string | number) => {
    // Se for undefined, null ou vazio, retorna 0
    if (!tempo && tempo !== 0) {
      return 0;
    }
    
    // Se for número (segundos), converte para minutos
    if (typeof tempo === 'number') {
      return Math.round(tempo / 60);
    }
    
    // Se for string, valida e processa formato HH:MM
    if (typeof tempo === 'string') {
      // Verificar se o formato está correto (contém ':')
      if (!tempo.includes(':')) {
        return 0;
      }
      
      const [horas, minutos] = tempo.split(':').map(Number);
      return (horas || 0) * 60 + (minutos || 0);
    }
    
    return 0;
  };
  
  // Taxa de aprovação baseada no tempo (≤60min = Aprovado, >60min = Reprovado)
  const exerciciosAprovados = exercicios.filter(ex => {
    const tempoMinutos = tempoParaMinutos(ex.tempo_vestimento);
    return tempoMinutos <= 60; // 1 hora como limite
  }).length;
  const taxaAprovacao = totalExercicios > 0 ? Math.round((exerciciosAprovados / totalExercicios) * 100) : 0;
  
  // Tempo médio de todos os exercícios
  const tempoMedio = totalExercicios > 0 
    ? exercicios.reduce((acc, ex) => {
        const tempoMinutos = tempoParaMinutos(ex.tempo_vestimento);
        return acc + tempoMinutos;
      }, 0) / totalExercicios 
    : 0;
  const tempoMedioFormatado = `${Math.floor(tempoMedio / 60)}:${String(Math.round(tempoMedio % 60)).padStart(2, '0')}`;
  
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
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exercicios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="text-muted-foreground">
                      <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhum exercício encontrado</p>
                      <p className="text-sm">Clique em "Novo Exercício" para começar</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                exercicios.map((exercicio, index) => (
                  <TableRow key={exercicio.exercicio_grupo_id ? `exercicio-${exercicio.exercicio_grupo_id}-${exercicio.data}` : `exercicio-${index}-${exercicio.data}`}>
                    <TableCell>{new Date(exercicio.data).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{exercicio.equipe}</Badge>
                    </TableCell>
                    <TableCell>{getChefeEquipe(exercicio.equipe)}</TableCell>
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
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:text-destructive"
                              disabled={!exercicio.exercicio_grupo_id}
                            >
                              Excluir
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir este exercício de EPI/EPR da equipe {exercicio.equipe}? Esta ação não pode ser desfeita e todos os dados relacionados ao exercício serão permanentemente removidos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteExercicio(exercicio.exercicio_grupo_id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Excluir Exercício
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ExercicioEPIModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        exercicioParaEdicao={exercicioSelecionado}
      />

      <ExercicioEPIVisualizacao
        open={visualizacaoOpen}
        onOpenChange={(open) => {
          setVisualizacaoOpen(open);
          if (!open) {
            setSelectedGrupoId(null);
            setExercicioSelecionado(null);
          }
        }}
        exercicio={exercicioDetalhado}
      />
    </div>
  );
};

export default ExercicioEPI;