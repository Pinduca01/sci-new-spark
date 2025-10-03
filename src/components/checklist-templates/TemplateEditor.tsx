import { useState, useEffect } from 'react';
import { useChecklistTemplates, type ChecklistTemplate, type TemplateItem } from '@/hooks/useChecklistTemplates';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TemplateEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string | null;
}

export const TemplateEditor = ({ open, onOpenChange, templateId }: TemplateEditorProps) => {
  const { createTemplate, updateTemplate, fetchTemplateById, isCreating, isUpdating } = useChecklistTemplates();
  const { toast } = useToast();
  const [nome, setNome] = useState('');
  const [tipoViatura, setTipoViatura] = useState('');
  const [categoria, setCategoria] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [itens, setItens] = useState<TemplateItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (templateId && open) {
      loadTemplate();
    } else if (!templateId && open) {
      resetForm();
    }
  }, [templateId, open]);

  const loadTemplate = async () => {
    if (!templateId) return;
    try {
      const template = await fetchTemplateById(templateId);
      setNome(template.nome);
      setTipoViatura(template.tipo_viatura);
      setCategoria(template.categoria);
      setAtivo(template.ativo);
      setItens(template.itens || []);
    } catch (error) {
      toast({
        title: 'Erro ao carregar template',
        description: 'Não foi possível carregar o template.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setNome('');
    setTipoViatura('');
    setCategoria('');
    setAtivo(true);
    setItens([]);
  };

  const addItem = () => {
    const newItem: TemplateItem = {
      id: Date.now(),
      item: '',
      tipo: 'verificacao',
      obrigatorio: true,
      ordem: itens.length + 1,
    };
    setItens([...itens, newItem]);
  };

  const removeItem = (id: number) => {
    setItens(itens.filter((item) => item.id !== id));
  };

  const updateItem = (id: number, field: keyof TemplateItem, value: any) => {
    setItens(
      itens.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItens = [...itens];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newItens.length) return;
    
    [newItens[index], newItens[targetIndex]] = [newItens[targetIndex], newItens[index]];
    
    // Reordenar
    newItens.forEach((item, idx) => {
      item.ordem = idx + 1;
    });
    
    setItens(newItens);
  };

  const handleSubmit = () => {
    // Validações
    if (!nome.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Informe o nome do template.',
        variant: 'destructive',
      });
      return;
    }

    if (!tipoViatura) {
      toast({
        title: 'Tipo obrigatório',
        description: 'Selecione o tipo de viatura.',
        variant: 'destructive',
      });
      return;
    }

    if (!categoria) {
      toast({
        title: 'Categoria obrigatória',
        description: 'Selecione a categoria.',
        variant: 'destructive',
      });
      return;
    }

    if (itens.length === 0) {
      toast({
        title: 'Itens obrigatórios',
        description: 'Adicione pelo menos um item ao template.',
        variant: 'destructive',
      });
      return;
    }

    // Validar itens
    const invalidItem = itens.find((item) => !item.item.trim());
    if (invalidItem) {
      toast({
        title: 'Item inválido',
        description: 'Todos os itens devem ter um nome.',
        variant: 'destructive',
      });
      return;
    }

    const templateData = {
      nome: nome.trim(),
      tipo_viatura: tipoViatura,
      categoria,
      itens,
      ativo,
    };

    if (templateId) {
      updateTemplate({ id: templateId, ...templateData });
    } else {
      createTemplate(templateData);
    }

    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {templateId ? 'Editar Template' : 'Novo Template'}
          </DialogTitle>
          <DialogDescription>
            {templateId ? 'Atualize as informações do template' : 'Crie um novo template de checklist'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Template *</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: Checklist BA-2 Completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Viatura *</Label>
                  <Select value={tipoViatura} onValueChange={setTipoViatura}>
                    <SelectTrigger id="tipo">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BA-2">BA-2 (Ambulância)</SelectItem>
                      <SelectItem value="BA-MC">BA-MC (Caminhão)</SelectItem>
                      <SelectItem value="Almoxarifado">Almoxarifado</SelectItem>
                      <SelectItem value="Equipamentos">Equipamentos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select value={categoria} onValueChange={setCategoria}>
                    <SelectTrigger id="categoria">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viatura">Viatura</SelectItem>
                      <SelectItem value="medico">Médico</SelectItem>
                      <SelectItem value="seguranca">Segurança</SelectItem>
                      <SelectItem value="estoque">Estoque</SelectItem>
                      <SelectItem value="geral">Geral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="ativo"
                    checked={ativo}
                    onCheckedChange={setAtivo}
                  />
                  <Label htmlFor="ativo">Template Ativo</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Itens do Checklist */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Itens do Checklist ({itens.length})</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showPreview ? 'Ocultar' : 'Visualizar'}
                </Button>
                <Button type="button" size="sm" onClick={addItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>
            </div>

            {itens.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-32">
                  <p className="text-muted-foreground mb-2">Nenhum item adicionado</p>
                  <Button type="button" size="sm" onClick={addItem}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Item
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {itens.map((item, index) => (
                  <Card key={item.id}>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-12 gap-4 items-start">
                        <div className="col-span-1 flex flex-col gap-1 pt-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => moveItem(index, 'up')}
                            disabled={index === 0}
                          >
                            ↑
                          </Button>
                          <GripVertical className="w-4 h-4 mx-auto text-muted-foreground" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => moveItem(index, 'down')}
                            disabled={index === itens.length - 1}
                          >
                            ↓
                          </Button>
                        </div>

                        <div className="col-span-5 space-y-2">
                          <Input
                            placeholder="Nome do item"
                            value={item.item}
                            onChange={(e) => updateItem(item.id, 'item', e.target.value)}
                          />
                        </div>

                        <div className="col-span-2 space-y-2">
                          <Select
                            value={item.tipo}
                            onValueChange={(value) => updateItem(item.id, 'tipo', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="verificacao">Verificação</SelectItem>
                              <SelectItem value="contagem">Contagem</SelectItem>
                              <SelectItem value="medida">Medida</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {item.tipo === 'medida' && (
                          <div className="col-span-2 space-y-2">
                            <Input
                              placeholder="Unidade"
                              value={item.unidade || ''}
                              onChange={(e) => updateItem(item.id, 'unidade', e.target.value)}
                            />
                          </div>
                        )}

                        <div className="col-span-1 flex items-center pt-2">
                          <Switch
                            checked={item.obrigatorio}
                            onCheckedChange={(checked) => updateItem(item.id, 'obrigatorio', checked)}
                          />
                        </div>

                        <div className="col-span-1 flex items-center justify-end pt-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Preview */}
          {showPreview && itens.length > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <Label className="text-lg font-semibold mb-4 block">Pré-visualização</Label>
                <div className="space-y-2">
                  {itens.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground w-8">{index + 1}.</span>
                      <span>{item.item}</span>
                      {item.obrigatorio && <span className="text-red-500">*</span>}
                      <span className="text-xs text-muted-foreground ml-auto">
                        ({item.tipo})
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botões */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? 'Salvando...' : templateId ? 'Atualizar' : 'Criar Template'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
