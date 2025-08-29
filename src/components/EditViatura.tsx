import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Viatura {
  id: string;
  nome_viatura: string;
  prefixo: string;
  modelo: string;
  tipo: string;
  status: string;
  observacoes: string | null;
}

interface EditViaturaProps {
  viatura: Viatura;
  isOpen: boolean;
  onClose: () => void;
  onViaturaUpdated: () => void;
}

export const EditViatura = ({ viatura, isOpen, onClose, onViaturaUpdated }: EditViaturaProps) => {
  const [formData, setFormData] = useState({
    nome_viatura: viatura.nome_viatura,
    prefixo: viatura.prefixo,
    modelo: viatura.modelo,
    tipo: viatura.tipo,
    status: viatura.status,
    observacoes: viatura.observacoes || '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setFormData({
      nome_viatura: viatura.nome_viatura,
      prefixo: viatura.prefixo,
      modelo: viatura.modelo,
      tipo: viatura.tipo,
      status: viatura.status,
      observacoes: viatura.observacoes || '',
    });
  }, [viatura]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('viaturas')
        .update({
          nome_viatura: formData.nome_viatura,
          prefixo: formData.prefixo,
          modelo: formData.modelo,
          tipo: formData.tipo,
          status: formData.status,
          observacoes: formData.observacoes || null,
        })
        .eq('id', viatura.id);

      if (error) {
        console.error('Erro ao atualizar viatura:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a viatura. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Viatura atualizada com sucesso!",
      });

      onViaturaUpdated();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar viatura:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Viatura - {viatura.prefixo}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome_viatura">Nome da Viatura *</Label>
              <Input
                id="nome_viatura"
                value={formData.nome_viatura}
                onChange={(e) => handleInputChange('nome_viatura', e.target.value)}
                placeholder="Exemplo: CCI 01, CA, CRS 01"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prefixo">Prefixo da Viatura *</Label>
              <Input
                id="prefixo"
                value={formData.prefixo}
                onChange={(e) => handleInputChange('prefixo', e.target.value)}
                placeholder="Exemplo: CCR 330, CCR 331, CRS 01"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo *</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) => handleInputChange('modelo', e.target.value)}
                placeholder="Exemplo: IVECO MAGIRUS X6"
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
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};