import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, X } from 'lucide-react';

interface Bombeiro {
  id: string;
  nome: string;
  documentos_certificados?: string[];
}

interface BombeiroDocumentsModalProps {
  bombeiro: Bombeiro | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BombeiroDocumentsModal: React.FC<BombeiroDocumentsModalProps> = ({
  bombeiro,
  open,
  onOpenChange,
}) => {
  if (!bombeiro) return null;

  const documentos = bombeiro.documentos_certificados || [];

  const handleDownload = (documento: string) => {
    // Implementar download do documento
    console.log('Download:', documento);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documentos de {bombeiro.nome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {documentos.length > 0 ? (
            <div className="grid gap-3">
              {documentos.map((documento, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{documento}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">PDF</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(documento)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum documento encontrado</p>
              <p className="text-sm">Este bombeiro não possui documentos armazenados.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};