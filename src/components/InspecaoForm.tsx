
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExtintoresAeroporto, ExtintorAeroporto } from '@/hooks/useExtintoresAeroporto';
import { Bombeiro } from '@/hooks/useBombeiros';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';

interface ItemVerificacao {
  item: string;
  conforme: boolean;
  observacao?: string;
}

interface InspecaoFormData {
  extintor_id: string;
  bombeiro_inspetor_id: string;
  data_inspecao: string;
  hora_inspecao: string;
  tipo_inspecao: string;
  status_extintor: string;
  itens_verificados: ItemVerificacao[];
  observacoes?: string;
  proxima_inspecao?: string;
}

interface InspecaoFormProps {
  open: boolean;
  onClose: () => void;
  extintores: ExtintorAeroporto[];
  bombeiros: Bombeiro[];
  selectedExtintorId?: string | null;
}

export const InspecaoForm = ({ 
  open, 
  onClose, 
  extintores, 
  bombeiros, 
  selectedExtintorId 
}: InspecaoFormProps) => {
  const { createInspecao } = useExtintoresAeroporto();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedExtintor, setSelectedExtintor] = useState(selectedExtintorId || '');
  const [selectedBombeiro, setSelectedBombeiro] = useState('');
  const [selectedTipoInspecao, setSelectedTipoInspecao] = useState('rotina');

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<InspecaoFormData>({
    defaultValues: {
      extintor_id: selectedExtintorId || '',
      data_inspecao: new Date().toISOString().split('T')[0],
      hora_inspecao: new Date().toTimeString().split(' ')[0].substring(0, 5),
      tipo_inspecao: 'rotina',
      status_extintor: 'conforme',
      itens_verificados: [
        { item: 'Pressão do manômetro', conforme: false },
        { item: 'Estado do lacre', conforme: false },
        { item: 'Mangueira e esguicho', conforme: false },
        { item: 'Sinalização e acessibilidade', conforme: false },
        { item: 'Estado físico do extintor', conforme: false }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'itens_verificados'
  });

  const itensVerificados = watch('itens_verificados');

  console.log('InspecaoForm - Estado atual:', {
    selectedExtintor,
    selectedBombeiro,
    extintores: extintores.length,
    bombeiros: bombeiros.length,
    itensVerificados: itensVerificados?.length
  });

  const onSubmit = async (data: InspecaoFormData) => {
    console.log('InspecaoForm - Iniciando envio do formulário:', data);
    
    if (!selectedExtintor) {
      toast({
        title: "Erro",
        description: "Selecione um extintor",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedBombeiro) {
      toast({
        title: "Erro",
        description: "Selecione um inspetor",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const statusExtintor = data.itens_verificados?.every(item => item.conforme) ? 'conforme' : 'nao_conforme';
      
      const inspecaoData = {
        ...data,
        extintor_id: selectedExtintor,
        bombeiro_inspetor_id: selectedBombeiro,
        tipo_inspecao: selectedTipoInspecao,
        status_extintor: statusExtintor
      };

      console.log('InspecaoForm - Dados finais para envio:', inspecaoData);

      await createInspecao.mutateAsync(inspecaoData);
      
      toast({
        title: "Sucesso",
        description: "Inspeção registrada com sucesso!",
      });
      
      handleClose();
    } catch (error) {
      console.error('InspecaoForm - Erro ao criar inspeção:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar inspeção: " + (error instanceof Error ? error.message : 'Erro desconhecido'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedExtintor(selectedExtintorId || '');
    setSelectedBombeiro('');
    setSelectedTipoInspecao('rotina');
    onClose();
  };

  // Validar se há dados necessários
  if (extintores.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Aviso</DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Não há extintores cadastrados. Cadastre um extintor primeiro.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end">
            <Button onClick={onClose}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (bombeiros.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Aviso</DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Não há bombeiros cadastrados. Configure os bombeiros primeiro.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end">
            <Button onClick={onClose}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Inspeção de Extintor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="extintor_id">Extintor *</Label>
              <Select value={selectedExtintor} onValueChange={setSelectedExtintor}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o extintor" />
                </SelectTrigger>
                <SelectContent>
                  {extintores.map((extintor) => (
                    <SelectItem key={extintor.id} value={extintor.id}>
                      {extintor.codigo_extintor} - {extintor.localizacao_detalhada}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedExtintor && (
                <p className="text-sm text-red-600 mt-1">Campo obrigatório</p>
              )}
            </div>

            <div>
              <Label htmlFor="bombeiro_inspetor_id">Inspetor *</Label>
              <Select value={selectedBombeiro} onValueChange={setSelectedBombeiro}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o inspetor" />
                </SelectTrigger>
                <SelectContent>
                  {bombeiros.map((bombeiro) => (
                    <SelectItem key={bombeiro.id} value={bombeiro.id}>
                      {bombeiro.nome} - {bombeiro.funcao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedBombeiro && (
                <p className="text-sm text-red-600 mt-1">Campo obrigatório</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="data_inspecao">Data da Inspeção *</Label>
              <Input
                id="data_inspecao"
                type="date"
                {...register('data_inspecao', { required: 'Campo obrigatório' })}
              />
              {errors.data_inspecao && (
                <p className="text-sm text-red-600 mt-1">{errors.data_inspecao.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="hora_inspecao">Hora da Inspeção *</Label>
              <Input
                id="hora_inspecao"
                type="time"
                {...register('hora_inspecao', { required: 'Campo obrigatório' })}
              />
              {errors.hora_inspecao && (
                <p className="text-sm text-red-600 mt-1">{errors.hora_inspecao.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="tipo_inspecao">Tipo de Inspeção *</Label>
              <Select value={selectedTipoInspecao} onValueChange={setSelectedTipoInspecao}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rotina">Rotina</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="emergencial">Emergencial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Itens de Verificação</CardTitle>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => append({ item: '', conforme: false })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <Input
                      placeholder="Descrição do item"
                      {...register(`itens_verificados.${index}.item` as const, { required: true })}
                    />
                    {errors.itens_verificados?.[index]?.item && (
                      <p className="text-sm text-red-600 mt-1">Campo obrigatório</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={itensVerificados?.[index]?.conforme || false}
                      onCheckedChange={(checked) => 
                        register(`itens_verificados.${index}.conforme`).onChange({
                          target: { value: checked }
                        })
                      }
                    />
                    <Label className="text-sm">Conforme</Label>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {statusGeral === 'nao_conforme' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Atenção: Este extintor será marcado como NÃO CONFORME devido a itens reprovados.
              </AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              {...register('observacoes')}
              placeholder="Observações gerais sobre a inspeção"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="proxima_inspecao">Próxima Inspeção</Label>
            <Input
              id="proxima_inspecao"
              type="date"
              {...register('proxima_inspecao')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Inspeção'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
