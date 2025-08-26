
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Download, RefreshCw, Printer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

interface Viatura {
  id: string;
  prefixo: string;
  placa: string;
  modelo: string;
  qr_code?: string;
}

interface QRGeneratorProps {
  viaturas: Viatura[];
  onUpdate: () => void;
}

export const QRGenerator = ({ viaturas, onUpdate }: QRGeneratorProps) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const generateQRCode = async (viatura: Viatura) => {
    setLoading(viatura.id);
    
    try {
      // Gerar código único
      const timestamp = Date.now();
      const qrCode = `VIATURA_${viatura.prefixo}_${timestamp}`;
      
      // Atualizar no banco
      const { error } = await supabase
        .from('viaturas')
        .update({ qr_code: qrCode })
        .eq('id', viatura.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `QR Code gerado para ${viatura.prefixo}`,
      });

      onUpdate();
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o QR Code",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const downloadQR = async (viatura: Viatura) => {
    if (!viatura.qr_code) return;

    try {
      const qrCodeURL = await QRCode.toDataURL(
        `${window.location.origin}/checklist/qr/${viatura.qr_code}`,
        {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        }
      );

      const link = document.createElement('a');
      link.href = qrCodeURL;
      link.download = `QR_${viatura.prefixo}.png`;
      link.click();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao baixar QR Code",
        variant: "destructive",
      });
    }
  };

  const printQR = async (viatura: Viatura) => {
    if (!viatura.qr_code) return;

    try {
      const qrCodeURL = await QRCode.toDataURL(
        `${window.location.origin}/checklist/qr/${viatura.qr_code}`,
        {
          width: 400,
          margin: 3
        }
      );

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>QR Code - ${viatura.prefixo}</title>
              <style>
                body { 
                  margin: 0; 
                  padding: 20px; 
                  text-align: center; 
                  font-family: Arial, sans-serif;
                }
                .qr-container {
                  border: 2px solid #000;
                  padding: 20px;
                  display: inline-block;
                  margin: 20px;
                }
                h2 { margin-bottom: 10px; }
                p { margin: 5px 0; }
              </style>
            </head>
            <body>
              <div class="qr-container">
                <h2>${viatura.prefixo}</h2>
                <p>${viatura.modelo} - ${viatura.placa}</p>
                <img src="${qrCodeURL}" alt="QR Code" />
                <p><strong>Escaneie para iniciar checklist</strong></p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao imprimir QR Code",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Gerenciamento de QR Codes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Gere QR codes únicos para cada viatura. Os bombeiros poderão escanear para iniciar checklists.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {viaturas.map((viatura) => (
          <Card key={viatura.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{viatura.prefixo}</CardTitle>
                {viatura.qr_code ? (
                  <Badge variant="default">QR Ativo</Badge>
                ) : (
                  <Badge variant="outline">Sem QR</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {viatura.modelo} • {viatura.placa}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {!viatura.qr_code ? (
                <Button
                  onClick={() => generateQRCode(viatura)}
                  disabled={loading === viatura.id}
                  className="w-full"
                >
                  {loading === viatura.id ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <QrCode className="h-4 w-4 mr-2" />
                  )}
                  Gerar QR Code
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadQR(viatura)}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Baixar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => printQR(viatura)}
                      className="flex-1"
                    >
                      <Printer className="h-4 w-4 mr-1" />
                      Imprimir
                    </Button>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => generateQRCode(viatura)}
                    disabled={loading === viatura.id}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerar QR
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
