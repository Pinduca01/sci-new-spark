import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Download, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface EscalaIndividualProps {
  escalas: any[];
  mes: number;
  ano: number;
  onBack: () => void;
}

const EscalaIndividual = ({ escalas, mes, ano, onBack }: EscalaIndividualProps) => {
  const [bombeiros, setBombeiros] = useState<any[]>([]);
  const [feristaEscalas, setFeristaEscalas] = useState<any[]>([]);
  const [periodosFerias, setPeriodosFerias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const loadBombeiros = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bombeiros')
        .select(`
          *,
          equipes!inner(nome_equipe, cor_identificacao)
        `)
        .eq('status', 'ativo')
        .order('nome');

      if (error) throw error;

      setBombeiros(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os bombeiros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFeristaEscalas = async () => {
    try {
      const { data, error } = await supabase
        .from('feristas_escalas')
        .select(`
          *,
          bombeiro_ferista:bombeiros!bombeiro_ferista_id(id, nome, funcao, equipes(nome_equipe, cor_identificacao)),
          bombeiro_substituido:bombeiros!bombeiro_substituido_id(id, nome, equipes(nome_equipe, cor_identificacao))
        `)
        .eq('mes_referencia', mes)
        .eq('ano_referencia', ano);

      if (error) throw error;

      setFeristaEscalas(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar ferista escalas:', error);
    }
  };

  const loadPeriodosFerias = async () => {
    try {
      const { data, error } = await supabase
        .from('periodos_ferias')
        .select(`
          *,
          bombeiros(id, nome, equipe_id)
        `)
        .eq('mes_referencia', mes)
        .eq('ano_referencia', ano);

      if (error) throw error;

      setPeriodosFerias(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar períodos de férias:', error);
    }
  };

  useEffect(() => {
    loadBombeiros();
    loadFeristaEscalas();
    loadPeriodosFerias();
  }, [mes, ano]);

  const diasNoMes = new Date(ano, mes, 0).getDate();
  const diasArray = Array.from({ length: diasNoMes }, (_, i) => i + 1);

  // Incluir feristas na lista de bombeiros para visualização
  const bombeirosPorEquipeCompleta = [...bombeiros];
  
  // Adicionar feristas às suas equipes de destino
  feristaEscalas.forEach(feristaEscala => {
    if (feristaEscala.bombeiro_ferista && !bombeirosPorEquipeCompleta.find(b => b.id === feristaEscala.bombeiro_ferista.id)) {
      bombeirosPorEquipeCompleta.push({
        ...feristaEscala.bombeiro_ferista,
        equipe_id: feristaEscala.equipe_atual_id,
        equipes: feristaEscala.bombeiro_ferista.equipes
      });
    }
  });

  // Agrupar bombeiros por equipe
  const bombeirosPorEquipe = bombeirosPorEquipeCompleta.reduce((grupos, bombeiro) => {
    const nomeEquipe = bombeiro.equipes?.nome_equipe || 'Sem Equipe';
    if (!grupos[nomeEquipe]) {
      grupos[nomeEquipe] = [];
    }
    grupos[nomeEquipe].push(bombeiro);
    return grupos;
  }, {} as Record<string, any[]>);

  const verificarPlantao = (bombeiroId: string, bombeiroEquipeId: string, dia: number) => {
    const dataAtual = new Date(ano, mes - 1, dia);
    
    // Verificar se o bombeiro está de férias neste dia
    const estaDeFerias = periodosFerias.some(periodo => {
      const inicioFerias = new Date(periodo.data_inicio);
      const fimFerias = new Date(periodo.data_fim);
      return periodo.bombeiro_id === bombeiroId && 
             dataAtual >= inicioFerias && 
             dataAtual <= fimFerias;
    });
    
    // Se está de férias, não marca plantão para ele
    if (estaDeFerias) {
      return null;
    }
    
    // Verificar se há escala para esta equipe neste dia
    const escalaData = escalas.find(e => {
      const dataEscala = new Date(e.data);
      return dataEscala.getDate() === dia && e.equipe_id === bombeiroEquipeId;
    });
    
    return escalaData;
  };

  const verificarFeristaSubstituto = (bombeiroEquipeId: string, dia: number) => {
    const dataAtual = new Date(ano, mes - 1, dia);
    
    // Verificar se há ferista atuando nesta equipe neste dia
    const feristaAtivo = feristaEscalas.find(ferista => {
      // Verificar se o ferista está substituindo alguém desta equipe
      if (ferista.equipe_atual_id !== bombeiroEquipeId) return false;
      
      // Verificar se a pessoa que ele está substituindo está realmente de férias neste dia
      const pessoaSubstituida = periodosFerias.find(periodo => {
        const inicioFerias = new Date(periodo.data_inicio);
        const fimFerias = new Date(periodo.data_fim);
        return periodo.bombeiro_id === ferista.bombeiro_substituido_id &&
               dataAtual >= inicioFerias && 
               dataAtual <= fimFerias;
      });
      
      return !!pessoaSubstituida;
    });
    
    if (feristaAtivo) {
      // Verificar se há escala para esta equipe neste dia
      const escalaData = escalas.find(e => {
        const dataEscala = new Date(e.data);
        return dataEscala.getDate() === dia && e.equipe_id === bombeiroEquipeId;
      });
      
      if (escalaData) {
        return {
          escala: escalaData,
          ferista: feristaAtivo.bombeiro_ferista,
          substituindo: feristaAtivo.bombeiro_substituido?.nome
        };
      }
    }
    
    return null;
  };

  const exportarRelatorio = async () => {
    const element = document.getElementById('escala-individual');
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
      pdf.text(`Escala Individual - ${meses[mes - 1]} de ${ano}`, 148.5, 20, { align: 'center' });
      
      position = 30;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Escala_Individual_${meses[mes - 1]}_${ano}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Carregando bombeiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack} className="hover-scale">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Calendário
          </Button>
          <Users className="h-8 w-8 text-primary animate-pulse" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Escala Individual - {meses[mes - 1]} de {ano}
          </h1>
        </div>
        
        <Button variant="outline" onClick={exportarRelatorio} className="hover-scale bg-gradient-to-r from-green-500 to-green-600 text-white border-0 hover:from-green-600 hover:to-green-700">
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      <div id="escala-individual" className="space-y-6">
        {Object.entries(bombeirosPorEquipe).map(([nomeEquipe, membros]) => (
          <Card key={nomeEquipe} className="shadow-lg border-0 bg-gradient-to-br from-background to-background/80 animate-scale-in">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div
                  className="w-6 h-6 rounded-full shadow-md"
                  style={{ 
                    backgroundColor: (membros as any[])[0]?.equipes?.cor_identificacao || '#gray',
                    boxShadow: `0 2px 8px ${(membros as any[])[0]?.equipes?.cor_identificacao || '#gray'}40`
                  }}
                />
                <span className="font-bold">Equipe {nomeEquipe}</span>
                <span className="text-sm text-muted-foreground ml-auto">
                  {(membros as any[]).length} membros
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="text-left p-4 min-w-[250px] font-bold border-r">Nome do Bombeiro</th>
                      {diasArray.map(dia => (
                        <th key={dia} className="text-center p-2 min-w-[35px] text-sm font-semibold border-r last:border-r-0">
                          {dia}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(membros as any[]).map((bombeiro, index) => (
                      <tr key={bombeiro.id} className={`
                        border-b hover:bg-accent/30 transition-all duration-200
                        ${index % 2 === 0 ? 'bg-muted/10' : 'bg-background'}
                      `}>
                        <td className="p-4 font-semibold border-r">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center font-bold text-primary">
                              {bombeiro.nome.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-semibold">{bombeiro.nome}</p>
                              <p className="text-xs text-muted-foreground">{bombeiro.funcao}</p>
                            </div>
                          </div>
                        </td>
                        {diasArray.map(dia => {
                          const temPlantao = verificarPlantao(bombeiro.id, bombeiro.equipe_id, dia);
                          const feristaSubstituto = verificarFeristaSubstituto(bombeiro.equipe_id, dia);
                          
                          return (
                            <td key={dia} className="text-center p-2 border-r last:border-r-0">
                              {temPlantao && (
                                <div className="flex justify-center">
                                  <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md hover:scale-110 transition-transform"
                                    style={{ 
                                      backgroundColor: bombeiro.equipes?.cor_identificacao || '#gray',
                                      boxShadow: `0 2px 6px ${bombeiro.equipes?.cor_identificacao || '#gray'}40`
                                    }}
                                  >
                                    ●
                                  </div>
                                </div>
                              )}
                              
                              {/* Mostrar ferista se estiver substituindo alguém desta equipe */}
                              {feristaSubstituto && bombeiro.id === feristaSubstituto.ferista?.id && (
                                <div className="flex justify-center">
                                  <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md hover:scale-110 transition-transform border-2 border-yellow-400"
                                    style={{ 
                                      backgroundColor: '#f59e0b',
                                      boxShadow: `0 2px 6px #f59e0b40`
                                    }}
                                    title={`Ferista substituindo ${feristaSubstituto.substituindo}`}
                                  >
                                    F
                                  </div>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resumo estatístico */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-background to-background/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Resumo da Escala
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-primary/10">
              <p className="text-2xl font-bold text-primary">{bombeirosPorEquipeCompleta.filter(b => !b.ferista && !b.eh_ferista).length}</p>
              <p className="text-sm text-muted-foreground">Bombeiros Efetivos</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-yellow-500/10">
              <p className="text-2xl font-bold text-yellow-600">{feristaEscalas.length}</p>
              <p className="text-sm text-muted-foreground">Feristas Ativos</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-500/10">
              <p className="text-2xl font-bold text-blue-600">{diasNoMes}</p>
              <p className="text-sm text-muted-foreground">Dias no Mês</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-500/10">
              <p className="text-2xl font-bold text-red-600">{periodosFerias.length}</p>
              <p className="text-sm text-muted-foreground">Pessoas de Férias</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EscalaIndividual;