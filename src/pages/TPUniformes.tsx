
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, Droplets, Package, BarChart3 } from "lucide-react";
import TPUniformesDashboard from "@/components/TPUniformesDashboard";
import TPVerificacaoForm from "@/components/TPVerificacaoForm";
import TPHigienizacaoForm from "@/components/TPHigienizacaoForm";
import EPIDistribuicaoForm from "@/components/EPIDistribuicaoForm";

const TPUniformes = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">TP e Uniformes</h1>
          <p className="text-muted-foreground">
            Controle completo de trajes de proteção individual e uniformes do efetivo
          </p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="verificacao">
            <ShieldCheck className="w-4 h-4 mr-2" />
            Verificação TP
          </TabsTrigger>
          <TabsTrigger value="higienizacao">
            <Droplets className="w-4 h-4 mr-2" />
            Higienização
          </TabsTrigger>
          <TabsTrigger value="distribuicao">
            <Package className="w-4 h-4 mr-2" />
            Distribuição EPIs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard de TP e Uniformes</CardTitle>
            </CardHeader>
            <CardContent>
              <TPUniformesDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verificacao" className="space-y-4">
          <TPVerificacaoForm />
          
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Verificações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Funcionalidade de histórico em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="higienizacao" className="space-y-4">
          <TPHigienizacaoForm />
          
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Higienizações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Funcionalidade de histórico em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribuicao" className="space-y-4">
          <EPIDistribuicaoForm />
          
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Distribuições</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Funcionalidade de histórico em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TPUniformes;
