
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Package, 
  FileText, 
  AlertTriangle, 
  Plus, 
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
        <div className="flex space-x-2">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Gerar Relatório
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Material
          </Button>
        </div>
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
              <CardTitle>Dashboard de Estoque</CardTitle>
              <CardDescription>Visão geral do seu estoque atual.</CardDescription>
            </CardHeader>
            <CardContent>
              <EstoqueDashboard />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Novo Material</CardTitle>
              <CardDescription>
                Formulário para adicionar um novo material ao estoque.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MaterialForm />
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
              <MovimentacaoForm tipo="estoque" />
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
              <HistoricoChecklists tipo="almoxarifado" />
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
              <HistoricoOS tipo="geral" />
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
