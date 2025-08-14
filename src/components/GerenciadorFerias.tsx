import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2, Users, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface GerenciadorFeriasProps {
  mes: number;
  ano: number;
  onFeriasChange: () => void;
}

const GerenciadorFerias = ({ mes, ano, onFeriasChange }: GerenciadorFeriasProps) => {
  const [bombeiros, setBombeiros] = useState<any[]>([]);
  const [feristas, setFeristas] = useState<any[]>([]);
  const [periodosFerias, setPeriodosFerias] = useState<any[]>([]);
  const [feristasSelecionados, setFeristasSelecionados] = useState<any[]>([]);
  
  // Estados para novo período de férias
  const [novoFeriasBombeiro, setNovoFeriasBombeiro] = useState("");
  const [dataInicioFerias, setDataInicioFerias] = useState<Date>();
  const [dataFimFerias, setDataFimFerias] = useState<Date>();
  
  // Estados para ferista substituto
  const [novoFeristaBombeiro, setNovoFeristaBombeiro] = useState("");
  const [bombeiroSubstituido, setBombeiroSubstituido] = useState("");

  useEffect(() => {
    loadBombeiros();
    loadFeristas();
    loadPeriodosFerias();
  }, [mes, ano]);

  const loadBombeiros = async () => {
    const { data, error } = await supabase
      .from('bombeiros')
      .select(`
        *,
        equipes(nome_equipe, cor_identificacao)
      `)
      .eq('status', 'ativo')
      .neq('funcao', 'ferista')
      .order('nome');

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os bombeiros",
        variant: "destructive",
      });
      return;
    }

    setBombeiros(data || []);
  };

  const loadFeristas = async () => {
    const { data, error } = await supabase
      .from('bombeiros')
      .select(`
        *,
        equipes(nome_equipe, cor_identificacao)
      `)
      .eq('status', 'ativo')
      .eq('funcao', 'ferista')
      .order('nome');

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os feristas",
        variant: "destructive",
      });
      return;
    }

    setFeristas(data || []);
  };

  const loadPeriodosFerias = async () => {
    const { data, error } = await supabase
      .from('periodos_ferias')
      .select(`
        *,
        bombeiros(nome, equipes(nome_equipe))
      `)
      .eq('mes_referencia', mes)
      .eq('ano_referencia', ano)
      .order('data_inicio');

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os períodos de férias",
        variant: "destructive",
      });
      return;
    }

    setPeriodosFerias(data || []);
  };

  const adicionarPeriodoFerias = async () => {
    if (!novoFeriasBombeiro || !dataInicioFerias || !dataFimFerias) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos para adicionar período de férias",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('periodos_ferias')
      .insert({
        bombeiro_id: novoFeriasBombeiro,
        data_inicio: format(dataInicioFerias, 'yyyy-MM-dd'),
        data_fim: format(dataFimFerias, 'yyyy-MM-dd'),
        mes_referencia: mes,
        ano_referencia: ano,
      });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar período de férias",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Período de férias adicionado com sucesso",
    });

    // Limpar campos
    setNovoFeriasBombeiro("");
    setDataInicioFerias(undefined);
    setDataFimFerias(undefined);

    // Recarregar dados
    loadPeriodosFerias();
    onFeriasChange();
  };

  const removerPeriodoFerias = async (id: string) => {
    const { error } = await supabase
      .from('periodos_ferias')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover período de férias",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Período de férias removido com sucesso",
    });

    loadPeriodosFerias();
    onFeriasChange();
  };

  const adicionarFeristaSubstituto = async () => {
    if (!novoFeristaBombeiro || !bombeiroSubstituido) {
      toast({
        title: "Erro",
        description: "Selecione o ferista e o bombeiro a ser substituído",
        variant: "destructive",
      });
      return;
    }

    // Buscar equipe do bombeiro substituído
    const bombeiroInfo = bombeiros.find(b => b.id === bombeiroSubstituido);
    if (!bombeiroInfo) {
      toast({
        title: "Erro",
        description: "Bombeiro não encontrado",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('feristas_escalas')
      .insert({
        bombeiro_ferista_id: novoFeristaBombeiro,
        bombeiro_substituido_id: bombeiroSubstituido,
        mes_referencia: mes,
        ano_referencia: ano,
        equipe_atual_id: bombeiroInfo.equipe_id,
      });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar ferista substituto",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Ferista substituto adicionado com sucesso",
    });

    // Limpar campos
    setNovoFeristaBombeiro("");
    setBombeiroSubstituido("");

    // Adicionar à lista local
    const feristaSelecionado = feristas.find(f => f.id === novoFeristaBombeiro);
    if (feristaSelecionado) {
      setFeristasSelecionados([...feristasSelecionados, {
        ferista: feristaSelecionado,
        substituindo: bombeiroInfo
      }]);
    }

    onFeriasChange();
  };

  return (
    <div className="space-y-6">
      {/* Gerenciar Períodos de Férias */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-background to-background/80">
        <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/5 rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            Gerenciar Períodos de Férias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Bombeiro</Label>
              <Select value={novoFeriasBombeiro} onValueChange={setNovoFeriasBombeiro}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o bombeiro" />
                </SelectTrigger>
                <SelectContent>
                  {bombeiros.map((bombeiro) => (
                    <SelectItem key={bombeiro.id} value={bombeiro.id}>
                      {bombeiro.nome} - {bombeiro.equipes?.nome_equipe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data de Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataInicioFerias && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataInicioFerias ? format(dataInicioFerias, "dd/MM/yyyy") : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataInicioFerias}
                    onSelect={setDataInicioFerias}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data de Fim</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataFimFerias && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataFimFerias ? format(dataFimFerias, "dd/MM/yyyy") : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataFimFerias}
                    onSelect={setDataFimFerias}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button onClick={adicionarPeriodoFerias} className="w-full bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Período de Férias
          </Button>

          {/* Lista de períodos de férias */}
          {periodosFerias.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Períodos de Férias Cadastrados:</h4>
              {periodosFerias.map((periodo) => (
                <div key={periodo.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm">
                    <strong>{periodo.bombeiros.nome}</strong> - {periodo.bombeiros.equipes?.nome_equipe}
                    <br />
                    <span className="text-muted-foreground">
                      {format(new Date(periodo.data_inicio), "dd/MM/yyyy")} até {format(new Date(periodo.data_fim), "dd/MM/yyyy")}
                    </span>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removerPeriodoFerias(periodo.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gerenciar Feristas Substitutos */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-background to-background/80">
        <CardHeader className="bg-gradient-to-r from-green-500/10 to-green-600/5 rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Gerenciar Feristas Substitutos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ferista Disponível (Função: Ferista)</Label>
              <Select value={novoFeristaBombeiro} onValueChange={setNovoFeristaBombeiro}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione ferista (função ferista)" />
                </SelectTrigger>
                <SelectContent>
                  {feristas.length > 0 ? (
                    feristas.map((ferista) => (
                      <SelectItem key={ferista.id} value={ferista.id}>
                        {ferista.nome} - {ferista.equipes?.nome_equipe} (Ferista)
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      Nenhum ferista encontrado
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Substituir Bombeiro</Label>
              <Select value={bombeiroSubstituido} onValueChange={setBombeiroSubstituido}>
                <SelectTrigger>
                  <SelectValue placeholder="Bombeiro a ser substituído" />
                </SelectTrigger>
                <SelectContent>
                  {periodosFerias.map((periodo) => (
                    <SelectItem key={periodo.bombeiro_id} value={periodo.bombeiro_id}>
                      {periodo.bombeiros.nome} - {periodo.bombeiros.equipes?.nome_equipe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={adicionarFeristaSubstituto} className="w-full bg-green-600 hover:bg-green-700">
            <UserCheck className="h-4 w-4 mr-2" />
            Adicionar Ferista Substituto
          </Button>

          {/* Lista de feristas selecionados */}
          {feristasSelecionados.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Feristas Selecionados para Substituição:</h4>
              {feristasSelecionados.map((item, index) => (
                <div key={index} className="p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm">
                    <strong>{item.ferista.nome}</strong> (Ferista) substituindo <strong>{item.substituindo.nome}</strong>
                    <br />
                    <span className="text-muted-foreground">
                      Equipe de destino: {item.substituindo.equipes?.nome_equipe}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Aviso se não há feristas disponíveis */}
          {feristas.length === 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Aviso:</strong> Não há bombeiros cadastrados com a função "ferista". 
                Para adicionar feristas, vá ao módulo de Controle de Pessoal e cadastre bombeiros com a função "ferista".
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GerenciadorFerias;