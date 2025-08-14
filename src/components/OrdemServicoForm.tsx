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

interface OrdemServicoFormProps {
  viaturaId: string;
  viaturaPrefixo: string;
  onClose: () => void;
  onSave: () => void;
}

export const OrdemServicoForm = ({ viaturaId, viaturaPrefixo, onClose, onSave }: OrdemServicoFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo_servico: "viatura",
    descricao_problema: "",
    prioridade: "media",
    bombeiro_solicitante: "",
    responsavel_manutencao: "",
    observacoes: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateNumeroOS = async () => {
    const { data, error } = await supabase.rpc('nextval', { sequence_name: 'os_sequence' });
    if (error) throw error;
    return `OS-${String(data).padStart(6, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descricao_problema.trim() || !formData.bombeiro_solicitante.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const numeroOS = await generateNumeroOS();

      const { error } = await supabase
        .from('ordens_servico')
        .insert([{
          viatura_id: viaturaId,
          numero_os: numeroOS,
          ...formData,
          responsavel_manutencao: formData.responsavel_manutencao || null,
          observacoes: formData.observacoes || null,
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Ordem de Serviço ${numeroOS} criada com sucesso!`,
      });

      onSave();
    } catch (error: any) {
      console.error('Erro ao criar OS:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar a ordem de serviço.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Nova Ordem de Serviço - {viaturaPrefixo}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo_servico">Tipo de Serviço *</Label>
              <Select value={formData.tipo_servico} onValueChange={(value) => handleInputChange('tipo_servico', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viatura">Viatura</SelectItem>
                  <SelectItem value="material">Material</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade *</Label>
              <Select value={formData.prioridade} onValueChange={(value) => handleInputChange('prioridade', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao_problema">Descrição do Problema *</Label>
            <Textarea
              id="descricao_problema"
              value={formData.descricao_problema}
              onChange={(e) => handleInputChange('descricao_problema', e.target.value)}
              placeholder="Descreva detalhadamente o problema encontrado..."
              className="resize-none"
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bombeiro_solicitante">Bombeiro Solicitante *</Label>
            <Input
              id="bombeiro_solicitante"
              value={formData.bombeiro_solicitante}
              onChange={(e) => handleInputChange('bombeiro_solicitante', e.target.value)}
              placeholder="Nome do bombeiro que está solicitando"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsavel_manutencao">Responsável pela Manutenção</Label>
            <Input
              id="responsavel_manutencao"
              value={formData.responsavel_manutencao}
              onChange={(e) => handleInputChange('responsavel_manutencao', e.target.value)}
              placeholder="Nome do responsável pela execução"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Observações adicionais..."
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
              Criar Ordem de Serviço
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};