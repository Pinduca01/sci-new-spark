import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Camera } from "lucide-react";

interface ChecklistItem {
  id: string;
  nome: string;
  status: 'conforme' | 'nao_conforme' | 'nao_existente' | '';
  justificativa: string;
  foto: string;
}

interface ChecklistFormProps {
  tipo: 'BA-MC' | 'BA-2';
  viaturaId: string;
  viaturaPrefixo: string;
  onClose: () => void;
  onSave: () => void;
}

const checklistItemsBAMC = [
  { id: '1', nome: 'Mochila de emergência completa' },
  { id: '2', nome: 'Oxímetro funcionando' },
  { id: '3', nome: 'Glicosímetro e fitas' },
  { id: '4', nome: 'Medicações básicas' },
  { id: '5', nome: 'Material para curativos' },
  { id: '6', nome: 'Equipamentos de proteção individual' },
  { id: '7', nome: 'Prancha rígida' },
  { id: '8', nome: 'Colar cervical (vários tamanhos)' },
  { id: '9', nome: 'Maca dobrável' },
  { id: '10', nome: 'Cilindro de oxigênio (carga completa)' },
];

const checklistItemsBA2 = [
  { id: '1', nome: 'Nível de óleo do motor' },
  { id: '2', nome: 'Nível de água do radiador' },
  { id: '3', nome: 'Pressão dos pneus' },
  { id: '4', nome: 'Estado geral dos pneus' },
  { id: '5', nome: 'Funcionamento das luzes' },
  { id: '6', nome: 'Funcionamento da sirene' },
  { id: '7', nome: 'Limpeza interna e externa' },
  { id: '8', nome: 'Combustível (mínimo 3/4 do tanque)' },
  { id: '9', nome: 'Funcionamento do rádio' },
  { id: '10', nome: 'Kit de ferramentas básicas' },
];

export const ChecklistForm = ({ tipo, viaturaId, viaturaPrefixo, onClose, onSave }: ChecklistFormProps) => {
  const [loading, setLoading] = useState(false);
  const [bombeiro, setBombeiro] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [itens, setItens] = useState<ChecklistItem[]>(
    (tipo === 'BA-MC' ? checklistItemsBAMC : checklistItemsBA2).map(item => ({
      ...item,
      status: '' as any,
      justificativa: '',
      foto: ''
    }))
  );

  const handleItemStatusChange = (itemId: string, status: string) => {
    setItens(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, status: status as any, justificativa: status !== 'nao_conforme' ? '' : item.justificativa }
        : item
    ));
  };

  const handleJustificativaChange = (itemId: string, justificativa: string) => {
    setItens(prev => prev.map(item => 
      item.id === itemId ? { ...item, justificativa } : item
    ));
  };

  const calculateStatusGeral = () => {
    const hasNaoConforme = itens.some(item => item.status === 'nao_conforme');
    const allCompleted = itens.every(item => item.status !== '');
    
    if (!allCompleted) return 'em_andamento';
    return hasNaoConforme ? 'nao_conforme' : 'conforme';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bombeiro.trim()) {
      toast({
        title: "Erro",
        description: "Nome do bombeiro responsável é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    const incompleteItems = itens.filter(item => item.status === '');
    if (incompleteItems.length > 0) {
      toast({
        title: "Checklist Incompleto",
        description: `Ainda há ${incompleteItems.length} itens não verificados.`,
        variant: "destructive",
      });
      return;
    }

    const naoConformeItems = itens.filter(item => item.status === 'nao_conforme' && !item.justificativa.trim());
    if (naoConformeItems.length > 0) {
      toast({
        title: "Justificativa Obrigatória",
        description: "Todos os itens 'Não Conforme' devem ter justificativa.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('checklists_viaturas')
        .insert({
          viatura_id: viaturaId,
          tipo_checklist: tipo,
          bombeiro_responsavel: bombeiro,
          status_geral: calculateStatusGeral(),
          itens_checklist: itens as any,
          observacoes_gerais: observacoes || null,
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Checklist ${tipo} salvo com sucesso!`,
      });

      onSave();
    } catch (error: any) {
      console.error('Erro ao salvar checklist:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o checklist.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Checklist {tipo} - {viaturaPrefixo}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bombeiro">Bombeiro Responsável *</Label>
            <Input
              id="bombeiro"
              value={bombeiro}
              onChange={(e) => setBombeiro(e.target.value)}
              placeholder="Nome do bombeiro responsável"
              required
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Itens do Checklist</h3>
            
            {itens.map((item, index) => (
              <Card key={item.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {index + 1}. {item.nome}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={item.status}
                    onValueChange={(value) => handleItemStatusChange(item.id, value)}
                    className="flex flex-wrap gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="conforme" id={`${item.id}-conforme`} />
                      <Label htmlFor={`${item.id}-conforme`} className="text-green-600">
                        Conforme
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao_conforme" id={`${item.id}-nao-conforme`} />
                      <Label htmlFor={`${item.id}-nao-conforme`} className="text-red-600">
                        Não Conforme
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao_existente" id={`${item.id}-nao-existente`} />
                      <Label htmlFor={`${item.id}-nao-existente`} className="text-gray-600">
                        Não Existente
                      </Label>
                    </div>
                  </RadioGroup>

                  {item.status === 'nao_conforme' && (
                    <div className="space-y-3 pt-3 border-t bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                      <div className="space-y-2">
                        <Label htmlFor={`${item.id}-justificativa`}>
                          Justificativa (obrigatória) *
                        </Label>
                        <Textarea
                          id={`${item.id}-justificativa`}
                          value={item.justificativa}
                          onChange={(e) => handleJustificativaChange(item.id, e.target.value)}
                          placeholder="Descreva o problema encontrado..."
                          className="resize-none"
                          rows={2}
                          required
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Camera className="h-4 w-4" />
                        Tirar Foto
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações Gerais</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações gerais sobre o checklist..."
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
              Salvar Checklist
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};