
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useMateriais } from "@/hooks/useMateriais";

const categorias = [
  "Agentes Extintores",
  "EPI",
  "Medicamentos", 
  "Ferramentas",
  "Materiais Médicos",
  "Peças de Reposição",
  "Materiais de Limpeza",
  "Combustíveis"
];

const tiposUnidade = [
  { value: "volume", label: "Volume" },
  { value: "peso", label: "Peso" },
  { value: "unidade", label: "Unidade" },
  { value: "comprimento", label: "Comprimento" }
];

const unidadesMedida = {
  volume: ["litros", "mililitros"],
  peso: ["quilos", "gramas", "toneladas"],
  unidade: ["unidades", "pares", "jogos", "kits"],
  comprimento: ["metros", "centímetros", "quilômetros"]
};

export const MaterialForm = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    codigo_material: "",
    nome: "",
    categoria: "",
    tipo_unidade: "",
    unidade_medida: "",
    descricao: "",
    fabricante: "",
    ativo: true
  });

  const { createMaterial } = useMateriais();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMaterial.mutate(formData, {
      onSuccess: () => {
        setOpen(false);
        setFormData({
          codigo_material: "",
          nome: "",
          categoria: "",
          tipo_unidade: "",
          unidade_medida: "",
          descricao: "",
          fabricante: "",
          ativo: true
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Material
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Material</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código do Material*</Label>
              <Input
                id="codigo"
                value={formData.codigo_material}
                onChange={(e) => setFormData(prev => ({ ...prev, codigo_material: e.target.value }))}
                placeholder="Ex: LGE001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria*</Label>
              <Select 
                value={formData.categoria} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Material*</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Ex: Líquido Gerador de Espuma"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo_unidade">Tipo de Unidade*</Label>
              <Select 
                value={formData.tipo_unidade} 
                onValueChange={(value) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    tipo_unidade: value,
                    unidade_medida: "" // Reset unidade quando muda tipo
                  }));
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposUnidade.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unidade_medida">Unidade de Medida*</Label>
              <Select 
                value={formData.unidade_medida} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, unidade_medida: value }))}
                disabled={!formData.tipo_unidade}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {formData.tipo_unidade && unidadesMedida[formData.tipo_unidade as keyof typeof unidadesMedida]?.map((unidade) => (
                    <SelectItem key={unidade} value={unidade}>{unidade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fabricante">Fabricante</Label>
            <Input
              id="fabricante"
              value={formData.fabricante}
              onChange={(e) => setFormData(prev => ({ ...prev, fabricante: e.target.value }))}
              placeholder="Ex: Empresa XYZ"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descrição detalhada do material"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMaterial.isPending}>
              {createMaterial.isPending ? "Salvando..." : "Salvar Material"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
