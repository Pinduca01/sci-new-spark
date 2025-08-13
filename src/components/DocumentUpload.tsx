import React, { useState } from 'react';
import { Upload, File, Trash2, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadProps {
  bombeiroId?: string;
  existingDocs?: string[];
  onDocumentsChange: (docs: string[]) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  bombeiroId,
  existingDocs = [],
  onDocumentsChange,
}) => {
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<string[]>(existingDocs);
  const { toast } = useToast();

  const uploadDocument = async (file: File) => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${bombeiroId || 'temp'}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documentos-bombeiros')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('documentos-bombeiros')
        .getPublicUrl(filePath);

      const newDocs = [...documents, data.publicUrl];
      setDocuments(newDocs);
      onDocumentsChange(newDocs);

      toast({
        title: "Documento enviado",
        description: "O documento foi enviado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar o documento.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = async (docUrl: string, index: number) => {
    try {
      // Extract filename from URL for deletion
      const fileName = docUrl.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('documentos-bombeiros')
          .remove([fileName]);
      }

      const newDocs = documents.filter((_, i) => i !== index);
      setDocuments(newDocs);
      onDocumentsChange(newDocs);

      toast({
        title: "Documento removido",
        description: "O documento foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover documento:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover o documento.",
        variant: "destructive",
      });
    }
  };

  const viewDocument = (docUrl: string) => {
    window.open(docUrl, '_blank');
  };

  const downloadDocument = (docUrl: string, fileName?: string) => {
    const link = document.createElement('a');
    link.href = docUrl;
    link.download = fileName || 'documento';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadDocument(file);
          }}
          className="hidden"
          id="file-upload"
          disabled={uploading}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            {uploading ? 'Enviando...' : 'Clique para enviar documentos'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PDF, JPG, JPEG, PNG
          </p>
        </label>
      </div>

      {documents.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Documentos enviados:</h4>
          {documents.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded-md">
              <div className="flex items-center space-x-2">
                <File className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm truncate">
                  Documento {index + 1}
                </span>
              </div>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => viewDocument(doc)}
                >
                  <Eye className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => downloadDocument(doc, `documento_${index + 1}`)}
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeDocument(doc, index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};