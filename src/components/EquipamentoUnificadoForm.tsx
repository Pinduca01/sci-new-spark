import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Package, Beaker } from 'lucide-react';
import { useMateriais } from '@/hooks/useMateriais';
import { useAgentesExtintores } from '@/hooks/useAgentesExtintores';
import { useEquipamentos } from '@/hooks/useEquipamentos';
import { ImageUpload } from './ImageUpload';

export const EquipamentoUnificadoForm = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('material');
  const { materiais } = useMateriais();
  const { createAgente } = useAgentesExtintores();
  const { createEquipamento } = useEquipamentos();

  // Formulário para material comum
  const [materialForm, setMaterialForm] = useState<{
    material_id: string;
    codigo_equipamento: string;
    numero_serie: string;
    status: 'ativo' | 'manutencao' | 'inativo' | 'descartado';
    localizacao_fisica: string;
    data_aquisicao: string;
    valor_aquisicao: number;
    fornecedor: string;
    observacoes: string;
    fotos: string[];
  }>({
    material_id: '',
    codigo_equipamento: '',
    numero_serie: '',
    status: 'ativo',
    localizacao_fisica: '',
    data_aquisicao: '',
    valor_aquisicao: 0,
    fornecedor: '',
    observacoes: '',
    fotos: []
  });

  // Formulário para agente extintor
  const [agenteForm, setAgenteForm] = useState<{
    tipo: 'LGE' | 'PQS';
    fabricante: string;
    data_fabricacao: string;
    data_validade: string;
    quantidade: number;
    unidade: string;
    situacao: 'disponivel' | 'em_uso' | 'vencido' | 'descartado';
    observacoes: string;
  }>({
    tipo: 'LGE',
    fabricante: '',
    data_fabricacao: '',
    data_validade: '',
    quantidade: 0,
    unidade: 'kg',
    situacao: 'disponivel',
    observacoes: ''
  });

  const handleMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEquipamento.mutateAsync(materialForm);
      setMaterialForm({
        material_id: '',
        codigo_equipamento: '',
        numero_serie: '',
        status: 'ativo',
        localizacao_fisica: '',
        data_aquisicao: '',
        valor_aquisicao: 0,
        fornecedor: '',
        observacoes: '',
        fotos: []
      });
      setOpen(false);
    } catch (error) {
      console.error('Erro ao cadastrar equipamento:', error);
    }
  };

  const handleAgenteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAgente.mutateAsync({
        ...agenteForm,
        numero_recargas: 0
      });
      setAgenteForm({
        tipo: 'LGE',
        fabricante: '',
        data_fabricacao: '',
        data_validade: '',
        quantidade: 0,
        unidade: 'kg',
        situacao: 'disponivel',
        observacoes: ''
      });
      setOpen(false);
    } catch (error) {
      console.error('Erro ao cadastrar agente extintor:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Lançar Equipamento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lançar Novo Equipamento</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="material" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Material Comum
            </TabsTrigger>
            <TabsTrigger value="agente" className="flex items-center gap-2">
              <Beaker className="h-4 w-4" />
              Agente Extintor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="material" className="space-y-4">
            <form onSubmit={handleMaterialSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="material_id">Material Base</Label>
                  <Select value={materialForm.material_id} onValueChange={(value) => setMaterialForm(prev => ({ ...prev, material_id: value }))}>
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
                <div>
                  <Label htmlFor="codigo_equipamento">Código do Equipamento</Label>
                  <Input
                    id="codigo_equipamento"
                    value={materialForm.codigo_equipamento}
                    onChange={(e) => setMaterialForm(prev => ({ ...prev, codigo_equipamento: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numero_serie">Número de Série</Label>
                  <Input
                    id="numero_serie"
                    value={materialForm.numero_serie}
                    onChange={(e) => setMaterialForm(prev => ({ ...prev, numero_serie: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={materialForm.status} 
                    onValueChange={(value: 'ativo' | 'manutencao' | 'inativo' | 'descartado') => 
                      setMaterialForm(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="manutencao">Em Manutenção</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="localizacao_fisica">Localização Física</Label>
                  <Input
                    id="localizacao_fisica"
                    value={materialForm.localizacao_fisica}
                    onChange={(e) => setMaterialForm(prev => ({ ...prev, localizacao_fisica: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="data_aquisicao">Data de Aquisição</Label>
                  <Input
                    id="data_aquisicao"
                    type="date"
                    value={materialForm.data_aquisicao}
                    onChange={(e) => setMaterialForm(prev => ({ ...prev, data_aquisicao: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valor_aquisicao">Valor de Aquisição (R$)</Label>
                  <Input
                    id="valor_aquisicao"
                    type="number"
                    min="0"
                    step="0.01"
                    value={materialForm.valor_aquisicao}
                    onChange={(e) => setMaterialForm(prev => ({ ...prev, valor_aquisicao: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="fornecedor">Fornecedor</Label>
                  <Input
                    id="fornecedor"
                    value={materialForm.fornecedor}
                    onChange={(e) => setMaterialForm(prev => ({ ...prev, fornecedor: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={materialForm.observacoes}
                  onChange={(e) => setMaterialForm(prev => ({ ...prev, observacoes: e.target.value }))}
                  rows={3}
                />
              </div>

              <ImageUpload
                title="Fotos do Equipamento"
                images={materialForm.fotos}
                onImagesChange={(fotos) => setMaterialForm(prev => ({ ...prev, fotos }))}
                maxImages={3}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createEquipamento.isPending}>
                  {createEquipamento.isPending ? 'Cadastrando...' : 'Cadastrar Equipamento'}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="agente" className="space-y-4">
            <form onSubmit={handleAgenteSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo">Tipo de Agente</Label>
                  <Select value={agenteForm.tipo} onValueChange={(value: 'LGE' | 'PQS') => setAgenteForm(prev => ({ ...prev, tipo: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LGE">LGE - Líquido Gerador de Espuma</SelectItem>
                      <SelectItem value="PQS">PQS - Pó Químico Seco</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fabricante">Fabricante</Label>
                  <Input
                    id="fabricante"
                    value={agenteForm.fabricante}
                    onChange={(e) => setAgenteForm(prev => ({ ...prev, fabricante: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantidade">Quantidade</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    min="0"
                    step="0.1"
                    value={agenteForm.quantidade}
                    onChange={(e) => setAgenteForm(prev => ({ ...prev, quantidade: Number(e.target.value) }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="unidade">Unidade</Label>
                  <Select value={agenteForm.unidade} onValueChange={(value) => setAgenteForm(prev => ({ ...prev, unidade: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="L">Litros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_fabricacao">Data de Fabricação</Label>
                  <Input
                    id="data_fabricacao"
                    type="date"
                    value={agenteForm.data_fabricacao}
                    onChange={(e) => setAgenteForm(prev => ({ ...prev, data_fabricacao: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="data_validade">Data de Validade</Label>
                  <Input
                    id="data_validade"
                    type="date"
                    value={agenteForm.data_validade}
                    onChange={(e) => setAgenteForm(prev => ({ ...prev, data_validade: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="situacao">Situação</Label>
                <Select value={agenteForm.situacao} onValueChange={(value: 'disponivel' | 'em_uso' | 'vencido' | 'descartado') => setAgenteForm(prev => ({ ...prev, situacao: value }))}>
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
                <Label htmlFor="observacoes_agente">Observações</Label>
                <Textarea
                  id="observacoes_agente"
                  value={agenteForm.observacoes}
                  onChange={(e) => setAgenteForm(prev => ({ ...prev, observacoes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createAgente.isPending}>
                  {createAgente.isPending ? 'Cadastrando...' : 'Cadastrar Agente Extintor'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
