
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
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
  
  // Cronômetro
  const [segundos, setSegundos] = useState(0);
  const [ativo, setAtivo] = useState(false);
  const [pausado, setPausado] = useState(false);

  const bombeiro = bombeiros.find(b => b.id === selectedBombeiro);
  const idade = bombeiro ? new Date().getFullYear() - new Date(bombeiro.data_admissao).getFullYear() : 0;
  const meta = getMetaPorIdade(idade);

  // Cronômetro logic
  useEffect(() => {
    let intervalo: NodeJS.Timeout | null = null;
    
    if (ativo && !pausado) {
      intervalo = setInterval(() => {
        setSegundos(s => s + 1);
      }, 1000);
    } else if (intervalo) {
      clearInterval(intervalo);
    }

    return () => {
      if (intervalo) clearInterval(intervalo);
    };
  }, [ativo, pausado]);

  const formatarTempo = (s: number) => {
    const minutos = Math.floor(s / 60);
    const segs = s % 60;
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  const iniciarCronometro = () => {
    setAtivo(true);
    setPausado(false);
  };

  const pausarCronometro = () => {
    setPausado(!pausado);
  };

  const resetarCronometro = () => {
    setSegundos(0);
    setAtivo(false);
    setPausado(false);
  };

  const calcularAprovacao = () => {
    if (!meta) return false;
    
    const tempoLimite = meta.tempo_limite_minutos * 60;
    const dentroDoTempo = segundos <= tempoLimite;
    const metasAtingidas = 
      flexoes >= meta.meta_flexoes &&
      abdominais >= meta.meta_abdominais &&
      polichinelos >= meta.meta_polichinelos;

    return dentroDoTempo && metasAtingidas;
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

    const aprovado = calcularAprovacao();
    
    try {
      await createAvaliacao.mutateAsync({
        bombeiro_id: selectedBombeiro,
        data_teste: new Date().toISOString().split('T')[0],
        idade_na_data: idade,
        faixa_etaria: idade < 40 ? 'menor_40' : 'maior_igual_40',
        flexoes_realizadas: flexoes,
        abdominais_realizadas: abdominais,
        polichinelos_realizados: polichinelos,
        tempo_limite_minutos: meta.tempo_limite_minutos,
        tempo_total_segundos: segundos,
        aprovado,
        avaliador_nome: avaliadorNome,
        observacoes: observacoes || undefined
      });

      toast({
        title: "Sucesso",
        description: `TAF registrado com sucesso. Bombeiro ${aprovado ? 'APROVADO' : 'REPROVADO'}`,
      });

      // Reset form
      setSelectedBombeiro('');
      setAvaliadorNome('');
      setFlexoes(0);
      setAbdominais(0);
      setPolichinelos(0);
      setObservacoes('');
      resetarCronometro();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao registrar TAF",
        variant: "destructive"
      });
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
                <p><strong>Idade:</strong> {idade} anos</p>
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
              <CardTitle className="text-lg">Cronômetro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl font-mono font-bold text-primary">
                  {formatarTempo(segundos)}
                </div>
                <div className="flex justify-center gap-2">
                  <Button 
                    type="button"
                    onClick={iniciarCronometro}
                    disabled={ativo && !pausado}
                    variant="outline"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Iniciar
                  </Button>
                  <Button 
                    type="button"
                    onClick={pausarCronometro}
                    disabled={!ativo}
                    variant="outline"
                  >
                    <Pause className="w-4 h-4 mr-1" />
                    {pausado ? 'Continuar' : 'Pausar'}
                  </Button>
                  <Button 
                    type="button"
                    onClick={resetarCronometro}
                    variant="outline"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                </div>
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

          {bombeiro && meta && (
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
            disabled={createAvaliacao.isPending || !selectedBombeiro || !avaliadorNome}
          >
            {createAvaliacao.isPending ? 'Salvando...' : 'Registrar TAF'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TAFForm;
