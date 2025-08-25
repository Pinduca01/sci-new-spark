
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { useMateriais } from "@/hooks/useMateriais";
import { useBombeiros } from "@/hooks/useBombeiros";

interface MovimentacaoFormProps {
  tipo: 'entrada' | 'saida';
}

const motivosEntrada = [
  "Compra",
  "Doação",
  "Transferência de outra unidade",
  "Devolução",
  "Ajuste de inventário"
];

const motivosSaida = [
  "Uso operacional",
  "Treinamento",
  "Manutenção",
  "Transferência",
  "Descarte por vencimento",
  "Perda/Avaria"
];

export const MovimentacaoForm = ({ tipo }: MovimentacaoFormProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    material_id: "",
    quantidade: "",
    motivo: "",
    responsavel_id: "",
    origem: "",
    destino: "",
    observacoes: ""
  });

  const { createMovimentacao } = useMovimentacoes();
  const { materiais } = useMateriais();
  const { bombeirosAtivos } = useBombeiros();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const movimentacaoData = {
      ...formData,
      quantidade: parseFloat(formData.quantidade),
      tipo_movimentacao: tipo,
      data_movimentacao: new Date().toISOString()
    };

    createMovimentacao.mutate(movimentacaoData, {
      onSuccess: () => {
        setOpen(false);
        setFormData({
          material_id: "",
          quantidade: "",
          motivo: "",
          responsavel_id: "",
          origem: "",
          destino: "",
          observacoes: ""
        });
      }
    });
  };

  const motivos = tipo === 'entrada' ? motivosEntrada : motivosSaida;
  const Icon = tipo === 'entrada' ? ArrowUpCircle : ArrowDownCircle;
  const title = tipo === 'entrada' ? 'Entrada de Material' : 'Saída de Material';
  const colorClass = tipo === 'entrada' ? 'text-green-600' : 'text-red-600';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={tipo === 'entrada' ? 'default' : 'destructive'} className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${colorClass}`}>
            <Icon className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="material">Material*</Label>
              <Select 
                value={formData.material_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, material_id: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o material" />
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
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade*</Label>
              <Input
                id="quantidade"
                type="number"
                step="0.001"
                value={formData.quantidade}
                onChange={(e) => setFormData(prev => ({ ...prev, quantidade: e.target.value }))}
                placeholder="0.000"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo*</Label>
              <Select 
                value={formData.motivo} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, motivo: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o motivo" />
                </SelectTrigger>
                <SelectContent>
                  {motivos.map((motivo) => (
                    <SelectItem key={motivo} value={motivo}>{motivo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável*</Label>
              <Select 
                value={formData.responsavel_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, responsavel_id: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {bombeirosAtivos.map((bombeiro) => (
                    <SelectItem key={bombeiro.id} value={bombeiro.id}>
                      {bombeiro.nome} - {bombeiro.funcao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {tipo === 'entrada' && (
            <div className="space-y-2">
              <Label htmlFor="origem">Origem</Label>
              <Input
                id="origem"
                value={formData.origem}
                onChange={(e) => setFormData(prev => ({ ...prev, origem: e.target.value }))}
                placeholder="Ex: Fornecedor XYZ, Almoxarifado Central"
              />
            </div>
          )}

          {tipo === 'saida' && (
            <div className="space-y-2">
              <Label htmlFor="destino">Destino</Label>
              <Input
                id="destino"
                value={formData.destino}
                onChange={(e) => setFormData(prev => ({ ...prev, destino: e.target.value }))}
                placeholder="Ex: Viatura BA-01, Treinamento, Descarte"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Observações adicionais sobre a movimentação"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createMovimentacao.isPending}
              variant={tipo === 'entrada' ? 'default' : 'destructive'}
            >
              {createMovimentacao.isPending ? "Processando..." : `Registrar ${title}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
