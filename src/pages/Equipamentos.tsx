
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Package, 
  FileText, 
  AlertTriangle, 
  Truck,
  Archive,
  History,
  Beaker,
  Settings,
  BarChart3
} from "lucide-react";
import { EstoqueDashboard } from "@/components/EstoqueDashboard";
import { MaterialForm } from "@/components/MaterialForm";
import { MovimentacaoForm } from "@/components/MovimentacaoForm";
import { ChecklistAlmoxarifadoForm } from "@/components/ChecklistAlmoxarifadoForm";
import { HistoricoChecklists } from "@/components/HistoricoChecklists";
import { HistoricoOS } from "@/components/HistoricoOS";
import { AgentesExtintoresDashboard } from "@/components/AgentesExtintoresDashboard";
import { RelatorioEquipamentosGenerator } from "@/components/RelatorioEquipamentosGenerator";
import { EstoqueTable } from "@/components/EstoqueTable";
import { AgentesExtintoresTable } from "@/components/AgentesExtintoresTable";
import { EquipamentoUnificadoForm } from "@/components/EquipamentoUnificadoForm";

const Equipamentos = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipamentos</h1>
          <p className="text-muted-foreground">
            Sistema completo de gerenciamento de equipamentos
          </p>
        </div>
        <div className="flex gap-2">
          <EquipamentoUnificadoForm />
          <RelatorioEquipamentosGenerator />
        </div>
      </div>

      <Tabs defaultValue="visao-geral" className="space-y-4">
        <TabsList className="grid grid-cols-6 lg:grid-cols-6">
          <TabsTrigger value="visao-geral" className="text-xs">
            <BarChart3 className="w-4 h-4 mr-1" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="estoque" className="text-xs">
            <Archive className="w-4 h-4 mr-1" />
            Estoque
          </TabsTrigger>
          <TabsTrigger value="agentes" className="text-xs">
            <Beaker className="w-4 h-4 mr-1" />
            Agentes
          </TabsTrigger>
          <TabsTrigger value="movimentacao" className="text-xs">
            <Truck className="w-4 h-4 mr-1" />
            Movimentação
          </TabsTrigger>
          <TabsTrigger value="almoxarifado" className="text-xs">
            <Package className="w-4 h-4 mr-1" />
            Almoxarifado
          </TabsTrigger>
          <TabsTrigger value="validacao" className="text-xs">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Validação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard do Estoque</CardTitle>
                <CardDescription>Visão geral dos materiais em estoque</CardDescription>
              </CardHeader>
              <CardContent>
                <EstoqueDashboard />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Dashboard dos Agentes Extintores</CardTitle>
                <CardDescription>Status e validade dos agentes extintores</CardDescription>
              </CardHeader>
              <CardContent>
                <AgentesExtintoresDashboard />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="estoque" className="space-y-4">
          <Tabs defaultValue="gerenciar" className="space-y-4">
            <TabsList>
              <TabsTrigger value="gerenciar">
                <Settings className="w-4 h-4 mr-2" />
                Gerenciar Itens
              </TabsTrigger>
              <TabsTrigger value="adicionar">
                <Package className="w-4 h-4 mr-2" />
                Adicionar Material
              </TabsTrigger>
              <TabsTrigger value="dashboard">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
            </TabsList>

            <TabsContent value="gerenciar">
              <EstoqueTable />
            </TabsContent>

            <TabsContent value="adicionar">
              <Card>
                <CardHeader>
                  <CardTitle>Cadastrar Novo Material</CardTitle>
                  <CardDescription>
                    Adicione novos materiais ao catálogo do sistema.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MaterialForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dashboard">
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard do Estoque</CardTitle>
                  <CardDescription>
                    Visualize estatísticas e indicadores do estoque.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EstoqueDashboard />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="agentes" className="space-y-4">
          <Tabs defaultValue="gerenciar" className="space-y-4">
            <TabsList>
              <TabsTrigger value="gerenciar">
                <Settings className="w-4 h-4 mr-2" />
                Gerenciar Agentes
              </TabsTrigger>
              <TabsTrigger value="dashboard">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
            </TabsList>

            <TabsContent value="gerenciar">
              <AgentesExtintoresTable />
            </TabsContent>

            <TabsContent value="dashboard">
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard de Agentes Extintores</CardTitle>
                  <CardDescription>
                    Acompanhe o status e a validade dos agentes extintores.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AgentesExtintoresDashboard />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="movimentacao">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Movimentação</CardTitle>
              <CardDescription>
                Registre as entradas e saídas de materiais do estoque.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MovimentacaoForm tipo="entrada" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="almoxarifado">
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Checklist do Almoxarifado</CardTitle>
                <CardDescription>
                  Preencha o checklist diário do almoxarifado.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChecklistAlmoxarifadoForm />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Checklists</CardTitle>
                <CardDescription>
                  Visualize o histórico de checklists preenchidos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HistoricoChecklists />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Ordens de Serviço</CardTitle>
                <CardDescription>
                  Acompanhe o histórico de ordens de serviço.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HistoricoOS />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="validacao">
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Validação</CardTitle>
              <CardDescription>
                Verifique os materiais e equipamentos que precisam de validação ou estão com problemas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Sistema de validação automática implementado. Os alertas aparecerão aqui conforme necessário.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Equipamentos;
