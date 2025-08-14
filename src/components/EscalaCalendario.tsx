import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Users, FileText, Download } from "lucide-react";

interface EscalaCalendarioProps {
  escalas: any[];
  mes: number;
  ano: number;
  onBack: () => void;
  onViewIndividual: () => void;
  onReload: () => void;
}

const EscalaCalendario = ({ escalas, mes, ano, onBack, onViewIndividual, onReload }: EscalaCalendarioProps) => {
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const diasNoMes = new Date(ano, mes, 0).getDate();
  const primeiroDia = new Date(ano, mes - 1, 1).getDay();
  
  // Criar array de células do calendário
  const celulasCalendario = [];
  
  // Adicionar células vazias para os dias antes do primeiro dia do mês
  for (let i = 0; i < primeiroDia; i++) {
    celulasCalendario.push(null);
  }
  
  // Adicionar células para cada dia do mês
  for (let dia = 1; dia <= diasNoMes; dia++) {
    const escalaData = escalas.find(e => new Date(e.data).getDate() === dia);
    celulasCalendario.push({
      dia,
      escala: escalaData
    });
  }

  const exportarPDF = () => {
    // Implementar exportação para PDF
    console.log("Exportar para PDF");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Calendar className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">
            Escala de {meses[mes - 1]} de {ano}
          </h1>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportarPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button onClick={onViewIndividual}>
            <Users className="h-4 w-4 mr-2" />
            Ver Escala Individual
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">Calendário de Escalas</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => (
              <div key={dia} className="p-3 text-center font-semibold text-muted-foreground">
                {dia}
              </div>
            ))}
          </div>

          {/* Grid do calendário */}
          <div className="grid grid-cols-7 gap-2">
            {celulasCalendario.map((celula, index) => (
              <div
                key={index}
                className={`
                  aspect-square p-2 border rounded-lg flex flex-col items-center justify-center text-sm
                  ${celula ? "bg-background hover:bg-accent/50 transition-colors" : ""}
                `}
              >
                {celula && (
                  <>
                    <div className="font-semibold mb-1">{celula.dia}</div>
                    {celula.escala && (
                      <div
                        className="px-2 py-1 rounded text-xs font-medium text-white text-center w-full"
                        style={{ backgroundColor: celula.escala.equipes.cor_identificacao }}
                      >
                        {celula.escala.equipes.nome_equipe}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legenda das cores das equipes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legenda das Equipes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {escalas
              .reduce((uniqueEquipes, escala) => {
                if (!uniqueEquipes.find(e => e.id === escala.equipes.id)) {
                  uniqueEquipes.push({
                    id: escala.equipes.id,
                    nome: escala.equipes.nome_equipe,
                    cor: escala.equipes.cor_identificacao
                  });
                }
                return uniqueEquipes;
              }, [] as any[])
              .map((equipe) => (
                <div key={equipe.id} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: equipe.cor }}
                  />
                  <span className="text-sm font-medium">{equipe.nome}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EscalaCalendario;