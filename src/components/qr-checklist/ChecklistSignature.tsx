
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SignatureCanvas from 'react-signature-canvas';
import { Pen, RotateCcw } from 'lucide-react';

interface ChecklistSignatureProps {
  onSignatureChange: (signature: string) => void;
  signature?: string;
}

export const ChecklistSignature = ({ onSignatureChange, signature }: ChecklistSignatureProps) => {
  const sigCanvas = useRef<SignatureCanvas>(null);

  const handleClear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      onSignatureChange('');
    }
  };

  const handleEnd = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL();
      onSignatureChange(signatureData);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Pen className="h-5 w-5" />
          Assinatura Digital
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 bg-muted/10">
          {signature ? (
            <div className="text-center">
              <img src={signature} alt="Assinatura" className="mx-auto max-h-32" />
              <p className="text-sm text-muted-foreground mt-2">Assinatura capturada</p>
            </div>
          ) : (
            <div>
              <SignatureCanvas
                ref={sigCanvas}
                penColor="black"
                canvasProps={{
                  width: 400,
                  height: 150,
                  className: 'signature-canvas w-full border rounded'
                }}
                onEnd={handleEnd}
              />
              <p className="text-sm text-muted-foreground text-center mt-2">
                Assine na área acima
              </p>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            className="flex-1"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
