
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEstoqueAlmoxarifado } from '@/hooks/useEstoqueAlmoxarifado';
import { useMateriais } from '@/hooks/useMateriais';

interface EstoqueCreateModalProps {
  open: boolean;
  onClose: () => void;
}

export const EstoqueCreateModal = ({ open, onClose }: EstoqueCreateModalProps) => {
  const { addEstoque } = useEstoqueAlmoxarifado();
  const { materiais } = useMateriais();
  const [formData, setFormData] = useState({
    material_id: '',
    quantidade_disponivel: 0,
    quantidade_minima: 0,
    lote: '',
    data_fabricacao: '',
    data_validade: '',
    localizacao_fisica: '',
    observacoes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.material_id) {
      return;
    }

    try {
      await addEstoque.mutateAsync(formData);
      setFormData({
        material_id: '',
        quantidade_disponivel: 0,
        quantidade_minima: 0,
        lote: '',
        data_fabricacao: '',
        data_validade: '',
        localizacao_fisica: '',
        observacoes: ''
      });
      onClose();
    } catch (error) {
      console.error('Erro ao criar item:', error);
    }
  };

  const selectedMaterial = materiais.find(m => m.id === formData.material_id);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Item ao Estoque</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="material_id">Material *</Label>
            <Select
              value={formData.material_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, material_id: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um material" />
              </SelectTrigger>
              <SelectContent>
                {materiais.map((material) => (
                  <SelectItem key={material.id} value={material.id}>
                    {material.codigo_material} - {material.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMaterial && (
            <div className="p-2 bg-muted rounded">
              <div className="text-sm text-muted-foreground">
                <strong>Categoria:</strong> {selectedMaterial.categoria} | 
                <strong> Unidade:</strong> {selectedMaterial.unidade_medida}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantidade_disponivel">Quantidade Disponível *</Label>
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
              <Label htmlFor="quantidade_minima">Quantidade Mínima *</Label>
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
            <Button type="submit" disabled={addEstoque.isPending}>
              {addEstoque.isPending ? 'Criando...' : 'Criar Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
