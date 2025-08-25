import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, Save } from "lucide-react";
import { useBombeiros } from "@/hooks/useBombeiros";
import { useTAF } from "@/hooks/useTAF";
import { useToast } from "@/hooks/use-toast";

const TAFForm = () => {
  const { bombeiros } = useBombeiros();
  const { metas, criarAvaliacao } = useTAF();
  const { toast } = useToast();

  const [bombeiroSelecionado, setBombeiroSelecionado] = useState("");
  const [idadeBombeiro, setIdadeBombeiro] = useState(0);
  const [avaliadorNome, setAvaliadorNome] = useState("");
  const [observacoes, setObservacoes] = useState("");
  
  // Contadores dos exercícios
  const [flexoes, setFlexoes] = useState(0);
  const [abdominais, setAbdominais] = useState(0);
  const [polichinelos, setPolichinelos] = useState(0);
  
  // Timer
  const [tempo, setTempo] = useState(0);
  const [timerAtivo, setTimerAtivo] = useState(false);
  const [timerPausado, setTimerPausado] = useState(false);

  // Metas baseadas na idade
  const faixaEtaria = idadeBombeiro >= 40 ? 'acima_40' : 'abaixo_40';
  const metasAtivas = metas.find(m => m.faixa_etaria === faixaEtaria);
  const tempoLimite = metasAtivas?.tempo_limite_minutos || 3;

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerAtivo && !timerPausado) {
      interval = setInterval(() => {
        setTempo(tempo => {
          if (tempo >= tempoLimite * 60) {
            setTimerAtivo(false);
            toast({
              title: "Tempo Esgotado!",
              description: `Os ${tempoLimite} minutos acabaram.`,
              variant: "destructive",
            });
            return tempo;
          }
          return tempo + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerAtivo, timerPausado, tempoLimite, toast]);

  // Calcular idade automaticamente baseada na data de admissão
  useEffect(() => {
    if (bombeiroSelecionado) {
      const bombeiro = bombeiros.find(b => b.id === bombeiroSelecionado);
      if (bombeiro?.data_admissao) {
        const hoje = new Date();
        const admissao = new Date(bombeiro.data_admissao);
        // Calcular uma idade estimada baseada na admissão (assumindo admissão aos 25 anos)
        const anosServico = hoje.getFullYear() - admissao.getFullYear();
        const idadeEstimada = 25 + anosServico;
        setIdadeBombeiro(idadeEstimada > 0 ? idadeEstimada : 25);
      } else {
        // Fallback para idade padrão
        setIdadeBombeiro(30);
      }
    }
  }, [bombeiroSelecionado, bombeiros]);

  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const iniciarTimer = () => {
    if (!timerAtivo) {
      setTempo(0);
      setFlexoes(0);
      setAbdominais(0);
      setPolichinelos(0);
    }
    setTimerAtivo(true);
    setTimerPausado(false);
  };

  const pausarTimer = () => {
    setTimerPausado(!timerPausado);
  };

  const resetarTimer = () => {
    setTempo(0);
    setTimerAtivo(false);
    setTimerPausado(false);
    setFlexoes(0);
    setAbdominais(0);
    setPolichinelos(0);
  };

  const verificarAprovacao = () => {
    if (!metasAtivas) return false;
    
    return flexoes >= metasAtivas.meta_flexoes &&
           abdominais >= metasAtivas.meta_abdominais &&
           polichinelos >= metasAtivas.meta_polichinelos &&
           tempo <= tempoLimite * 60;
  };

  const salvarAvaliacao = async () => {
    if (!bombeiroSelecionado || !avaliadorNome.trim()) {
      toast({
        title: "Erro",
        description: "Selecione um bombeiro e informe o avaliador.",
        variant: "destructive",
      });
      return;
    }

    try {
      await criarAvaliacao.mutateAsync({
        bombeiro_id: bombeiroSelecionado,
        idade_na_data: idadeBombeiro,
        flexoes_realizadas: flexoes,
        abdominais_realizadas: abdominais,
        polichinelos_realizados: polichinelos,
        tempo_total_segundos: tempo,
        avaliador_nome: avaliadorNome,
        observacoes: observacoes.trim() || undefined
      });

      // Resetar formulário
      setBombeiroSelecionado("");
      setAvaliadorNome("");
      setObservacoes("");
      resetarTimer();
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
    }
  };

  const aprovado = verificarAprovacao();
  const progressoTempo = (tempo / (tempoLimite * 60)) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Formulário Principal */}
      <Card>
        <CardHeader>
          <CardTitle>Dados da Avaliação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bombeiro">Bombeiro</Label>
            <Select value={bombeiroSelecionado} onValueChange={setBombeiroSelecionado}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um bombeiro" />
              </SelectTrigger>
              <SelectContent>
                {bombeiros.map((bombeiro) => (
                  <SelectItem key={bombeiro.id} value={bombeiro.id}>
                    {bombeiro.nome} - {bombeiro.funcao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Idade Estimada</Label>
              <Input value={idadeBombeiro} onChange={(e) => setIdadeBombeiro(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Faixa Etária</Label>
              <Badge variant={idadeBombeiro >= 40 ? "destructive" : "default"}>
                {idadeBombeiro >= 40 ? "Acima de 40" : "Abaixo de 40"}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avaliador">Avaliador</Label>
            <Input 
              id="avaliador"
              value={avaliadorNome}
              onChange={(e) => setAvaliadorNome(e.target.value)}
              placeholder="Nome do avaliador"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea 
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações sobre o teste (opcional)"
            />
          </div>

          {metasAtivas && (
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Metas para {idadeBombeiro >= 40 ? "Acima" : "Abaixo"} de 40 anos:</h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>Flexões: {metasAtivas.meta_flexoes}</div>
                <div>Abdominais: {metasAtivas.meta_abdominais}</div>
                <div>Polichinelos: {metasAtivas.meta_polichinelos}</div>
              </div>
              <div className="mt-2 text-sm">
                Tempo Limite: {metasAtivas.tempo_limite_minutos} minutos
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cronômetro e Contadores */}
      <Card>
        <CardHeader>
          <CardTitle>Cronômetro e Contadores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timer */}
          <div className="text-center">
            <div className="text-4xl font-mono font-bold mb-2">
              {formatarTempo(tempo)}
            </div>
            <Progress value={progressoTempo} className="mb-4" />
            <div className="flex justify-center gap-2">
              <Button onClick={iniciarTimer} disabled={timerAtivo && !timerPausado}>
                <Play className="h-4 w-4" />
              </Button>
              <Button onClick={pausarTimer} disabled={!timerAtivo}>
                <Pause className="h-4 w-4" />
              </Button>
              <Button onClick={resetarTimer} variant="outline">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Contadores */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <Label>Flexões</Label>
              <div className="text-2xl font-bold my-2">{flexoes}</div>
              <div className="flex gap-1">
                <Button size="sm" onClick={() => setFlexoes(Math.max(0, flexoes - 1))}>-</Button>
                <Button size="sm" onClick={() => setFlexoes(flexoes + 1)}>+</Button>
              </div>
              {metasAtivas && (
                <div className="text-xs mt-1">
                  Meta: {metasAtivas.meta_flexoes}
                </div>
              )}
            </div>

            <div className="text-center">
              <Label>Abdominais</Label>
              <div className="text-2xl font-bold my-2">{abdominais}</div>
              <div className="flex gap-1">
                <Button size="sm" onClick={() => setAbdominais(Math.max(0, abdominais - 1))}>-</Button>
                <Button size="sm" onClick={() => setAbdominais(abdominais + 1)}>+</Button>
              </div>
              {metasAtivas && (
                <div className="text-xs mt-1">
                  Meta: {metasAtivas.meta_abdominais}
                </div>
              )}
            </div>

            <div className="text-center">
              <Label>Polichinelos</Label>
              <div className="text-2xl font-bold my-2">{polichinelos}</div>
              <div className="flex gap-1">
                <Button size="sm" onClick={() => setPolichinelos(Math.max(0, polichinelos - 1))}>-</Button>
                <Button size="sm" onClick={() => setPolichinelos(polichinelos + 1)}>+</Button>
              </div>
              {metasAtivas && (
                <div className="text-xs mt-1">
                  Meta: {metasAtivas.meta_polichinelos}
                </div>
              )}
            </div>
          </div>

          {/* Resultado */}
          <div className="text-center">
            <Badge variant={aprovado ? "default" : "destructive"} className="text-lg p-2">
              {aprovado ? "APROVADO" : "REPROVADO"}
            </Badge>
          </div>

          {/* Botão Salvar */}
          <Button 
            onClick={salvarAvaliacao} 
            className="w-full" 
            disabled={!bombeiroSelecionado || !avaliadorNome.trim() || criarAvaliacao.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Avaliação
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TAFForm;
