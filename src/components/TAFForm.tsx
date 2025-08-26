import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { useBombeiros } from '@/hooks/useBombeiros';
import { useTAFMetas } from '@/hooks/useTAFMetas';
import { useTAFAvaliacoes } from '@/hooks/useTAFAvaliacoes';
import { useToast } from '@/hooks/use-toast';

const TAFForm = () => {
  const { toast } = useToast();
  const { bombeiros } = useBombeiros();
  const { getMetaPorIdade } = useTAFMetas();
  const { createAvaliacao } = useTAFAvaliacoes();

  const [selectedBombeiro, setSelectedBombeiro] = useState('');
  const [avaliadorNome, setAvaliadorNome] = useState('');
  const [flexoes, setFlexoes] = useState(0);
  const [abdominais, setAbdominais] = useState(0);
  const [polichinelos, setPolichinelos] = useState(0);
  const [observacoes, setObservacoes] = useState('');
  
  // Campos para tempo manual
  const [minutos, setMinutos] = useState(0);
  const [segundos, setSegundos] = useState(0);

  const bombeiro = bombeiros.find(b => b.id === selectedBombeiro);
  const idade = bombeiro ? new Date().getFullYear() - new Date(bombeiro.data_admissao).getFullYear() + 25 : 0;
  const meta = getMetaPorIdade(idade);

  // Converter tempo manual para segundos totais
  const tempoTotalSegundos = minutos * 60 + segundos;

  const calcularAprovacao = () => {
    if (!meta) return false;
    
    const tempoLimite = meta.tempo_limite_minutos * 60;
    const dentroDoTempo = tempoTotalSegundos <= tempoLimite;
    const metasAtingidas = 
      flexoes >= meta.meta_flexoes &&
      abdominais >= meta.meta_abdominais &&
      polichinelos >= meta.meta_polichinelos;

    return dentroDoTempo && metasAtingidas;
  };

  const formatarTempo = (totalSegundos: number) => {
    const mins = Math.floor(totalSegundos / 60);
    const secs = totalSegundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bombeiro || !meta || !avaliadorNome) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (tempoTotalSegundos === 0) {
      toast({
        title: "Erro",
        description: "Informe o tempo realizado pelo bombeiro",
        variant: "destructive"
      });
      return;
    }

    const aprovado = calcularAprovacao();
    
    // Ajustar mapeamento das faixas etárias para o banco de dados
    const faixaEtariaBanco = idade < 40 ? 'abaixo_40' : 'acima_40';
    
    try {
      await createAvaliacao.mutateAsync({
        bombeiro_id: selectedBombeiro,
        data_teste: new Date().toISOString().split('T')[0],
        idade_na_data: idade,
        faixa_etaria: faixaEtariaBanco,
        flexoes_realizadas: flexoes,
        abdominais_realizadas: abdominais,
        polichinelos_realizados: polichinelos,
        tempo_limite_minutos: meta.tempo_limite_minutos,
        tempo_total_segundos: tempoTotalSegundos,
        aprovado,
        avaliador_nome: avaliadorNome,
        observacoes: observacoes || undefined
      });

      // Reset form
      setSelectedBombeiro('');
      setAvaliadorNome('');
      setFlexoes(0);
      setAbdominais(0);
      setPolichinelos(0);
      setObservacoes('');
      setMinutos(0);
      setSegundos(0);
    } catch (error) {
      console.error('Erro ao registrar TAF:', error);
    }
  };

  const aprovado = calcularAprovacao();

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-primary">Novo TAF</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bombeiro">Bombeiro *</Label>
              <Select value={selectedBombeiro} onValueChange={setSelectedBombeiro}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o bombeiro" />
                </SelectTrigger>
                <SelectContent>
                  {bombeiros.map(bombeiro => (
                    <SelectItem key={bombeiro.id} value={bombeiro.id}>
                      {bombeiro.nome} - {bombeiro.funcao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="avaliador">Avaliador *</Label>
              <Input
                id="avaliador"
                value={avaliadorNome}
                onChange={(e) => setAvaliadorNome(e.target.value)}
                placeholder="Nome do avaliador"
                required
              />
            </div>
          </div>

          {bombeiro && meta && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
              <div>
                <p><strong>Idade Estimada:</strong> {idade} anos</p>
                <p><strong>Faixa Etária:</strong> {idade < 40 ? 'Menor que 40 anos' : '40 anos ou mais'}</p>
                <p><strong>Tempo Limite:</strong> {meta.tempo_limite_minutos} minutos</p>
              </div>
              <div>
                <p><strong>Metas:</strong></p>
                <p>• Flexões: {meta.meta_flexoes}</p>
                <p>• Abdominais: {meta.meta_abdominais}</p>
                <p>• Polichinelos: {meta.meta_polichinelos}</p>
              </div>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Tempo Realizado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minutos">Minutos</Label>
                    <Input
                      id="minutos"
                      type="number"
                      min="0"
                      max="30"
                      value={minutos}
                      onChange={(e) => setMinutos(Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="segundos">Segundos</Label>
                    <Input
                      id="segundos"
                      type="number"
                      min="0"
                      max="59"
                      value={segundos}
                      onChange={(e) => setSegundos(Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                {tempoTotalSegundos > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-mono font-bold text-primary">
                      {formatarTempo(tempoTotalSegundos)}
                    </div>
                    {meta && (
                      <div className="mt-2">
                        <Badge 
                          variant={tempoTotalSegundos <= meta.tempo_limite_minutos * 60 ? "default" : "destructive"}
                        >
                          Limite: {formatarTempo(meta.tempo_limite_minutos * 60)}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="flexoes">Flexões Realizadas</Label>
              <Input
                id="flexoes"
                type="number"
                min="0"
                value={flexoes}
                onChange={(e) => setFlexoes(Number(e.target.value))}
              />
              {meta && (
                <div className="mt-1">
                  <Badge variant={flexoes >= meta.meta_flexoes ? "default" : "secondary"}>
                    Meta: {meta.meta_flexoes}
                  </Badge>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="abdominais">Abdominais Realizadas</Label>
              <Input
                id="abdominais"
                type="number"
                min="0"
                value={abdominais}
                onChange={(e) => setAbdominais(Number(e.target.value))}
              />
              {meta && (
                <div className="mt-1">
                  <Badge variant={abdominais >= meta.meta_abdominais ? "default" : "secondary"}>
                    Meta: {meta.meta_abdominais}
                  </Badge>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="polichinelos">Polichinelos Realizados</Label>
              <Input
                id="polichinelos"
                type="number"
                min="0"
                value={polichinelos}
                onChange={(e) => setPolichinelos(Number(e.target.value))}
              />
              {meta && (
                <div className="mt-1">
                  <Badge variant={polichinelos >= meta.meta_polichinelos ? "default" : "secondary"}>
                    Meta: {meta.meta_polichinelos}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações adicionais sobre o teste"
              rows={3}
            />
          </div>

          {bombeiro && meta && tempoTotalSegundos > 0 && (
            <Card className={`border-2 ${aprovado ? 'border-green-500' : 'border-red-500'}`}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-center gap-2">
                  {aprovado ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <span className="text-lg font-bold text-green-500">APROVADO</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-red-500" />
                      <span className="text-lg font-bold text-red-500">REPROVADO</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={createAvaliacao.isPending || !selectedBombeiro || !avaliadorNome || tempoTotalSegundos === 0}
          >
            {createAvaliacao.isPending ? 'Salvando...' : 'Registrar TAF'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TAFForm;
