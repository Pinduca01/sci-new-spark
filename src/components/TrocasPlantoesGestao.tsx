
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, BarChart3, Plus, Calendar } from "lucide-react";
import TrocaForm from "@/components/TrocaForm";
import TrocasEstatisticasTable from "@/components/TrocasEstatisticasTable";
import TrocasTable from "@/components/TrocasTable";

interface TrocasPlantoesGestaoProps {
  onBack: () => void;
}

const TrocasPlantoesGestao = ({ onBack }: TrocasPlantoesGestaoProps) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState("estatisticas");

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar às Escalas
        </Button>
        <Users className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Gestão de Trocas de Plantão</h1>
      </div>

      {/* Seletores de período */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Período de Referência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
            <div className="space-y-2">
              <Label>Mês</Label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
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
              <Label>Ano</Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
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
        </CardContent>
      </Card>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="estatisticas" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Estatísticas
          </TabsTrigger>
          <TabsTrigger value="cadastro" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Troca
          </TabsTrigger>
          <TabsTrigger value="listagem" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Gerenciar Trocas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="estatisticas" className="space-y-6">
          <TrocasEstatisticasTable mes={selectedMonth} ano={selectedYear} />
        </TabsContent>

        <TabsContent value="cadastro" className="space-y-6">
          <TrocaForm 
            mes={selectedMonth} 
            ano={selectedYear}
            onSuccess={() => setActiveTab("listagem")}
          />
        </TabsContent>

        <TabsContent value="listagem" className="space-y-6">
          <TrocasTable mes={selectedMonth} ano={selectedYear} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrocasPlantoesGestao;
