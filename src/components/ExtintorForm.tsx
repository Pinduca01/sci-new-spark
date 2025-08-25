
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExtintoresAeroporto, QuadranteAeroporto } from '@/hooks/useExtintoresAeroporto';
import { toast } from '@/hooks/use-toast';

interface ExtintorFormData {
  codigo_extintor: string;
  localizacao_detalhada: string;
  quadrante_id: string;
  tipo_extintor: string;
  capacidade: number;
  unidade_capacidade: string;
  fabricante?: string;
  data_fabricacao?: string;
  data_instalacao: string;
  observacoes?: string;
}

interface ExtintorFormProps {
  open: boolean;
  onClose: () => void;
  quadrantes: QuadranteAeroporto[];
}

export const ExtintorForm = ({ open, onClose, quadrantes }: ExtintorFormProps) => {
  const { createExtintor } = useExtintoresAeroporto();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedQuadrante, setSelectedQuadrante] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedUnidade, setSelectedUnidade] = useState('kg');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ExtintorFormData>({
    defaultValues: {
      unidade_capacidade: 'kg'
    }
  });

  console.log('ExtintorForm - Quadrantes disponíveis:', quadrantes);
  console.log('ExtintorForm - Valores selecionados:', { selectedQuadrante, selectedTipo, selectedUnidade });

  const onSubmit = async (data: ExtintorFormData) => {
    console.log('ExtintorForm - Iniciando envio do formulário:', data);
    
    if (!selectedQuadrante) {
      toast({
        title: "Erro",
        description: "Selecione um quadrante",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTipo) {
      toast({
        title: "Erro",
        description: "Selecione um tipo de extintor",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const extintorData = {
        ...data,
        quadrante_id: selectedQuadrante,
        tipo_extintor: selectedTipo,
        unidade_capacidade: selectedUnidade,
        status: 'ativo'
      };

      console.log('ExtintorForm - Dados finais para envio:', extintorData);

      await createExtintor.mutateAsync(extintorData);
      
      toast({
        title: "Sucesso",
        description: "Extintor cadastrado com sucesso!",
      });
      
      reset();
      setSelectedQuadrante('');
      setSelectedTipo('');
      setSelectedUnidade('kg');
      onClose();
    } catch (error) {
      console.error('ExtintorForm - Erro ao criar extintor:', error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar extintor: " + (error instanceof Error ? error.message : 'Erro desconhecido'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tiposExtintor = [
    'Água Pressurizada',
    'Espuma Mecânica',
    'Pó Químico Seco',
    'CO2',
    'Pó Químico Especial'
  ];

  const handleClose = () => {
    reset();
    setSelectedQuadrante('');
    setSelectedTipo('');
    setSelectedUnidade('kg');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Extintor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="codigo_extintor">Código do Extintor *</Label>
              <Input
                id="codigo_extintor"
                {...register('codigo_extintor', { required: 'Campo obrigatório' })}
                placeholder="Ex: EXT-001"
              />
              {errors.codigo_extintor && (
                <p className="text-sm text-red-600 mt-1">{errors.codigo_extintor.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="quadrante_id">Quadrante *</Label>
              <Select value={selectedQuadrante} onValueChange={setSelectedQuadrante}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o quadrante" />
                </SelectTrigger>
                <SelectContent>
                  {quadrantes.map((quadrante) => (
                    <SelectItem key={quadrante.id} value={quadrante.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: quadrante.cor_identificacao }}
                        />
                        {quadrante.nome_quadrante}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedQuadrante && (
                <p className="text-sm text-red-600 mt-1">Campo obrigatório</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="localizacao_detalhada">Localização Detalhada *</Label>
            <Input
              id="localizacao_detalhada"
              {...register('localizacao_detalhada', { required: 'Campo obrigatório' })}
              placeholder="Ex: Terminal Principal - Portão 5"
            />
            {errors.localizacao_detalhada && (
              <p className="text-sm text-red-600 mt-1">{errors.localizacao_detalhada.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="tipo_extintor">Tipo do Extintor *</Label>
              <Select value={selectedTipo} onValueChange={setSelectedTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposExtintor.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedTipo && (
                <p className="text-sm text-red-600 mt-1">Campo obrigatório</p>
              )}
            </div>

            <div>
              <Label htmlFor="capacidade">Capacidade *</Label>
              <Input
                id="capacidade"
                type="number"
                step="0.1"
                {...register('capacidade', { 
                  required: 'Campo obrigatório',
                  valueAsNumber: true,
                  min: { value: 0.1, message: 'Capacidade deve ser maior que 0' }
                })}
                placeholder="Ex: 4"
              />
              {errors.capacidade && (
                <p className="text-sm text-red-600 mt-1">{errors.capacidade.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="unidade_capacidade">Unidade</Label>
              <Select value={selectedUnidade} onValueChange={setSelectedUnidade}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="l">l</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fabricante">Fabricante</Label>
              <Input
                id="fabricante"
                {...register('fabricante')}
                placeholder="Ex: Extinção LTDA"
              />
            </div>

            <div>
              <Label htmlFor="data_instalacao">Data de Instalação *</Label>
              <Input
                id="data_instalacao"
                type="date"
                {...register('data_instalacao', { required: 'Campo obrigatório' })}
              />
              {errors.data_instalacao && (
                <p className="text-sm text-red-600 mt-1">{errors.data_instalacao.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="data_fabricacao">Data de Fabricação</Label>
            <Input
              id="data_fabricacao"
              type="date"
              {...register('data_fabricacao')}
            />
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              {...register('observacoes')}
              placeholder="Informações adicionais sobre o extintor"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Extintor'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
