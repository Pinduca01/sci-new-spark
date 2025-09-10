import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePTRExcelGenerator } from './PTRExcelGenerator';
import { CheckCircle, XCircle, Info, AlertCircle } from 'lucide-react';

interface PTRExcelDebugModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PTRExcelDebugModal = ({ open, onOpenChange }: PTRExcelDebugModalProps) => {
  const { hasActiveTemplate, activeTemplateName, getDebugInfo, validateTemplate } = usePTRExcelGenerator();
  
  const debugInfo = getDebugInfo();
  const isValid = validateTemplate();

  const copyDebugInfo = () => {
    const info = JSON.stringify(debugInfo, null, 2);
    navigator.clipboard.writeText(info);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Diagnóstico do Sistema Excel
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Status Geral */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {isValid ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                Status do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Template Ativo:</span>
                <Badge variant={hasActiveTemplate ? 'default' : 'destructive'}>
                  {hasActiveTemplate ? 'Configurado' : 'Não Configurado'}
                </Badge>
              </div>
              
              {activeTemplateName && (
                <div className="flex justify-between items-center">
                  <span>Nome do Template:</span>
                  <Badge variant="outline">{activeTemplateName}</Badge>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span>Validação:</span>
                <Badge variant={isValid ? 'default' : 'destructive'}>
                  {isValid ? 'Válido' : 'Inválido'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Informações Técnicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Técnicas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Template Size:</span>
                  <span>{debugInfo.templateSize ? `${Math.round(debugInfo.templateSize / 1024)} KB` : 'N/A'}</span>
                </div>
                
                {debugInfo.templateMappings && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Mapeamentos Configurados:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(debugInfo.templateMappings).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="capitalize">{key.replace('_', ' ')}:</span>
                          <code className="bg-muted px-1 rounded">{value || 'Não configurado'}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Guia de Solução de Problemas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                Solução de Problemas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold text-red-600">❌ Download não funciona?</h4>
                <ul className="list-disc list-inside mt-1 space-y-1 text-muted-foreground">
                  <li>Verifique se um template está configurado</li>
                  <li>Confirme se todos os campos obrigatórios estão preenchidos</li>
                  <li>Verifique permissões de download do navegador</li>
                  <li>Abra o console do navegador (F12) para ver erros</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-blue-600">⚙️ Como configurar?</h4>
                <ul className="list-disc list-inside mt-1 space-y-1 text-muted-foreground">
                  <li>Clique em "⚙️ Configurar Excel" no formulário</li>
                  <li>Faça upload do seu template Excel</li>
                  <li>Configure os mapeamentos de células</li>
                  <li>Salve e ative o template</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-green-600">✅ Teste o sistema:</h4>
                <ul className="list-disc list-inside mt-1 space-y-1 text-muted-foreground">
                  <li>Baixe o template de exemplo primeiro</li>
                  <li>Teste com dados simples</li>
                  <li>Verifique se o Excel abre corretamente</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={copyDebugInfo}>
              📋 Copiar Info Debug
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};