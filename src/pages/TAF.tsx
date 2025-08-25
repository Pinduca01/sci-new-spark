
import { useState } from "react";
import { Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TAFDashboard from "@/components/TAFDashboard";
import TAFForm from "@/components/TAFForm";
import TAFRelatorios from "@/components/TAFRelatorios";
import TAFHistorico from "@/components/TAFHistorico";

const TAF = () => {
  return (
    <div className="space-y-6 p-6 relative z-30">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Activity className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">TAF - Teste de Aptidão Física</h1>
          <p className="text-muted-foreground">
            Controle completo dos testes físicos do efetivo
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="novo-teste">Novo Teste</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <TAFDashboard />
        </TabsContent>

        <TabsContent value="novo-teste" className="mt-6">
          <TAFForm />
        </TabsContent>

        <TabsContent value="historico" className="mt-6">
          <TAFHistorico />
        </TabsContent>

        <TabsContent value="relatorios" className="mt-6">
          <TAFRelatorios />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TAF;
