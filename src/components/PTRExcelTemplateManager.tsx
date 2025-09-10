import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, Trash2, Settings, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePTRTemplates, PTRTemplate } from '@/hooks/usePTRTemplates';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface PTRExcelTemplateManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PTRExcelTemplateManager: React.FC<PTRExcelTemplateManagerProps> = ({
  open,
  onOpenChange
}) => {
  const { templates, activeTemplate, saveTemplate, deleteTemplate, setActive } = usePTRTemplates();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [mappings, setMappings] = useState({
    data: 'B2',
    codigo: 'B3',
    participantes_inicio: 'A8',
    ptr_inicio: 'A15',
    observacoes: 'A25'
  });
  const [previewData, setPreviewData] = useState<any>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo Excel (.xlsx ou .xls)",
        variant: "destructive"
      });
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Preview first 10 rows and columns
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: "A1:J10" });
      
      setPreviewData({
        sheetNames: workbook.SheetNames,
        preview: jsonData,
        cellCount: Object.keys(worksheet).length
      });
      
      setUploadedFile(file);
      setTemplateName(file.name.replace(/\.(xlsx|xls)$/, ''));
    } catch (error) {
      toast({
        title: "Erro ao ler arquivo",
        description: "Não foi possível processar o arquivo Excel.",
        variant: "destructive"
      });
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const saveCurrentTemplate = async () => {
    if (!uploadedFile || !templateName.trim()) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, selecione um arquivo e defina um nome para o template.",
        variant: "destructive"
      });
      return;
    }

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const newTemplate: PTRTemplate = {
        id: Date.now().toString(),
        name: templateName.trim(),
        file: arrayBuffer,
        mappings,
        createdAt: new Date()
      };

      await saveTemplate(newTemplate);
      setUploadedFile(null);
      setTemplateName('');
      setPreviewData(null);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o template.",
        variant: "destructive"
      });
    }
  };

  const downloadSampleTemplate = () => {
    // Create a sample Excel template
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ['PTR-BA - RELATÓRIO DE TREINAMENTO'],
      ['Data:', '', 'Código:'],
      ['Equipe:', ''],
      [''],
      ['PARTICIPANTES'],
      ['Nome', 'Presente', 'Situação BA'],
      ['', '', ''],
      ['', '', ''],
      [''],
      ['ATIVIDADES PTR'],
      ['Horário', 'Tipo', 'Instrutor', 'Observações'],
      ['', '', '', ''],
      ['', '', '', ''],
      [''],
      ['OBSERVAÇÕES GERAIS'],
      ['']
    ]);
    
    XLSX.utils.book_append_sheet(wb, ws, 'PTR-BA');
    XLSX.writeFile(wb, 'template-ptr-ba-exemplo.xlsx');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Gerenciar Templates Excel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Novo Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Arraste seu template Excel aqui ou clique para selecionar
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleInputChange}
                  className="hidden"
                  id="template-upload"
                />
                <Button asChild variant="outline" size="sm">
                  <label htmlFor="template-upload" className="cursor-pointer">
                    Selecionar Arquivo
                  </label>
                </Button>
              </div>

              <Button 
                variant="outline" 
                onClick={downloadSampleTemplate}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Template de Exemplo
              </Button>

              {previewData && (
                <Alert>
                  <AlertDescription>
                    Arquivo carregado: {previewData.sheetNames.length} aba(s), {previewData.cellCount} células
                  </AlertDescription>
                </Alert>
              )}

              {uploadedFile && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template-name">Nome do Template</Label>
                    <Input
                      id="template-name"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Ex: Template PTR-BA Oficial"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Mapeamento de Células</Label>
                      <div className="space-y-2 mt-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span>Data:</span>
                          <Input
                            className="h-8"
                            value={mappings.data}
                            onChange={(e) => setMappings(prev => ({ ...prev, data: e.target.value }))}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span>Código:</span>
                          <Input
                            className="h-8"
                            value={mappings.codigo}
                            onChange={(e) => setMappings(prev => ({ ...prev, codigo: e.target.value }))}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span>Participantes:</span>
                          <Input
                            className="h-8"
                            value={mappings.participantes_inicio}
                            onChange={(e) => setMappings(prev => ({ ...prev, participantes_inicio: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    {previewData && (
                      <div>
                        <Label>Preview do Template</Label>
                        <div className="mt-2 text-xs bg-muted p-2 rounded max-h-32 overflow-y-auto">
                          {previewData.preview.slice(0, 5).map((row: any[], idx: number) => (
                            <div key={idx} className="font-mono">
                              {row.slice(0, 3).join(' | ')}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button onClick={saveCurrentTemplate} className="w-full">
                    Salvar Template
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Templates List */}
          <Card>
            <CardHeader>
              <CardTitle>Templates Salvos</CardTitle>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum template salvo ainda
                </p>
              ) : (
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        activeTemplate?.id === template.id 
                          ? 'bg-primary/5 border-primary' 
                          : 'bg-card'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Criado em {new Date(template.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {activeTemplate?.id === template.id && (
                          <Badge variant="default" className="text-xs">
                            Ativo
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActive(
                            activeTemplate?.id === template.id ? null : template
                          )}
                        >
                          {activeTemplate?.id === template.id ? 'Desativar' : 'Ativar'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteTemplate(template.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};