import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Beaker } from "lucide-react";
import { useAgentesExtintores } from "@/hooks/useAgentesExtintores";


export const AgenteExtintorForm = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    tipo: "" as "LGE" | "PO_QUIMICO" | "NITROGENIO" | "",
    fabricante: "",
    data_fabricacao: "",
    data_validade: "",
    quantidade: "",
    unidade: "kg",
    observacoes: ""
  });

  const { createAgente } = useAgentesExtintores();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação para garantir que tipo não seja vazio
    if (!formData.tipo) {
      return;
    }

    const agenteData = {
      tipo: formData.tipo as "LGE" | "PO_QUIMICO" | "NITROGENIO",
      fabricante: formData.fabricante,
      data_fabricacao: formData.data_fabricacao,
      data_validade: formData.data_validade,
      quantidade: parseFloat(formData.quantidade),
      unidade: formData.unidade,
      situacao: 'ativo' as const,
      observacoes: formData.observacoes
    };

    createAgente.mutate(agenteData, {
      onSuccess: () => {
        setOpen(false);
        setFormData({
          tipo: "",
          fabricante: "",
          data_fabricacao: "",
          data_validade: "",
          quantidade: "",
          unidade: "kg",
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
              <Label htmlFor="tipo">Tipo de Agente*</Label>
              <Select 
                value={formData.tipo} 
                onValueChange={(value: "LGE" | "PO_QUIMICO" | "NITROGENIO") => setFormData(prev => ({ ...prev, tipo: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LGE">LGE - Líquido Gerador de Espuma</SelectItem>
                  <SelectItem value="PO_QUIMICO">Pó Químico</SelectItem>
                  <SelectItem value="NITROGENIO">Nitrogênio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fabricante">Fabricante*</Label>
              <Input
                id="fabricante"
                value={formData.fabricante}
                onChange={(e) => setFormData(prev => ({ ...prev, fabricante: e.target.value }))}
                placeholder="Ex: Extinção LTDA"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade*</Label>
              <Input
                id="quantidade"
                type="number"
                step="0.1"
                value={formData.quantidade}
                onChange={(e) => setFormData(prev => ({ ...prev, quantidade: e.target.value }))}
                placeholder="Ex: 20"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unidade">Unidade</Label>
              <Select 
                value={formData.unidade} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, unidade: value }))}
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
              <Label htmlFor="data_validade">Data de Validade*</Label>
              <Input
                id="data_validade"
                type="date"
                value={formData.data_validade}
                onChange={(e) => setFormData(prev => ({ ...prev, data_validade: e.target.value }))}
                required
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
