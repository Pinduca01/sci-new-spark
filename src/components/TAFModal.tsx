import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Plus, Trash2 } from 'lucide-react';
import { useBombeiros } from '@/hooks/useBombeiros';
import { useTAFMetas } from '@/hooks/useTAFMetas';
import { useTAFAvaliacoes } from '@/hooks/useTAFAvaliacoes';
import { useToast } from '@/hooks/use-toast';

interface TAFModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TAFModal = ({ open, onOpenChange }: TAFModalProps) => {
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
  const [minutos, setMinutos] = useState(0);
  const [segundos, setSegundos] = useState(0);
  
  // Estados para identificação
  const [aeroporto, setAeroporto] = useState('');
  const [dataAvaliacao, setDataAvaliacao] = useState('');
  const [equipe, setEquipe] = useState('');
  
  // Estados para tabela de bombeiros
  const [bombeirosTAF, setBombeirosTAF] = useState<Array<{
    nome: string;
    funcao: string;
    flexoes: string;
    abdominais: string;
    polichinelos: string;
    tempo: string;
    status: string;
  }>>([]);

  const bombeiro = bombeiros.find(b => b.id === selectedBombeiro);
  const idade = bombeiro ? new Date().getFullYear() - new Date(bombeiro.data_admissao).getFullYear() + 25 : 0;
  const meta = getMetaPorIdade(idade);
  const tempoTotalSegundos = minutos * 60 + segundos;

  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBombeiro || !avaliadorNome || tempoTotalSegundos === 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const faixaEtaria = idade < 40 ? 'menor_40' : 'maior_igual_40';
      
      await createAvaliacao.mutateAsync({
        bombeiro_id: selectedBombeiro,
        avaliador_nome: avaliadorNome,
        data_teste: new Date().toISOString().split('T')[0],
        idade_na_data: idade,
        faixa_etaria: faixaEtaria,
        tempo_limite_minutos: meta?.tempo_limite_minutos || 12,
        tempo_total_segundos: tempoTotalSegundos,
        flexoes_realizadas: flexoes,
        abdominais_realizadas: abdominais,
        polichinelos_realizados: polichinelos,
        observacoes: observacoes || null,
        aprovado: calcularAprovacao()
      });

      toast({
        title: "Sucesso!",
        description: "TAF registrado com sucesso"
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
      
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao registrar TAF:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar TAF",
        variant: "destructive"
      });
    }
  };

  const aprovado = calcularAprovacao();

  const adicionarBombeiroTAF = () => {
    setBombeirosTAF([...bombeirosTAF, {
      nome: '',
      funcao: '',
      flexoes: '',
      abdominais: '',
      polichinelos: '',
      tempo: '',
      status: ''
    }]);
  };

  const removerBombeiroTAF = (index: number) => {
    setBombeirosTAF(bombeirosTAF.filter((_, i) => i !== index));
  };

  const atualizarBombeiroTAF = (index: number, campo: string, valor: string) => {
    const novosBombeiros = [...bombeirosTAF];
    novosBombeiros[index] = { ...novosBombeiros[index], [campo]: valor };
    setBombeirosTAF(novosBombeiros);
  };

  const handleBombeiroTAFSelect = (index: number, bombeiroId: string) => {
    const bombeiroSelecionado = bombeiros.find(b => b.id === bombeiroId);
    if (bombeiroSelecionado) {
      atualizarBombeiroTAF(index, 'nome', bombeiroSelecionado.nome);
      atualizarBombeiroTAF(index, 'funcao', bombeiroSelecionado.funcao);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo TAF</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campos de Identificação */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="aeroporto">Identificação do Aeroporto *</Label>
              <Select value={aeroporto} onValueChange={setAeroporto}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o aeroporto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aeroporto1">Aeroporto Internacional de Brasília</SelectItem>
                  <SelectItem value="aeroporto2">Aeroporto de Congonhas</SelectItem>
                  <SelectItem value="aeroporto3">Aeroporto do Galeão</SelectItem>
                  <SelectItem value="aeroporto4">Aeroporto de Guarulhos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="data">Data *</Label>
              <Input
                id="data"
                type="date"
                value={dataAvaliacao}
                onChange={(e) => setDataAvaliacao(e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="equipe">Equipe *</Label>
              <Select value={equipe} onValueChange={setEquipe}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a equipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equipe1">Equipe Alpha</SelectItem>
                  <SelectItem value="equipe2">Equipe Bravo</SelectItem>
                  <SelectItem value="equipe3">Equipe Charlie</SelectItem>
                  <SelectItem value="equipe4">Equipe Delta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
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





          {/* Tabela de Bombeiros */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Tempos dos Bombeiros</h3>
                <Button type="button" onClick={adicionarBombeiroTAF} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Bombeiro
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-gray-300 p-2 text-left">Nome</th>
                      <th className="border border-gray-300 p-2 text-left">Função</th>
                      <th className="border border-gray-300 p-2 text-center">Flexão</th>
                      <th className="border border-gray-300 p-2 text-center">Abdominais</th>
                      <th className="border border-gray-300 p-2 text-center">Polichinelos</th>
                      <th className="border border-gray-300 p-2 text-center">Tempo</th>
                      <th className="border border-gray-300 p-2 text-center">Status</th>
                      <th className="border border-gray-300 p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bombeirosTAF.map((bombeiroTAF, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-1">
                          <Select
                            value={bombeiros.find(b => b.nome === bombeiroTAF.nome)?.id || ""}
                            onValueChange={(value) => handleBombeiroTAFSelect(index, value)}
                          >
                            <SelectTrigger className="border-0 h-8">
                              <SelectValue placeholder="Selecione o bombeiro" />
                            </SelectTrigger>
                            <SelectContent>
                              {bombeiros.map((bombeiroCadastrado) => (
                                <SelectItem key={bombeiroCadastrado.id} value={bombeiroCadastrado.id}>
                                  {bombeiroCadastrado.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiroTAF.funcao}
                            onChange={(e) => atualizarBombeiroTAF(index, 'funcao', e.target.value)}
                            className="border-0 h-8"
                            placeholder="Função"
                          />
                        </td>
                        {/* Flexões */}
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiroTAF.flexoes}
                            onChange={(e) => atualizarBombeiroTAF(index, 'flexoes', e.target.value)}
                            className="border-0 h-8 text-center"
                            placeholder="Quantidade"
                            type="text"
                          />
                        </td>
                        {/* Abdominais */}
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiroTAF.abdominais}
                            onChange={(e) => atualizarBombeiroTAF(index, 'abdominais', e.target.value)}
                            className="border-0 h-8 text-center"
                            placeholder="Quantidade"
                            type="text"
                          />
                        </td>
                        {/* Polichinelos */}
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiroTAF.polichinelos}
                            onChange={(e) => atualizarBombeiroTAF(index, 'polichinelos', e.target.value)}
                            className="border-0 h-8 text-center"
                            placeholder="Quantidade"
                            type="text"
                          />
                        </td>
                        {/* Tempo */}
                        <td className="border border-gray-300 p-1">
                          <Input
                            value={bombeiroTAF.tempo}
                            onChange={(e) => atualizarBombeiroTAF(index, 'tempo', e.target.value)}
                            className="border-0 h-8 text-center"
                            placeholder="MM:SS"
                            type="text"
                          />
                        </td>
                        {/* Status */}
                        <td className="border border-gray-300 p-1">
                          <Select
                            value={bombeiroTAF.status}
                            onValueChange={(value) => atualizarBombeiroTAF(index, 'status', value)}
                          >
                            <SelectTrigger className="border-0 h-8">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="aprovado">Aprovado</SelectItem>
                              <SelectItem value="reprovado">Reprovado</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="border border-gray-300 p-1 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removerBombeiroTAF(index)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

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

          <div className="flex gap-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={createAvaliacao.isPending || !selectedBombeiro || !avaliadorNome || tempoTotalSegundos === 0}
            >
              {createAvaliacao.isPending ? 'Salvando...' : 'Registrar TAF'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TAFModal;