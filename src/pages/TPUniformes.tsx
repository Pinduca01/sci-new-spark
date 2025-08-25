
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Package } from "lucide-react";

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

      <Card>
        <CardHeader>
          <CardTitle>Trajes de Proteção e Uniformes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <ShieldCheck className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Sistema de TP e Uniformes</p>
            <p className="text-sm mb-6">
              Esta seção permitirá o controle completo de:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
              <div className="space-y-2">
                <h4 className="font-medium">Trajes de Proteção:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Roupas de aproximação</li>
                  <li>• Equipamentos de proteção individual</li>
                  <li>• Capacetes e acessórios</li>
                  <li>• Botas e luvas especiais</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Uniformes:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Uniformes operacionais</li>
                  <li>• Uniformes administrativos</li>
                  <li>• Controle por bombeiro</li>
                  <li>• Histórico de distribuição</li>
                </ul>
              </div>
            </div>
            <div className="mt-8">
              <Button variant="outline" className="mr-4">
                <Package className="w-4 h-4 mr-2" />
                Funcionalidade em desenvolvimento
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TPUniformes;
