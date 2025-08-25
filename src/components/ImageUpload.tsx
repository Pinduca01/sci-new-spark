
import React, { useState, useRef } from 'react';
import { Upload, X, Camera, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  title?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 2,
  title = "Fotos da Instrução"
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);

    Array.from(files).forEach((file) => {
      if (images.length >= maxImages) {
        toast({
          title: "Limite atingido",
          description: `Máximo de ${maxImages} imagens permitidas.`,
          variant: "destructive",
        });
        return;
      }

      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Arquivo inválido",
          description: "Apenas imagens são permitidas.",
          variant: "destructive",
        });
        return;
      }

      // Validar tamanho (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "Tamanho máximo: 5MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = e.target?.result as string;
        onImagesChange([...images, newImage]);
      };
      reader.readAsDataURL(file);
    });

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const openImageViewer = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium flex items-center space-x-2">
        <Camera className="w-4 h-4" />
        <span>{title}</span>
        <span className="text-sm text-muted-foreground">
          ({images.length}/{maxImages})
        </span>
      </h4>

      {/* Upload Area */}
      <Card className={`border-2 border-dashed transition-colors ${
        images.length >= maxImages ? 'border-muted-foreground/30 bg-muted/20' : 'border-primary/30 hover:border-primary/50 bg-primary/5'
      }`}>
        <CardContent className="p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading || images.length >= maxImages}
          />
          
          <div 
            className={`text-center cursor-pointer ${images.length >= maxImages ? 'cursor-not-allowed' : ''}`}
            onClick={() => {
              if (images.length < maxImages && !uploading) {
                fileInputRef.current?.click();
              }
            }}
          >
            <Upload className={`h-8 w-8 mx-auto mb-2 ${
              images.length >= maxImages ? 'text-muted-foreground/50' : 'text-primary'
            }`} />
            <p className={`text-sm ${
              images.length >= maxImages ? 'text-muted-foreground' : 'text-foreground'
            }`}>
              {uploading ? 'Enviando...' : 
               images.length >= maxImages ? 'Limite de imagens atingido' : 
               'Clique para selecionar imagens'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, GIF até 5MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview das Imagens */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {images.map((image, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0 relative">
                <img 
                  src={image} 
                  alt={`Foto ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute top-2 right-2 flex space-x-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-6 w-6 p-0 bg-black/50 hover:bg-black/70 text-white border-0"
                    onClick={() => openImageViewer(image)}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-6 w-6 p-0 bg-red-500/80 hover:bg-red-500"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-1">
                  <p className="text-xs text-center">Foto {index + 1}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
