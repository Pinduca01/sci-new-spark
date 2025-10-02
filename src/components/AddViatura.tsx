import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AddViaturaProps {
  onClose: () => void;
  onSave: () => void;
}

export const AddViatura = ({ onClose, onSave }: AddViaturaProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome_viatura: "",
    prefixo: "",
    modelo: "",
    placa: "",
    tipo: "CCI",
    status: "ativo",
    observacoes: "",
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToInsert = {
        nome_viatura: formData.nome_viatura,
        prefixo: formData.prefixo,
        modelo: formData.modelo,
        placa: formData.placa || '', // Adicionar placa obrigatória
        tipo: formData.tipo,
        status: formData.status,
        observacoes: formData.observacoes || null,
      };

      const { error } = await supabase
        .from('viaturas')
        .insert([dataToInsert]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Viatura adicionada com sucesso!",
      });

      onSave();
    } catch (error: any) {
      console.error('Erro ao adicionar viatura:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar a viatura.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Adicionar Nova Viatura
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome_viatura">Nome da Viatura *</Label>
            <Input
              id="nome_viatura"
              value={formData.nome_viatura}
              onChange={(e) => handleInputChange('nome_viatura', e.target.value)}
              placeholder="Ex: CCI 01, CA, CRS 01"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prefixo">Prefixo da Viatura *</Label>
            <Input
              id="prefixo"
              value={formData.prefixo}
              onChange={(e) => handleInputChange('prefixo', e.target.value)}
              placeholder="Ex: CCR 330, CCR 331, CRS 01"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modelo">Modelo *</Label>
            <Input
              id="modelo"
              value={formData.modelo}
              onChange={(e) => handleInputChange('modelo', e.target.value)}
              placeholder="Ex: IVECO MAGIRUS X6"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo da Viatura *</Label>
            <Select value={formData.tipo} onValueChange={(value) => handleInputChange('tipo', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CCI">CCI - Carro Contra Incêndio</SelectItem>
                <SelectItem value="CRS">CRS - Carro de Salvamento e Resgate</SelectItem>
                <SelectItem value="CCI RT">CCI RT - Carro Contra Incêndio Reserva Técnica</SelectItem>
                <SelectItem value="CA">CA - Carro de Apoio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status da Viatura *</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="baixada">Baixada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Observações sobre a viatura..."
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Viatura
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};