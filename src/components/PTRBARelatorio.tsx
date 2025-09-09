import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, X, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from './ImageUpload';
import { PTRTemasManager, TEMAS_PTR_PADRAO } from './PTRTemasManager';

// Função para calcular duração entre dois horários
const calcularDuracao = (inicio: string, fim: string): string => {
  const [horaInicio, minutoInicio] = inicio.split(':').map(Number);
  const [horaFim, minutoFim] = fim.split(':').map(Number);
  
  const inicioMinutos = horaInicio * 60 + minutoInicio;
  const fimMinutos = horaFim * 60 + minutoFim;
  
  const diferencaMinutos = fimMinutos - inicioMinutos;
  const horas = Math.floor(diferencaMinutos / 60);
  const minutos = diferencaMinutos % 60;
  
  if (horas === 0) {
    return `${minutos}min`;
  } else if (minutos === 0) {
    return `${horas}h`;
  } else {
    return `${horas}h ${minutos}min`;
  }
};

import { useEquipes } from '@/hooks/useEquipes';
import { useBombeiros } from '@/hooks/useBombeiros';
import { usePTRInstrucoes } from '@/hooks/usePTRInstrucoes';
import { usePTRParticipantes } from '@/hooks/usePTRParticipantes';
import { usePTRFotos } from '@/hooks/usePTRFotos';

interface PTRBARelatorioProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
}

interface PTRData {
  id: string;
  hora_inicio: string;
  hora_fim: string;
  tipo: string;
  instrutor_id: string;
  observacoes: string;
  fotos: string[];
}

interface FormData {
  data: string;
  equipe_id: string;
  participantes: string[];
  ptrs: PTRData[];
}

// Função para gerenciar temas PTR via localStorage
const carregarTemasPTR = (): string[] => {
  try {
    const temasSalvos = localStorage.getItem('ptr-temas-personalizados');
    return temasSalvos ? JSON.parse(temasSalvos) : TEMAS_PTR_PADRAO;
  } catch {
    return TEMAS_PTR_PADRAO;
  }
};

const salvarTemasPTR = (temas: string[]) => {
  try {
    localStorage.setItem('ptr-temas-personalizados', JSON.stringify(temas));
  } catch (error) {
    console.error('Erro ao salvar temas PTR:', error);
  }
};

export const PTRBARelatorio: React.FC<PTRBARelatorioProps> = ({
  open,
  onOpenChange,
  selectedDate,
}) => {
  const { toast } = useToast();
  const { data: equipes = [] } = useEquipes();
  const { bombeiros } = useBombeiros();
  const { criarInstrucao } = usePTRInstrucoes();
  const { adicionarParticipantes } = usePTRParticipantes();
  const { uploadFotoCompleto } = usePTRFotos();
  
  const [formData, setFormData] = useState<FormData>({
    data: selectedDate.toISOString().split('T')[0],
    equipe_id: '',
    participantes: [],
    ptrs: [{
      id: '1',
      hora_inicio: '08:00',
      hora_fim: '09:00',
      tipo: TEMAS_PTR_PADRAO[0],
      instrutor_id: '',
      observacoes: '',
      fotos: []
    }]
  });
  
  const [presencas, setPresencas] = useState<Record<string, boolean>>({});
  const [situacoesBa, setSituacoesBa] = useState<Record<string, 'P' | 'A' | 'EO'>>({});
  const [salvando, setSalvando] = useState(false);
  const [temasPTR, setTemasPTR] = useState<string[]>([]);
  const [showGerenciadorTemas, setShowGerenciadorTemas] = useState(false);

  // Bombeiros da equipe selecionada
  const bombeirosDaEquipe = bombeiros.filter(b => b.equipe_id === formData.equipe_id);
  
  // Bombeiros disponíveis para adicionar (não selecionados)
  const bombeirosDisponiveis = bombeiros.filter(b => 
    !formData.participantes.includes(b.id) && b.status === 'ativo'
  );

  // Participantes selecionados com dados completos
  const participantesSelecionados = formData.participantes
    .map(id => bombeiros.find(b => b.id === id))
    .filter(Boolean);

  // Carregar temas PTR na inicialização
  useEffect(() => {
    setTemasPTR(carregarTemasPTR());
  }, []);

  // Preencher participantes quando equipe é selecionada
  useEffect(() => {
    if (formData.equipe_id && bombeirosDaEquipe.length > 0) {
      const participantesIds = bombeirosDaEquipe.map(b => b.id);
      setFormData(prev => ({
        ...prev,
        participantes: participantesIds
      }));
      
      // Marcar todos como presentes por padrão
      const novasPresencas: Record<string, boolean> = {};
      const novasSituacoes: Record<string, 'P' | 'A' | 'EO'> = {};
      participantesIds.forEach(id => {
        novasPresencas[id] = true;
        novasSituacoes[id] = 'P';
      });
      setPresencas(novasPresencas);
      setSituacoesBa(novasSituacoes);
    }
  }, [formData.equipe_id, bombeirosDaEquipe]);

  // Adicionar participante individual
  const handleAdicionarParticipante = (bombeiroId: string) => {
    setFormData(prev => ({
      ...prev,
      participantes: [...prev.participantes, bombeiroId]
    }));
    
    // Marcar como presente por padrão
    setPresencas(prev => ({
      ...prev,
      [bombeiroId]: true
    }));
    
    // Definir situação padrão como presente
    setSituacoesBa(prev => ({
      ...prev,
      [bombeiroId]: 'P'
    }));
  };

  // Remover participante individual
  const handleRemoverParticipante = (bombeiroId: string) => {
    if (formData.participantes.length === 1) {
      toast({
        title: "Atenção",
        description: "É necessário ter pelo menos um participante.",
        variant: "destructive",
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      participantes: prev.participantes.filter(id => id !== bombeiroId)
    }));
    
    // Remover presença e situação do participante removido
    setPresencas(prev => {
      const novasPresencas = { ...prev };
      delete novasPresencas[bombeiroId];
      return novasPresencas;
    });
    
    setSituacoesBa(prev => {  
      const novasSituacoes = { ...prev };
      delete novasSituacoes[bombeiroId];
      return novasSituacoes;
    });
    
    // Remover da lista de presenças
    setPresencas(prev => {
      const novasPresencas = { ...prev };
      delete novasPresencas[bombeiroId];
      return novasPresencas;
    });
  };

  const handleAddPTR = () => {
    const novoPTR: PTRData = {
      id: Date.now().toString(),
      hora_inicio: '14:00',
      hora_fim: '15:00',
      tipo: temasPTR[0] || 'CONDUÇÃO DE VEÍCULOS DE EMERGÊNCIA NA ÁREA OPERACIONAL DO AERÓDROMO',
      instrutor_id: '',
      observacoes: '',
      fotos: []
    };
    
    setFormData(prev => ({
      ...prev,
      ptrs: [...prev.ptrs, novoPTR]
    }));
  };

  const handleRemovePTR = (ptrId: string) => {
    if (formData.ptrs.length === 1) {
      toast({
        title: "Atenção",
        description: "É necessário ter pelo menos um PTR no formulário.",
        variant: "destructive",
      });
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      ptrs: prev.ptrs.filter(ptr => ptr.id !== ptrId)
    }));
  };

  const handlePTRChange = (ptrId: string, field: keyof PTRData, value: string) => {
    setFormData(prev => ({
      ...prev,
      ptrs: prev.ptrs.map(ptr => 
        ptr.id === ptrId ? { ...ptr, [field]: value } : ptr
      )
    }));
  };

  const handlePhotosChange = (ptrId: string, fotos: string[]) => {
    setFormData(prev => ({
      ...prev,
      ptrs: prev.ptrs.map(ptr =>
        ptr.id === ptrId ? { ...ptr, fotos } : ptr
      )
    }));
  };

  const handlePresencaChange = (participanteId: string, presente: boolean) => {
    setPresencas(prev => ({
      ...prev,
      [participanteId]: presente
    }));
  };

  const handleSituacaoChange = (participanteId: string, situacao: 'P' | 'A' | 'EO') => {
    setSituacoesBa(prev => ({
      ...prev,
      [participanteId]: situacao
    }));
    
    // Automaticamente atualizar presença baseado na situação
    setPresencas(prev => ({
      ...prev,
      [participanteId]: situacao === 'P'
    }));
  };

  const handleTemasChange = (novosTemas: string[]) => {
    setTemasPTR(novosTemas);
    salvarTemasPTR(novosTemas);
  };

  const validarFormulario = (): boolean => {
    if (!formData.data || !formData.equipe_id || formData.ptrs.length === 0) {
      toast({
        title: "Erro de Validação",
        description: "Data, equipe e pelo menos um PTR são obrigatórios.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.participantes.length === 0) {
      toast({
        title: "Erro de Validação",
        description: "É necessário ter pelo menos um participante.",
        variant: "destructive",
      });
      return false;
    }

    for (const ptr of formData.ptrs) {
      if (!ptr.hora_inicio || !ptr.hora_fim || !ptr.tipo || !ptr.instrutor_id) {
        toast({
          title: "Erro de Validação",
          description: "Todos os campos do PTR são obrigatórios.",
          variant: "destructive",
        });
        return false;
      }

      // Validar se horário de término é posterior ao de início
      if (ptr.hora_fim <= ptr.hora_inicio) {
        toast({
          title: "Erro de Validação",
          description: "O horário de término deve ser posterior ao horário de início.",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleSalvar = async () => {
    if (!validarFormulario()) return;

    try {
      setSalvando(true);
      
      for (const ptr of formData.ptrs) {
        const novaInstrucao = await criarInstrucao.mutateAsync({
          data: formData.data,
          hora: ptr.hora_inicio,
          hora_fim: ptr.hora_fim,
          tipo: ptr.tipo,
          instrutor_id: ptr.instrutor_id,
          observacoes: ptr.observacoes
        });

        await adicionarParticipantes.mutateAsync({
          instrucaoId: novaInstrucao.id,
          bombeirosIds: formData.participantes
        });

        // Upload fotos if any
        if (ptr.fotos.length > 0) {
          for (let i = 0; i < ptr.fotos.length; i++) {
            const fotoBase64 = ptr.fotos[i];
            const response = await fetch(fotoBase64);
            const blob = await response.blob();
            const file = new File([blob], `foto-${i + 1}.jpg`, { type: 'image/jpeg' });
            
            await uploadFotoCompleto.mutateAsync({
              file,
              instrucaoId: novaInstrucao.id,
              descricao: `Foto ${i + 1} - ${ptr.tipo}`,
              ordem: i + 1
            });
          }
        }
      }

      toast({
        title: "Sucesso",
        description: "PTR-BA criado com sucesso!",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar PTR-BA.",
        variant: "destructive",
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo PTR-BA</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data">Data *</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="equipe">Equipe *</Label>
                  <Select 
                    value={formData.equipe_id} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, equipe_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a equipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipes.map(equipe => (
                        <SelectItem key={equipe.id} value={equipe.id}>
                          {equipe.nome_equipe}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.equipe_id && (
                <div>
                  <Label className="font-semibold mb-3 block">Participantes:</Label>
                  
                  {/* Lista de participantes selecionados */}
                  <div className="space-y-3 mb-4">
                    {participantesSelecionados.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                         {participantesSelecionados.map(bombeiro => bombeiro && (
                           <div key={bombeiro.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                             <div className="flex items-center space-x-3 flex-1">
                               <div className="flex flex-col">
                                 <span className="font-medium">{bombeiro.nome}</span>
                                 <Badge variant="secondary" className="w-fit text-xs mb-2">
                                   {bombeiro.funcao}
                                 </Badge>
                                 <div className="flex items-center space-x-2">
                                   <Label className="text-sm font-medium">Situação dos BA:</Label>
                                   <Select
                                     value={situacoesBa[bombeiro.id] || 'P'}
                                     onValueChange={(value: 'P' | 'A' | 'EO') => handleSituacaoChange(bombeiro.id, value)}
                                   >
                                     <SelectTrigger className="w-32">
                                       <SelectValue />
                                     </SelectTrigger>
                                     <SelectContent>
                                       <SelectItem value="P">P - Presente</SelectItem>
                                       <SelectItem value="A">A - Ausente</SelectItem>
                                       <SelectItem value="EO">E.O - Emp. Ocorrência</SelectItem>
                                     </SelectContent>
                                   </Select>
                                 </div>
                               </div>
                             </div>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handleRemoverParticipante(bombeiro.id)}
                               className="text-destructive hover:text-destructive hover:bg-destructive/10"
                             >
                               <Trash2 className="w-4 h-4" />
                             </Button>
                           </div>
                         ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground border rounded-lg bg-muted/20">
                        <p className="text-sm">Nenhum participante selecionado</p>
                      </div>
                    )}
                  </div>

                  {/* Adicionar novo participante */}
                  {bombeirosDisponiveis.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Select onValueChange={handleAdicionarParticipante}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Adicionar participante..." />
                        </SelectTrigger>
                        <SelectContent>
                          {bombeirosDisponiveis.map(bombeiro => (
                            <SelectItem key={bombeiro.id} value={bombeiro.id}>
                              <div className="flex items-center space-x-2">
                                <span>{bombeiro.nome}</span>
                                <Badge variant="outline" className="text-xs">
                                  {bombeiro.funcao}
                                </Badge>
                                {bombeiro.equipe && (
                                  <Badge variant="secondary" className="text-xs">
                                    {bombeiro.equipe}
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {bombeirosDisponiveis.length === 0 && participantesSelecionados.length > 0 && (
                    <div className="text-center py-2 text-muted-foreground">
                      <p className="text-sm">Todos os bombeiros disponíveis já foram adicionados</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">PTRs do Dia</h3>
              <Button onClick={handleAddPTR} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar PTR-BA
              </Button>
            </div>

            {formData.ptrs.map((ptr, index) => (
              <Card key={ptr.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>PTR-BA {index + 1}</CardTitle>
                    {formData.ptrs.length > 1 && (
                      <Button variant="outline" size="sm" onClick={() => handleRemovePTR(ptr.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Horário de Início *</Label>
                      <Input
                        type="time"
                        value={ptr.hora_inicio}
                        onChange={(e) => handlePTRChange(ptr.id, 'hora_inicio', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Horário de Término *</Label>
                      <Input
                        type="time"
                        value={ptr.hora_fim}
                        onChange={(e) => handlePTRChange(ptr.id, 'hora_fim', e.target.value)}
                      />
                    </div>
                    <div className="flex items-center pt-6">
                      {ptr.hora_inicio && ptr.hora_fim && ptr.hora_fim > ptr.hora_inicio && (
                        <div className="text-sm text-muted-foreground">
                          Duração: {calcularDuracao(ptr.hora_inicio, ptr.hora_fim)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between">
                      <Label>Tema da Instrução *</Label>
                      <Button
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowGerenciadorTemas(true)}
                        className="h-auto p-1 text-muted-foreground hover:text-foreground"
                        aria-label="Gerenciar temas de PTR"
                      >
                        <Settings className="w-3 h-3" />
                      </Button>
                    </div>
                    <Select 
                      value={ptr.tipo} 
                      onValueChange={(value) => handlePTRChange(ptr.id, 'tipo', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {temasPTR.map(tipo => (
                          <SelectItem key={tipo} value={tipo}>
                            <div className="w-full text-left">
                              <div className="font-medium text-sm leading-tight">
                                {tipo}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Instrutor *</Label>
                    <Select 
                      value={ptr.instrutor_id} 
                      onValueChange={(value) => handlePTRChange(ptr.id, 'instrutor_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o instrutor" />
                      </SelectTrigger>
                      <SelectContent>
                        {participantesSelecionados.map(bombeiro => bombeiro && (
                          <SelectItem key={bombeiro.id} value={bombeiro.id}>
                            {bombeiro.nome} - {bombeiro.funcao}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <ImageUpload
                      images={ptr.fotos}
                      onImagesChange={(fotos) => handlePhotosChange(ptr.id, fotos)}
                      maxImages={2}
                      title={`Fotos - ${ptr.tipo || 'PTR-BA'}`}
                    />
                  </div>

                  <div>
                    <Label>Observações</Label>
                    <Textarea
                      value={ptr.observacoes}
                      onChange={(e) => handlePTRChange(ptr.id, 'observacoes', e.target.value)}
                      placeholder="Observações sobre a instrução..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSalvar} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar PTR-BA'}
              <Save className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Modal do Gerenciador de Temas */}
        <PTRTemasManager
          open={showGerenciadorTemas}
          onOpenChange={setShowGerenciadorTemas}
          temas={temasPTR}
          onTemasChange={handleTemasChange}
        />
      </DialogContent>
    </Dialog>
  );
};