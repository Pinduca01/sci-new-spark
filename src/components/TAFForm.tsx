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
  CheckCircle,
  XCircle,
  AlertTriangle,
  Timer,
  Activity,
  Users,
  Plus,
  Trash2,
  Target
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

interface ParticipanteEquipe {
  id: string;
  bombeiro_id: string;
  faixa_etaria: 'abaixo_40' | 'acima_40';
  flexoes_realizadas: string;
  abdominais_realizadas: string;
  polichinelos_realizados: string;
  tempo_total_segundos: string;
  tempo_minutos: string;
  tempo_segundos: string;
  aprovado?: boolean;
}

const TAFForm: React.FC<TAFFormProps> = ({ onSuccess, avaliacaoId }) => {
  const [equipeSelecionada, setEquipeSelecionada] = useState('');
  const [participantes, setParticipantes] = useState<ParticipanteEquipe[]>([]);
  const [dataAvaliacao, setDataAvaliacao] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const equipes = ['Alfa', 'Bravo', 'Charlie', 'Delta'];

  const { bombeiros, isLoading: loadingBombeiros, buscarPorEquipe } = useBombeiros();
  const { metas, isLoading: loadingMetas } = useTAFMetas();
  const { criarAvaliacao, atualizarAvaliacao, buscarPorId } = useTAFAvaliacoes();

  // Carregar dados da avaliação se estiver editando (modo equipe)
  useEffect(() => {
    if (avaliacaoId) {
      // TODO: Implementar carregamento de avaliação de equipe se necessário
      console.log('Carregamento de avaliação de equipe não implementado ainda');
    }
  }, [avaliacaoId]);

  // Buscar automaticamente bombeiros da equipe selecionada
  useEffect(() => {
    if (equipeSelecionada && buscarPorEquipe) {
      const bombeirosDaEquipe = buscarPorEquipe(equipeSelecionada);
      
      if (bombeirosDaEquipe && bombeirosDaEquipe.length > 0) {
        // Limpar participantes existentes
        setParticipantes([]);
        
        // Criar participantes automaticamente para cada bombeiro da equipe
        const novosParticipantes: ParticipanteEquipe[] = bombeirosDaEquipe.map((bombeiro, index) => ({
          id: `${Date.now()}-${index}`,
          bombeiro_id: bombeiro.id,
          faixa_etaria: 'abaixo_40',
          flexoes_realizadas: '',
          abdominais_realizadas: '',
          polichinelos_realizados: '',
          tempo_total_segundos: '',
          tempo_minutos: '3',
          tempo_segundos: '0'
        }));
        
        setParticipantes(novosParticipantes);
        
        // Mostrar toast informativo
        toast.success(`${bombeirosDaEquipe.length} bombeiro(s) da equipe ${equipeSelecionada} adicionado(s) automaticamente!`);
      } else {
        // Limpar participantes se não houver bombeiros na equipe
        setParticipantes([]);
        toast.info(`Nenhum bombeiro encontrado na equipe ${equipeSelecionada}`);
      }
    } else if (!equipeSelecionada) {
      // Limpar participantes quando nenhuma equipe estiver selecionada
      setParticipantes([]);
    }
  }, [equipeSelecionada, buscarPorEquipe]);



  // Calcular aprovação para cada participante da equipe
  useEffect(() => {
    if (metas) {
      const participantesAtualizados = participantes.map(participante => {
        const metaAtual = metas.find(m => m.faixa_etaria === participante.faixa_etaria);
        
        if (metaAtual && participante.flexoes_realizadas && participante.abdominais_realizadas && participante.polichinelos_realizados) {
          const flexoesOk = parseInt(participante.flexoes_realizadas) >= metaAtual.meta_flexoes;
          const abdominaisOk = parseInt(participante.abdominais_realizadas) >= metaAtual.meta_abdominais;
          const polichinelasOk = parseInt(participante.polichinelos_realizados) >= metaAtual.meta_polichinelos;
          const tempoOk = participante.tempo_total_segundos ? parseInt(participante.tempo_total_segundos) <= 180 : true;
          
          return { ...participante, aprovado: flexoesOk && abdominaisOk && polichinelasOk && tempoOk };
        }
        
        return { ...participante, aprovado: undefined };
      });
      
      setParticipantes(participantesAtualizados);
    }
  }, [participantes, metas]);

  const adicionarParticipante = () => {
    const novoParticipante: ParticipanteEquipe = {
      id: Date.now().toString(),
      bombeiro_id: '',
      faixa_etaria: 'abaixo_40',
      flexoes_realizadas: '',
      abdominais_realizadas: '',
      polichinelos_realizados: '',
      tempo_total_segundos: '',
      tempo_minutos: '3',
      tempo_segundos: '0'
    };
    setParticipantes(prev => [...prev, novoParticipante]);
  };

  const removerParticipante = (id: string) => {
    setParticipantes(prev => prev.filter(p => p.id !== id));
  };

  const atualizarParticipante = (id: string, campo: string, valor: string) => {
    setParticipantes(prev => prev.map(p => {
      if (p.id === id) {
        const participanteAtualizado = { ...p, [campo]: valor };
        
        // Atualizar tempo total se for mudança de minutos/segundos
        if (campo === 'tempo_minutos' || campo === 'tempo_segundos') {
          const minutos = campo === 'tempo_minutos' ? parseInt(valor || '0') : parseInt(p.tempo_minutos || '0');
          const segundos = campo === 'tempo_segundos' ? parseInt(valor || '0') : parseInt(p.tempo_segundos || '0');
          participanteAtualizado.tempo_total_segundos = (minutos * 60 + segundos).toString();
        }
        
        return participanteAtualizado;
      }
      return p;
    }));
  };

  const validarParticipantesUnicos = () => {
    const bombeiroIds = participantes.map(p => p.bombeiro_id).filter(id => id);
    const idsUnicos = new Set(bombeiroIds);
    return bombeiroIds.length === idsUnicos.size;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações para modo equipe
    if (!equipeSelecionada) {
      toast.error('Selecione uma equipe');
      return;
    }
    
    if (participantes.length === 0) {
      toast.error('Adicione pelo menos um participante');
      return;
    }
    
    if (!validarParticipantesUnicos()) {
      toast.error('Não é possível ter participantes duplicados na mesma equipe');
      return;
    }
    
    // Validar se todos os participantes têm dados completos
    const participantesIncompletos = participantes.filter(p => 
      !p.bombeiro_id || !p.flexoes_realizadas || !p.abdominais_realizadas || !p.polichinelos_realizados
    );
    
    if (participantesIncompletos.length > 0) {
      toast.error('Preencha todos os campos obrigatórios de todos os participantes');
      return;
    }

    setIsSubmitting(true);

    try {
      // Salvar avaliação de equipe
      const avaliacoesEquipe = participantes.map(participante => ({
        bombeiro_id: participante.bombeiro_id,
        data_teste: dataAvaliacao,
        avaliador_nome: 'Sistema',
        faixa_etaria: participante.faixa_etaria,
        idade_na_data: 30,
        flexoes_realizadas: parseInt(participante.flexoes_realizadas),
        abdominais_realizadas: parseInt(participante.abdominais_realizadas),
        polichinelos_realizados: parseInt(participante.polichinelos_realizados),
        tempo_total_segundos: parseInt(participante.tempo_total_segundos || '0'),
        tempo_limite_minutos: 3,
        aprovado: participante.aprovado || false,
        equipe: equipeSelecionada,
        tipo_avaliacao: 'equipe'
      }));
      
      // Criar todas as avaliações da equipe
      for (const avaliacao of avaliacoesEquipe) {
        await criarAvaliacao.mutateAsync(avaliacao);
      }
      
      toast.success(`Avaliação TAF da equipe ${equipeSelecionada} cadastrada com sucesso!`);
      
      // Limpar formulário de equipe
      setEquipeSelecionada('');
      setParticipantes([]);
      setDataAvaliacao(format(new Date(), 'yyyy-MM-dd'));
      
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      toast.error('Erro ao salvar avaliação TAF');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          Nova Avaliação TAF - Equipe
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
           {/* Modo Equipe */}
           <div className="space-y-6">
              {/* Seleção de Equipe e Data */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Equipe *</Label>
                  <Select value={equipeSelecionada} onValueChange={setEquipeSelecionada}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a equipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipes.map((equipe) => (
                        <SelectItem key={equipe} value={equipe}>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Equipe {equipe}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="data_teste_equipe">Data do Teste *</Label>
                  <Input
                    id="data_teste_equipe"
                    type="date"
                    value={dataAvaliacao}
                    onChange={(e) => setDataAvaliacao(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Botão Adicionar Participante */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Participantes da Equipe</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={adicionarParticipante}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Participante
                </Button>
              </div>

              {/* Lista de Participantes */}
              {participantes.map((participante, index) => (
                <Card key={participante.id} className="p-4 border-2">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Participante {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removerParticipante(participante.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Campos do Participante */}
                  <div className="space-y-4">
                    {/* Bombeiro e Faixa Etária */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Bombeiro *</Label>
                        <Select 
                          value={participante.bombeiro_id} 
                          onValueChange={(value) => atualizarParticipante(participante.id, 'bombeiro_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o bombeiro" />
                          </SelectTrigger>
                          <SelectContent>
                            {bombeiros?.filter(b => 
                              !participantes.some(p => p.id !== participante.id && p.bombeiro_id === b.id)
                            ).map((bombeiro) => (
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
                        <Label>Faixa Etária *</Label>
                        <Select 
                          value={participante.faixa_etaria} 
                          onValueChange={(value) => atualizarParticipante(participante.id, 'faixa_etaria', value)}
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
                    </div>

                    {/* Metas */}
                    {(() => {
                      const metaParticipante = metas?.find(m => m.faixa_etaria === participante.faixa_etaria);
                      return metaParticipante && (
                        <Alert>
                          <Target className="w-4 h-4" />
                          <AlertDescription>
                            <strong>Metas para {participante.faixa_etaria === 'abaixo_40' ? 'abaixo de 40 anos' : 'acima de 40 anos'}:</strong>
                            <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                              <div>Flexões: <Badge variant="outline">{metaParticipante.meta_flexoes}</Badge></div>
                              <div>Abdominais: <Badge variant="outline">{metaParticipante.meta_abdominais}</Badge></div>
                              <div>Polichinelos: <Badge variant="outline">{metaParticipante.meta_polichinelos}</Badge></div>
                            </div>
                          </AlertDescription>
                        </Alert>
                      );
                    })()}

                    {/* Exercícios */}
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Flexões *</Label>
                        <Input
                          type="number"
                          min="0"
                          value={participante.flexoes_realizadas}
                          onChange={(e) => atualizarParticipante(participante.id, 'flexoes_realizadas', e.target.value)}
                          placeholder="Quantidade"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Abdominais *</Label>
                        <Input
                          type="number"
                          min="0"
                          value={participante.abdominais_realizadas}
                          onChange={(e) => atualizarParticipante(participante.id, 'abdominais_realizadas', e.target.value)}
                          placeholder="Quantidade"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Polichinelos *</Label>
                        <Input
                          type="number"
                          min="0"
                          value={participante.polichinelos_realizados}
                          onChange={(e) => atualizarParticipante(participante.id, 'polichinelos_realizados', e.target.value)}
                          placeholder="Quantidade"
                        />
                      </div>
                    </div>

                    {/* Tempo */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Tempo Realizado</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="3"
                            value={participante.tempo_minutos}
                            onChange={(e) => atualizarParticipante(participante.id, 'tempo_minutos', e.target.value)}
                            placeholder="Min"
                          />
                          <span className="flex items-center">:</span>
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            value={participante.tempo_segundos}
                            onChange={(e) => atualizarParticipante(participante.id, 'tempo_segundos', e.target.value)}
                            placeholder="Seg"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <div className="flex items-center gap-2 p-2 rounded border">
                          {participante.aprovado !== undefined ? (
                            participante.aprovado ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-green-600 text-sm">Aprovado</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 text-red-500" />
                                <span className="text-red-600 text-sm">Reprovado</span>
                              </>
                            )
                          ) : (
                            <>
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-500 text-sm">Pendente</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {participantes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum participante adicionado ainda.</p>
                  <p className="text-sm">Clique em "Adicionar Participante" para começar.</p>
                </div>
              )}
            </div>

          <Separator />

          {/* Botões de Ação */}
          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={isSubmitting || loadingBombeiros || loadingMetas || participantes.length === 0}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Timer className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {avaliacaoId ? 'Atualizar Avaliação' : `Salvar Avaliação da Equipe ${equipeSelecionada || ''}`}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TAFForm;