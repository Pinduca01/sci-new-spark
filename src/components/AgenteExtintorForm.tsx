import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Beaker } from "lucide-react";
import { useAgentesExtintores } from "@/hooks/useAgentesExtintores";
import { useMateriais } from "@/hooks/useMateriais";

export const AgenteExtintorForm = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    material_id: "",
    lote: "",
    data_fabricacao: "",
    data_vencimento: "",
    tipo_agente: "" as "LGE" | "PQS" | "",
    capacidade: "",
    unidade_capacidade: "kg",
    localizacao_fisica: "",
    custo_unitario: "",
    fornecedor: "",
    numero_serie: "",
    observacoes: ""
  });

  const { createAgente } = useAgentesExtintores();
  const { materiais } = useMateriais();

  // Filtrar apenas materiais de agentes extintores
  const materiaisAgentes = materiais.filter(m => 
    m.categoria === 'Agentes Extintores' || 
    m.nome.toLowerCase().includes('lge') || 
    m.nome.toLowerCase().includes('pqs') ||
    m.nome.toLowerCase().includes('espuma') ||
    m.nome.toLowerCase().includes('pó químico')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação para garantir que tipo_agente não seja vazio
    if (!formData.tipo_agente) {
      return;
    }

    const agenteData = {
      ...formData,
      tipo_agente: formData.tipo_agente as "LGE" | "PQS", // Type assertion para garantir o tipo correto
      capacidade: parseFloat(formData.capacidade),
      custo_unitario: parseFloat(formData.custo_unitario) || 0,
      numero_recargas: 0,
      status_uso: 'disponivel' as const
    };

    createAgente.mutate(agenteData, {
      onSuccess: () => {
        setOpen(false);
        setFormData({
          material_id: "",
          lote: "",
          data_fabricacao: "",
          data_vencimento: "",
          tipo_agente: "",
          capacidade: "",
          unidade_capacidade: "kg",
          localizacao_fisica: "",
          custo_unitario: "",
          fornecedor: "",
          numero_serie: "",
          observacoes: ""
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Cadastrar Agente Extintor
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            Cadastrar Agente Extintor
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="material_id">Material Base*</Label>
              <Select 
                value={formData.material_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, material_id: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o material" />
                </SelectTrigger>
                <SelectContent>
                  {materiaisAgentes.map((material) => (
                    <SelectItem key={material.id} value={material.id}>
                      {material.codigo_material} - {material.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo_agente">Tipo de Agente*</Label>
              <Select 
                value={formData.tipo_agente} 
                onValueChange={(value: "LGE" | "PQS") => setFormData(prev => ({ ...prev, tipo_agente: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LGE">LGE - Líquido Gerador de Espuma</SelectItem>
                  <SelectItem value="PQS">PQS - Pó Químico Seco</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lote">Lote*</Label>
              <Input
                id="lote"
                value={formData.lote}
                onChange={(e) => setFormData(prev => ({ ...prev, lote: e.target.value }))}
                placeholder="Ex: LGE001-2024"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacidade">Capacidade*</Label>
              <Input
                id="capacidade"
                type="number"
                step="0.1"
                value={formData.capacidade}
                onChange={(e) => setFormData(prev => ({ ...prev, capacidade: e.target.value }))}
                placeholder="Ex: 20"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unidade_capacidade">Unidade</Label>
              <Select 
                value={formData.unidade_capacidade} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, unidade_capacidade: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="litros">litros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_fabricacao">Data de Fabricação*</Label>
              <Input
                id="data_fabricacao"
                type="date"
                value={formData.data_fabricacao}
                onChange={(e) => setFormData(prev => ({ ...prev, data_fabricacao: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_vencimento">Data de Vencimento*</Label>
              <Input
                id="data_vencimento"
                type="date"
                value={formData.data_vencimento}
                onChange={(e) => setFormData(prev => ({ ...prev, data_vencimento: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fornecedor">Fornecedor</Label>
              <Input
                id="fornecedor"
                value={formData.fornecedor}
                onChange={(e) => setFormData(prev => ({ ...prev, fornecedor: e.target.value }))}
                placeholder="Ex: Empresa XYZ"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custo_unitario">Custo Unitário (R$)</Label>
              <Input
                id="custo_unitario"
                type="number"
                step="0.01"
                value={formData.custo_unitario}
                onChange={(e) => setFormData(prev => ({ ...prev, custo_unitario: e.target.value }))}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero_serie">Número de Série</Label>
              <Input
                id="numero_serie"
                value={formData.numero_serie}
                onChange={(e) => setFormData(prev => ({ ...prev, numero_serie: e.target.value }))}
                placeholder="Ex: ABC123456"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="localizacao_fisica">Localização Física</Label>
              <Input
                id="localizacao_fisica"
                value={formData.localizacao_fisica}
                onChange={(e) => setFormData(prev => ({ ...prev, localizacao_fisica: e.target.value }))}
                placeholder="Ex: Almoxarifado - Prateleira A1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Observações adicionais sobre o agente extintor"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createAgente.isPending}>
              {createAgente.isPending ? "Cadastrando..." : "Cadastrar Agente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
