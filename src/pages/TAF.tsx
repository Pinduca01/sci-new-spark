
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Plus, 
  History, 
  TrendingUp,
  Users,
  Activity
} from "lucide-react";
import TAFForm from '@/components/TAFForm';
import TAFDashboard from '@/components/TAFDashboard';
import TAFHistorico from '@/components/TAFHistorico';

const TAF = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Teste de Aptidão Física (TAF)
          </CardTitle>
          <p className="text-muted-foreground">
            Sistema completo de controle e gerenciamento dos Testes de Aptidão Física do efetivo
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="novo" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo TAF
          </TabsTrigger>
          <TabsTrigger value="historico" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="evolucao" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Evolução
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <TAFDashboard />
        </TabsContent>

        <TabsContent value="novo">
          <TAFForm />
        </TabsContent>

        <TabsContent value="historico">
          <TAFHistorico />
        </TabsContent>

        <TabsContent value="evolucao" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Evolução Individual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Evolução Individual</h3>
                <p className="text-muted-foreground mb-6">
                  Acompanhe o progresso individual de cada bombeiro ao longo do tempo
                </p>
                <Button variant="outline">
                  <Activity className="w-4 h-4 mr-2" />
                  Em Desenvolvimento
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TAF;
