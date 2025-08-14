import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar, Users, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import EscalaCalendario from "@/components/EscalaCalendario";
import EscalaIndividual from "@/components/EscalaIndividual";

const Escalas = () => {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedRegime, setSelectedRegime] = useState<string>("");
  const [selectedEquipeInicial, setSelectedEquipeInicial] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<"generator" | "calendar" | "individual">("generator");
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
    const { data, error } = await supabase
      .from('equipes')
      .select('*')
      .eq('ativa', true)
      .order('nome_equipe');

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as equipes",
        variant: "destructive",
      });
      return;
    }

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

      // Encontrar índice da equipe inicial
      const equipeInicialIndex = equipesData.findIndex(e => e.id === selectedEquipeInicial);
      if (equipeInicialIndex === -1) {
        throw new Error("Equipe inicial não encontrada");
      }

      // Gerar escala
      const diasNoMes = new Date(selectedYear, selectedMonth, 0).getDate();
      const escalasToInsert = [];

      for (let dia = 1; dia <= diasNoMes; dia++) {
        const equipeIndex = (equipeInicialIndex + (dia - 1)) % equipesData.length;
        const equipe = equipesData[equipeIndex];
        
        escalasToInsert.push({
          data: new Date(selectedYear, selectedMonth - 1, dia).toISOString().split('T')[0],
          equipe_id: equipe.id,
          mes_referencia: selectedMonth,
          ano_referencia: selectedYear,
          regime_plantao: selectedRegime,
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
  useState(() => {
    loadEquipes();
  });

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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Gerenciamento de Escalas</h1>
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

          <Button 
            onClick={generateEscala} 
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