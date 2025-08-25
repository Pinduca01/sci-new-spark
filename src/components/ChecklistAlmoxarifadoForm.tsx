
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AssinaturaDigital } from '@/components/AssinaturaDigital';
import { ChecklistItem, ChecklistAlmoxarifado, useChecklistsAlmoxarifado } from '@/hooks/useChecklistsAlmoxarifado';
import { useBombeiros } from '@/hooks/useBombeiros';
import { useToast } from '@/hooks/use-toast';
import { 
  Check, 
  X, 
  AlertTriangle, 
  Search,
  Save,
  CheckCircle,
  Camera,
  FileText
} from 'lucide-react';

export const ChecklistAlmoxarifadoForm = () => {
  const { toast } = useToast();
  const { bombeiros } = useBombeiros();
  const { createChecklist, updateChecklist, prepareChecklistItems } = useChecklistsAlmoxarifado();
  
  const [itensChecklist, setItensChecklist] = useState<ChecklistItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [assinaturaDigital, setAssinaturaDigital] = useState<string>('');
  const [checklistId, setChecklistId] = useState<string>('');

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ChecklistAlmoxarifado>({
    defaultValues: {
      data_checklist: new Date().toISOString().split('T')[0],
      hora_checklist: new Date().toTimeString().slice(0, 5),
      status_geral: 'em_andamento',
      observacoes_gerais: ''
    }
  });

  const bombeiro_responsavel_id = watch('bombeiro_responsavel_id');

  // Carregar itens do checklist ao iniciar
  useEffect(() => {
    const loadItems = async () => {
      try {
        const items = await prepareChecklistItems();
        setItensChecklist(items);
      } catch (error) {
        console.error('Erro ao carregar itens:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar materiais do estoque.",
          variant: "destructive"
        });
      }
    };

    loadItems();
  }, []);

  // Atualizar nome do bombeiro quando selecionado
  useEffect(() => {
    if (bombeiro_responsavel_id) {
      const bombeiro = bombeiros.find(b => b.id === bombeiro_responsavel_id);
      if (bombeiro) {
        setValue('bombeiro_responsavel_nome', bombeiro.nome);
      }
    }
  }, [bombeiro_responsavel_id, bombeiros, setValue]);

  // Filtrar itens
  const filteredItems = itensChecklist.filter(item => {
    const matchesSearch = 
      item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.codigo_material.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || item.categoria === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categorias = [...new Set(itensChecklist.map(item => item.categoria))];

  // Calcular estatísticas
  const totalItens = itensChecklist.length;
  const itensConferidos = itensChecklist.filter(item => item.status !== 'pendente').length;
  const itensConformes = itensChecklist.filter(item => item.status === 'conforme').length;
  const itensDivergentes = itensChecklist.filter(item => 
    item.status === 'divergencia' || item.status === 'nao_localizado'
  ).length;
  const progresso = totalItens > 0 ? (itensConferidos / totalItens) * 100 : 0;

  const updateItemStatus = (materialId: string, status: ChecklistItem['status']) => {
    setItensChecklist(prev => prev.map(item => 
      item.material_id === materialId 
        ? { ...item, status, quantidade_encontrada: status === 'conforme' ? item.quantidade_teorica : item.quantidade_encontrada }
        : item
    ));
  };

  const updateItemQuantity = (materialId: string, quantidade: number) => {
    setItensChecklist(prev => prev.map(item => 
      item.material_id === materialId 
        ? { ...item, quantidade_encontrada: quantidade }
        : item
    ));
  };

  const updateItemJustificative = (materialId: string, justificativa: string) => {
    setItensChecklist(prev => prev.map(item => 
      item.material_id === materialId 
        ? { ...item, justificativa }
        : item
    ));
  };

  const getStatusBadge = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'conforme':
        return <Badge className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" />Conforme</Badge>;
      case 'divergencia':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Divergência</Badge>;
      case 'nao_localizado':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Não Localizado</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const handleSaveSignature = (signature: string) => {
    setAssinaturaDigital(signature);
    toast({
      title: "Sucesso",
      description: "Assinatura digital salva!",
    });
  };

  const onSubmit = async (data: ChecklistAlmoxarifado) => {
    if (!assinaturaDigital) {
      toast({
        title: "Erro",
        description: "Assinatura digital é obrigatória.",
        variant: "destructive"
      });
      return;
    }

    const checklistData = {
      ...data,
      itens_checklist: itensChecklist,
      assinatura_digital: assinaturaDigital,
      total_itens: totalItens,
      itens_conformes: itensConformes,
      itens_divergentes: itensDivergentes,
      status_geral: progresso === 100 ? 'concluido' as const : 'em_andamento' as const
    };

    try {
      if (checklistId) {
        await updateChecklist.mutateAsync({ id: checklistId, ...checklistData });
      } else {
        const result = await createChecklist.mutateAsync(checklistData);
        setChecklistId(result.id);
      }
      
      toast({
        title: "Sucesso",
        description: "Checklist salvo com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao salvar checklist:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar checklist.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      {/* Header com informações gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Checklist do Almoxarifado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data_checklist">Data do Checklist</Label>
              <Input
                id="data_checklist"
                type="date"
                {...register('data_checklist', { required: 'Data é obrigatória' })}
              />
              {errors.data_checklist && (
                <span className="text-sm text-red-500">{errors.data_checklist.message}</span>
              )}
            </div>
            
            <div>
              <Label htmlFor="hora_checklist">Hora do Checklist</Label>
              <Input
                id="hora_checklist"
                type="time"
                {...register('hora_checklist', { required: 'Hora é obrigatória' })}
              />
              {errors.hora_checklist && (
                <span className="text-sm text-red-500">{errors.hora_checklist.message}</span>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="bombeiro_responsavel">Bombeiro Responsável</Label>
            <Select onValueChange={(value) => setValue('bombeiro_responsavel_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o bombeiro responsável" />
              </SelectTrigger>
              <SelectContent>
                {bombeiros.map((bombeiro) => (
                  <SelectItem key={bombeiro.id} value={bombeiro.id}>
                    {bombeiro.nome} - {bombeiro.funcao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bombeiro_responsavel_id && (
              <span className="text-sm text-red-500">Bombeiro responsável é obrigatório</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progresso */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso do Checklist</span>
              <span>{Math.round(progresso)}% ({itensConferidos}/{totalItens})</span>
            </div>
            <Progress value={progresso} className="h-2" />
            <div className="flex gap-4 text-sm">
              <span className="text-green-600">Conformes: {itensConformes}</span>
              <span className="text-yellow-600">Divergências: {itensDivergentes}</span>
              <span className="text-gray-600">Pendentes: {totalItens - itensConferidos}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar materiais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as categorias</SelectItem>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de materiais */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <Card key={item.material_id} className="border-l-4 border-l-gray-200">
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">{item.nome}</div>
                    <div className="text-sm text-gray-500">
                      {item.codigo_material} • {item.categoria}
                    </div>
                    <div className="text-sm text-gray-500">
                      Qtd. Teórica: {item.quantidade_teorica} {item.unidade_medida}
                    </div>
                  </div>
                  <div className="ml-4">
                    {getStatusBadge(item.status)}
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    variant={item.status === 'conforme' ? 'default' : 'outline'}
                    onClick={() => updateItemStatus(item.material_id, 'conforme')}
                    className="flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Conforme
                  </Button>
                  
                  <Button
                    size="sm"
                    variant={item.status === 'divergencia' ? 'default' : 'outline'}
                    onClick={() => updateItemStatus(item.material_id, 'divergencia')}
                    className="flex items-center gap-1"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    Divergência
                  </Button>
                  
                  <Button
                    size="sm"
                    variant={item.status === 'nao_localizado' ? 'destructive' : 'outline'}
                    onClick={() => updateItemStatus(item.material_id, 'nao_localizado')}
                    className="flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Não Localizado
                  </Button>
                </div>

                {/* Campos adicionais para divergências */}
                {(item.status === 'divergencia' || item.status === 'nao_localizado') && (
                  <div className="space-y-2 p-3 bg-yellow-50 rounded-lg border">
                    {item.status === 'divergencia' && (
                      <div>
                        <Label className="text-sm">Quantidade Encontrada</Label>
                        <Input
                          type="number"
                          placeholder="Digite a quantidade encontrada"
                          value={item.quantidade_encontrada || ''}
                          onChange={(e) => updateItemQuantity(item.material_id, Number(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                    )}
                    
                    <div>
                      <Label className="text-sm">Justificativa (obrigatória)</Label>
                      <Textarea
                        placeholder="Descreva o motivo da divergência..."
                        value={item.justificativa || ''}
                        onChange={(e) => updateItemJustificative(item.material_id, e.target.value)}
                        className="mt-1 min-h-[60px]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Observações gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Observações Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Digite aqui observações gerais sobre o checklist..."
            {...register('observacoes_gerais')}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Assinatura Digital */}
      <AssinaturaDigital
        onSave={handleSaveSignature}
        assinaturaExistente={assinaturaDigital}
      />

      {/* Botões de ação */}
      <div className="flex gap-3 justify-center pb-8">
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={createChecklist.isPending || updateChecklist.isPending}
          className="flex items-center gap-2 px-8"
        >
          <Save className="h-4 w-4" />
          Salvar Checklist
        </Button>
        
        {progresso === 100 && assinaturaDigital && (
          <Button
            onClick={handleSubmit((data) => onSubmit({ ...data, status_geral: 'concluido' }))}
            disabled={createChecklist.isPending || updateChecklist.isPending}
            className="flex items-center gap-2 px-8 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4" />
            Finalizar Checklist
          </Button>
        )}
      </div>
    </div>
  );
};
