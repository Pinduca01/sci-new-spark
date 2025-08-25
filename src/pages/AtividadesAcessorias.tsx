
import { Card, CardContent } from "@/components/ui/card";

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
        <Card className="glass-card">
          <CardContent className="p-8">
            <div className="text-center text-muted-foreground">
              <p>Esta página será desenvolvida em breve.</p>
              <p className="mt-2">Aguarde as próximas atualizações do sistema.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AtividadesAcessorias;
