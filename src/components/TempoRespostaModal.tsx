import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ViaturaDados {
  id: string;
  viatura: string;
  bamc: string;
  assinaturaBamc: string;
  equipagem: string[];
  assinaturaEquipagem: string;
  tempo: string;
  conceito: string;
  performance: string;
}

interface FormularioTempoResposta {
  id?: string;
  identificacaoAeroporto: string;
  data: string;
  hora: string;
  equipe: string;
  local: string;
  viaturas: ViaturaDados[];
  observacoes: string;
  resumoExercicio: string;
  consideracoesFinais: string;
  checklist: { [key: string]: string };
  criadoEm: string;
}

interface TempoRespostaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (formulario: FormularioTempoResposta) => void;
  formularioParaEdicao?: FormularioTempoResposta;
}

const TempoRespostaModal = ({ open, onOpenChange, onSave, formularioParaEdicao }: TempoRespostaModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Dados do formulário
  const [identificacaoAeroporto, setIdentificacaoAeroporto] = useState("AEROPORTO INTERNACIONAL SANTA GENOVEVA-GYN");
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState(new Date().toTimeString().slice(0, 5));
  const [equipe, setEquipe] = useState("EQUIPE CHARLIE");
  const [local, setLocal] = useState("CABECEIRA 32");
  const [observacoes, setObservacoes] = useState("");
  const [resumoExercicio, setResumoExercicio] = useState("");
  const [consideracoesFinais, setConsideracoesFinais] = useState("Sem alterações.");

  // Dados das viaturas
  const [viaturas, setViaturas] = useState<ViaturaDados[]>([
    {
      id: '1',
      viatura: '',
      bamc: '',
      assinaturaBamc: '',
      equipagem: [],
      assinaturaEquipagem: '',
      tempo: '',
      conceito: '',
      performance: ''
    }
  ]);

  // Opções para os selects
  const viaturasDisponiveis = ['CCI 01', 'CCI 02', 'CRS'];
  const bamcDisponiveis = ['Lopes', 'Matheus Gomes', 'Thiago Monteiro'];
  const equipagensDisponiveis = [
    'BA-CE Leonardo BA-2 Neres',
    'BA-2 Assunção BA-2 Junqueira', 
    'BA-LR Rogerio Alves BA-RE Camila BA-RE Carmen'
  ];
  const conceitosDisponiveis = ['A', 'B', 'C'];
  const performancesDisponiveis = ['Satisfatório', 'Regular', 'Irregular'];

  // Checklist fixo
  const checklistPadrao = {
    'Coordenação SCI/TWR': 'Realizada entre SCI e TWR',
    'Acionamento': 'Acionado pela TWR',
    'Sistema de Alarmes': 'Sonoro sendo confirmado via rádio (GYN-CRT-SOLO), exercício tempo resposta',
    'Comunicação / Fraseologia': 'Dentro do Padrão',
    'Deslocamento VTR\'s': 'Início somente após recebimento das informações necessárias',
    'Visibilidade e Superfície': 'Excelentes condições de visibilidade',
    'Procedimentos PCINC': 'Realizados conforme orientações do Plano Contra Incêndio',
    'Tempo Resposta': 'Performance Satisfatória',
    'Feedback SPE': 'Realizado com sucesso',
    'Feedback TWR': 'Realizado com sucesso',
    'Feedback SCI': 'Realizado com sucesso',
    'BA-CE': '',
    'GS / EMBAIXADOR': ''
  };

  // Função para migrar dados antigos (equipagem como string) para novo formato (array)
  const migrarDadosViatura = (viaturas: any[]): ViaturaDados[] => {
    return viaturas.map(viatura => ({
      ...viatura,
      equipagem: Array.isArray(viatura.equipagem) 
        ? viatura.equipagem 
        : viatura.equipagem 
          ? [viatura.equipagem] 
          : []
    }));
  };

  // Carregar dados para edição
  useEffect(() => {
    if (formularioParaEdicao && open) {
      setIdentificacaoAeroporto(formularioParaEdicao.identificacaoAeroporto);
      setData(formularioParaEdicao.data);
      setHora(formularioParaEdicao.hora);
      setEquipe(formularioParaEdicao.equipe);
      setLocal(formularioParaEdicao.local);
      setViaturas(migrarDadosViatura(formularioParaEdicao.viaturas));
      setObservacoes(formularioParaEdicao.observacoes);
      setResumoExercicio(formularioParaEdicao.resumoExercicio);
      setConsideracoesFinais(formularioParaEdicao.consideracoesFinais);
    } else if (open && !formularioParaEdicao) {
      // Reset para novo formulário
      setIdentificacaoAeroporto("AEROPORTO INTERNACIONAL SANTA GENOVEVA-GYN");
      setData(new Date().toISOString().split('T')[0]);
      setHora(new Date().toTimeString().slice(0, 5));
      setEquipe("EQUIPE CHARLIE");
      setLocal("CABECEIRA 32");
      setViaturas([{
        id: '1',
        viatura: '',
        bamc: '',
        assinaturaBamc: '',
        equipagem: [],
        assinaturaEquipagem: '',
        tempo: '',
        conceito: '',
        performance: ''
      }]);
      setObservacoes("");
      setResumoExercicio("");
      setConsideracoesFinais("Sem alterações.");
    }
  }, [formularioParaEdicao, open]);

  const adicionarViatura = () => {
    const novaViatura: ViaturaDados = {
      id: Date.now().toString(),
      viatura: '',
      bamc: '',
      assinaturaBamc: '',
      equipagem: [],
      assinaturaEquipagem: '',
      tempo: '',
      conceito: '',
      performance: ''
    };
    setViaturas([...viaturas, novaViatura]);
  };

  const removerViatura = (id: string) => {
    if (viaturas.length > 1) {
      setViaturas(viaturas.filter(v => v.id !== id));
    }
  };

  const atualizarViatura = (id: string, campo: keyof ViaturaDados, valor: string | string[]) => {
    setViaturas(viaturas.map(v => 
      v.id === id ? { ...v, [campo]: valor } : v
    ));
  };

  const adicionarIntegrante = (viaturaId: string, integrante: string) => {
    if (!integrante.trim()) return;
    
    setViaturas(viaturas.map(v => 
      v.id === viaturaId ? { 
        ...v, 
        equipagem: [...v.equipagem, integrante.trim()]
      } : v
    ));
  };

  const removerIntegrante = (viaturaId: string, index: number) => {
    setViaturas(viaturas.map(v => 
      v.id === viaturaId ? { 
        ...v, 
        equipagem: v.equipagem.filter((_, i) => i !== index)
      } : v
    ));
  };

  const validarFormulario = () => {
    if (!identificacaoAeroporto.trim()) {
      toast({ title: "Erro", description: "Identificação do aeroporto é obrigatória", variant: "destructive" });
      return false;
    }
    if (!data) {
      toast({ title: "Erro", description: "Data é obrigatória", variant: "destructive" });
      return false;
    }
    if (!hora) {
      toast({ title: "Erro", description: "Hora é obrigatória", variant: "destructive" });
      return false;
    }
    if (!equipe.trim()) {
      toast({ title: "Erro", description: "Equipe é obrigatória", variant: "destructive" });
      return false;
    }
    if (!local.trim()) {
      toast({ title: "Erro", description: "Local é obrigatório", variant: "destructive" });
      return false;
    }

    // Validar viaturas
    for (const viatura of viaturas) {
      if (!viatura.viatura) {
        toast({ title: "Erro", description: "Todas as viaturas devem ser selecionadas", variant: "destructive" });
        return false;
      }
      if (!viatura.bamc) {
        toast({ title: "Erro", description: "Todos os BA-MC devem ser selecionados", variant: "destructive" });
        return false;
      }
      if (!viatura.equipagem || viatura.equipagem.length === 0) {
        toast({ title: "Erro", description: "Todas as viaturas devem ter pelo menos um integrante na equipagem", variant: "destructive" });
        return false;
      }
      if (!viatura.tempo.trim()) {
        toast({ title: "Erro", description: "Todos os tempos devem ser preenchidos", variant: "destructive" });
        return false;
      }
      if (!viatura.conceito) {
        toast({ title: "Erro", description: "Todos os conceitos devem ser selecionados", variant: "destructive" });
        return false;
      }
      if (!viatura.performance) {
        toast({ title: "Erro", description: "Todas as performances devem ser selecionadas", variant: "destructive" });
        return false;
      }
    }

    return true;
  };

  const handleSalvar = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      const formulario: FormularioTempoResposta = {
        id: formularioParaEdicao?.id || Date.now().toString(),
        identificacaoAeroporto,
        data,
        hora,
        equipe,
        local,
        viaturas,
        observacoes,
        resumoExercicio,
        consideracoesFinais,
        checklist: checklistPadrao,
        criadoEm: formularioParaEdicao?.criadoEm || new Date().toISOString()
      };

      onSave(formulario);
      onOpenChange(false);
      
      toast({
        title: "Sucesso",
        description: "Formulário de tempo de resposta salvo com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar formulário",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-7xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            FORMULÁRIO PARA AFERIÇÃO DE TEMPO RESPOSTA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seção 1: Dados Básicos */}
          <Card>
            <CardHeader>
              <CardTitle>Identificação do Exercício</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aeroporto">Identificação do Aeroporto *</Label>
                  <Input
                    id="aeroporto"
                    value={identificacaoAeroporto}
                    onChange={(e) => setIdentificacaoAeroporto(e.target.value)}
                    placeholder="Nome do aeroporto"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="equipe">Equipe *</Label>
                  <Input
                    id="equipe"
                    value={equipe}
                    onChange={(e) => setEquipe(e.target.value)}
                    placeholder="Nome da equipe"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data">Data *</Label>
                  <Input
                    id="data"
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora">Hora *</Label>
                  <Input
                    id="hora"
                    type="time"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="local">Local *</Label>
                  <Input
                    id="local"
                    value={local}
                    onChange={(e) => setLocal(e.target.value)}
                    placeholder="Local do exercício"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção 2: Tabela de Viaturas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Dados das Viaturas</CardTitle>
              <Button onClick={adicionarViatura} size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Viatura
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Viatura CCI</TableHead>
                      <TableHead>BA-MC</TableHead>
                      <TableHead>Assinatura</TableHead>
                      <TableHead>Equipagem</TableHead>
                      <TableHead>Assinatura</TableHead>
                      <TableHead>Tempo</TableHead>
                      <TableHead>Conceito</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viaturas.map((viatura) => (
                      <TableRow key={viatura.id}>
                        <TableCell>
                          <Select
                            value={viatura.viatura}
                            onValueChange={(value) => atualizarViatura(viatura.id, 'viatura', value)}
                          >
                            <SelectTrigger className="w-20 min-w-[80px]">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {viaturasDisponiveis.map((v) => (
                                <SelectItem key={v} value={v}>{v}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={viatura.bamc}
                            onValueChange={(value) => atualizarViatura(viatura.id, 'bamc', value)}
                          >
                            <SelectTrigger className="w-28 min-w-[112px]">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {bamcDisponiveis.map((b) => (
                                <SelectItem key={b} value={b}>{b}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={viatura.assinaturaBamc}
                            onChange={(e) => atualizarViatura(viatura.id, 'assinaturaBamc', e.target.value)}
                            placeholder="Assinatura"
                            className="w-20 min-w-[80px]"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2 w-48 min-w-[192px]">
                            {/* Lista de integrantes */}
                            <div className="space-y-1">
                              {viatura.equipagem.map((integrante, index) => (
                                <div key={index} className="flex items-center gap-1 bg-gray-50 p-1 rounded text-xs">
                                  <span className="flex-1 truncate">{integrante}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 hover:bg-red-100"
                                    onClick={() => removerIntegrante(viatura.id, index)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                            {/* Campo para adicionar novo integrante */}
                            <div className="space-y-1">
                              <Select
                                onValueChange={(value) => {
                                  adicionarIntegrante(viatura.id, value);
                                }}
                              >
                                <SelectTrigger className="h-7 text-xs">
                                  <SelectValue placeholder="Selecionar da lista" />
                                </SelectTrigger>
                                <SelectContent>
                                  {equipagensDisponiveis.map((e) => (
                                    <SelectItem key={e} value={e}>{e}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="flex gap-1">
                                <Input
                                  placeholder="Ou digite um nome"
                                  className="flex-1 h-7 text-xs"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const input = e.target as HTMLInputElement;
                                      if (input.value.trim()) {
                                        adicionarIntegrante(viatura.id, input.value.trim());
                                        input.value = '';
                                      }
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2 text-xs"
                                  onClick={(e) => {
                                    const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                                    if (input && input.value.trim()) {
                                      adicionarIntegrante(viatura.id, input.value.trim());
                                      input.value = '';
                                    }
                                  }}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={viatura.assinaturaEquipagem}
                            onChange={(e) => atualizarViatura(viatura.id, 'assinaturaEquipagem', e.target.value)}
                            placeholder="Assinatura"
                            className="w-20 min-w-[80px]"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={viatura.tempo}
                            onChange={(e) => atualizarViatura(viatura.id, 'tempo', e.target.value)}
                            placeholder="02min08seg"
                            className="w-24 min-w-[96px]"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={viatura.conceito}
                            onValueChange={(value) => atualizarViatura(viatura.id, 'conceito', value)}
                          >
                            <SelectTrigger className="w-14 min-w-[56px]">
                              <SelectValue placeholder="-" />
                            </SelectTrigger>
                            <SelectContent>
                              {conceitosDisponiveis.map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={viatura.performance}
                            onValueChange={(value) => atualizarViatura(viatura.id, 'performance', value)}
                          >
                            <SelectTrigger className="w-28 min-w-[112px]">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {performancesDisponiveis.map((p) => (
                                <SelectItem key={p} value={p}>{p}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {viaturas.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removerViatura(viatura.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Seção 3: Campos de Texto */}
          <Card>
            <CardHeader>
              <CardTitle>Observações e Considerações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Observações sobre o exercício..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resumo">Resumo do Exercício</Label>
                <Textarea
                  id="resumo"
                  value={resumoExercicio}
                  onChange={(e) => setResumoExercicio(e.target.value)}
                  placeholder="Resumo detalhado do exercício realizado..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="consideracoes">Considerações Finais</Label>
                <Textarea
                  id="consideracoes"
                  value={consideracoesFinais}
                  onChange={(e) => setConsideracoesFinais(e.target.value)}
                  placeholder="Considerações finais sobre o exercício..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSalvar} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Salvando..." : "Salvar Formulário"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TempoRespostaModal;
export type { FormularioTempoResposta, ViaturaDados };