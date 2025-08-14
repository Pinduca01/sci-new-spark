import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Users, FileText, Download } from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

  const exportarPDF = async () => {
    const element = document.getElementById('calendario-escala');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4'); // landscape
      
      const imgWidth = 297; // A4 width in mm (landscape)
      const pageHeight = 210; // A4 height in mm (landscape)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Adicionar título
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Escala de ${meses[mes - 1]} de ${ano}`, 148.5, 20, { align: 'center' });
      
      position = 30;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Escala_${meses[mes - 1]}_${ano}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack} className="hover-scale">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Calendar className="h-8 w-8 text-primary animate-pulse" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Escala de {meses[mes - 1]} de {ano}
          </h1>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportarPDF} className="hover-scale">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button onClick={onViewIndividual} className="hover-scale bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
            <Users className="h-4 w-4 mr-2" />
            Ver Escala Individual
          </Button>
        </div>
      </div>

      <Card className="shadow-lg border-0 bg-gradient-to-br from-background to-background/80" id="calendario-escala">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
          <CardTitle className="text-center text-2xl font-bold">
            Calendário de Escalas - {meses[mes - 1]} {ano}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-3 mb-6">
            {["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"].map((dia, index) => (
              <div key={dia} className={`p-4 text-center font-bold text-lg rounded-lg ${
                index === 0 || index === 6 ? 'bg-primary/10 text-primary' : 'bg-muted/50'
              }`}>
                {dia}
              </div>
            ))}
          </div>

          {/* Grid do calendário */}
          <div className="grid grid-cols-7 gap-3">
            {celulasCalendario.map((celula, index) => (
              <div
                key={index}
                className={`
                  aspect-square p-3 border-2 rounded-xl flex flex-col items-center justify-center text-sm transition-all duration-300
                  ${celula ? "bg-white hover:bg-accent/20 hover:scale-105 hover:shadow-lg border-border/50 hover:border-primary/30" : "border-transparent"}
                `}
              >
                {celula && (
                  <>
                    <div className="font-bold text-lg mb-2 text-foreground">{celula.dia}</div>
                    {celula.escala && (
                      <div
                        className="px-3 py-2 rounded-lg text-xs font-bold text-white text-center w-full shadow-md transition-transform hover:scale-105"
                        style={{ 
                          backgroundColor: celula.escala.equipes.cor_identificacao,
                          boxShadow: `0 4px 12px ${celula.escala.equipes.cor_identificacao}40`
                        }}
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
      <Card className="shadow-lg border-0 bg-gradient-to-br from-background to-background/80 animate-scale-in">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-primary to-primary/70"></div>
            Legenda das Equipes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <div key={equipe.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all hover-scale">
                  <div
                    className="w-6 h-6 rounded-full shadow-md"
                    style={{ 
                      backgroundColor: equipe.cor,
                      boxShadow: `0 2px 8px ${equipe.cor}40`
                    }}
                  />
                  <span className="font-semibold text-foreground">{equipe.nome}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EscalaCalendario;