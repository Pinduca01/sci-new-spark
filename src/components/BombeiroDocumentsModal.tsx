
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  if (!bombeiro) return null;

  const documentos = bombeiro.documentos_certificados || [];

  const handleDownload = (docUrl: string, index: number) => {
    try {
      // Extrair nome do arquivo da URL
      const urlParts = docUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const fileExtension = fileName.split('.').pop() || 'pdf';
      
      // Nome mais amigável para o download
      const downloadName = `${bombeiro.nome.replace(/\s+/g, '_')}_Documento_${index + 1}.${fileExtension}`;
      
      // Criar elemento temporário para download
      const link = document.createElement('a');
      link.href = docUrl;
      link.download = downloadName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Adicionar ao DOM, clicar e remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download iniciado",
        description: `Download do documento ${index + 1} iniciado com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      toast({
        title: "Erro no download",
        description: "Não foi possível fazer o download do documento.",
        variant: "destructive",
      });
    }
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
                    <span className="text-sm font-medium">Documento {index + 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">PDF</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(documento, index)}
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
