import { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import imageCompression from 'browser-image-compression';
import { toast } from 'sonner';

interface CameraCaptureProps {
  fotos: File[];
  onAddFotos: (files: File[]) => void;
  onRemoveFoto: (index: number) => void;
  maxFotos?: number;
}

export const CameraCapture = ({ 
  fotos, 
  onAddFotos, 
  onRemoveFoto, 
  maxFotos = 3 
}: CameraCaptureProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [compressing, setCompressing] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxFotos - fotos.length;
    if (files.length > remainingSlots) {
      toast.error(`Você pode adicionar no máximo ${remainingSlots} foto(s)`);
      return;
    }

    setCompressing(true);
    try {
      const compressedFiles = await Promise.all(
        files.map(async (file) => {
          try {
            const options = {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
              fileType: 'image/jpeg'
            };
            const compressed = await imageCompression(file, options);
            return new File([compressed], file.name, { type: 'image/jpeg' });
          } catch (error) {
            console.error('Erro ao comprimir:', error);
            return file; // Retorna original se falhar
          }
        })
      );

      onAddFotos(compressedFiles);
      toast.success(`${compressedFiles.length} foto(s) adicionada(s)`);
    } catch (error) {
      console.error('Erro ao processar fotos:', error);
      toast.error('Erro ao processar fotos');
    } finally {
      setCompressing(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const openCamera = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {fotos.length < maxFotos && (
        <Button
          type="button"
          variant="outline"
          onClick={openCamera}
          disabled={compressing}
          className="w-full h-12 touch-manipulation"
        >
          <Camera className="w-5 h-5 mr-2" />
          {compressing ? 'Processando...' : 'Capturar Foto'}
        </Button>
      )}

      {fotos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {fotos.map((foto, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={URL.createObjectURL(foto)}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 rounded-full"
                onClick={() => onRemoveFoto(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {fotos.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {fotos.length} de {maxFotos} fotos
        </p>
      )}
    </div>
  );
};
