
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExtintoresDashboard } from '@/components/ExtintoresDashboard';

const AtividadesAcessorias = () => {
  return (
    <div className="min-h-screen abstract-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Atividades Acessórias
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestão de atividades complementares e acessórias
            </p>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <Tabs defaultValue="extintores" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="extintores">Inspeção de Extintores</TabsTrigger>
          </TabsList>

          <TabsContent value="extintores" className="space-y-6">
            <ExtintoresDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AtividadesAcessorias;
