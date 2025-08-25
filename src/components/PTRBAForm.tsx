
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { usePTRInstrucoes } from '@/hooks/usePTRInstrucoes';
import { usePTRParticipantes } from '@/hooks/usePTRParticipantes';
import { useBombeiros } from '@/hooks/useBombeiros';
import { Loader2 } from 'lucide-react';

interface PTRBAFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
}

export const PTRBAForm: React.FC<PTRBAFormProps> = ({
  open,
  onOpenChange,
  selectedDate,
}) => {
  const { toast } = useToast();
  const { criarInstrucao } = usePTRInstrucoes();
  const { adicionarParticipantes } = usePTRParticipantes();
  const { bombeirosAtivos, isLoading: loadingBombeiros } = useBombeiros();

  const [formData, setFormData] = useState({
    data: selectedDate.toISOString().split('T')[0],
    hora: '',
    titulo: '',
    tipo: '',
    instrutor_id: '',
    participantes: [] as string[],
    observacoes: '',
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      data: selectedDate.toISOString().split('T')[0]
    }));
  }, [selectedDate]);

  const tiposInstrucao = [
    'Procedimentos de Emergência',
    'Combate a Incêndio',
    'Primeiros Socorros',
    'Manuseio de Equipamentos',
    'Resgate em Altura',
    'Salvamento Aquático',
    'Produtos Perigosos',
    'Comunicação de Emergência'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.hora || !formData.tipo) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      // 1. Criar a instrução
      const novaInstrucao = await criarInstrucao.mutateAsync({
        data: formData.data,
        hora: formData.hora,
        tipo: formData.tipo,
        titulo: formData.titulo,
        instrutor_id: formData.instrutor_id || undefined,
        observacoes: formData.observacoes || undefined,
      });

      // 2. Adicionar participantes se houver
      if (formData.participantes.length > 0) {
        await adicionarParticipantes.mutateAsync({
          instrucaoId: novaInstrucao.id,
          bombeirosIds: formData.participantes
        });
      }

      // Resetar form e fechar
      setFormData({
        data: selectedDate.toISOString().split('T')[0],
        hora: '',
        titulo: '',
        tipo: '',
        instrutor_id: '',
        participantes: [],
        observacoes: '',
      });
      onOpenChange(false);

    } catch (error) {
      console.error('Erro ao criar instrução:', error);
    }
  };

  const handleParticipanteChange = (bombeiroId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      participantes: checked
        ? [...prev.participantes, bombeiroId]
        : prev.participantes.filter(id => id !== bombeiroId)
    }));
  };

  const isSubmitting = criarInstrucao.isPending || adicionarParticipantes.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Instrução PTR-BA</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data">Data *</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="hora">Horário *</Label>
              <Input
                id="hora"
                type="time"
                value={formData.hora}
                onChange={(e) => setFormData(prev => ({ ...prev, hora: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tipo">Tipo de Instrução *</Label>
            <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de instrução" />
              </SelectTrigger>
              <SelectContent>
                {tiposInstrucao.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="titulo">Título da Instrução *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              placeholder="Ex: Procedimentos básicos de combate a incêndio"
              required
            />
          </div>

          <div>
            <Label htmlFor="instrutor">Instrutor Responsável</Label>
            <Select value={formData.instrutor_id} onValueChange={(value) => setFormData(prev => ({ ...prev, instrutor_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o instrutor" />
              </SelectTrigger>
              <SelectContent>
                {bombeirosAtivos.map((bombeiro) => (
                  <SelectItem key={bombeiro.id} value={bombeiro.id}>
                    {bombeiro.nome} - {bombeiro.funcao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Participantes</Label>
            {loadingBombeiros ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2">Carregando bombeiros...</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                {bombeirosAtivos.map((bombeiro) => (
                  <div key={bombeiro.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`bombeiro-${bombeiro.id}`}
                      checked={formData.participantes.includes(bombeiro.id)}
                      onCheckedChange={(checked) => 
                        handleParticipanteChange(bombeiro.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={`bombeiro-${bombeiro.id}`} className="text-sm">
                      {bombeiro.nome} - {bombeiro.funcao}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Observações adicionais sobre a instrução..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Instrução'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
