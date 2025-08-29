import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface NaoConformidadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { descricao: string; imagens: File[] }) => void;
  itemNome: string;
  descricaoInicial?: string;
  imagensIniciais?: File[];
}

export const NaoConformidadeModal: React.FC<NaoConformidadeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  itemNome,
  descricaoInicial = '',
  imagensIniciais = []
}) => {
  const [descricao, setDescricao] = useState(descricaoInicial);
  const [imagens, setImagens] = useState<File[]>(imagensIniciais);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) {
        toast.error(`Arquivo ${file.name} não é uma imagem válida`);
        return false;
      }
      
      if (!isValidSize) {
        toast.error(`Arquivo ${file.name} excede o limite de 5MB`);
        return false;
      }
      
      return true;
    });
    
    setImagens(prev => [...prev, ...validFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeImage = (index: number) => {
    setImagens(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!descricao.trim()) {
      toast.error('Por favor, descreva o problema encontrado');
      return;
    }
    
    onSave({ descricao: descricao.trim(), imagens });
    handleClose();
  };

  const handleClose = () => {
    setDescricao('');
    setImagens([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-red-600">
            Item Não Conforme
          </DialogTitle>
          <DialogDescription>
            Descreva detalhadamente o problema encontrado no item: <strong>{itemNome}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Campo de Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição do Problema *</Label>
            <Textarea
              id="descricao"
              placeholder="Descreva detalhadamente o problema encontrado, incluindo localização, gravidade e possíveis causas..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Upload de Imagens */}
          <div className="space-y-2">
            <Label>Imagens Comprovativas (Opcional)</Label>
            
            {/* Área de Drop */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Arraste e solte imagens aqui ou clique para selecionar
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Formatos aceitos: JPG, PNG, GIF (máx. 5MB por arquivo)
              </p>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                id="file-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Selecionar Imagens
              </Button>
            </div>

            {/* Preview das Imagens */}
            {imagens.length > 0 && (
              <div className="space-y-2">
                <Label>Imagens Selecionadas ({imagens.length})</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagens.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {file.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} className="bg-red-600 hover:bg-red-700">
            Salvar Não Conformidade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};