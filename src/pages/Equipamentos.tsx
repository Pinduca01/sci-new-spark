
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
  Beaker
} from "lucide-react";
import { EstoqueDashboard } from "@/components/EstoqueDashboard";
import { MaterialForm } from "@/components/MaterialForm";
import { MovimentacaoForm } from "@/components/MovimentacaoForm";
import { ChecklistAlmoxarifadoForm } from "@/components/ChecklistAlmoxarifadoForm";
import { HistoricoChecklists } from "@/components/HistoricoChecklists";
import { HistoricoOS } from "@/components/HistoricoOS";
import { AgentesExtintoresDashboard } from "@/components/AgentesExtintoresDashboard";
import { RelatorioEquipamentosGenerator } from "@/components/RelatorioEquipamentosGenerator";

const Equipamentos = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipamentos</h1>
          <p className="text-muted-foreground">
            Gerencie seus equipamentos de forma eficiente
          </p>
        </div>
        <RelatorioEquipamentosGenerator />
      </div>

      <Tabs defaultValue="estoque" className="space-y-4">
        <TabsList>
          <TabsTrigger value="estoque">
            <Archive className="w-4 h-4 mr-2" />
            Estoque
          </TabsTrigger>
          <TabsTrigger value="movimentacao">
            <Truck className="w-4 h-4 mr-2" />
            Movimentação
          </TabsTrigger>
          <TabsTrigger value="validacao">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Validação
          </TabsTrigger>
          <TabsTrigger value="almoxarifado">
            <Package className="w-4 h-4 mr-2" />
            Almoxarifado
          </TabsTrigger>
          <TabsTrigger value="agentes-extintores">
            <Beaker className="w-4 h-4 mr-2" />
            Agentes Extintores
          </TabsTrigger>
        </TabsList>
        <TabsContent value="estoque" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gerenciar Materiais</CardTitle>
                  <CardDescription>Cadastre novos materiais e visualize o estoque atual.</CardDescription>
                </div>
                <MaterialForm />
              </div>
            </CardHeader>
            <CardContent>
              <EstoqueDashboard />
            </CardContent>
          </Card>
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
        <TabsContent value="validacao">
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Validação</CardTitle>
              <CardDescription>
                Verifique os materiais que precisam de validação ou estão com
                problemas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription>
                  Nenhum material necessitando validação no momento.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="almoxarifado">
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
        </TabsContent>
        <TabsContent value="agentes-extintores">
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
    </div>
  );
};

export default Equipamentos;
