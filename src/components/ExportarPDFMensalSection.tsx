import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { generateChecklistMensalFormatoOficialPDF } from "@/utils/checklistPdfGenerator";
import { toast } from "sonner";

export function ExportarPDFMensalSection() {
  const currentDate = new Date();
  const [selectedViatura, setSelectedViatura] = useState<string>("");
  const [selectedTipo, setSelectedTipo] = useState<string>("TODOS");
  const [selectedMonth, setSelectedMonth] = useState<string>(String(currentDate.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState<string>(String(currentDate.getFullYear()));

  // Buscar viaturas disponíveis
  const { data: viaturas } = useQuery({
    queryKey: ['viaturas-export'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('viaturas')
        .select('id, placa, tipo')
        .eq('ativa', true)
        .order('placa');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Gerar opções de meses
  const meses = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: new Date(2000, i).toLocaleString('pt-BR', { month: 'long' })
  }));

  // Gerar opções de anos (últimos 3 anos)
  const anos = Array.from({ length: 3 }, (_, i) => {
    const ano = currentDate.getFullYear() - i;
    return { value: String(ano), label: String(ano) };
  });

  const handleGerarPDFMensal = async () => {
    if (!selectedViatura) {
      toast.error("Selecione uma viatura");
      return;
    }

    const mes = parseInt(selectedMonth);
    const ano = parseInt(selectedYear);
    
    try {
      // Buscar checklists do mês selecionado
      const { data: checklistsData, error } = await supabase
        .from('checklists_viaturas')
        .select(`
          *
        `)
        .eq('viatura_id', selectedViatura)
        .gte('data_checklist', `${ano}-${String(mes).padStart(2, '0')}-01`)
        .lt('data_checklist', mes === 12 ? `${ano + 1}-01-01` : `${ano}-${String(mes + 1).padStart(2, '0')}-01`)
        .order('data_checklist', { ascending: true });

      if (error) throw error;

      if (!checklistsData || checklistsData.length === 0) {
        toast.error(`Nenhum checklist encontrado para ${selectedMonth}/${selectedYear}`);
        return;
      }

      // Obter placa da viatura selecionada
      const viatura = viaturas?.find(v => v.id === selectedViatura);
      const viaturaPlaca = viatura?.placa || 'VIATURA';
      
      // Filtrar por tipo se necessário
      const tipoFiltro = selectedTipo === 'TODOS' ? undefined : selectedTipo;
      
      // Gerar PDF
      generateChecklistMensalFormatoOficialPDF(viaturaPlaca, mes, ano, checklistsData as any, tipoFiltro);
      
      toast.success(`PDF mensal ${tipoFiltro ? `de ${tipoFiltro}` : ''} gerado com sucesso!`);
    } catch (error: any) {
      console.error('Erro ao gerar PDF:', error);
      toast.error(error.message || 'Erro ao gerar PDF mensal');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exportar PDF Mensal (Formato Oficial)
        </CardTitle>
        <CardDescription>
          Gere relatórios consolidados de checklists por viatura no formato oficial
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Select de Viatura */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Viatura</label>
            <Select value={selectedViatura} onValueChange={setSelectedViatura}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a viatura" />
              </SelectTrigger>
              <SelectContent>
                {viaturas?.map((viatura) => (
                  <SelectItem key={viatura.id} value={viatura.id}>
                    {viatura.placa} - {viatura.tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtros de Tipo, Mês e Ano */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Checklist</label>
              <Select value={selectedTipo} onValueChange={setSelectedTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos os Tipos</SelectItem>
                  <SelectItem value="CCI">CCI - Inspeção de CCIs</SelectItem>
                  <SelectItem value="EQUIPAMENTOS">Equipamentos</SelectItem>
                  <SelectItem value="CRS">CRS - Inspeção de CRS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Mês</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {meses.map(m => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Ano</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {anos.map(a => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botão Gerar PDF */}
          <Button 
            onClick={handleGerarPDFMensal} 
            className="w-full"
            disabled={!selectedViatura}
          >
            <Download className="h-4 w-4 mr-2" />
            Gerar PDF Mensal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
