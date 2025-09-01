import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Save, 
  User, 
  Calendar, 
  Clock, 
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Timer,
  Activity
} from "lucide-react";
import { useTAFAvaliacoes } from '@/hooks/useTAFAvaliacoes';
import { useTAFMetas } from '@/hooks/useTAFMetas';
import { useBombeiros } from '@/hooks/useBombeiros';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TAFFormProps {
  onSuccess?: () => void;
  avaliacaoId?: string;
}

const TAFForm: React.FC<TAFFormProps> = ({ onSuccess, avaliacaoId }) => {
  const [formData, setFormData] = useState({
    bombeiro_id: '',
    data_teste: format(new Date(), 'yyyy-MM-dd'),
    faixa_etaria: 'abaixo_40' as 'abaixo_40' | 'acima_40',
    flexoes_realizadas: '',
    abdominais_realizadas: '',
    polichinelos_realizados: '',
    tempo_total_segundos: '',
    tempo_limite_minutos: '3'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aprovado, setAprovado] = useState<boolean | null>(null);
  const [tempoFormatado, setTempoFormatado] = useState({ minutos: '3', segundos: '0' });

  const { bombeiros, isLoading: loadingBombeiros } = useBombeiros();
  const { metas, isLoading: loadingMetas } = useTAFMetas();
  const { criarAvaliacao, atualizarAvaliacao, buscarPorId } = useTAFAvaliacoes();

  // Carregar dados da avaliação se estiver editando
  useEffect(() => {
    if (avaliacaoId) {
      const carregarAvaliacao = async () => {
        try {
          const avaliacao = await buscarPorId.mutateAsync(avaliacaoId);
          if (avaliacao) {
            setFormData({
              bombeiro_id: avaliacao.bombeiro_id,
              data_teste: format(new Date(avaliacao.data_teste), 'yyyy-MM-dd'),
              faixa_etaria: avaliacao.faixa_etaria as 'abaixo_40' | 'acima_40',
              flexoes_realizadas: avaliacao.flexoes_realizadas.toString(),
              abdominais_realizadas: avaliacao.abdominais_realizadas.toString(),
              polichinelos_realizados: avaliacao.polichinelos_realizados.toString(),
              tempo_total_segundos: avaliacao.tempo_total_segundos.toString(),
              tempo_limite_minutos: '3'
            });
            
            const minutos = Math.floor(avaliacao.tempo_total_segundos / 60);
            const segundos = avaliacao.tempo_total_segundos % 60;
            setTempoFormatado({ 
              minutos: minutos.toString(), 
              segundos: segundos.toString() 
            });
          }
        } catch (error) {
          console.error('Erro ao carregar avaliação:', error);
          toast.error('Erro ao carregar dados da avaliação');
        }
      };
      
      carregarAvaliacao();
    }
  }, [avaliacaoId, buscarPorId]);

  // Calcular aprovação automaticamente
  useEffect(() => {
    if (formData.flexoes_realizadas && formData.abdominais_realizadas && 
        formData.polichinelos_realizados && metas) {
      
      const metaAtual = metas.find(m => m.faixa_etaria === formData.faixa_etaria);
      
      if (metaAtual) {
        const flexoesOk = parseInt(formData.flexoes_realizadas) >= metaAtual.meta_flexoes;
        const abdominaisOk = parseInt(formData.abdominais_realizadas) >= metaAtual.meta_abdominais;
        const polichinelasOk = parseInt(formData.polichinelos_realizados) >= metaAtual.meta_polichinelos;
        
        const tempoOk = formData.tempo_total_segundos ? 
          parseInt(formData.tempo_total_segundos) <= (parseInt(formData.tempo_limite_minutos || '0') * 60) : true;
        
        setAprovado(flexoesOk && abdominaisOk && polichinelasOk && tempoOk);
      }
    } else {
      setAprovado(null);
    }
  }, [formData, metas]);

  // Atualizar tempo total quando minutos/segundos mudarem
  useEffect(() => {
    if (tempoFormatado.minutos || tempoFormatado.segundos) {
      const totalSegundos = (parseInt(tempoFormatado.minutos || '0') * 60) + parseInt(tempoFormatado.segundos || '0');
      setFormData(prev => ({ ...prev, tempo_total_segundos: totalSegundos.toString() }));
    }
  }, [tempoFormatado]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTempoChange = (tipo: 'minutos' | 'segundos', value: string) => {
    // Validar entrada
    const numValue = parseInt(value) || 0;
    if (tipo === 'segundos' && numValue >= 60) return;
    if (numValue < 0) return;
    
    setTempoFormatado(prev => ({ ...prev, [tipo]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bombeiro_id || !formData.flexoes_realizadas || 
        !formData.abdominais_realizadas || !formData.polichinelos_realizados) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);

    const dadosAvaliacao = {
      bombeiro_id: formData.bombeiro_id,
      data_teste: formData.data_teste,
      avaliador_nome: 'Sistema', // Valor padrão temporário
      faixa_etaria: formData.faixa_etaria,
      idade_na_data: 30, // Valor padrão temporário - deve ser calculado baseado na data de nascimento
      flexoes_realizadas: parseInt(formData.flexoes_realizadas),
      abdominais_realizadas: parseInt(formData.abdominais_realizadas),
      polichinelos_realizados: parseInt(formData.polichinelos_realizados),
      tempo_total_segundos: parseInt(formData.tempo_total_segundos || '0'),
      tempo_limite_minutos: parseInt(formData.tempo_limite_minutos || '0'),
      aprovado: aprovado || false
    };

    try {
      if (avaliacaoId) {
        await atualizarAvaliacao.mutateAsync({ id: avaliacaoId, dados: dadosAvaliacao });
        toast.success('Avaliação TAF atualizada com sucesso!');
      } else {
        await criarAvaliacao.mutateAsync(dadosAvaliacao);
        toast.success('Avaliação TAF cadastrada com sucesso!');
      }
      
      // Limpar formulário
      setFormData({
        bombeiro_id: '',
        data_teste: format(new Date(), 'yyyy-MM-dd'),
        faixa_etaria: 'abaixo_40',
        flexoes_realizadas: '',
        abdominais_realizadas: '',
        polichinelos_realizados: '',
        tempo_total_segundos: '',
        tempo_limite_minutos: ''
      });
      setTempoFormatado({ minutos: '', segundos: '' });
      setAprovado(null);
      
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      toast.error('Erro ao salvar avaliação TAF');
    } finally {
      setIsSubmitting(false);
    }
  };

  const metaAtual = metas?.find(m => m.faixa_etaria === formData.faixa_etaria);
  const bombeiroSelecionado = bombeiros?.find(b => b.id === formData.bombeiro_id);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-500" />
          {avaliacaoId ? 'Editar Avaliação TAF' : 'Nova Avaliação TAF'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bombeiro">Bombeiro *</Label>
              <Select 
                value={formData.bombeiro_id} 
                onValueChange={(value) => handleInputChange('bombeiro_id', value)}
                disabled={loadingBombeiros}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o bombeiro" />
                </SelectTrigger>
                <SelectContent>
                  {bombeiros?.map((bombeiro) => (
                    <SelectItem key={bombeiro.id} value={bombeiro.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {bombeiro.nome_completo || bombeiro.nome}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_teste">Data do Teste *</Label>
              <Input
                id="data_teste"
                type="date"
                value={formData.data_teste}
                onChange={(e) => handleInputChange('data_teste', e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Faixa Etária */}
          <div className="space-y-2">
            <Label>Faixa Etária *</Label>
            <Select 
              value={formData.faixa_etaria} 
              onValueChange={(value) => handleInputChange('faixa_etaria', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="abaixo_40">Abaixo de 40 anos</SelectItem>
                <SelectItem value="acima_40">Acima de 40 anos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Metas da Faixa Etária */}
          {metaAtual && (
            <Alert>
              <Target className="w-4 h-4" />
              <AlertDescription>
                <strong>Metas para {formData.faixa_etaria === 'abaixo_40' ? 'abaixo de 40 anos' : 'acima de 40 anos'}:</strong>
                <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                  <div>Flexões: <Badge variant="outline">{metaAtual.meta_flexoes}</Badge></div>
                  <div>Abdominais: <Badge variant="outline">{metaAtual.meta_abdominais}</Badge></div>
                  <div>Polichinelos: <Badge variant="outline">{metaAtual.meta_polichinelos}</Badge></div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Exercícios */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Exercícios Realizados
            </h3>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="flexoes">Flexões *</Label>
                <Input
                  id="flexoes"
                  type="number"
                  min="0"
                  value={formData.flexoes_realizadas}
                  onChange={(e) => handleInputChange('flexoes_realizadas', e.target.value)}
                  placeholder="Quantidade"
                />
                {metaAtual && formData.flexoes_realizadas && (
                  <div className="flex items-center gap-1 text-xs">
                    {parseInt(formData.flexoes_realizadas) >= metaAtual.meta_flexoes ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-500" />
                    )}
                    <span>Meta: {metaAtual.meta_flexoes}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="abdominais">Abdominais *</Label>
                <Input
                  id="abdominais"
                  type="number"
                  min="0"
                  value={formData.abdominais_realizadas}
                  onChange={(e) => handleInputChange('abdominais_realizadas', e.target.value)}
                  placeholder="Quantidade"
                />
                {metaAtual && formData.abdominais_realizadas && (
                  <div className="flex items-center gap-1 text-xs">
                    {parseInt(formData.abdominais_realizadas) >= metaAtual.meta_abdominais ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-500" />
                    )}
                    <span>Meta: {metaAtual.meta_abdominais}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="polichinelos">Polichinelos *</Label>
                <Input
                  id="polichinelos"
                  type="number"
                  min="0"
                  value={formData.polichinelos_realizados}
                  onChange={(e) => handleInputChange('polichinelos_realizados', e.target.value)}
                  placeholder="Quantidade"
                />
                {metaAtual && formData.polichinelos_realizados && (
                  <div className="flex items-center gap-1 text-xs">
                    {parseInt(formData.polichinelos_realizados) >= metaAtual.meta_polichinelos ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-500" />
                    )}
                    <span>Meta: {metaAtual.meta_polichinelos}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Tempo Total */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Tempo Total para Todos os Exercícios (3 minutos)
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tempo Realizado</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="3"
                    value={tempoFormatado.minutos}
                    onChange={(e) => handleTempoChange('minutos', e.target.value)}
                    placeholder="Min"
                  />
                  <span className="flex items-center">:</span>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={tempoFormatado.segundos}
                    onChange={(e) => handleTempoChange('segundos', e.target.value)}
                    placeholder="Seg"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Tempo limite: 3 minutos para flexões, abdominais e polichinelos
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status do Tempo</Label>
                <div className="flex items-center gap-2 p-2 rounded border">
                  {formData.tempo_total_segundos ? (
                    parseInt(formData.tempo_total_segundos) <= 180 ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 text-sm">Dentro do limite</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-red-600 text-sm">Acima do limite</span>
                      </>
                    )
                  ) : (
                    <>
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500 text-sm">Não definido</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status de Aprovação */}
          {aprovado !== null && (
            <Alert className={aprovado ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {aprovado ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <AlertDescription className={aprovado ? 'text-green-800' : 'text-red-800'}>
                <strong>{aprovado ? 'APROVADO' : 'REPROVADO'}</strong>
                {bombeiroSelecionado && (
                  <div className="mt-1">
                    {bombeiroSelecionado.nome_completo} - {format(new Date(formData.data_teste), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting || loadingBombeiros || loadingMetas}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Salvando...' : (avaliacaoId ? 'Atualizar' : 'Salvar Avaliação')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TAFForm;