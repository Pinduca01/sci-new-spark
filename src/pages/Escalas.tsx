import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar, Users, FileText, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import EscalaCalendario from "@/components/EscalaCalendario";
import EscalaIndividual from "@/components/EscalaIndividual";
import GerenciadorFerias from "@/components/GerenciadorFerias";
import TrocasPlantoesGestao from "@/components/TrocasPlantoesGestao";

const Escalas = () => {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedRegime, setSelectedRegime] = useState<string>("");
  const [selectedEquipeInicial, setSelectedEquipeInicial] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<"generator" | "calendar" | "individual" | "ferias" | "trocas">("generator");
  const [escalas, setEscalas] = useState<any[]>([]);
  const [equipes, setEquipes] = useState<any[]>([]);

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);

  const regimesPlantao = [
    { value: "12x36", label: "12h x 36h" },
    { value: "24x72", label: "24h x 72h" },
    { value: "24x48", label: "24h x 48h" }
  ];

  const loadEquipes = async () => {
    console.log('Loading equipes...');
    const { data, error } = await supabase
      .from('equipes')
      .select('*')
      .eq('ativa', true)
      .order('nome_equipe');

    if (error) {
      console.error('Error loading equipes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as equipes",
        variant: "destructive",
      });
      return;
    }

    console.log('Equipes loaded:', data);
    setEquipes(data || []);
  };

  const generateEscala = async () => {
    if (!selectedRegime || !selectedEquipeInicial) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Limpar escalas existentes para o mês/ano
      await supabase
        .from('escalas_geradas')
        .delete()
        .eq('mes_referencia', selectedMonth)
        .eq('ano_referencia', selectedYear);

      // Buscar equipes ordenadas
      const { data: equipesData } = await supabase
        .from('equipes')
        .select('*')
        .eq('ativa', true)
        .order('nome_equipe');

      if (!equipesData || equipesData.length === 0) {
        throw new Error("Nenhuma equipe encontrada");
      }

      // Buscar períodos de férias e feristas para o mês
      const { data: periodosFerias } = await supabase
        .from('periodos_ferias')
        .select(`
          *,
          bombeiros(id, nome, equipe_id)
        `)
        .eq('mes_referencia', selectedMonth)
        .eq('ano_referencia', selectedYear);

      const { data: feristaEscalas } = await supabase
        .from('feristas_escalas')
        .select(`
          *,
          bombeiro_ferista:bombeiros!bombeiro_ferista_id(id, nome, equipe_id),
          bombeiro_substituido:bombeiros!bombeiro_substituido_id(id, nome, equipe_id)
        `)
        .eq('mes_referencia', selectedMonth)
        .eq('ano_referencia', selectedYear);

      // Encontrar índice da equipe inicial
      const equipeInicialIndex = equipesData.findIndex(e => e.id === selectedEquipeInicial);
      if (equipeInicialIndex === -1) {
        throw new Error("Equipe inicial não encontrada");
      }

      // Gerar escala considerando férias e feristas
      const diasNoMes = new Date(selectedYear, selectedMonth, 0).getDate();
      const escalasToInsert = [];

      for (let dia = 1; dia <= diasNoMes; dia++) {
        const dataAtual = new Date(selectedYear, selectedMonth - 1, dia);
        const dataString = dataAtual.toISOString().split('T')[0];
        
        // Verificar se há bombeiros de férias neste dia
        const bombeirosDeFerias = periodosFerias?.filter(periodo => {
          const inicioFerias = new Date(periodo.data_inicio);
          const fimFerias = new Date(periodo.data_fim);
          return dataAtual >= inicioFerias && dataAtual <= fimFerias;
        }) || [];

        // Determinar qual equipe está de plantão (rotação normal)
        const equipeIndex = (equipeInicialIndex + (dia - 1)) % equipesData.length;
        let equipeDoPlantao = equipesData[equipeIndex];

        // Verificar se há feristas substituindo membros desta equipe
        const feristasSubstituindo = feristaEscalas?.filter(ferista => 
          ferista.equipe_atual_id === equipeDoPlantao.id
        ) || [];
        escalasToInsert.push({
          data: dataString,
          equipe_id: equipeDoPlantao.id,
          mes_referencia: selectedMonth,
          ano_referencia: selectedYear,
          regime_plantao: selectedRegime,
          observacoes: feristasSubstituindo.length > 0 ? 
            `Feristas: ${feristasSubstituindo.map(f => f.bombeiro_ferista?.nome).join(', ')}` : 
            null
        });
      }

      const { error } = await supabase
        .from('escalas_geradas')
        .insert(escalasToInsert);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Escala gerada com sucesso!",
      });

      // Carregar escalas geradas
      loadEscalas();
      setViewMode("calendar");

    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao gerar escala",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const loadEscalas = async () => {
    const { data, error } = await supabase
      .from('escalas_geradas')
      .select(`
        *,
        equipes!inner(nome_equipe, cor_identificacao)
      `)
      .eq('mes_referencia', selectedMonth)
      .eq('ano_referencia', selectedYear)
      .order('data');

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as escalas",
        variant: "destructive",
      });
      return;
    }

    setEscalas(data || []);
  };

  // Carregar equipes ao montar o componente
  useEffect(() => {
    console.log('Escalas useEffect running...');
    loadEquipes();
  }, []);

  if (viewMode === "ferias") {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" onClick={() => setViewMode("generator")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Gerador
          </Button>
          <Calendar className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Gerenciar Férias e Feristas</h1>
        </div>
        <GerenciadorFerias 
          mes={selectedMonth} 
          ano={selectedYear}
          onFeriasChange={() => {
            // Callback para atualizar quando houver mudanças
            console.log("Férias alteradas");
          }}
        />
      </div>
    );
  }

  if (viewMode === "trocas") {
    return <TrocasPlantoesGestao onBack={() => setViewMode("generator")} />;
  }

  if (viewMode === "calendar") {
    return (
      <EscalaCalendario
        escalas={escalas}
        mes={selectedMonth}
        ano={selectedYear}
        onBack={() => setViewMode("generator")}
        onViewIndividual={() => setViewMode("individual")}
        onReload={loadEscalas}
      />
    );
  }

  if (viewMode === "individual") {
    return (
      <EscalaIndividual
        escalas={escalas}
        mes={selectedMonth}
        ano={selectedYear}
        onBack={() => setViewMode("calendar")}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 relative z-30">
      <div className="flex items-center gap-3">
        <Calendar className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Gerenciamento de Escalas</h1>
          <p className="text-sm text-muted-foreground">
            Geração e visualização de escalas de plantão
          </p>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerador de Escala Mensal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mes">Selecione o Mês</Label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {meses.map((mes, index) => (
                    <SelectItem key={index} value={(index + 1).toString()}>
                      {mes}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ano">Selecione o Ano</Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {anos.map((ano) => (
                    <SelectItem key={ano} value={ano.toString()}>
                      {ano}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="regime">Selecione o Regime de Plantão</Label>
            <Select value={selectedRegime} onValueChange={setSelectedRegime}>
              <SelectTrigger>
                <SelectValue placeholder="Regime de plantão" />
              </SelectTrigger>
              <SelectContent>
                {regimesPlantao.map((regime) => (
                  <SelectItem key={regime.value} value={regime.value}>
                    {regime.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipe">Equipe que inicia o plantão no dia 1º</Label>
            <Select value={selectedEquipeInicial} onValueChange={setSelectedEquipeInicial}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a equipe inicial" />
              </SelectTrigger>
              <SelectContent>
                {equipes.map((equipe) => (
                  <SelectItem key={equipe.id} value={equipe.id}>
                    {equipe.nome_equipe}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              onClick={() => {
                console.log('Gerenciar Férias button clicked');
                setViewMode("ferias");
              }}
              className="hover-scale"
            >
              <Users className="h-4 w-4 mr-2" />
              Gerenciar Férias
            </Button>

            <Button 
              variant="outline" 
              onClick={() => {
                console.log('Gerenciar Trocas button clicked');
                setViewMode("trocas");
              }}
              className="hover-scale"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Trocas de Plantão
            </Button>
          </div>

          <Button 
            onClick={() => {
              console.log('Generate Escala button clicked');
              generateEscala();
            }} 
            className="w-full" 
            disabled={isGenerating}
            size="lg"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-current" />
                Gerando Escala...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Gerar Escala
              </div>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Escalas;
