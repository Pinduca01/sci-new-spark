import { Timer, Plus, Zap, Users, TrendingUp, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import TempoRespostaModal, { FormularioTempoResposta } from "./TempoRespostaModal";
import TempoRespostaVisualizacao from "./TempoRespostaVisualizacao";
import { useToast } from "@/hooks/use-toast";

const ExercicioTempoResposta = () => {
  const { toast } = useToast();
  const [modalAberto, setModalAberto] = useState(false);
  const [visualizacaoAberta, setVisualizacaoAberta] = useState(false);
  const [formularios, setFormularios] = useState<FormularioTempoResposta[]>([]);
  const [formularioSelecionado, setFormularioSelecionado] = useState<FormularioTempoResposta | null>(null);
  const [formularioParaEdicao, setFormularioParaEdicao] = useState<FormularioTempoResposta | undefined>(undefined);

  // Carregar formulários do localStorage
  useEffect(() => {
    const formulariosStorage = localStorage.getItem('formularios-tempo-resposta');
    if (formulariosStorage) {
      try {
        setFormularios(JSON.parse(formulariosStorage));
      } catch (error) {
        console.error('Erro ao carregar formulários:', error);
      }
    }
  }, []);

  // Salvar formulários no localStorage
  const salvarFormularios = (novosFormularios: FormularioTempoResposta[]) => {
    setFormularios(novosFormularios);
    localStorage.setItem('formularios-tempo-resposta', JSON.stringify(novosFormularios));
  };

  const handleSalvarFormulario = (formulario: FormularioTempoResposta) => {
    const formulariosAtualizados = formularioParaEdicao
      ? formularios.map(f => f.id === formulario.id ? formulario : f)
      : [...formularios, formulario];
    
    salvarFormularios(formulariosAtualizados);
    setFormularioParaEdicao(undefined);
  };

  const handleVisualizarFormulario = (formulario: FormularioTempoResposta) => {
    setFormularioSelecionado(formulario);
    setVisualizacaoAberta(true);
  };

  const handleEditarFormulario = (formulario: FormularioTempoResposta) => {
    setFormularioParaEdicao(formulario);
    setModalAberto(true);
  };

  const handleExcluirFormulario = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este formulário?')) {
      const formulariosAtualizados = formularios.filter(f => f.id !== id);
      salvarFormularios(formulariosAtualizados);
      toast({
        title: "Sucesso",
        description: "Formulário excluído com sucesso!"
      });
    }
  };

  const handleNovoFormulario = () => {
    setFormularioParaEdicao(undefined);
    setModalAberto(true);
  };

  // Calcular estatísticas
  const totalFormularios = formularios.length;
  const tempoMedio = formularios.length > 0 
    ? formularios.reduce((acc, f) => {
        const tempoTotal = f.viaturas.reduce((vAcc, v) => {
          const tempo = v.tempo.match(/(\d+)min(\d+)seg/);
          if (tempo) {
            return vAcc + (parseInt(tempo[1]) * 60) + parseInt(tempo[2]);
          }
          return vAcc;
        }, 0);
        return acc + (tempoTotal / f.viaturas.length);
      }, 0) / formularios.length
    : 0;
  
  const formatarTempo = (segundos: number) => {
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min}:${seg.toString().padStart(2, '0')}`;
  };

  const equipesAvaliadas = new Set(formularios.map(f => f.equipe)).size;
  const performanceSatisfatoria = formularios.filter(f => 
    f.viaturas.some(v => v.performance === 'Satisfatório')
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
              Formulários salvos
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {totalFormularios > 0 ? formatarTempo(tempoMedio) : "--:--"}
            </div>
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
            <div className="text-2xl font-bold text-blue-500">{equipesAvaliadas}</div>
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
        <Button onClick={handleNovoFormulario} className="flex items-center gap-2">
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
                <TableHead>Aeroporto</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Tempo Médio</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formularios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Nenhum formulário de tempo de resposta cadastrado.
                    <br />
                    Clique em "Novo Exercício" para começar.
                  </TableCell>
                </TableRow>
              ) : (
                formularios.map((formulario) => {
                  const tempoMedioFormulario = formulario.viaturas.length > 0 
                    ? formulario.viaturas.reduce((acc, v) => {
                        const tempo = v.tempo.match(/(\d+)min(\d+)seg/);
                        if (tempo) {
                          return acc + (parseInt(tempo[1]) * 60) + parseInt(tempo[2]);
                        }
                        return acc;
                      }, 0) / formulario.viaturas.length
                    : 0;
                  
                  const performanceGeral = formulario.viaturas.every(v => v.performance === 'Satisfatório') 
                    ? 'Excelente' 
                    : formulario.viaturas.some(v => v.performance === 'Satisfatório') 
                    ? 'Bom' 
                    : 'Regular';

                  return (
                    <TableRow key={formulario.id}>
                      <TableCell>{new Date(formulario.data).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{formulario.equipe}</Badge>
                      </TableCell>
                      <TableCell>{formulario.identificacaoAeroporto}</TableCell>
                      <TableCell>{formulario.local}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Timer className="h-3 w-3 text-muted-foreground" />
                          {formatarTempo(tempoMedioFormulario)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3 text-muted-foreground" />
                          {formulario.hora}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            performanceGeral === "Excelente" ? "default" : 
                            performanceGeral === "Bom" ? "secondary" : "destructive"
                          }
                        >
                          {performanceGeral}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleVisualizarFormulario(formulario)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            Ver
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditarFormulario(formulario)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Editar
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleExcluirFormulario(formulario.id!)}
                            className="text-destructive hover:text-destructive flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal para criar/editar formulário */}
      <TempoRespostaModal
        open={modalAberto}
        onOpenChange={setModalAberto}
        formularioParaEdicao={formularioParaEdicao}
        onSave={handleSalvarFormulario}
      />

      {/* Modal para visualizar formulário */}
      <TempoRespostaVisualizacao
        open={visualizacaoAberta}
        onOpenChange={setVisualizacaoAberta}
        formulario={formularioSelecionado}
      />
    </div>
  );
};

export default ExercicioTempoResposta;