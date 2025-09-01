
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
import TAFEvolucao from '@/components/TAFEvolucao';

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
        <div className="bg-muted rounded-lg p-1.5 mb-6">
          <div className="grid w-full grid-cols-4 gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'dashboard'
                  ? 'bg-background text-foreground shadow-sm border border-border/50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('novo')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'novo'
                  ? 'bg-background text-foreground shadow-sm border border-border/50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo TAF</span>
            </button>
            <button
              onClick={() => setActiveTab('historico')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'historico'
                  ? 'bg-background text-foreground shadow-sm border border-border/50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Histórico</span>
            </button>
            <button
              onClick={() => setActiveTab('evolucao')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'evolucao'
                  ? 'bg-background text-foreground shadow-sm border border-border/50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Evolução</span>
            </button>
          </div>
        </div>

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
          <TAFEvolucao />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TAF;
