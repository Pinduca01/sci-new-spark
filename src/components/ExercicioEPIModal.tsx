import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BombeiroTempo {
  nome: string;
  funcao: string;
  calcaBota1: string;
  calcaBota2: string;
  calcaBota3: string;
  calcaBota4: string;
  tpCompleto1: string;
  tpCompleto2: string;
  tpCompleto3: string;
  tpCompleto4: string;
  eprTpCompleto1: string;
  eprTpCompleto2: string;
  eprTpCompleto3: string;
  eprTpCompleto4: string;
  eprSemTp1: string;
  eprSemTp2: string;
  eprSemTp3: string;
  eprSemTp4: string;
}

interface ExercicioEPIModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (exercicio: any) => void;
}

const ExercicioEPIModal = ({ open, onOpenChange, onSave }: ExercicioEPIModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [identificacaoLocal, setIdentificacaoLocal] = useState("AEROPORTO INTERNACIONAL SANTA GENOVEVA - GYN");
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState(new Date().toTimeString().slice(0, 5));
  const [equipe, setEquipe] = useState("Alfa");
  const [observacoes, setObservacoes] = useState("");
  const [chefeEquipe, setChefeEquipe] = useState("");
  const [gerenteSCI, setGerenteSCI] = useState("");
  
  const [bombeiros, setBombeiros] = useState<BombeiroTempo[]>([
    {
      nome: "",
      funcao: "",
      calcaBota1: "", calcaBota2: "", calcaBota3: "", calcaBota4: "",
      tpCompleto1: "", tpCompleto2: "", tpCompleto3: "", tpCompleto4: "",
      eprTpCompleto1: "", eprTpCompleto2: "", eprTpCompleto3: "", eprTpCompleto4: "",
      eprSemTp1: "", eprSemTp2: "", eprSemTp3: "", eprSemTp4: ""
    }
  ]);

  const adicionarBombeiro = () => {
    setBombeiros([...bombeiros, {
      nome: "",
      funcao: "",
      calcaBota1: "", calcaBota2: "", calcaBota3: "", calcaBota4: "",
      tpCompleto1: "", tpCompleto2: "", tpCompleto3: "", tpCompleto4: "",
      eprTpCompleto1: "", eprTpCompleto2: "", eprTpCompleto3: "", eprTpCompleto4: "",
      eprSemTp1: "", eprSemTp2: "", eprSemTp3: "", eprSemTp4: ""
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

  const handleSave = async () => {
    setLoading(true);
    
    try {
      const exercicio = {
        id: Date.now(),
        identificacaoLocal,
        data,
        hora,
        equipe,
        bombeiros,
        observacoes,
        chefeEquipe,
        gerenteSCI,
        tipo: "EPI/EPR",
        status: "Concluído"
      };

      onSave(exercicio);
      
      toast({
        title: "Exercício criado",
        description: "Exercício de EPI/EPR foi criado com sucesso.",
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar exercício.",
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
          <DialogTitle>Novo Exercício de EPI/EPR</DialogTitle>
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
                      <th className="border border-gray-300 p-2 text-center" colSpan={4}>
                        Calça + Bota
                      </th>
                      <th className="border border-gray-300 p-2 text-center" colSpan={4}>
                        TP Completo
                      </th>
                      <th className="border border-gray-300 p-2 text-center" colSpan={4}>
                        EPR + TP Completo
                      </th>
                      <th className="border border-gray-300 p-2 text-center" colSpan={4}>
                        EPR sem TP
                      </th>
                      <th className="border border-gray-300 p-2">Ações</th>
                    </tr>
                    <tr className="bg-muted/50">
                      <th className="border border-gray-300 p-1"></th>
                      <th className="border border-gray-300 p-1"></th>
                      <th className="border border-gray-300 p-1 text-xs">1º</th>
                      <th className="border border-gray-300 p-1 text-xs">2º</th>
                      <th className="border border-gray-300 p-1 text-xs">3º</th>
                      <th className="border border-gray-300 p-1 text-xs">4º</th>
                      <th className="border border-gray-300 p-1 text-xs">1º</th>
                      <th className="border border-gray-300 p-1 text-xs">2º</th>
                      <th className="border border-gray-300 p-1 text-xs">3º</th>
                      <th className="border border-gray-300 p-1 text-xs">4º</th>
                      <th className="border border-gray-300 p-1 text-xs">1º</th>
                      <th className="border border-gray-300 p-1 text-xs">2º</th>
                      <th className="border border-gray-300 p-1 text-xs">3º</th>
                      <th className="border border-gray-300 p-1 text-xs">4º</th>
                      <th className="border border-gray-300 p-1 text-xs">1º</th>
                      <th className="border border-gray-300 p-1 text-xs">2º</th>
                      <th className="border border-gray-300 p-1 text-xs">3º</th>
                      <th className="border border-gray-300 p-1 text-xs">4º</th>
                      <th className="border border-gray-300 p-1"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {bombeiros.map((bombeiro, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiro.nome}
                            onChange={(e) => atualizarBombeiro(index, 'nome', e.target.value)}
                            className="border-0 h-8"
                            placeholder="Nome do bombeiro"
                          />
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
                            value={bombeiro.calcaBota1}
                            onChange={(e) => atualizarBombeiro(index, 'calcaBota1', e.target.value)}
                            className="border-0 h-8 text-center"
                            placeholder="00:00"
                          />
                        </td>
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiro.calcaBota2}
                            onChange={(e) => atualizarBombeiro(index, 'calcaBota2', e.target.value)}
                            className="border-0 h-8 text-center"
                            placeholder="00:00"
                          />
                        </td>
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiro.calcaBota3}
                            onChange={(e) => atualizarBombeiro(index, 'calcaBota3', e.target.value)}
                            className="border-0 h-8 text-center"
                            placeholder="00:00"
                          />
                        </td>
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiro.calcaBota4}
                            onChange={(e) => atualizarBombeiro(index, 'calcaBota4', e.target.value)}
                            className="border-0 h-8 text-center"
                            placeholder="00:00"
                          />
                        </td>
                        {/* TP Completo */}
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiro.tpCompleto1}
                            onChange={(e) => atualizarBombeiro(index, 'tpCompleto1', e.target.value)}
                            className="border-0 h-8 text-center"
                            placeholder="00:00"
                          />
                        </td>
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiro.tpCompleto2}
                            onChange={(e) => atualizarBombeiro(index, 'tpCompleto2', e.target.value)}
                            className="border-0 h-8 text-center"
                            placeholder="00:00"
                          />
                        </td>
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiro.tpCompleto3}
                            onChange={(e) => atualizarBombeiro(index, 'tpCompleto3', e.target.value)}
                            className="border-0 h-8 text-center"
                            placeholder="00:00"
                          />
                        </td>
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiro.tpCompleto4}
                            onChange={(e) => atualizarBombeiro(index, 'tpCompleto4', e.target.value)}
                            className="border-0 h-8 text-center"
                            placeholder="00:00"
                          />
                        </td>
                        {/* EPR + TP Completo */}
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiro.eprTpCompleto1}
                            onChange={(e) => atualizarBombeiro(index, 'eprTpCompleto1', e.target.value)}
                            className="border-0 h-8 text-center"
                            placeholder="00:00"
                          />
                        </td>
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiro.eprTpCompleto2}
                            onChange={(e) => atualizarBombeiro(index, 'eprTpCompleto2', e.target.value)}
                            className="border-0 h-8 text-center"
                            placeholder="00:00"
                          />
                        </td>
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiro.eprTpCompleto3}
                            onChange={(e) => atualizarBombeiro(index, 'eprTpCompleto3', e.target.value)}
                            className="border-0 h-8 text-center"
                            placeholder="00:00"
                          />
                        </td>
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiro.eprTpCompleto4}
                            onChange={(e) => atualizarBombeiro(index, 'eprTpCompleto4', e.target.value)}
                            className="border-0 h-8 text-center"
                            placeholder="00:00"
                          />
                        </td>
                        {/* EPR sem TP */}
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiro.eprSemTp1}
                            onChange={(e) => atualizarBombeiro(index, 'eprSemTp1', e.target.value)}
                            className="border-0 h-8 text-center"
                            placeholder="00:00"
                          />
                        </td>
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiro.eprSemTp2}
                            onChange={(e) => atualizarBombeiro(index, 'eprSemTp2', e.target.value)}
                            className="border-0 h-8 text-center"
                            placeholder="00:00"
                          />
                        </td>
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiro.eprSemTp3}
                            onChange={(e) => atualizarBombeiro(index, 'eprSemTp3', e.target.value)}
                            className="border-0 h-8 text-center"
                            placeholder="00:00"
                          />
                        </td>
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiro.eprSemTp4}
                            onChange={(e) => atualizarBombeiro(index, 'eprSemTp4', e.target.value)}
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
            <div>
              <Label htmlFor="gerenteSCI">Gerente SCI</Label>
              <Input
                id="gerenteSCI"
                value={gerenteSCI}
                onChange={(e) => setGerenteSCI(e.target.value)}
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