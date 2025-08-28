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
  calcaBota: string;
  tpCompleto: string;
  eprTpCompleto: string;
  eprSemTp: string;
}

interface ExercicioEPIModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (exercicio: any) => void;
  exercicioParaEdicao?: any;
}

const ExercicioEPIModal = ({ open, onOpenChange, onSave, exercicioParaEdicao }: ExercicioEPIModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bombeirosCadastrados, setBombeirosCadastrados] = useState<BombeiroCadastrado[]>([]);
  
  // Form data
  const [identificacaoLocal, setIdentificacaoLocal] = useState("AEROPORTO INTERNACIONAL SANTA GENOVEVA - GYN");
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState(new Date().toTimeString().slice(0, 5));
  const [equipe, setEquipe] = useState("Alfa");
  const [observacoes, setObservacoes] = useState("");
  const [chefeEquipe, setChefeEquipe] = useState("");
  
  
  const [bombeiros, setBombeiros] = useState<BombeiroTempo[]>([
    {
      nome: "",
      funcao: "",
      calcaBota: "",
      tpCompleto: "",
      eprTpCompleto: "",
      eprSemTp: ""
    }
  ]);

  const adicionarBombeiro = () => {
    setBombeiros([...bombeiros, {
      nome: "",
      funcao: "",
      calcaBota: "",
      tpCompleto: "",
      eprTpCompleto: "",
      eprSemTp: ""
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

  useEffect(() => {
    if (open) {
      fetchBombeiros();
    }
  }, [open]);

  // Carregar dados do exercício para edição
  useEffect(() => {
    if (exercicioParaEdicao && open) {
      setData(exercicioParaEdicao.data || new Date().toISOString().split('T')[0]);
      setHora(exercicioParaEdicao.hora || new Date().toTimeString().slice(0, 5));
      setEquipe(exercicioParaEdicao.equipe || "Alfa");
      setChefeEquipe(exercicioParaEdicao.chefeEquipe || "");
      setObservacoes(exercicioParaEdicao.observacoes || "");
      
      
      // Se o exercício tem dados de bombeiros, carregá-los
      if (exercicioParaEdicao.bombeiros && exercicioParaEdicao.bombeiros.length > 0) {
        setBombeiros(exercicioParaEdicao.bombeiros);
      }
    } else if (open && !exercicioParaEdicao) {
      // Resetar formulário para novo exercício
      setData(new Date().toISOString().split('T')[0]);
      setHora(new Date().toTimeString().slice(0, 5));
      setEquipe("Alfa");
      setChefeEquipe("");
      setObservacoes(""); 
      setBombeiros([{
        nome: "",
        funcao: "",
        calcaBota: "",
        tpCompleto: "",
        eprTpCompleto: "",
        eprSemTp: ""
      }]);
    }
  }, [exercicioParaEdicao, open]);

  // Função para preencher automaticamente a função quando um bombeiro é selecionado
  const handleBombeiroSelect = (index: number, bombeiroId: string) => {
    const bombeiro = bombeirosCadastrados.find(b => b.id === bombeiroId);
    if (bombeiro) {
      const novosBombeiros = [...bombeiros];
      novosBombeiros[index].nome = bombeiro.nome;
      novosBombeiros[index].funcao = bombeiro.funcao;
      setBombeiros(novosBombeiros);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      const exercicio = {
        id: exercicioParaEdicao ? exercicioParaEdicao.id : Date.now(),
        identificacaoLocal,
        data,
        hora,
        equipe,
        bombeiros,
        observacoes,
        chefeEquipe,
        tipo: "EPI/EPR",
        status: "Concluído"
      };

      onSave(exercicio);
      
      toast({
        title: exercicioParaEdicao ? "Exercício atualizado" : "Exercício criado",
        description: exercicioParaEdicao ? "Exercício de EPI/EPR foi atualizado com sucesso." : "Exercício de EPI/EPR foi criado com sucesso.",
      });
      
      onOpenChange(false);
    } catch (error) {
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
                value={identificacaoLocal}
                onChange={(e) => setIdentificacaoLocal(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="hora">Hora</Label>
                <Input
                  id="hora"
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Equipe */}
          <div>
            <Label htmlFor="equipe">Equipe</Label>
            <Input
              id="equipe"
              value={equipe}
              onChange={(e) => setEquipe(e.target.value)}
              placeholder="Ex: Alfa, Bravo, Charlie..."
            />
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
                      <tr key={index}>
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
                                <SelectItem key={bombeiroCadastrado.id} value={bombeiroCadastrado.id}>
                                  {bombeiroCadastrado.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiro.funcao}
                            onChange={(e) => atualizarBombeiro(index, 'funcao', e.target.value)}
                            className="border-0 h-8"
                            placeholder="Função"
                          />
                        </td>
                        {/* Calça + Bota */}
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiro.calcaBota}
                            onChange={(e) => atualizarBombeiro(index, 'calcaBota', e.target.value)}
                            className="border-0 h-8 text-center"
                            placeholder="00:00"
                          />
                        </td>
                        {/* TP Completo */}
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiro.tpCompleto}
                            onChange={(e) => atualizarBombeiro(index, 'tpCompleto', e.target.value)}
                            className="border-0 h-8 text-center"
                            placeholder="00:00"
                          />
                        </td>
                        {/* EPR + TP Completo */}
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiro.eprTpCompleto}
                            onChange={(e) => atualizarBombeiro(index, 'eprTpCompleto', e.target.value)}
                            className="border-0 h-8 text-center"
                            placeholder="00:00"
                          />
                        </td>
                        {/* EPR sem TP */}
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiro.eprSemTp}
                            onChange={(e) => atualizarBombeiro(index, 'eprSemTp', e.target.value)}
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
              value={observacoes}
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
                value={chefeEquipe}
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