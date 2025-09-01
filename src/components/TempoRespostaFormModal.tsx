import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Clock, FileText, CheckSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

interface EquipeMembro {
  id: string;
  nome: string;
}

interface ViaturaTempo {
  id: string;
  viaturaCCI: string;
  bamc: string;
  equipagem: EquipeMembro[];
  tempo: string;
  conceito: string;
  performance: string;
}

interface ChecklistItem {
  id: string;
  item: string;
  observacao: string;
  assinatura?: string;
}

interface FormularioTempoResposta {
  id?: string;
  aeroporto: string;
  dataExercicio: string;
  hora: string;
  equipe: string;
  local: string;
  viaturas: ViaturaTempo[];
  observacoes: string;
  resumoExercicio: string;
  consideracoesFinais: string;
  checklist: ChecklistItem[];
  createdAt?: string;
}

interface TempoRespostaFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formularioParaEdicao?: FormularioTempoResposta;
  onSave: (formulario: FormularioTempoResposta) => void;
}

const viaturasDisponiveis = ['CCI 01', 'CCI 02', 'CRS'];

const bamcDisponiveis = ['Lopes', 'Matheus Gomes', 'Thiago Monteiro'];

const equipagemDisponivel = [
  'BA-CE Leonardo',
  'BA-2 Neres',
  'BA-2 Assunção',
  'BA-2 Junqueira',
  'BA-LR Rogerio Alves',
  'BA-RE Camila',
  'BA-RE Carmen'
];

const conceitosDisponiveis = ['A', 'B', 'C'];

const performanceDisponiveis = ['Satisfatório', 'Regular', 'Irregular'];

const checklistPadrao: ChecklistItem[] = [
  { id: '1', item: 'Coordenação SCI/TWR', observacao: 'Realizada entre SCI e TWR' },
  { id: '2', item: 'Acionamento', observacao: 'Acionado pela TWR' },
  { id: '3', item: 'Sistema de Alarmes', observacao: 'Sonoro sendo confirmado via rádio (GYN-CRT-SOLO), exercício tempo resposta' },
  { id: '4', item: 'Comunicação / Fraseologia', observacao: 'Dentro do Padrão' },
  { id: '5', item: 'Deslocamento VTR\'s', observacao: 'Início somente após recebimento das informações necessárias' },
  { id: '6', item: 'Visibilidade e Superfície', observacao: 'Excelentes condições de visibilidade' },
  { id: '7', item: 'Procedimentos PCINC', observacao: 'Realizados conforme orientações do Plano Contra Incêndio' },
  { id: '8', item: 'Tempo Resposta', observacao: 'Performance Satisfatória' },
  { id: '9', item: 'Feedback SPE', observacao: 'Realizado com sucesso' },
  { id: '10', item: 'Feedback TWR', observacao: 'Realizado com sucesso' },
  { id: '11', item: 'Feedback SCI', observacao: 'Realizado com sucesso' },
  { id: '12', item: 'BA-CE', observacao: '', assinatura: '' },
  { id: '13', item: 'GS / EMBAIXADOR', observacao: '', assinatura: '' }
];

export const TempoRespostaFormModal: React.FC<TempoRespostaFormModalProps> = ({
  open,
  onOpenChange,
  formularioParaEdicao,
  onSave
}) => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<FormularioTempoResposta>({
    aeroporto: '',
    dataExercicio: '',
    hora: '',
    equipe: '',
    local: '',
    viaturas: [],
    observacoes: '',
    resumoExercicio: '',
    consideracoesFinais: '',
    checklist: checklistPadrao
  });

  useEffect(() => {
    if (formularioParaEdicao) {
      setFormData(formularioParaEdicao);
    } else {
      setFormData({
        aeroporto: '',
        dataExercicio: '',
        hora: '',
        equipe: '',
        local: 'Santa Genoveva - GYN', // Valor padrão temporário
        viaturas: [],
        observacoes: '',
        resumoExercicio: '',
        consideracoesFinais: '',
        checklist: checklistPadrao
      });
    }
  }, [formularioParaEdicao, open]);

  const adicionarViatura = () => {
    const novaViatura: ViaturaTempo = {
      id: Date.now().toString(),
      viaturaCCI: '',
      bamc: '',
      equipagem: [],
      tempo: '',
      conceito: '',
      performance: ''
    };
    setFormData(prev => ({
      ...prev,
      viaturas: [...prev.viaturas, novaViatura]
    }));
  };

  const removerViatura = (id: string) => {
    setFormData(prev => ({
      ...prev,
      viaturas: prev.viaturas.filter(v => v.id !== id)
    }));
  };

  const atualizarViatura = (id: string, campo: keyof ViaturaTempo, valor: any) => {
    setFormData(prev => ({
      ...prev,
      viaturas: prev.viaturas.map(v => 
        v.id === id ? { ...v, [campo]: valor } : v
      )
    }));
  };

  const adicionarMembroEquipagem = (viaturaId: string) => {
    const novoMembro: EquipeMembro = {
      id: Date.now().toString(),
      nome: ''
    };
    
    setFormData(prev => ({
      ...prev,
      viaturas: prev.viaturas.map(v => 
        v.id === viaturaId 
          ? { ...v, equipagem: [...v.equipagem, novoMembro] }
          : v
      )
    }));
  };

  const removerMembroEquipagem = (viaturaId: string, membroId: string) => {
    setFormData(prev => ({
      ...prev,
      viaturas: prev.viaturas.map(v => 
        v.id === viaturaId 
          ? { ...v, equipagem: v.equipagem.filter(m => m.id !== membroId) }
          : v
      )
    }));
  };

  const atualizarMembroEquipagem = (viaturaId: string, membroId: string, nome: string) => {
    setFormData(prev => ({
      ...prev,
      viaturas: prev.viaturas.map(v => 
        v.id === viaturaId 
          ? { 
              ...v, 
              equipagem: v.equipagem.map(m => 
                m.id === membroId ? { ...m, nome } : m
              )
            }
          : v
      )
    }));
  };

  const atualizarChecklist = (id: string, campo: 'observacao' | 'assinatura', valor: string) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.map(item => 
        item.id === id ? { ...item, [campo]: valor } : item
      )
    }));
  };

  const handleSave = () => {
    // Validação básica
    if (!formData.aeroporto || !formData.dataExercicio || !formData.hora || !formData.equipe || !formData.local) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos de identificação.",
        variant: "destructive"
      });
      return;
    }

    if (formData.viaturas.length === 0) {
      toast({
        title: "Viaturas necessárias",
        description: "Adicione pelo menos uma viatura ao formulário.",
        variant: "destructive"
      });
      return;
    }

    const formularioCompleto = {
      ...formData,
      id: formularioParaEdicao?.id || Date.now().toString(),
      createdAt: formularioParaEdicao?.createdAt || new Date().toISOString()
    };

    onSave(formularioCompleto);
    onOpenChange(false);
    
    toast({
      title: "Formulário salvo",
      description: "O formulário de tempo resposta foi salvo com sucesso."
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {formularioParaEdicao ? "Editar" : "Novo"} Formulário de Aferição de Tempo Resposta
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Primeira Parte - Identificação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Identificação do Exercício
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aeroporto">Identificação do Aeroporto *</Label>
                <Input
                  id="aeroporto"
                  value={formData.aeroporto}
                  onChange={(e) => setFormData(prev => ({ ...prev, aeroporto: e.target.value }))}
                  placeholder="Ex: SBGO - Aeroporto de Goiânia"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataExercicio">Data do Exercício *</Label>
                <Input
                  id="dataExercicio"
                  type="date"
                  value={formData.dataExercicio}
                  onChange={(e) => setFormData(prev => ({ ...prev, dataExercicio: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hora">Hora *</Label>
                <Input
                  id="hora"
                  type="time"
                  value={formData.hora}
                  onChange={(e) => setFormData(prev => ({ ...prev, hora: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipe">Equipe *</Label>
                <Input
                  id="equipe"
                  value={formData.equipe}
                  onChange={(e) => setFormData(prev => ({ ...prev, equipe: e.target.value }))}
                  placeholder="Ex: Alfa"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="local">Local *</Label>
                <Input
                  id="local"
                  value={formData.local}
                  onChange={(e) => setFormData(prev => ({ ...prev, local: e.target.value }))}
                  placeholder="Ex: Pista 14/32 - Posição A1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Segunda Parte - Tabela de Viaturas */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Viaturas e Tempos</CardTitle>
                <Button onClick={adicionarViatura} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Viatura
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {formData.viaturas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma viatura adicionada ainda.</p>
                  <p className="text-sm">Clique em "Adicionar Viatura" para começar.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {formData.viaturas.map((viatura, index) => (
                    <Card key={viatura.id} className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            Viatura {index + 1} - {viatura.viaturaCCI || "Não definida"}
                          </CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removerViatura(viatura.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label>Viatura CCI</Label>
                            <Select
                              value={viatura.viaturaCCI}
                              onValueChange={(value) => atualizarViatura(viatura.id, 'viaturaCCI', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {viaturasDisponiveis.map((v) => (
                                  <SelectItem key={v} value={v}>{v}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>BA-MC</Label>
                            <Select
                              value={viatura.bamc}
                              onValueChange={(value) => atualizarViatura(viatura.id, 'bamc', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {bamcDisponiveis.map((b) => (
                                  <SelectItem key={b} value={b}>{b}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Assinatura BA-MC</Label>
                            <Input
                              value={viatura.bamc}
                              onChange={(e) => atualizarViatura(viatura.id, 'bamc', e.target.value)}
                              placeholder="Assinatura"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Assinatura Equipagem</Label>
                            <Input
                              value={viatura.equipagem.map(m => m.nome).join(', ')}
                              disabled={true} // Disabled since equipagem signatures are handled individually
                              placeholder="Assinatura"
                            />
                          </div>
                        </div>

                        {/* Equipagem */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Equipagem</Label>
                            <Button
                              type="button"
                              onClick={() => adicionarMembroEquipagem(viatura.id)}
                              size="sm"
                              variant="outline"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Adicionar Membro
                            </Button>
                          </div>
                          
                          {viatura.equipagem.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              Nenhum membro da equipagem adicionado.
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {viatura.equipagem.map((membro) => (
                                <div key={membro.id} className="flex items-center gap-2">
                                  <Select
                                    value={membro.nome}
                                    onValueChange={(value) => atualizarMembroEquipagem(viatura.id, membro.id, value)}
                                  >
                                    <SelectTrigger className="flex-1">
                                      <SelectValue placeholder="Selecione membro" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {equipagemDisponivel.map((eq) => (
                                        <SelectItem key={eq} value={eq}>{eq}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removerMembroEquipagem(viatura.id, membro.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Tempo, Conceito e Performance */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Tempo</Label>
                            <Input
                              value={viatura.tempo}
                              onChange={(e) => atualizarViatura(viatura.id, 'tempo', e.target.value)}
                              placeholder="Ex: 02min08seg"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Conceito</Label>
                            <Select
                              value={viatura.conceito}
                              onValueChange={(value) => atualizarViatura(viatura.id, 'conceito', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {conceitosDisponiveis.map((c) => (
                                  <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Performance</Label>
                            <Select
                              value={viatura.performance}
                              onValueChange={(value) => atualizarViatura(viatura.id, 'performance', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {performanceDisponiveis.map((p) => (
                                  <SelectItem key={p} value={p}>{p}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Terceira Parte - Campos de Texto */}
          <Card>
            <CardHeader>
              <CardTitle>Observações e Considerações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Observações gerais sobre o exercício..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resumoExercicio">Resumo do Exercício</Label>
                <Textarea
                  id="resumoExercicio"
                  value={formData.resumoExercicio}
                  onChange={(e) => setFormData(prev => ({ ...prev, resumoExercicio: e.target.value }))}
                  placeholder="Resumo detalhado do exercício realizado..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="consideracoesFinais">Considerações Finais</Label>
                <Textarea
                  id="consideracoesFinais"
                  value={formData.consideracoesFinais}
                  onChange={(e) => setFormData(prev => ({ ...prev, consideracoesFinais: e.target.value }))}
                  placeholder="Considerações finais e recomendações..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quarta Parte - Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Checklist de Observações / Considerações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.checklist.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox checked={true} className="mt-1" />
                      <div className="flex-1 space-y-2">
                        <div className="font-medium">{item.item}</div>
                        {item.observacao && (
                          <div className="text-sm text-muted-foreground">{item.observacao}</div>
                        )}
                        {(item.id === '12' || item.id === '13') && (
                          <div className="space-y-2">
                            <Label>Assinatura</Label>
                            <Input
                              value={item.assinatura || ''}
                              onChange={(e) => atualizarChecklist(item.id, 'assinatura', e.target.value)}
                              placeholder="Assinatura"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {formularioParaEdicao ? "Atualizar" : "Salvar"} Formulário
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TempoRespostaFormModal;