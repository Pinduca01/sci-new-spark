import { useState } from "react";
import { Target } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExercicioEPI from "@/components/ExercicioEPI";
import ExercicioTempoResposta from "@/components/ExercicioTempoResposta";
import ExercicioPosicionamento from "@/components/ExercicioPosicionamento";

const Exercicios = () => {
  return (
    <div className="space-y-6 p-6 relative z-30">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Target className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Exercícios</h1>
          <p className="text-muted-foreground">
            Treinamentos e simulações para a equipe SCI
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="epi-epr" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="epi-epr">EPI/EPR</TabsTrigger>
          <TabsTrigger value="tempo-resposta">Tempo Resposta</TabsTrigger>
          <TabsTrigger value="posicionamento">Posicionamento</TabsTrigger>
        </TabsList>

        <TabsContent value="epi-epr" className="mt-6">
          <ExercicioEPI />
        </TabsContent>

        <TabsContent value="tempo-resposta" className="mt-6">
          <ExercicioTempoResposta />
        </TabsContent>

        <TabsContent value="posicionamento" className="mt-6">
          <ExercicioPosicionamento />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Exercicios;