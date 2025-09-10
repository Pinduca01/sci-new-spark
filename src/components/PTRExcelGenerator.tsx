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

  const diagnosticLog = (step: string, data?: any) => {
    console.log(`[PTR Excel Generator] ${step}`, data || '');
  };

  const generateExcel = async (data: PTRData) => {
    diagnosticLog('Iniciando geração de Excel', { templateAtivo: !!activeTemplate, dadosRecebidos: !!data });
    
    if (!activeTemplate) {
      diagnosticLog('Erro: Template não configurado');
      toast({
        title: "Template não configurado",
        description: "Configure um template Excel antes de gerar o arquivo.",
        variant: "destructive"
      });
      return false;
    }

    // Validar dados essenciais
    if (!data.codigo || !data.data || !data.equipe) {
      diagnosticLog('Erro: Dados obrigatórios não preenchidos', {
        codigo: !!data.codigo,
        data: !!data.data,
        equipe: !!data.equipe
      });
      toast({
        title: "Dados incompletos",
        description: "Preencha código, data e equipe antes de gerar o Excel.",
        variant: "destructive"
      });
      return false;
    }

    try {
      diagnosticLog('Carregando template', { nomeTemplate: activeTemplate.name });
      
      // Load the template
      const templateBuffer = getTemplateFile(activeTemplate);
      if (!templateBuffer || templateBuffer.byteLength === 0) {
        throw new Error('Template vazio ou inválido');
      }
      
      diagnosticLog('Template carregado com sucesso', { tamanho: templateBuffer.byteLength });
      
      const workbook = XLSX.read(templateBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      diagnosticLog('Planilha lida com sucesso', { planilhas: workbook.SheetNames });

      // Fill basic information
      diagnosticLog('Preenchendo informações básicas');
      if (activeTemplate.mappings.data) {
        XLSX.utils.sheet_add_aoa(worksheet, [[data.data]], {
          origin: activeTemplate.mappings.data
        });
        diagnosticLog('Data preenchida', { célula: activeTemplate.mappings.data, valor: data.data });
      }

      if (activeTemplate.mappings.codigo) {
        XLSX.utils.sheet_add_aoa(worksheet, [[data.codigo]], {
          origin: activeTemplate.mappings.codigo
        });
        diagnosticLog('Código preenchido', { célula: activeTemplate.mappings.codigo, valor: data.codigo });
      }

      if (activeTemplate.mappings.equipe) {
        XLSX.utils.sheet_add_aoa(worksheet, [[data.equipe]], {
          origin: activeTemplate.mappings.equipe
        });
        diagnosticLog('Equipe preenchida', { célula: activeTemplate.mappings.equipe, valor: data.equipe });
      }

      // Fill participants
      if (activeTemplate.mappings.participantes_inicio && data.participantes.length > 0) {
        diagnosticLog('Preenchendo participantes', { quantidade: data.participantes.length, célula: activeTemplate.mappings.participantes_inicio });
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
          diagnosticLog(`Participante ${index + 1} preenchido`, { nome: participante.nome, linha: currentRow + 1 });
        });
      } else {
        diagnosticLog('Participantes não preenchidos', { temMapping: !!activeTemplate.mappings.participantes_inicio, temParticipantes: data.participantes.length > 0 });
      }

      // Fill PTR activities
      if (activeTemplate.mappings.ptr_inicio && data.ptrs.length > 0) {
        diagnosticLog('Preenchendo atividades PTR', { quantidade: data.ptrs.length, célula: activeTemplate.mappings.ptr_inicio });
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
          diagnosticLog(`PTR ${index + 1} preenchido`, { tipo: ptr.tipo, linha: currentRow + 1 });
        });
      } else {
        diagnosticLog('PTRs não preenchidos', { temMapping: !!activeTemplate.mappings.ptr_inicio, temPTRs: data.ptrs.length > 0 });
      }

      // Fill general observations
      if (activeTemplate.mappings.observacoes && data.observacoes_gerais) {
        XLSX.utils.sheet_add_aoa(worksheet, [[data.observacoes_gerais]], {
          origin: activeTemplate.mappings.observacoes
        });
        diagnosticLog('Observações preenchidas', { célula: activeTemplate.mappings.observacoes });
      }

      // Generate filename
      const filename = `PTR-BA_${data.codigo}_${data.data.replace(/\//g, '-')}.xlsx`;
      diagnosticLog('Gerando arquivo', { nomeArquivo: filename });

      // Try primary download method
      try {
        XLSX.writeFile(workbook, filename);
        diagnosticLog('Download automático executado com sucesso');
        
        toast({
          title: "Excel gerado com sucesso!",
          description: `Arquivo ${filename} foi baixado.`
        });
        return true;
        
      } catch (downloadError) {
        diagnosticLog('Erro no download automático, tentando método alternativo', downloadError);
        
        // Alternative download method using Blob
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        diagnosticLog('Download alternativo executado');
        toast({
          title: "Excel gerado (método alternativo)",
          description: `Arquivo ${filename} foi baixado.`
        });
        return true;
      }

    } catch (error) {
      diagnosticLog('Erro crítico na geração', error);
      console.error('Erro ao gerar Excel:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao gerar Excel",
        description: `Erro: ${errorMessage}. Verifique o console para mais detalhes.`,
        variant: "destructive"
      });
      return false;
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

  const validateTemplate = () => {
    if (!activeTemplate) {
      diagnosticLog('Validação falhou: Nenhum template ativo');
      return false;
    }
    
    const requiredMappings = ['data', 'codigo', 'equipe'];
    const missingMappings = requiredMappings.filter(field => !activeTemplate.mappings[field]);
    
    if (missingMappings.length > 0) {
      diagnosticLog('Validação falhou: Mappings obrigatórios ausentes', missingMappings);
      toast({
        title: "Template incompleto",
        description: `Configure os campos obrigatórios: ${missingMappings.join(', ')}`,
        variant: "destructive"
      });
      return false;
    }
    
    diagnosticLog('Template validado com sucesso');
    return true;
  };

  const getDebugInfo = () => {
    return {
      hasActiveTemplate: !!activeTemplate,
      activeTemplateName: activeTemplate?.name,
      templateMappings: activeTemplate?.mappings,
      templateSize: activeTemplate ? getTemplateFile(activeTemplate)?.byteLength : 0
    };
  };

  return {
    generateExcel,
    validateTemplate,
    getDebugInfo,
    hasActiveTemplate: !!activeTemplate,
    activeTemplateName: activeTemplate?.name
  };
};