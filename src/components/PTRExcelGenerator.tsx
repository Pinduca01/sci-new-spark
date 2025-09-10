import * as XLSX from 'xlsx';
import { usePTRTemplates } from '@/hooks/usePTRTemplates';
import { toast } from '@/hooks/use-toast';

interface PTRData {
  data: string;
  codigo: string;
  equipe: string;
  participantes: Array<{
    nome: string;
    presente: boolean;
    situacao_ba: string;
  }>;
  ptrs: Array<{
    horario_inicio: string;
    horario_fim: string;
    tipo: string;
    instrutor: string;
    observacoes: string;
  }>;
  observacoes_gerais: string;
}

export const usePTRExcelGenerator = () => {
  const { activeTemplate, getTemplateFile } = usePTRTemplates();

  const generateExcel = async (data: PTRData) => {
    if (!activeTemplate) {
      toast({
        title: "Template não configurado",
        description: "Configure um template Excel antes de gerar o arquivo.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Load the template
      const templateBuffer = getTemplateFile(activeTemplate);
      const workbook = XLSX.read(templateBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Fill basic information
      if (activeTemplate.mappings.data) {
        XLSX.utils.sheet_add_aoa(worksheet, [[data.data]], {
          origin: activeTemplate.mappings.data
        });
      }

      if (activeTemplate.mappings.codigo) {
        XLSX.utils.sheet_add_aoa(worksheet, [[data.codigo]], {
          origin: activeTemplate.mappings.codigo
        });
      }

      // Fill participants
      if (activeTemplate.mappings.participantes_inicio && data.participantes.length > 0) {
        const startCell = activeTemplate.mappings.participantes_inicio;
        const startRow = parseInt(startCell.match(/\d+/)?.[0] || '1') - 1;
        const startCol = startCell.match(/[A-Z]+/)?.[0] || 'A';
        
        data.participantes.forEach((participante, index) => {
          const currentRow = startRow + index;
          const rowData = [
            participante.nome,
            participante.presente ? 'SIM' : 'NÃO',
            participante.situacao_ba
          ];
          
          XLSX.utils.sheet_add_aoa(worksheet, [rowData], {
            origin: `${startCol}${currentRow + 1}`
          });
        });
      }

      // Fill PTR activities
      if (activeTemplate.mappings.ptr_inicio && data.ptrs.length > 0) {
        const startCell = activeTemplate.mappings.ptr_inicio;
        const startRow = parseInt(startCell.match(/\d+/)?.[0] || '1') - 1;
        const startCol = startCell.match(/[A-Z]+/)?.[0] || 'A';
        
        data.ptrs.forEach((ptr, index) => {
          const currentRow = startRow + index;
          const duracao = calcularDuracao(ptr.horario_inicio, ptr.horario_fim);
          const rowData = [
            `${ptr.horario_inicio} - ${ptr.horario_fim} (${duracao})`,
            ptr.tipo,
            ptr.instrutor,
            ptr.observacoes
          ];
          
          XLSX.utils.sheet_add_aoa(worksheet, [rowData], {
            origin: `${startCol}${currentRow + 1}`
          });
        });
      }

      // Fill general observations
      if (activeTemplate.mappings.observacoes && data.observacoes_gerais) {
        XLSX.utils.sheet_add_aoa(worksheet, [[data.observacoes_gerais]], {
          origin: activeTemplate.mappings.observacoes
        });
      }

      // Generate filename
      const filename = `PTR-BA_${data.codigo}_${data.data.replace(/\//g, '-')}.xlsx`;

      // Export file
      XLSX.writeFile(workbook, filename);

      toast({
        title: "Excel gerado com sucesso!",
        description: `Arquivo ${filename} foi baixado.`
      });

    } catch (error) {
      console.error('Erro ao gerar Excel:', error);
      toast({
        title: "Erro ao gerar Excel",
        description: "Não foi possível gerar o arquivo Excel. Verifique o template.",
        variant: "destructive"
      });
    }
  };

  const calcularDuracao = (inicio: string, fim: string): string => {
    if (!inicio || !fim) return '';
    
    const [inicioHora, inicioMinuto] = inicio.split(':').map(Number);
    const [fimHora, fimMinuto] = fim.split(':').map(Number);
    
    const inicioTotal = inicioHora * 60 + inicioMinuto;
    const fimTotal = fimHora * 60 + fimMinuto;
    
    const duracaoMinutos = fimTotal - inicioTotal;
    
    if (duracaoMinutos <= 0) return '';
    
    const horas = Math.floor(duracaoMinutos / 60);
    const minutos = duracaoMinutos % 60;
    
    if (horas === 0) {
      return `${minutos}min`;
    } else if (minutos === 0) {
      return `${horas}h`;
    } else {
      return `${horas}h${minutos}min`;
    }
  };

  return {
    generateExcel,
    hasActiveTemplate: !!activeTemplate,
    activeTemplateName: activeTemplate?.name
  };
};