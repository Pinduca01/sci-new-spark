import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, MapPin, Users, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EquipeMembro {
  id: string;
  nome: string;
}

interface ViaturaPosicionamento {
  id: string;
  viatura: string;
  motorista: string;
  equipagem: EquipeMembro[];
  tempo: string;
  conceito: string;
  performance: string;
  chefeEquipe: string;
}

interface FormularioPosicionamento {
  id?: string;
  aeroporto: string;
  dataExercicio: string;
  hora: string;
  equipe: string;
  local: string;
  viaturas: ViaturaPosicionamento[];
  observacoes: string;
  resumoExercicio: string;
  consideracoesFinais: string;
  createdAt?: string;
}

interface ExercicioPosicionamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formularioParaEdicao?: FormularioPosicionamento;
  onSave: (formulario: FormularioPosicionamento) => void;
}

const aeroportosDisponiveis = [
  'SBGO - Aeroporto Internacional Santa Genoveva',
  'SBBR - Aeroporto Internacional de Brasília',
  'SBGR - Aeroporto Internacional de Guarulhos',
  'SBSP - Aeroporto de Congonhas'
];

const equipesDisponiveis = ['Alfa', 'Bravo', 'Charlie', 'Delta'];

const viaturasDisponiveis = ['CCI 01', 'CCI 02', 'CRS', 'ABT 01', 'ABT 02'];

const motoristasDisponiveis = [
  'Lopes',
  'Matheus Gomes', 
  'Thiago Monteiro',
  'Silva',
  'Santos',
  'Costa'
];

const equipagemDisponivel = [
  'BA-CE Leonardo',
  'BA-2 Neres',
  'BA-2 Assunção',
  'BA-2 Junqueira',
  'BA-LR Rogerio Alves',
  'BA-RE Camila',
  'BA-RE Carmen',
  'BA-1 Silva',
  'BA-1 Santos'
];

const chefesEquipeDisponiveis = [
  'Sgt. Santos',
  'Cb. Silva',
  '3º Sgt. Costa',
  'Sgt. Oliveira',
  'Cb. Ferreira'
];

const conceitosDisponiveis = ['A', 'B', 'C'];

const performanceDisponiveis = ['Satisfatório', 'Regular', 'Irregular'];

export const ExercicioPosicionamentoModal: React.FC<ExercicioPosicionamentoModalProps> = ({
  open,
  onOpenChange,
  formularioParaEdicao,
  onSave
}) => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<FormularioPosicionamento>({
    aeroporto: '',
    dataExercicio: '',
    hora: '',
    equipe: '',
    local: '',
    viaturas: [],
    observacoes: '',
    resumoExercicio: '',
    consideracoesFinais: ''
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
        consideracoesFinais: ''
      });
    }
  }, [formularioParaEdicao, open]);

  const adicionarViatura = () => {
    const novaViatura: ViaturaPosicionamento = {
      id: Date.now().toString(),
      viatura: '',
      motorista: '',
      equipagem: [],
      tempo: '',
      conceito: '',
      performance: '',
      chefeEquipe: ''
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

  const atualizarViatura = (id: string, campo: keyof ViaturaPosicionamento, valor: any) => {
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

  const formatarTempo = (tempo: string) => {
    // Remove caracteres não numéricos
    const numeros = tempo.replace(/\D/g, '');
    
    if (numeros.length <= 2) {
      return numeros + 'min';
    } else if (numeros.length <= 4) {
      const minutos = numeros.slice(0, 2);
      const segundos = numeros.slice(2);
      return minutos + 'min' + segundos + 'seg';
    } else {
      const minutos = numeros.slice(0, 2);
      const segundos = numeros.slice(2, 4);
      return minutos + 'min' + segundos + 'seg';
    }
  };

  const handleTempoChange = (viaturaId: string, valor: string) => {
    const tempoFormatado = formatarTempo(valor);
    atualizarViatura(viaturaId, 'tempo', tempoFormatado);
  };

  const handleSave = () => {
    // Validação básica
    if (!formData.aeroporto || !formData.dataExercicio || !formData.hora || !formData.equipe || !formData.local) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
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
      title: "Sucesso",
      description: `Formulário ${formularioParaEdicao ? 'atualizado' : 'criado'} com sucesso!`
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Novo Formulário de exercício de Posicionamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Primeira Parte - Identificação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Identificação do Exercício
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aeroporto">Identificação do Aeroporto *</Label>
                <Select
                  value={formData.aeroporto}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, aeroporto: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o aeroporto" />
                  </SelectTrigger>
                  <SelectContent>
                    {aeroportosDisponiveis.map((aeroporto) => (
                      <SelectItem key={aeroporto} value={aeroporto}>{aeroporto}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataExercicio">Data *</Label>
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
                <Select
                  value={formData.equipe}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, equipe: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a equipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipesDisponiveis.map((equipe) => (
                      <SelectItem key={equipe} value={equipe}>{equipe}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="local">Local *</Label>
                <Input
                  id="local"
                  value={formData.local}
                  onChange={(e) => setFormData(prev => ({ ...prev, local: e.target.value }))}
                  placeholder="Ex: Pista 14/32, Terminal de Passageiros"
                />
              </div>
            </CardContent>
          </Card>

          {/* Segunda Parte - Viaturas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Viaturas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                type="button" 
                onClick={adicionarViatura}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar Viatura
              </Button>
              
              {formData.viaturas.map((viatura) => (
                <Card key={viatura.id} className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-semibold">Viatura {formData.viaturas.indexOf(viatura) + 1}</h4>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removerViatura(viatura.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Viatura</Label>
                        <Select
                          value={viatura.viatura}
                          onValueChange={(value) => atualizarViatura(viatura.id, 'viatura', value)}
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
                        <Label>Motorista</Label>
                        <Select
                          value={viatura.motorista}
                          onValueChange={(value) => atualizarViatura(viatura.id, 'motorista', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {motoristasDisponiveis.map((m) => (
                              <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Chefe de Equipe</Label>
                        <Select
                          value={viatura.chefeEquipe}
                          onValueChange={(value) => atualizarViatura(viatura.id, 'chefeEquipe', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {chefesEquipeDisponiveis.map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Tempo (00min00seg)</Label>
                        <Input
                          value={viatura.tempo}
                          onChange={(e) => handleTempoChange(viatura.id, e.target.value)}
                          placeholder="00min00seg"
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
                    
                    {/* Equipagem */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Equipagem</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => adicionarMembroEquipagem(viatura.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Adicionar
                        </Button>
                      </div>
                      
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
                              {equipagemDisponivel.map((e) => (
                                <SelectItem key={e} value={e}>{e}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removerMembroEquipagem(viatura.id, membro.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Terceira Parte - Campos Adicionais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Informações Adicionais
              </CardTitle>
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
        </div>

        {/* Rodapé */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExercicioPosicionamentoModal;