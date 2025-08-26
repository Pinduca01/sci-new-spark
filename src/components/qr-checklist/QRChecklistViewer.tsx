
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRChecklistForm } from './QRChecklistForm';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export const QRChecklistViewer = () => {
  const { qrCode } = useParams<{ qrCode: string }>();
  const [isValidQR, setIsValidQR] = useState<boolean | null>(null);

  useEffect(() => {
    if (qrCode) {
      // Validar se o QR code existe
      setIsValidQR(true); // Por agora, assumimos que é válido
    } else {
      setIsValidQR(false);
    }
  }, [qrCode]);

  if (isValidQR === null) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isValidQR || !qrCode) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">QR Code Inválido</h3>
            <p className="text-muted-foreground">
              O QR Code escaneado não é válido ou não foi encontrado no sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <QRChecklistForm qrCode={qrCode} />;
};
