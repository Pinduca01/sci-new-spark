import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCreateExercicioEPI, useUpdateExercicioEPI } from "../hooks/useExerciciosEPI";
import { ExercicioEPIAgrupado, CreateExercicioEPI, UpdateExercicioEPI, timeToSeconds, secondsToTime } from "../types/exercicioEPI";
import { useBombeirosPorEquipe } from "@/hooks/useBombeiros";

interface BombeiroCadastrado {
  id: string;
  nome: string;
  funcao: string;
  funcao_completa: string;
  equipe?: string;
  status: string;
}

interface BombeiroTempo {
  nome: string;
  funcao: string;
  tempo_calca_bota: string;
  tempo_tp_completo: string;
  tempo_epr_tp_completo: string;
  tempo_epr_sem_tp: string;
}



interface ExercicioEPIModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercicioParaEdicao?: ExercicioEPIAgrupado;
}

const ExercicioEPIModal = ({ open, onOpenChange, exercicioParaEdicao }: ExercicioEPIModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingEquipe, setLoadingEquipe] = useState(false);
  const [bombeirosCadastrados, setBombeirosCadastrados] = useState<BombeiroCadastrado[]>([]);
  const createExercicioEPI = useCreateExercicioEPI();
  const updateExercicioEPI = useUpdateExercicioEPI();
  
  // Form data
  const [identificacaoLocal, setIdentificacaoLocal] = useState("AEROPORTO INTERNACIONAL SANTA GENOVEVA - GYN");
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState(new Date().toTimeString().slice(0, 5));
  const [equipe, setEquipe] = useState("Alfa");
  const [tipoEpi, setTipoEpi] = useState<'EPI' | 'EPR'>('EPI');
  const [observacoes, setObservacoes] = useState("");
  const [chefeEquipe, setChefeEquipe] = useState("");
  
  
  const [bombeiros, setBombeiros] = useState<BombeiroTempo[]>([
    {
      nome: "",
      funcao: "",
      tempo_calca_bota: "",
      tempo_tp_completo: "",
      tempo_epr_tp_completo: "",
      tempo_epr_sem_tp: ""
    }
  ]);

  // Hook para buscar bombeiros por equipe
  const { bombeiros: bombeirosDaEquipe, isLoading: loadingBombeirosDaEquipe, refetch: refetchBombeirosDaEquipe } = useBombeirosPorEquipe(equipe);

  const adicionarBombeiro = () => {
    setBombeiros([...bombeiros, {
      nome: "",
      funcao: "",
      tempo_calca_bota: "",
      tempo_tp_completo: "",
      tempo_epr_tp_completo: "",
      tempo_epr_sem_tp: ""
    }]);
  };

  const removerBombeiro = (index: number) => {
    setBombeiros(bombeiros.filter((_, i) => i !== index));
  };

  const atualizarBombeiro = (index: number, field: keyof BombeiroTempo, value: string) => {
    const novosBombeiros = [...bombeiros];
    novosBombeiros[index][field] = value;
    setBombeiros(novosBombeiros);
  };

  // Buscar bombeiros cadastrados do Supabase
  const fetchBombeiros = async () => {
    try {
      const { data, error } = await supabase
        .from('bombeiros')
        .select('id, nome, funcao, funcao_completa, equipe, status')
        .eq('status', 'ativo')
        .order('nome');

      if (error) throw error;
      
      // Se não houver dados no Supabase, usar dados mock
      if (!data || data.length === 0) {
        const bombeirosMock: BombeiroCadastrado[] = [
          { id: '1', nome: 'João Silva', funcao: 'BA-CE', funcao_completa: 'Bombeiro Auxiliar - Chefe de Equipe', equipe: 'Alfa', status: 'ativo' },
          { id: '2', nome: 'Maria Santos', funcao: 'BA-LR', funcao_completa: 'Bombeiro Auxiliar - Líder de Resgate', equipe: 'Bravo', status: 'ativo' },
          { id: '3', nome: 'Carlos Oliveira', funcao: 'BA-MC', funcao_completa: 'Bombeiro Auxiliar - Motorista Condutor', equipe: 'Charlie', status: 'ativo' },
          { id: '4', nome: 'Ana Costa', funcao: 'BA-2', funcao_completa: 'Bombeiro Auxiliar 2ª Classe', equipe: 'Delta', status: 'ativo' },
          { id: '5', nome: 'Pedro Souza', funcao: 'BA-2', funcao_completa: 'Bombeiro Auxiliar 2ª Classe', equipe: 'Echo', status: 'ativo' },
          { id: '6', nome: 'Lucas Ferreira', funcao: 'BA-1', funcao_completa: 'Bombeiro Auxiliar 1ª Classe', equipe: 'Foxtrot', status: 'ativo' },
        ];
        setBombeirosCadastrados(bombeirosMock);
      } else {
        setBombeirosCadastrados(data);
      }
    } catch (error) {
      console.error('Erro ao buscar bombeiros:', error);
      // Em caso de erro, usar dados mock
      const bombeirosMock: BombeiroCadastrado[] = [
        { id: '1', nome: 'João Silva', funcao: 'BA-CE', funcao_completa: 'Bombeiro Auxiliar - Chefe de Equipe', equipe: 'Alfa', status: 'ativo' },
        { id: '2', nome: 'Maria Santos', funcao: 'BA-LR', funcao_completa: 'Bombeiro Auxiliar - Líder de Resgate', equipe: 'Bravo', status: 'ativo' },
        { id: '3', nome: 'Carlos Oliveira', funcao: 'BA-MC', funcao_completa: 'Bombeiro Auxiliar - Motorista Condutor', equipe: 'Charlie', status: 'ativo' },
        { id: '4', nome: 'Ana Costa', funcao: 'BA-2', funcao_completa: 'Bombeiro Auxiliar 2ª Classe', equipe: 'Delta', status: 'ativo' },
        { id: '5', nome: 'Pedro Souza', funcao: 'BA-2', funcao_completa: 'Bombeiro Auxiliar 2ª Classe', equipe: 'Echo', status: 'ativo' },
        { id: '6', nome: 'Lucas Ferreira', funcao: 'BA-1', funcao_completa: 'Bombeiro Auxiliar 1ª Classe', equipe: 'Foxtrot', status: 'ativo' },
      ];
      setBombeirosCadastrados(bombeirosMock);
    }
  };

  // Função para extrair apenas a abreviação da função
  const extrairAbreviacaoFuncao = (funcaoCompleta: string): string => {
    if (!funcaoCompleta) return '';
    
    // Procurar por texto entre parênteses
    const match = funcaoCompleta.match(/\(([^)]+)\)/);
    if (match && match[1]) {
      return match[1];
    }
    
    // Se não encontrar parênteses, retornar a função original
    return funcaoCompleta;
  };

  // Função para preencher automaticamente os bombeiros da equipe selecionada
  const preencherBombeirosDaEquipe = async (equipeNome: string) => {
    if (!equipeNome) return;
    
    setLoadingEquipe(true);
    try {
      // Buscar bombeiros da equipe selecionada
      const { data: bombeirosDaEquipeData, error } = await supabase
        .from('bombeiros')
        .select('id, nome, funcao, funcao_completa, equipe, status')
        .eq('equipe', equipeNome)
        .eq('status', 'ativo')
        .order('nome');

      if (error) throw error;

      if (bombeirosDaEquipeData && bombeirosDaEquipeData.length > 0) {
        // Converter para o formato BombeiroTempo
        const novosBombeiros: BombeiroTempo[] = bombeirosDaEquipeData.map(bombeiro => ({
          nome: bombeiro.nome,
          funcao: extrairAbreviacaoFuncao(bombeiro.funcao_completa || bombeiro.funcao),
          tempo_calca_bota: '',
          tempo_tp_completo: '',
          tempo_epr_tp_completo: '',
          tempo_epr_sem_tp: ''
        }));

        setBombeiros(novosBombeiros);
        
        toast({
          title: "Equipe carregada",
          description: `${bombeirosDaEquipeData.length} bombeiros da equipe ${equipeNome} foram adicionados automaticamente.`,
        });
      } else {
        toast({
          title: "Equipe vazia",
          description: `Nenhum bombeiro ativo encontrado na equipe ${equipeNome}.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao buscar bombeiros da equipe:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar bombeiros da equipe. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoadingEquipe(false);
    }
  };

  // Função para lidar com mudança de equipe
  const handleEquipeChange = (novaEquipe: string) => {
    setEquipe(novaEquipe);
    // Preencher automaticamente os bombeiros da nova equipe
    preencherBombeirosDaEquipe(novaEquipe);
  };

  useEffect(() => {
    if (open) {
      fetchBombeiros();
    }
  }, [open]);

  // Carregar dados do exercício para edição
  useEffect(() => {
    if (exercicioParaEdicao && open) {
      setIdentificacaoLocal(exercicioParaEdicao.identificacao_local || "AEROPORTO INTERNACIONAL SANTA GENOVEVA - GYN");
      setData(exercicioParaEdicao.data || new Date().toISOString().split('T')[0]);
      setHora(exercicioParaEdicao.hora || new Date().toTimeString().slice(0, 5));
      setEquipe(exercicioParaEdicao.equipe || "Alfa");
      setTipoEpi(exercicioParaEdicao.tipo_epi || 'EPI');
      setChefeEquipe(exercicioParaEdicao.chefe_equipe || "");
      setObservacoes(exercicioParaEdicao.observacoes || "");
      
      
      // Se o exercício tem dados de bombeiros, carregá-los
      if (exercicioParaEdicao.bombeiros && exercicioParaEdicao.bombeiros.length > 0) {
        const bombeirosCarregados = exercicioParaEdicao.bombeiros.map((bombeiro: any) => ({
          nome: bombeiro.nome || "",
          funcao: bombeiro.funcao || "",
          tempo_calca_bota: bombeiro.tempo_calca_bota ? secondsToTime(bombeiro.tempo_calca_bota) : "",
          tempo_tp_completo: bombeiro.tempo_tp_completo ? secondsToTime(bombeiro.tempo_tp_completo) : "",
          tempo_epr_tp_completo: bombeiro.tempo_epr_tp_completo ? secondsToTime(bombeiro.tempo_epr_tp_completo) : "",
          tempo_epr_sem_tp: bombeiro.tempo_epr_sem_tp ? secondsToTime(bombeiro.tempo_epr_sem_tp) : "",
        }));
        setBombeiros(bombeirosCarregados);
      }
    } else if (open && !exercicioParaEdicao) {
      // Resetar formulário para novo exercício
      setData(new Date().toISOString().split('T')[0]);
      setHora(new Date().toTimeString().slice(0, 5));
      setEquipe("Alfa");
      setTipoEpi('EPI');
      setChefeEquipe("");
      setObservacoes(""); 
      setBombeiros([{
        nome: "",
        funcao: "",
        tempo_calca_bota: "",
        tempo_tp_completo: "",
        tempo_epr_tp_completo: "",
        tempo_epr_sem_tp: ""
      }]);
    }
  }, [exercicioParaEdicao, open]);

  // Função para selecionar o bombeiro e preencher a função abreviada
  const handleBombeiroSelect = (index: number, bombeiroId: string) => {
    const bombeiro = bombeirosCadastrados.find(b => b.id === bombeiroId);
    if (bombeiro) {
      const novosBombeiros = [...bombeiros];
      novosBombeiros[index].nome = bombeiro.nome;
      novosBombeiros[index].funcao = extrairAbreviacaoFuncao(bombeiro.funcao_completa || bombeiro.funcao);
      setBombeiros(novosBombeiros);
    }
  };



  const handleSave = async () => {
    if (!data || !equipe || bombeiros.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Validar se pelo menos um bombeiro tem nome
    const bombeirosValidos = bombeiros.filter(b => b.nome && b.nome.trim());
    if (bombeirosValidos.length === 0) {
      toast({
        title: "Bombeiros obrigatórios",
        description: "Adicione pelo menos um bombeiro válido.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const exercicioData: CreateExercicioEPI | UpdateExercicioEPI = {
        data,
        hora,
        equipe,
        tipo_epi: tipoEpi,
        identificacao_local: identificacaoLocal,
        status: 'Pendente', // Valor padrão para o status
        bombeiros: bombeirosValidos.map(bombeiro => ({
          bombeiro_nome: bombeiro.nome,
          bombeiro_funcao: bombeiro.funcao || '',
          tempo_calca_bota: bombeiro.tempo_calca_bota ? timeToSeconds(bombeiro.tempo_calca_bota) : null,
          tempo_tp_completo: bombeiro.tempo_tp_completo ? timeToSeconds(bombeiro.tempo_tp_completo) : null,
          tempo_epr_tp_completo: bombeiro.tempo_epr_tp_completo ? timeToSeconds(bombeiro.tempo_epr_tp_completo) : null,
          tempo_epr_sem_tp: bombeiro.tempo_epr_sem_tp ? timeToSeconds(bombeiro.tempo_epr_sem_tp) : null,
        })),
        observacoes,
        chefe_equipe: chefeEquipe,
      };

      if (exercicioParaEdicao) {
        await updateExercicioEPI.mutateAsync({
          exercicio_grupo_id: exercicioParaEdicao.exercicio_grupo_id,
          ...exercicioData as UpdateExercicioEPI,
        });
        toast({
          title: "Sucesso",
          description: "Exercício atualizado com sucesso!",
        });
      } else {
        await createExercicioEPI.mutateAsync(exercicioData as CreateExercicioEPI);
        toast({
          title: "Sucesso",
          description: "Exercício criado com sucesso!",
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar exercício:", error);
      toast({
        title: "Erro",
        description: exercicioParaEdicao ? "Erro ao atualizar exercício." : "Erro ao criar exercício.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{exercicioParaEdicao ? "Editar Exercício de EPI/EPR" : "Novo Exercício de EPI/EPR"}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Identificação e Data/Hora */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="identificacao">Identificação do Local</Label>
              <Input
                id="identificacao"
                value={identificacaoLocal || ""}
                onChange={(e) => setIdentificacaoLocal(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={data || ""}
                  onChange={(e) => setData(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="hora">Hora</Label>
                <Input
                  id="hora"
                  type="time"
                  value={hora || ""}
                  onChange={(e) => setHora(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Equipe e Tipo EPI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="equipe">Equipe</Label>
                <Select value={equipe} onValueChange={handleEquipeChange} disabled={loadingEquipe}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingEquipe ? "Carregando..." : "Selecione uma equipe"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alfa">Alfa</SelectItem>
                    <SelectItem value="Bravo">Bravo</SelectItem>
                    <SelectItem value="Charlie">Charlie</SelectItem>
                    <SelectItem value="Delta">Delta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            <div>
              <Label htmlFor="tipo-epi">Tipo de Exercício</Label>
              <Select value={tipoEpi} onValueChange={(value: 'EPI' | 'EPR') => setTipoEpi(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EPI">EPI - Equipamento de Proteção Individual</SelectItem>
                  <SelectItem value="EPR">EPR - Equipamento de Proteção Respiratória</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabela de Bombeiros */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Tempos dos Bombeiros</h3>
                <Button type="button" onClick={adicionarBombeiro} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Bombeiro
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-gray-300 p-2 text-left">Nome</th>
                      <th className="border border-gray-300 p-2 text-left">Função</th>
                      <th className="border border-gray-300 p-2 text-center">
                        Calça + Bota
                      </th>
                      <th className="border border-gray-300 p-2 text-center">
                        TP Completo
                      </th>
                      <th className="border border-gray-300 p-2 text-center">
                        EPR + TP Completo
                      </th>
                      <th className="border border-gray-300 p-2 text-center">
                        EPR sem TP
                      </th>
                      <th className="border border-gray-300 p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bombeiros.map((bombeiro, index) => (
                      <tr key={`bombeiro-${index}-${bombeiro.nome || 'novo'}`}>
                        <td className="border border-gray-300 p-1">
                          <Select
                            value={bombeirosCadastrados.find(b => b.nome === bombeiro.nome)?.id || ""}
                            onValueChange={(value) => handleBombeiroSelect(index, value)}
                          >
                            <SelectTrigger className="border-0 h-8">
                              <SelectValue placeholder="Selecione o bombeiro" />
                            </SelectTrigger>
                            <SelectContent>
                              {bombeirosCadastrados.map((bombeiroCadastrado) => (
                                <SelectItem key={`select-${bombeiroCadastrado.id}`} value={bombeiroCadastrado.id}>
                                  {bombeiroCadastrado.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiro.funcao || ""}
                            onChange={(e) => atualizarBombeiro(index, 'funcao', e.target.value)}
                            className="border-0 h-8"
                            placeholder="Função"
                          />
                        </td>
                        {/* Calça + Bota */}
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiro.tempo_calca_bota || ""}
                            onChange={(e) => atualizarBombeiro(index, 'tempo_calca_bota', e.target.value)}
                            className="border-0 h-8 text-center"
                            placeholder="00:00"
                          />
                        </td>
                        {/* TP Completo */}
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiro.tempo_tp_completo || ""}
                            onChange={(e) => atualizarBombeiro(index, 'tempo_tp_completo', e.target.value)}
                            className="border-0 h-8 text-center"
                            placeholder="00:00"
                          />
                        </td>
                        {/* EPR + TP Completo */}
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiro.tempo_epr_tp_completo || ""}
                            onChange={(e) => atualizarBombeiro(index, 'tempo_epr_tp_completo', e.target.value)}
                            className="border-0 h-8 text-center"
                            placeholder="00:00"
                          />
                        </td>
                        {/* EPR sem TP */}
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiro.tempo_epr_sem_tp || ""}
                            onChange={(e) => atualizarBombeiro(index, 'tempo_epr_sem_tp', e.target.value)}
                            className="border-0 h-8 text-center"
                            placeholder="00:00"
                          />
                        </td>
                        <td className="border border-gray-300 p-1 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removerBombeiro(index)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes || ""}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Assinaturas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="chefeEquipe">Chefe de Equipe</Label>
              <Input
                id="chefeEquipe"
                value={chefeEquipe || ""}
                onChange={(e) => setChefeEquipe(e.target.value)}
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave} disabled={loading}>
              {loading ? "Salvando..." : "Salvar Exercício"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExercicioEPIModal;