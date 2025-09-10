
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Beaker, 
  BarChart3,
  Package,
  ClipboardCheck,
  TruckIcon,
  FileText,
  AlertTriangle,
  Plus,
  Droplets,
  Flame,
  Wind
} from "lucide-react";
import AgentesExtintoresEstoqueDashboard from "@/components/AgentesExtintoresEstoqueDashboard";
import AgentesExtintoresTable from "@/components/AgentesExtintoresTable";

import AgentesExtintoresMovimentacaoForm from "@/components/AgentesExtintoresMovimentacaoForm";
import AgentesExtintoresRelatoriosSection from "@/components/AgentesExtintoresRelatoriosSection";
import { RelatorioMensalModal } from "@/components/RelatorioMensalModal";
import { useAgentesExtintores } from "@/hooks/useAgentesExtintores";
import { gerarRelatorioPDF } from "@/utils/pdfGenerator";
import { toast } from "sonner";











const AgentesExtintores = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { fetchAgentesPorPeriodo } = useAgentesExtintores();

  const handleGerarRelatorio = async (mes: number, ano: number) => {
    try {
      const agentes = await fetchAgentesPorPeriodo(mes, ano);
      
      if (agentes.length === 0) {
        toast.warning(`Nenhum agente extintor foi cadastrado em ${mes}/${ano}`);
        return;
      }

      gerarRelatorioPDF({ mes, ano, agentes });
      toast.success(`Relatório de ${mes}/${ano} gerado com sucesso!`);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório. Tente novamente.');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agentes Extintores</h1>
          <p className="text-muted-foreground">
            Sistema completo de gestão de agentes extintores - LGE, Pó Químico e Nitrogênio
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsModalOpen(true)}>
            <FileText className="w-4 h-4 mr-2" />
            Relatório Mensal
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid grid-cols-3 lg:grid-cols-3">
          <TabsTrigger value="dashboard">
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="estoque">
            <Package className="w-4 h-4 mr-2" />
            Gestão de Estoque
          </TabsTrigger>
          <TabsTrigger value="movimentacao">
            <TruckIcon className="w-4 h-4 mr-2" />
            Movimentação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <AgentesExtintoresEstoqueDashboard />
        </TabsContent>

        <TabsContent value="estoque" className="space-y-4">
          <AgentesExtintoresTable />
        </TabsContent>



        <TabsContent value="movimentacao" className="space-y-4">
          <AgentesExtintoresMovimentacaoForm />
        </TabsContent>


      </Tabs>

      <RelatorioMensalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={handleGerarRelatorio}
      />
    </div>
  );
};

export default AgentesExtintores;
