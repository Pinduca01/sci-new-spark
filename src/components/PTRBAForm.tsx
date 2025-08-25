
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

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
  const [formData, setFormData] = useState({
    data: selectedDate.toISOString().split('T')[0],
    hora: '',
    titulo: '',
    tipo: '',
    instrutor: '',
    participantes: [] as string[],
    observacoes: '',
  });

  // Dados mockados - depois virão do Supabase
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

  const bombeirosDisponiveis = [
    { id: '1', nome: 'João Silva', funcao: 'BA-CE' },
    { id: '2', nome: 'Maria Santos', funcao: 'BA-LR' },
    { id: '3', nome: 'Carlos Oliveira', funcao: 'BA-MC' },
    { id: '4', nome: 'Ana Costa', funcao: 'BA-2' },
    { id: '5', nome: 'Pedro Souza', funcao: 'BA-2' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.titulo || !formData.hora || !formData.tipo) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Aqui seria a integração com Supabase
    toast({
      title: "Sucesso",
      description: "Instrução PTR-BA cadastrada com sucesso.",
    });

    onOpenChange(false);
    setFormData({
      data: selectedDate.toISOString().split('T')[0],
      hora: '',
      titulo: '',
      tipo: '',
      instrutor: '',
      participantes: [],
      observacoes: '',
    });
  };

  const handleParticipanteChange = (bombeiroId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      participantes: checked
        ? [...prev.participantes, bombeiroId]
        : prev.participantes.filter(id => id !== bombeiroId)
    }));
  };

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
            <Input
              id="instrutor"
              value={formData.instrutor}
              onChange={(e) => setFormData(prev => ({ ...prev, instrutor: e.target.value }))}
              placeholder="Nome do instrutor"
            />
          </div>

          <div>
            <Label>Participantes</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
              {bombeirosDisponiveis.map((bombeiro) => (
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar Instrução
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
