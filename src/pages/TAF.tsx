
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TAF = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Teste de Aptidão Física (TAF)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Página em desenvolvimento para gerenciamento dos Testes de Aptidão Física.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TAF;
