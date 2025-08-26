
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useEstoqueAlmoxarifado } from '@/hooks/useEstoqueAlmoxarifado';

interface EstoqueEditModalProps {
  item: any;
  open: boolean;
  onClose: () => void;
}

export const EstoqueEditModal = ({ item, open, onClose }: EstoqueEditModalProps) => {
  const { updateEstoque } = useEstoqueAlmoxarifado();
  const [formData, setFormData] = useState({
    quantidade_disponivel: 0,
    quantidade_minima: 0,
    lote: '',
    data_fabricacao: '',
    data_validade: '',
    localizacao_fisica: '',
    observacoes: ''
  });

  useEffect(() => {
    if (item) {
      setFormData({
        quantidade_disponivel: item.quantidade_disponivel || 0,
        quantidade_minima: item.quantidade_minima || 0,
        lote: item.lote || '',
        data_fabricacao: item.data_fabricacao || '',
        data_validade: item.data_validade || '',
        localizacao_fisica: item.localizacao_fisica || '',
        observacoes: item.observacoes || ''
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateEstoque.mutateAsync({
        id: item.id,
        ...formData
      });
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Item do Estoque</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Material</Label>
              <div className="p-2 bg-muted rounded">
                <div className="font-medium">{item?.materiais?.nome}</div>
                <div className="text-sm text-muted-foreground">
                  {item?.materiais?.codigo_material}
                </div>
              </div>
            </div>
            <div>
              <Label>Categoria</Label>
              <div className="p-2 bg-muted rounded">
                {item?.materiais?.categoria}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantidade_disponivel">Quantidade Disponível</Label>
              <Input
                id="quantidade_disponivel"
                type="number"
                min="0"
                step="0.01"
                value={formData.quantidade_disponivel}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  quantidade_disponivel: Number(e.target.value)
                }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="quantidade_minima">Quantidade Mínima</Label>
              <Input
                id="quantidade_minima"
                type="number"
                min="0"
                step="0.01"
                value={formData.quantidade_minima}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  quantidade_minima: Number(e.target.value)
                }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lote">Lote</Label>
              <Input
                id="lote"
                value={formData.lote}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  lote: e.target.value
                }))}
              />
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
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data_fabricacao">Data de Fabricação</Label>
              <Input
                id="data_fabricacao"
                type="date"
                value={formData.data_fabricacao}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  data_fabricacao: e.target.value
                }))}
              />
            </div>
            <div>
              <Label htmlFor="data_validade">Data de Validade</Label>
              <Input
                id="data_validade"
                type="date"
                value={formData.data_validade}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  data_validade: e.target.value
                }))}
              />
            </div>
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
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateEstoque.isPending}>
              {updateEstoque.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
