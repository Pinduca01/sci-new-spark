import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface PTRTemplate {
  id: string;
  name: string;
  file: ArrayBuffer;
  mappings: {
    data?: string;
    codigo?: string;
    equipe?: string;
    participantes_inicio?: string;
    ptr_inicio?: string;
    observacoes?: string;
  };
  createdAt: Date;
}

const STORAGE_KEY = 'ptr-excel-templates';

// Helper functions for robust Base64 conversion
const arrayBufferToBase64 = (buffer: Uint8Array): string => {
  let binary = '';
  const len = buffer.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
};

const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

export const usePTRTemplates = () => {
  const [templates, setTemplates] = useState<PTRTemplate[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const parsedTemplates = JSON.parse(stored);
      console.log('[PTR Templates] Templates carregados do localStorage:', parsedTemplates.length);
      return parsedTemplates;
    } catch (error) {
      console.error('[PTR Templates] Erro ao carregar templates:', error);
      return [];
    }
  });

  const [activeTemplate, setActiveTemplate] = useState<PTRTemplate | null>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}-active`);
      if (!stored) return null;
      
      const parsedTemplate = JSON.parse(stored);
      console.log('[PTR Templates] Template ativo carregado:', parsedTemplate.name);
      return parsedTemplate;
    } catch (error) {
      console.error('[PTR Templates] Erro ao carregar template ativo:', error);
      return null;
    }
  });

  const saveTemplate = useCallback(async (template: PTRTemplate) => {
    try {
      console.log('[PTR Templates] Salvando template:', template.name, 'Tamanho:', template.file.byteLength);
      
      const updatedTemplates = [...templates.filter(t => t.id !== template.id), template];
      setTemplates(updatedTemplates);
      
      // Convert ArrayBuffer to base64 for storage using safer method
      const uint8Array = new Uint8Array(template.file);
      const base64 = arrayBufferToBase64(uint8Array);
      const templateForStorage = {
        ...template,
        file: base64
      };
      
      const templatesForStorage = updatedTemplates.map(t => 
        t.id === template.id ? templateForStorage : {
          ...t,
          file: typeof t.file === 'string' ? t.file : arrayBufferToBase64(new Uint8Array(t.file))
        }
      );
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templatesForStorage));
      console.log('[PTR Templates] Template salvo com sucesso no localStorage');
      
      toast({
        title: "Template salvo com sucesso",
        description: `Template "${template.name}" foi salvo.`
      });
    } catch (error) {
      console.error('[PTR Templates] Erro ao salvar template:', error);
      toast({
        title: "Erro ao salvar template",
        description: "Não foi possível salvar o template. Verifique o tamanho do arquivo.",
        variant: "destructive"
      });
    }
  }, [templates]);

  const deleteTemplate = useCallback((templateId: string) => {
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    setTemplates(updatedTemplates);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
    
    if (activeTemplate?.id === templateId) {
      setActiveTemplate(null);
      localStorage.removeItem(`${STORAGE_KEY}-active`);
    }
    
    toast({
      title: "Template removido",
      description: "Template foi removido com sucesso."
    });
  }, [templates, activeTemplate]);

  const setActive = useCallback((template: PTRTemplate | null) => {
    console.log('[PTR Templates] Definindo template ativo:', template?.name || 'nenhum');
    setActiveTemplate(template);
    if (template) {
      const templateForStorage = {
        ...template,
        file: typeof template.file === 'string' ? template.file : arrayBufferToBase64(new Uint8Array(template.file))
      };
      localStorage.setItem(`${STORAGE_KEY}-active`, JSON.stringify(templateForStorage));
      console.log('[PTR Templates] Template ativo salvo no localStorage');
    } else {
      localStorage.removeItem(`${STORAGE_KEY}-active`);
      console.log('[PTR Templates] Template ativo removido do localStorage');
    }
  }, []);

  const getTemplateFile = useCallback((template: PTRTemplate) => {
    try {
      if (template.file instanceof ArrayBuffer) {
        console.log('[PTR Templates] Template já é ArrayBuffer, tamanho:', template.file.byteLength);
        return template.file;
      }
      
      // Convert base64 back to ArrayBuffer using safer method
      console.log('[PTR Templates] Convertendo template de base64 para ArrayBuffer');
      const arrayBuffer = base64ToArrayBuffer(template.file as string);
      console.log('[PTR Templates] Conversão concluída, tamanho:', arrayBuffer.byteLength);
      return arrayBuffer;
    } catch (error) {
      console.error('[PTR Templates] Erro ao converter template:', error);
      throw new Error('Template corrompido ou inválido');
    }
  }, []);

  return {
    templates,
    activeTemplate,
    saveTemplate,
    deleteTemplate,
    setActive,
    getTemplateFile
  };
};