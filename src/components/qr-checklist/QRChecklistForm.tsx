
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChecklistSignature } from './ChecklistSignature';
import { ImageUpload } from '@/components/ImageUpload';
import { useQRChecklists, ChecklistItem, QRChecklist } from '@/hooks/useQRChecklists';
import { useBombeiros } from '@/hooks/useBombeiros';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock,
  MapPin,
  Camera,
  FileCheck,
  Save
} from 'lucide-react';

interface QRChecklistFormProps {
  qrCode: string;
  onComplete?: () => void;
}

export const QRChecklistForm = ({ qrCode, onComplete }: QRChecklistFormProps) => {
  const [checklist, setChecklist] = useState<Partial<QRChecklist>>({
    qr_code: qrCode,
    status: 'em_andamento',
    itens_checklist: [],
    fotos: []
  });
  
  const [viatura, setViatura] = useState<any>(null);
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { getChecklistByQR, createChecklist, updateChecklist } = useQRChecklists();
  const { bombeiros } = useBombeiros();

  useEffect(() => {
    loadChecklistData();
    getCurrentLocation();
  }, [qrCode]);

  const loadChecklistData = async () => {
    try {
      setLoading(true);
      // Primeiro tenta buscar um checklist existente
      try {
        const existingChecklist = await getChecklistByQR(qrCode);
        if (existingChecklist) {
          setChecklist({
            ...existingChecklist,
            itens_checklist: JSON.parse(existingChecklist.itens_checklist),
            fotos: existingChecklist.fotos ? JSON.parse(existingChecklist.fotos) : []
          });
          setViatura(existingChecklist.viaturas);
          setTemplate(existingChecklist.checklist_templates);
          setLoading(false);
          return;
        }
      } catch (error) {
        // Se não encontrar checklist existente, busca dados da viatura
        console.log('Nenhum checklist existente encontrado, criando novo...');
      }

      // Buscar dados da viatura pelo QR code
      const { data: viaturaData, error: viaturaError } = await supabase
        .from('viaturas')
        .select(`
          *,
          checklist_templates!checklist_templates_tipo_viatura_fkey(*)
        `)
        .eq('qr_code', qrCode)
        .single();

      if (viaturaError || !viaturaData) {
        throw new Error('QR Code inválido ou viatura não encontrada');
      }

      // Buscar template apropriado
      const { data: templateData, error: templateError } = await supabase
        .from('checklist_templates')
        .select('*')
        .eq('tipo_viatura', viaturaData.tipo)
        .eq('ativo', true)
        .single();

      if (templateError || !templateData) {
        throw new Error('Template de checklist não encontrado para este tipo de viatura');
      }

      setViatura(viaturaData);
      setTemplate(templateData);
      
      // Inicializar checklist com template
      setChecklist(prev => ({
        ...prev,
        viatura_id: viaturaData.id,
        template_id: templateData.id,
        itens_checklist: JSON.parse(templateData.itens).map((item: any) => ({
          ...item,
          status: undefined,
          valor: '',
          observacao: '',
          foto: ''
        }))
      }));

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log('Erro ao obter localização:', error)
      );
    }
  };

  const updateItem = (itemId: string, updates: Partial<ChecklistItem>) => {
    setChecklist(prev => ({
      ...prev,
      itens_checklist: prev.itens_checklist?.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      ) || []
    }));
  };

  const calculateProgress = () => {
    const items = checklist.itens_checklist || [];
    const completed = items.filter(item => item.status && item.status !== 'nao_aplicavel').length;
    return items.length > 0 ? (completed / items.length) * 100 : 0;
  };

  const handleSave = async (finalizar: boolean = false) => {
    if (!checklist.bombeiro_id) {
      alert('Selecione o bombeiro responsável');
      return;
    }

    const checklistData = {
      ...checklist,
      status: finalizar ? 'concluido' as const : 'em_andamento' as const,
      hora_conclusao: finalizar ? new Date().toTimeString().slice(0, 5) : undefined,
      localizacao: location,
      bombeiro_nome: bombeiros.find(b => b.id === checklist.bombeiro_id)?.nome || ''
    };

    try {
      if (checklist.id) {
        await updateChecklist.mutateAsync({ id: checklist.id, ...checklistData });
      } else {
        await createChecklist.mutateAsync(checklistData as any);
      }

      if (finalizar && onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Erro ao salvar checklist:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!viatura || !template) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">QR Code Inválido</h3>
          <p className="text-muted-foreground">
            Este QR Code não está associado a uma viatura válida ou não possui template de checklist.
          </p>
        </CardContent>
      </Card>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-6 w-6" />
                {template.nome}
              </CardTitle>
              <p className="text-muted-foreground">
                {viatura.prefixo} • {viatura.modelo} • {viatura.placa}
              </p>
            </div>
            <Badge variant={checklist.status === 'concluido' ? 'default' : 'secondary'}>
              {checklist.status === 'concluido' ? 'Concluído' : 'Em Andamento'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bombeiro">Bombeiro Responsável *</Label>
                <select
                  id="bombeiro"
                  className="w-full px-3 py-2 border rounded-md"
                  value={checklist.bombeiro_id || ''}
                  onChange={(e) => setChecklist(prev => ({ ...prev, bombeiro_id: e.target.value }))}
                  required
                >
                  <option value="">Selecione o bombeiro</option>
                  {bombeiros.map((bombeiro) => (
                    <option key={bombeiro.id} value={bombeiro.id}>
                      {bombeiro.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Data/Hora</Label>
                <p className="px-3 py-2 bg-muted rounded-md text-sm">
                  {new Date().toLocaleDateString('pt-BR')} • {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progresso do Checklist</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Itens do Checklist */}
      <div className="space-y-4">
        {checklist.itens_checklist?.map((item, index) => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>{index + 1}. {item.item}</span>
                {item.obrigatorio && <Badge variant="outline">Obrigatório</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status do Item */}
              <div>
                <Label>Status *</Label>
                <RadioGroup
                  value={item.status || ''}
                  onValueChange={(value) => updateItem(item.id, { status: value as any })}
                  className="flex flex-wrap gap-6 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="conforme" id={`${item.id}-conforme`} />
                    <Label htmlFor={`${item.id}-conforme`} className="text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Conforme
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nao_conforme" id={`${item.id}-nao-conforme`} />
                    <Label htmlFor={`${item.id}-nao-conforme`} className="text-red-600 flex items-center gap-1">
                      <XCircle className="h-4 w-4" />
                      Não Conforme
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nao_aplicavel" id={`${item.id}-nao-aplicavel`} />
                    <Label htmlFor={`${item.id}-nao-aplicavel`} className="text-gray-600 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Não Aplicável
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Valor/Medida (se necessário) */}
              {(item.tipo === 'contagem' || item.tipo === 'medida') && (
                <div>
                  <Label htmlFor={`${item.id}-valor`}>
                    {item.tipo === 'contagem' ? 'Quantidade' : 'Valor'} 
                    {item.unidade && ` (${item.unidade})`}
                  </Label>
                  <Input
                    id={`${item.id}-valor`}
                    type="number"
                    value={item.valor || ''}
                    onChange={(e) => updateItem(item.id, { valor: e.target.value })}
                    placeholder={item.tipo === 'contagem' ? 'Quantidade encontrada' : 'Valor medido'}
                  />
                </div>
              )}

              {/* Observação */}
              <div>
                <Label htmlFor={`${item.id}-obs`}>Observações</Label>
                <Textarea
                  id={`${item.id}-obs`}
                  value={item.observacao || ''}
                  onChange={(e) => updateItem(item.id, { observacao: e.target.value })}
                  placeholder="Observações sobre este item..."
                  rows={2}
                />
              </div>

              {/* Foto (se não conforme) */}
              {item.status === 'nao_conforme' && (
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Camera className="h-4 w-4" />
                    Foto da Não Conformidade
                  </Label>
                  <ImageUpload
                    images={item.foto ? [item.foto] : []}
                    onImagesChange={(images) => updateItem(item.id, { foto: images[0] || '' })}
                    maxImages={1}
                    title=""
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Observações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle>Observações Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={checklist.observacoes_gerais || ''}
            onChange={(e) => setChecklist(prev => ({ ...prev, observacoes_gerais: e.target.value }))}
            placeholder="Observações gerais sobre o checklist..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Assinatura Digital */}
      <ChecklistSignature
        signature={checklist.assinatura_digital}
        onSignatureChange={(signature) => setChecklist(prev => ({ ...prev, assinatura_digital: signature }))}
      />

      {/* Localização */}
      {location && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              Localização: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      <div className="flex gap-4 justify-center">
        <Button
          variant="outline"
          onClick={() => handleSave(false)}
          disabled={createChecklist.isPending || updateChecklist.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          Salvar Rascunho
        </Button>
        <Button
          onClick={() => handleSave(true)}
          disabled={!checklist.bombeiro_id || !checklist.assinatura_digital || createChecklist.isPending || updateChecklist.isPending}
        >
          <FileCheck className="h-4 w-4 mr-2" />
          Finalizar Checklist
        </Button>
      </div>
    </div>
  );
};
