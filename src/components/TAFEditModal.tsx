import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User,
  Calendar,
  Activity,
  Target,
  Clock,
  Timer,
  CheckCircle,
  XCircle,
  Save,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface TAFEditModalProps {
  avaliacaoId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TAFEditModal: React.FC<TAFEditModalProps> = ({
  avaliacaoId,
  open,
  onClose,
  onSuccess,
}) => {
  const [avaliacao, setAvaliacao] = useState<any>(null);
  const [bombeiro, setBombeiro] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    data_teste: '',
    faixa_etaria: '',
    flexoes_realizadas: 0,
    flexoes_minimo: 0,
    abdominais_realizadas: 0,
    abdominais_minimo: 0,
    polichinelos_realizados: 0,
    polichinelos_minimo: 0,
    tempo_total_segundos: 0,
    observacoes: '',
    status: 'pendente',
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const carregarDados = async () => {
      if (!avaliacaoId) return;
      
      try {
        setIsLoadingData(true);
        // Aqui você implementaria a busca dos dados da avaliação e bombeiro
        // Por enquanto, vamos simular os dados
        const avaliacaoMock = {
          id: avaliacaoId,
          data_teste: new Date().toISOString(),
          faixa_etaria: 'abaixo_40',
          flexoes_realizadas: 25,
          flexoes_minimo: 20,
          abdominais_realizadas: 30,
          abdominais_minimo: 25,
          polichinelos_realizados: 40,
          polichinelos_minimo: 35,
          tempo_total_segundos: 165,
          observacoes: 'Avaliação realizada com sucesso.',
          status: 'aprovado',
        };
        
        const bombeiroMock = {
          id: '1',
          nome_completo: 'João Silva Santos',
          matricula: '12345',
        };
        
        setAvaliacao(avaliacaoMock);
        setBombeiro(bombeiroMock);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (open && avaliacaoId) {
      carregarDados();
    }
  }, [avaliacaoId, open]);

  useEffect(() => {
    if (avaliacao) {
      setFormData({
        data_teste: avaliacao.data_teste ? format(new Date(avaliacao.data_teste), 'yyyy-MM-dd') : '',
        faixa_etaria: avaliacao.faixa_etaria || '',
        flexoes_realizadas: avaliacao.flexoes_realizadas || 0,
        flexoes_minimo: avaliacao.flexoes_minimo || 0,
        abdominais_realizadas: avaliacao.abdominais_realizadas || 0,
        abdominais_minimo: avaliacao.abdominais_minimo || 0,
        polichinelos_realizados: avaliacao.polichinelos_realizados || 0,
        polichinelos_minimo: avaliacao.polichinelos_minimo || 0,
        tempo_total_segundos: avaliacao.tempo_total_segundos || 0,
        observacoes: avaliacao.observacoes || '',
        status: avaliacao.status || 'pendente',
      });
    }
  }, [avaliacao]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const calcularStatus = () => {
    const flexoesAprovado = formData.flexoes_realizadas >= formData.flexoes_minimo;
    const abdominaisAprovado = formData.abdominais_realizadas >= formData.abdominais_minimo;
    const polinchelosAprovado = formData.polichinelos_realizados >= formData.polichinelos_minimo;
    const tempoAprovado = formData.tempo_total_segundos <= 180; // 3 minutos

    if (flexoesAprovado && abdominaisAprovado && polinchelosAprovado && tempoAprovado) {
      return 'aprovado';
    } else {
      return 'reprovado';
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const statusCalculado = calcularStatus();
      const dadosAtualizados = {
        ...formData,
        status: statusCalculado,
        flexoes_realizadas: Number(formData.flexoes_realizadas),
        flexoes_minimo: Number(formData.flexoes_minimo),
        abdominais_realizadas: Number(formData.abdominais_realizadas),
        abdominais_minimo: Number(formData.abdominais_minimo),
        polichinelos_realizados: Number(formData.polichinelos_realizados),
        polichinelos_minimo: Number(formData.polichinelos_minimo),
        tempo_total_segundos: Number(formData.tempo_total_segundos),
      };

      // Aqui você implementaria a função de salvar no backend
      console.log('Dados atualizados:', dadosAtualizados);
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      toast.error('Erro ao salvar avaliação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Editar Avaliação TAF
          </DialogTitle>
        </DialogHeader>

        {isLoadingData ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[300px]" />
              <Skeleton className="h-4 w-[250px]" />
            </div>
          </div>
        ) : !avaliacao || !bombeiro ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Erro ao carregar dados da avaliação.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" />
                  <Label className="text-sm font-medium">Bombeiro</Label>
                </div>
                <p className="text-sm bg-muted p-2 rounded border">
                  {bombeiro?.nome_completo || bombeiro?.nome || 'Nome não disponível'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-500" />
                  <Label htmlFor="data_teste" className="text-sm font-medium">Data do Teste</Label>
                </div>
                <Input
                  id="data_teste"
                  type="date"
                  value={formData.data_teste}
                  onChange={(e) => handleInputChange('data_teste', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Faixa Etária</Label>
                <Select
                  value={formData.faixa_etaria}
                  onValueChange={(value) => handleInputChange('faixa_etaria', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="abaixo_40">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">Abaixo de 40</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="acima_40">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">Acima de 40</Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Exercícios */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Exercícios
              </h3>
              
              <div className="grid gap-4 md:grid-cols-3">
                {/* Flexões */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <Label htmlFor="flexoes_realizadas" className="text-sm font-medium">Flexões de Braço</Label>
                  </div>
                  <Input
                    id="flexoes_realizadas"
                    type="number"
                    min="0"
                    placeholder="Número de flexões realizadas"
                    value={formData.flexoes_realizadas}
                    onChange={(e) => handleInputChange('flexoes_realizadas', parseInt(e.target.value) || 0)}
                  />
                </div>

                {/* Abdominais */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-500" />
                    <Label htmlFor="abdominais_realizadas" className="text-sm font-medium">Abdominais</Label>
                  </div>
                  <Input
                    id="abdominais_realizadas"
                    type="number"
                    min="0"
                    placeholder="Número de abdominais realizadas"
                    value={formData.abdominais_realizadas}
                    onChange={(e) => handleInputChange('abdominais_realizadas', parseInt(e.target.value) || 0)}
                  />
                </div>

                {/* Polichinelos */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-500" />
                    <Label htmlFor="polichinelos_realizados" className="text-sm font-medium">Polichinelos</Label>
                  </div>
                  <Input
                    id="polichinelos_realizados"
                    type="number"
                    min="0"
                    placeholder="Número de polichinelos realizados"
                    value={formData.polichinelos_realizados}
                    onChange={(e) => handleInputChange('polichinelos_realizados', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Tempo Total para Todos os Exercícios (3 minutos) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Tempo Total para Todos os Exercícios (3 minutos)
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tempo_minutos" className="text-sm font-medium">Minutos</Label>
                  <Input
                    id="tempo_minutos"
                    type="number"
                    min="0"
                    max="3"
                    placeholder="0-3"
                    value={Math.floor(formData.tempo_total_segundos / 60)}
                    onChange={(e) => {
                      const minutos = parseInt(e.target.value) || 0;
                      const segundos = formData.tempo_total_segundos % 60;
                      handleInputChange('tempo_total_segundos', minutos * 60 + segundos);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tempo_segundos" className="text-sm font-medium">Segundos</Label>
                  <Input
                    id="tempo_segundos"
                    type="number"
                    min="0"
                    max="59"
                    placeholder="0-59"
                    value={formData.tempo_total_segundos % 60}
                    onChange={(e) => {
                      const segundos = parseInt(e.target.value) || 0;
                      const minutos = Math.floor(formData.tempo_total_segundos / 60);
                      handleInputChange('tempo_total_segundos', minutos * 60 + segundos);
                    }}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Tempo limite: 3 minutos para realizar todos os exercícios (flexões, abdominais e polichinelos)
              </p>
            </div>

            <Separator />

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes" className="text-sm font-medium">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Observações sobre a avaliação..."
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || isLoadingData || !avaliacao}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Salvando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TAFEditModal;