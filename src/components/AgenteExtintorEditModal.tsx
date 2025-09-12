
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAgentesExtintores } from '@/hooks/useAgentesExtintores';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AgenteExtintorEditModalProps {
  agente: any;
  open: boolean;
  onClose: () => void;
}

export const AgenteExtintorEditModal = ({ agente, open, onClose }: AgenteExtintorEditModalProps) => {
  const { updateAgente } = useAgentesExtintores();
  const [formData, setFormData] = useState<{
    status_uso: 'disponivel' | 'em_uso' | 'vencido' | 'descartado';
    localizacao_fisica: string;
    viatura_id: string;
    observacoes: string;
  }>({
    status_uso: 'disponivel',
    localizacao_fisica: '',
    viatura_id: '',
    observacoes: ''
  });

  // Buscar viaturas para o select
  const { data: viaturas = [] } = useQuery({
    queryKey: ['viaturas-select'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('viaturas')
        .select('id, prefixo, nome_viatura')
        .order('prefixo');
      
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (agente) {
      setFormData({
        status_uso: agente.status_uso || 'disponivel',
        localizacao_fisica: agente.localizacao_fisica || '',
        viatura_id: agente.viatura_id || '',
        observacoes: agente.observacoes || ''
      });
    }
  }, [agente]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateAgente.mutateAsync({
        id: agente.id,
        updates: {
          ...formData,
          viatura_id: formData.viatura_id || null
        }
      });
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar agente:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Agente Extintor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Agente</Label>
              <div className="p-2 bg-muted rounded">
                <div className="font-medium">{agente?.tipo}</div>
              </div>
            </div>
            <div>
              <Label>Fabricante</Label>
              <div className="p-2 bg-muted rounded">
                {agente?.fabricante}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Quantidade</Label>
              <div className="p-2 bg-muted rounded">
                {agente?.quantidade} {agente?.unidade}
              </div>
            </div>
            <div>
              <Label>Data de Validade</Label>
              <div className="p-2 bg-muted rounded">
                {agente?.data_validade ? new Date(agente.data_validade).toLocaleDateString('pt-BR') : '-'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status_uso">Status de Uso</Label>
              <Select 
                value={formData.status_uso} 
                onValueChange={(value: 'disponivel' | 'em_uso' | 'vencido' | 'descartado') => 
                  setFormData(prev => ({ ...prev, status_uso: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponivel">Disponível</SelectItem>
                  <SelectItem value="em_uso">Em Uso</SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                  <SelectItem value="descartado">Descartado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="viatura_id">Viatura</Label>
              <Select 
                value={formData.viatura_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, viatura_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma viatura" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma viatura</SelectItem>
                  {viaturas.map((viatura) => (
                    <SelectItem key={viatura.id} value={viatura.id}>
                      {viatura.prefixo} - {viatura.nome_viatura}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="localizacao_fisica">Localização Física</Label>
            <Input
              id="localizacao_fisica"
              value={formData.localizacao_fisica}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                localizacao_fisica: e.target.value
              }))}
              placeholder="Ex: Almoxarifado - Prateleira A1"
            />
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                observacoes: e.target.value
              }))}
              rows={3}
              placeholder="Observações gerais sobre o agente extintor..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateAgente.isPending}>
              {updateAgente.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
