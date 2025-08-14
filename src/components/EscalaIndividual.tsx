import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface EscalaIndividualProps {
  escalas: any[];
  mes: number;
  ano: number;
  onBack: () => void;
}

const EscalaIndividual = ({ escalas, mes, ano, onBack }: EscalaIndividualProps) => {
  const [bombeiros, setBombeiros] = useState<any[]>([]);
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

  useEffect(() => {
    loadBombeiros();
  }, []);

  const diasNoMes = new Date(ano, mes, 0).getDate();
  const diasArray = Array.from({ length: diasNoMes }, (_, i) => i + 1);

  // Agrupar bombeiros por equipe
  const bombeirosPorEquipe = bombeiros.reduce((grupos, bombeiro) => {
    const nomeEquipe = bombeiro.equipes?.nome_equipe || 'Sem Equipe';
    if (!grupos[nomeEquipe]) {
      grupos[nomeEquipe] = [];
    }
    grupos[nomeEquipe].push(bombeiro);
    return grupos;
  }, {} as Record<string, any[]>);

  const verificarPlantao = (bombeiroEquipeId: string, dia: number) => {
    const escalaData = escalas.find(e => {
      const dataEscala = new Date(e.data);
      return dataEscala.getDate() === dia && e.equipe_id === bombeiroEquipeId;
    });
    return escalaData;
  };

  const exportarRelatorio = () => {
    // Implementar exportação para PDF/Excel
    console.log("Exportar relatório");
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Calendário
          </Button>
          <Calendar className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">
            Escala Individual - {meses[mes - 1]} de {ano}
          </h1>
        </div>
        
        <Button variant="outline" onClick={exportarRelatorio}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      <div className="space-y-6">
        {Object.entries(bombeirosPorEquipe).map(([nomeEquipe, membros]) => (
          <Card key={nomeEquipe}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ 
                    backgroundColor: membros[0]?.equipes?.cor_identificacao || '#gray' 
                  }}
                />
                Equipe {nomeEquipe}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 min-w-[200px]">Nome do Bombeiro</th>
                      {diasArray.map(dia => (
                        <th key={dia} className="text-center p-1 min-w-[30px] text-xs">
                          {dia}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(membros as any[]).map(bombeiro => (
                      <tr key={bombeiro.id} className="border-b hover:bg-accent/50">
                        <td className="p-2 font-medium">{bombeiro.nome}</td>
                        {diasArray.map(dia => {
                          const temPlantao = verificarPlantao(bombeiro.equipe_id, dia);
                          return (
                            <td key={dia} className="text-center p-1">
                              {temPlantao && (
                                <div
                                  className="w-6 h-6 rounded-full mx-auto flex items-center justify-center text-white text-xs font-bold"
                                  style={{ 
                                    backgroundColor: bombeiro.equipes?.cor_identificacao || '#gray' 
                                  }}
                                >
                                  ●
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
    </div>
  );
};

export default EscalaIndividual;