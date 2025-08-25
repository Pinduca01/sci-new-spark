import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useChecklistsAlmoxarifado, ChecklistItem, ChecklistAlmoxarifado } from '@/hooks/useChecklistsAlmoxarifado';
import { useBombeiros } from '@/hooks/useBombeiros';
import { AssinaturaDigital } from './AssinaturaDigital';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock,
  Search,
  Save,
  FileCheck
} from 'lucide-react';

export const ChecklistAlmoxarifadoForm = () => {
  const [checklist, setChecklist] = useState<Partial<ChecklistAlmoxarifado>>({
    data_checklist: new Date().toISOString().split('T')[0],
    hora_checklist: new Date().toTimeString().slice(0, 5),
    status_geral: 'em_andamento',
    itens_checklist: [],
    total_itens: 0,
    itens_conformes: 0,
    itens_divergentes: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  const { createChecklist, updateChecklist, prepareChecklistItems } = useChecklistsAlmoxarifado();
  const { bombeiros } = useBombeiros();
  const { toast } = useToast();

  // Carregar itens do estoque ao inicializar
  useEffect(() => {
    let isMounted = true;

    const loadItems = async () => {
      if (!isMounted) return;
      
      try {
        setIsLoadingItems(true);
        const items = await prepareChecklistItems();
        
        if (isMounted) {
          setChecklist(prev => ({
            ...prev,
            itens_checklist: items,
            total_itens: items.length
          }));
        }
      } catch (error) {
        console.error('Erro ao carregar itens:', error);
        if (isMounted) {
          toast({
            title: "Erro",
            description: "Erro ao carregar itens do estoque",
            variant: "destructive"
          });
        }
      } finally {
        if (isMounted) {
          setIsLoadingItems(false);
        }
      }
    };

    loadItems();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateItemStatus = (materialId: string, status: ChecklistItem['status'], quantidadeEncontrada?: number, justificativa?: string) => {
    setChecklist(prev => {
      const items = prev.itens_checklist || [];
      const updatedItems = items.map(item => 
        item.material_id === materialId 
          ? { ...item, status, quantidade_encontrada: quantidadeEncontrada, justificativa }
          : item
      );

      const conformes = updatedItems.filter(item => item.status === 'conforme').length;
      const divergentes = updatedItems.filter(item => item.status === 'divergencia' || item.status === 'nao_localizado').length;

      return {
        ...prev,
        itens_checklist: updatedItems,
        itens_conformes: conformes,
        itens_divergentes: divergentes
      };
    });
  };

  const handleSave = async () => {
    if (!checklist.bombeiro_responsavel_id) {
      toast({
        title: "Erro",
        description: "Selecione o bombeiro responsável",
        variant: "destructive"
      });
      return;
    }

    if (!checklist.assinatura_digital) {
      toast({
        title: "Erro",
        description: "Assinatura digital é obrigatória",
        variant: "destructive"
      });
      return;
    }

    try {
      const checklistData = {
        ...checklist,
        status_geral: checklist.status_geral || 'em_andamento'
      } as Omit<ChecklistAlmoxarifado, 'id' | 'created_at' | 'updated_at'>;

      if (checklist.id) {
        await updateChecklist.mutateAsync({ id: checklist.id, ...checklistData });
      } else {
        await createChecklist.mutateAsync(checklistData);
      }
    } catch (error) {
      console.error('Erro ao salvar checklist:', error);
    }
  };

  const filteredItems = (checklist.itens_checklist || []).filter(item => {
    const matchesSearch = 
      item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.codigo_material.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.categoria === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set((checklist.itens_checklist || []).map(item => item.categoria))];
  const progress = checklist.total_itens > 0 
    ? ((checklist.itens_conformes + checklist.itens_divergentes) / checklist.total_itens) * 100 
    : 0;

  if (isLoadingItems) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Checklist do Almoxarifado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={checklist.data_checklist}
                onChange={(e) => setChecklist(prev => ({ ...prev, data_checklist: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="hora">Hora</Label>
              <Input
                id="hora"
                type="time"
                value={checklist.hora_checklist}
                onChange={(e) => setChecklist(prev => ({ ...prev, hora_checklist: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="responsavel">Bombeiro Responsável</Label>
              <Select 
                value={checklist.bombeiro_responsavel_id}
                onValueChange={(value) => {
                  const bombeiro = bombeiros.find(b => b.id === value);
                  setChecklist(prev => ({ 
                    ...prev, 
                    bombeiro_responsavel_id: value,
                    bombeiro_responsavel_nome: bombeiro?.nome || ''
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {bombeiros.map((bombeiro) => (
                    <SelectItem key={bombeiro.id} value={bombeiro.id}>
                      {bombeiro.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso do Checklist</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Conformes: {checklist.itens_conformes}</span>
              <span>Divergentes: {checklist.itens_divergentes}</span>
              <span>Total: {checklist.total_itens}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
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
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredItems.map((item) => (
          <Card key={item.material_id}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{item.nome}</h3>
                    <p className="text-sm text-muted-foreground">
                      Código: {item.codigo_material} | Categoria: {item.categoria}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Quantidade Teórica: {item.quantidade_teorica} {item.unidade_medida}
                    </p>
                  </div>
                  {getStatusBadge(item.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <Button
                    type="button"
                    variant={item.status === 'conforme' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateItemStatus(item.material_id, 'conforme', item.quantidade_teorica)}
                    className="w-full"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Conforme
                  </Button>
                  <Button
                    type="button"
                    variant={item.status === 'divergencia' ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => updateItemStatus(item.material_id, 'divergencia')}
                    className="w-full"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Divergência
                  </Button>
                  <Button
                    type="button"
                    variant={item.status === 'nao_localizado' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => updateItemStatus(item.material_id, 'nao_localizado')}
                    className="w-full"
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Não Localizado
                  </Button>
                </div>

                {(item.status === 'divergencia' || item.status === 'nao_localizado') && (
                  <div className="space-y-2 pt-2 border-t">
                    {item.status === 'divergencia' && (
                      <div>
                        <Label htmlFor={`qtd-${item.material_id}`}>Quantidade Encontrada</Label>
                        <Input
                          id={`qtd-${item.material_id}`}
                          type="number"
                          placeholder="Quantidade encontrada"
                          value={item.quantidade_encontrada || ''}
                          onChange={(e) => updateItemStatus(
                            item.material_id, 
                            item.status, 
                            Number(e.target.value),
                            item.justificativa
                          )}
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor={`just-${item.material_id}`}>Justificativa</Label>
                      <Textarea
                        id={`just-${item.material_id}`}
                        placeholder="Justificativa para a divergência..."
                        value={item.justificativa || ''}
                        onChange={(e) => updateItemStatus(
                          item.material_id, 
                          item.status, 
                          item.quantidade_encontrada,
                          e.target.value
                        )}
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Observações Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Observações gerais sobre o checklist..."
            value={checklist.observacoes_gerais || ''}
            onChange={(e) => setChecklist(prev => ({ ...prev, observacoes_gerais: e.target.value }))}
            rows={3}
          />
        </CardContent>
      </Card>

      <AssinaturaDigital
        assinatura={checklist.assinatura_digital}
        onSave={(assinatura) => setChecklist(prev => ({ ...prev, assinatura_digital: assinatura }))}
      />

      <div className="flex gap-4 justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => setChecklist(prev => ({ ...prev, status_geral: 'em_andamento' }))}
          disabled={createChecklist.isPending || updateChecklist.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          Salvar Rascunho
        </Button>
        <Button
          type="button"
          onClick={() => {
            setChecklist(prev => ({ ...prev, status_geral: 'concluido' }));
            handleSave();
          }}
          disabled={createChecklist.isPending || updateChecklist.isPending}
        >
          <FileCheck className="h-4 w-4 mr-2" />
          Finalizar Checklist
        </Button>
      </div>
    </div>
  );

  function getStatusIcon(status: ChecklistItem['status']) {
    switch (status) {
      case 'conforme':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'divergencia':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'nao_localizado':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  }

  function getStatusBadge(status: ChecklistItem['status']) {
    const variants = {
      conforme: 'default',
      divergencia: 'destructive',
      nao_localizado: 'secondary',
      pendente: 'outline'
    } as const;

    const labels = {
      conforme: 'Conforme',
      divergencia: 'Divergência',
      nao_localizado: 'Não Localizado',
      pendente: 'Pendente'
    };

    return (
      <Badge variant={variants[status]}>
        {getStatusIcon(status)}
        <span className="ml-1">{labels[status]}</span>
      </Badge>
    );
  }
};
