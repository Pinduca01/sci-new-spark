import React, { useState } from 'react';
import { AssinaturaDigital } from './AssinaturaDigital';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentoAssinatura {
  id: string;
  nome: string;
  status: 'rascunho' | 'enviado' | 'assinado';
  assinatura?: string;
  documentoAutentiqueId?: string;
}

export const ExemploAssinaturaAutentique: React.FC = () => {
  const [documento, setDocumento] = useState<DocumentoAssinatura>({
    id: '1',
    nome: 'Contrato de Prestação de Serviços',
    status: 'rascunho'
  });
  
  const [signatarios] = useState([
    { email: 'cliente@exemplo.com', name: 'João Silva' },
    { email: 'gestor@empresa.com', name: 'Maria Santos' }
  ]);
  
  const { toast } = useToast();
  
  const handleSaveSignature = (assinatura: string) => {
    setDocumento(prev => ({
      ...prev,
      assinatura
    }));
    
    toast({
      title: "Assinatura salva",
      description: "A assinatura foi salva localmente.",
    });
  };
  
  const handleDocumentSent = (documentId: string) => {
    setDocumento(prev => ({
      ...prev,
      status: 'enviado',
      documentoAutentiqueId: documentId
    }));
    
    toast({
      title: "Documento enviado!",
      description: "O documento foi enviado para assinatura digital.",
    });
  };
  
  const handleSignatureCompleted = (documentId: string) => {
    setDocumento(prev => ({
      ...prev,
      status: 'assinado'
    }));
    
    toast({
      title: "Assinatura concluída!",
      description: "Todas as assinaturas foram coletadas com sucesso.",
    });
  };
  
  const getStatusIcon = () => {
    switch (documento.status) {
      case 'rascunho':
        return <FileText className="h-4 w-4" />;
      case 'enviado':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'assinado':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };
  
  const getStatusText = () => {
    switch (documento.status) {
      case 'rascunho':
        return 'Rascunho';
      case 'enviado':
        return 'Enviado para Assinatura';
      case 'assinado':
        return 'Assinado';
      default:
        return 'Desconhecido';
    }
  };
  
  const getStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    switch (documento.status) {
      case 'rascunho':
        return 'outline';
      case 'enviado':
        return 'secondary';
      case 'assinado':
        return 'default';
      default:
        return 'outline';
    }
  };
  
  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Exemplo: Assinatura Digital com Autentique</span>
            <Badge variant={getStatusVariant()} className="flex items-center gap-2">
              {getStatusIcon()}
              {getStatusText()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Informações do Documento</h3>
                <p><strong>Nome:</strong> {documento.nome}</p>
                <p><strong>ID:</strong> {documento.id}</p>
                {documento.documentoAutentiqueId && (
                  <p><strong>ID Autentique:</strong> {documento.documentoAutentiqueId}</p>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Signatários</h3>
                <div className="space-y-1">
                  {signatarios.map((signatario, index) => (
                    <div key={index} className="text-sm">
                      <p><strong>{signatario.name}</strong></p>
                      <p className="text-gray-600">{signatario.email}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <AssinaturaDigital
        onAssinaturaConcluida={(dados) => {
          handleSignatureCompleted(dados.documentoId);
        }}
        signatarios={signatarios.map(s => ({ nome: s.name, email: s.email }))}
      />
      
      {documento.status === 'assinado' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Documento Assinado com Sucesso!</span>
            </div>
            <p className="text-sm text-green-600 mt-2">
              Todas as assinaturas foram coletadas. O documento está pronto para uso.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExemploAssinaturaAutentique;